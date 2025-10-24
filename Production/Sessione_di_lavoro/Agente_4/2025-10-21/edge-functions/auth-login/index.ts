// =============================================================================
// EDGE FUNCTION: auth-login
// POST /auth/login
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateLoginRequest, validateBusinessRules, AggregateValidationError } from '../shared/validation.ts';
import { errorResponse, ErrorCode, handleUnknownError, rateLimitError, csrfError, accountLockedError, invalidCredentialsError } from '../shared/errors.ts';
import { LoginRequest, LoginResponse } from '../shared/types.ts';
import { 
    checkRateLimit, 
    RATE_LIMITS, 
    generateSessionToken, 
    generateCsrfToken, 
    verifyPassword, 
    createAuditLog, 
    getUserIP, 
    getUserAgent,
    SESSION_CONFIG,
    cleanupExpiredSessions,
    calculateLockoutDuration
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
        const body: LoginRequest = await req.json();

        // 4. Validate input
        try {
            validateLoginRequest(body);
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
            RATE_LIMITS.LOGIN.IP
        );

        if (!ipRateLimit.allowed) {
            await createAuditLog(supabase, {
                action: 'login_rate_limited_ip',
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

        const emailRateLimit = await checkRateLimit(
            supabase, 
            body.email, 
            'email' as any, 
            RATE_LIMITS.LOGIN.EMAIL
        );

        if (!emailRateLimit.allowed) {
            await createAuditLog(supabase, {
                action: 'login_rate_limited_email',
                details: {
                    email: body.email,
                    retry_after: emailRateLimit.retryAfter
                },
                ip_address: ipAddress,
                user_agent: userAgent
            });

            return rateLimitError(
                emailRateLimit.retryAfter || 0,
                emailRateLimit.limit,
                emailRateLimit.remaining,
                emailRateLimit.reset
            );
        }

        // 7. Find user by email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', body.email.toLowerCase())
            .eq('is_active', true)
            .single();

        if (userError || !user) {
            // Log failed login attempt
            await createAuditLog(supabase, {
                action: 'login_failed_user_not_found',
                details: {
                    email: body.email,
                    reason: 'user_not_found'
                },
                ip_address: ipAddress,
                user_agent: userAgent
            });

            return invalidCredentialsError();
        }

        // 8. Check if account is locked
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            await createAuditLog(supabase, {
                user_id: user.id,
                action: 'login_failed_account_locked',
                details: {
                    email: body.email,
                    locked_until: user.locked_until
                },
                ip_address: ipAddress,
                user_agent: userAgent
            });

            return accountLockedError(user.locked_until);
        }

        // 9. Verify password
        const passwordValid = await verifyPassword(body.password, user.password_hash);

        if (!passwordValid) {
            // Increment failed login attempts
            const newFailedAttempts = user.failed_login_attempts + 1;
            let lockedUntil = null;

            // Decision #4: Rate Limiting Escalation
            // Lock account with progressive escalation
            if (newFailedAttempts >= 5) {
                const lockoutDuration = calculateLockoutDuration(newFailedAttempts);
                lockedUntil = new Date(Date.now() + lockoutDuration * 1000);
            }

            await supabase
                .from('users')
                .update({
                    failed_login_attempts: newFailedAttempts,
                    locked_until: lockedUntil
                })
                .eq('id', user.id);

            // Log failed login attempt
            await createAuditLog(supabase, {
                user_id: user.id,
                action: 'login_failed_invalid_password',
                details: {
                    email: body.email,
                    failed_attempts: newFailedAttempts,
                    locked: lockedUntil !== null
                },
                ip_address: ipAddress,
                user_agent: userAgent
            });

            return invalidCredentialsError();
        }

        // 10. Reset failed login attempts on successful login
        await supabase
            .from('users')
            .update({
                failed_login_attempts: 0,
                locked_until: null,
                last_login_at: new Date().toISOString()
            })
            .eq('id', user.id);

        // 11. Clean up expired sessions
        await cleanupExpiredSessions(supabase);

        // 12. Create new session
        const sessionToken = generateSessionToken();
        const csrfToken = generateCsrfToken();
        const expiresAt = new Date(Date.now() + SESSION_CONFIG.LIFETIME);

        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert({
                user_id: user.id,
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

        // 13. Get user role and tenant
        const { data: userRole, error: roleError } = await supabase
            .from('user_roles')
            .select(`
                role_id,
                tenant_id,
                roles!inner(name)
            `)
            .eq('user_id', user.id)
            .limit(1)
            .single();

        if (roleError || !userRole) {
            console.error('Failed to get user role:', roleError);
            return errorResponse(ErrorCode.DATABASE_ERROR, 500, 'Failed to get user role');
        }

        // 14. Log successful login
        await createAuditLog(supabase, {
            user_id: user.id,
            action: 'login_success',
            details: {
                email: body.email,
                session_id: session.id,
                role: userRole.roles.name,
                tenant_id: userRole.tenant_id
            },
            ip_address: ipAddress,
            user_agent: userAgent
        });

        // 15. Return success response
        const response: LoginResponse = {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: userRole.roles.name,
                tenant_id: userRole.tenant_id
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
                status: 200,
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
