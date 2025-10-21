// =============================================================================
// EDGE FUNCTION: auth-invite-accept
// POST /auth/invite/accept
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateInviteAccept, AggregateValidationError } from '../shared/validation.ts';
import { errorResponse, ErrorCode, handleUnknownError, rateLimitError, tokenExpiredError, tokenInvalidError } from '../shared/errors.ts';
import { InviteAcceptRequest, InviteAcceptResponse } from '../shared/types.ts';
import { 
    checkRateLimit, 
    RATE_LIMITS, 
    generateSessionToken, 
    generateCsrfToken, 
    hashPassword, 
    createAuditLog, 
    getUserIP, 
    getUserAgent,
    SESSION_CONFIG
} from '../shared/business-logic.ts';

/**
 * CORS headers
 */
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Only allow POST requests
        if (req.method !== 'POST') {
            return errorResponse(ErrorCode.BAD_REQUEST, 405, 'Method not allowed');
        }

        // 2. Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 3. Parse request body
        const body: InviteAcceptRequest = await req.json();

        // 4. Validate input
        try {
            validateInviteAccept(body);
        } catch (error) {
            if (error instanceof AggregateValidationError) {
                return errorResponse(ErrorCode.VALIDATION_ERROR, 400, 'Validation failed', error.toJSON().details);
            }
            throw error;
        }

        // 5. Get request metadata
        const ipAddress = getUserIP(req);
        const userAgent = getUserAgent(req);

        // 6. Check rate limiting
        const ipRateLimit = await checkRateLimit(
            supabase, 
            ipAddress, 
            'ip' as any, 
            RATE_LIMITS.INVITE.IP
        );

        if (!ipRateLimit.allowed) {
            await createAuditLog(supabase, {
                action: 'invite_accept_rate_limited_ip',
                details: {
                    ip_address: ipAddress,
                    retry_after: ipRateLimit.retryAfter
                },
                ip_address: ipAddress,
                user_agent: userAgent
            });

            return rateLimitError(
                ipRateLimit.retryAfter || 0,
                ipRateLimit.limit,
                ipRateLimit.remaining,
                ipRateLimit.reset
            );
        }

        // 7. Find invite by token
        const { data: invite, error: inviteError } = await supabase
            .from('invites')
            .select(`
                *,
                roles!inner(name),
                tenants!inner(id, name, slug)
            `)
            .eq('token', body.token)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .single();

        if (inviteError || !invite) {
            await createAuditLog(supabase, {
                action: 'invite_accept_failed_invalid_token',
                details: {
                    token: body.token,
                    reason: 'invite_not_found_or_expired'
                },
                ip_address: ipAddress,
                user_agent: userAgent
            });

            return tokenInvalidError();
        }

        // 8. Check if invite is expired
        if (new Date(invite.expires_at) <= new Date()) {
            await createAuditLog(supabase, {
                action: 'invite_accept_failed_token_expired',
                details: {
                    token: body.token,
                    expires_at: invite.expires_at
                },
                ip_address: ipAddress,
                user_agent: userAgent
            });

            return tokenExpiredError();
        }

        // 9. Check if user already exists
        const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', invite.email.toLowerCase())
            .single();

        if (!userError && existingUser) {
            await createAuditLog(supabase, {
                action: 'invite_accept_failed_user_exists',
                details: {
                    email: invite.email,
                    token: body.token
                },
                ip_address: ipAddress,
                user_agent: userAgent
            });

            return errorResponse(ErrorCode.CONFLICT, 409, 'User already exists with this email');
        }

        // 10. Hash password
        const hashedPassword = await hashPassword(body.password);

        // 11. Create user
        const { data: newUser, error: createUserError } = await supabase
            .from('users')
            .insert({
                email: invite.email.toLowerCase(),
                password_hash: hashedPassword,
                first_name: body.first_name,
                last_name: body.last_name,
                is_active: true,
                email_verified: true, // Invited users are pre-verified
                failed_login_attempts: 0,
                locked_until: null
            })
            .select()
            .single();

        if (createUserError) {
            console.error('Failed to create user:', createUserError);
            return errorResponse(ErrorCode.DATABASE_ERROR, 500, 'Failed to create user');
        }

        // 12. Assign role to user
        const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
                user_id: newUser.id,
                role_id: invite.role_id,
                tenant_id: invite.tenant_id,
                assigned_by: invite.invited_by
            });

        if (roleError) {
            console.error('Failed to assign role:', roleError);
            // Clean up user if role assignment fails
            await supabase.from('users').delete().eq('id', newUser.id);
            return errorResponse(ErrorCode.DATABASE_ERROR, 500, 'Failed to assign role');
        }

        // 13. Update invite status
        await supabase
            .from('invites')
            .update({
                status: 'accepted',
                accepted_at: new Date().toISOString(),
                accepted_by: newUser.id
            })
            .eq('id', invite.id);

        // 14. Create session
        const sessionToken = generateSessionToken();
        const csrfToken = generateCsrfToken();
        const expiresAt = new Date(Date.now() + SESSION_CONFIG.LIFETIME);

        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert({
                user_id: newUser.id,
                token: sessionToken,
                csrf_token: csrfToken,
                ip_address: ipAddress,
                user_agent: userAgent,
                is_active: true,
                expires_at: expiresAt.toISOString()
            })
            .select()
            .single();

        if (sessionError) {
            console.error('Failed to create session:', sessionError);
            return errorResponse(ErrorCode.DATABASE_ERROR, 500, 'Failed to create session');
        }

        // 15. Log successful invite acceptance
        await createAuditLog(supabase, {
            user_id: newUser.id,
            tenant_id: invite.tenant_id,
            action: 'invite_accepted',
            details: {
                email: invite.email,
                role: invite.roles.name,
                tenant: invite.tenants.name,
                invite_id: invite.id,
                session_id: session.id
            },
            ip_address: ipAddress,
            user_agent: userAgent
        });

        // 16. Return success response
        const response: InviteAcceptResponse = {
            success: true,
            user: {
                id: newUser.id,
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                role: invite.roles.name,
                tenant_id: invite.tenant_id
            },
            session: {
                token: sessionToken,
                csrf_token: csrfToken,
                expires_at: expiresAt.toISOString()
            }
        };

        return new Response(
            JSON.stringify(response),
            {
                status: 201,
                headers: { 
                    ...corsHeaders, 
                    'Content-Type': 'application/json',
                    'Set-Cookie': `session_token=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_CONFIG.LIFETIME / 1000}`,
                    'Set-Cookie': `csrf_token=${csrfToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${CSRF_CONFIG.LIFETIME / 1000}`
                }
            }
        );

    } catch (error) {
        return handleUnknownError(error);
    }
});
