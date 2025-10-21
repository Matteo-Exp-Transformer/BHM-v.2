// =============================================================================
// EDGE FUNCTION: auth-recovery-request
// POST /auth/recovery/request
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateRecoveryRequest, AggregateValidationError } from '../shared/validation.ts';
import { errorResponse, ErrorCode, handleUnknownError, rateLimitError } from '../shared/errors.ts';
import { RecoveryRequestRequest, RecoveryRequestResponse } from '../shared/types.ts';
import { 
    checkRateLimit, 
    RATE_LIMITS, 
    generateSessionToken, 
    createAuditLog, 
    getUserIP, 
    getUserAgent 
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
        const body: RecoveryRequestRequest = await req.json();

        // 4. Validate input
        try {
            validateRecoveryRequest(body);
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
            RATE_LIMITS.RECOVERY.IP
        );

        if (!ipRateLimit.allowed) {
            await createAuditLog(supabase, {
                action: 'recovery_rate_limited_ip',
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
            RATE_LIMITS.RECOVERY.EMAIL
        );

        if (!emailRateLimit.allowed) {
            await createAuditLog(supabase, {
                action: 'recovery_rate_limited_email',
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

        // Always return success to prevent email enumeration
        // But only send email if user exists
        if (!userError && user) {
            // 8. Generate recovery token
            const recoveryToken = generateSessionToken(); // Using same function for simplicity
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // 9. Store recovery token in database (you might want a separate table for this)
            // For now, we'll use the sessions table with a special type
            const { error: tokenError } = await supabase
                .from('sessions')
                .insert({
                    user_id: user.id,
                    token: recoveryToken,
                    csrf_token: 'recovery', // Special marker
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    is_active: true,
                    expires_at: expiresAt.toISOString()
                });

            if (tokenError) {
                console.error('Failed to store recovery token:', tokenError);
                return errorResponse(ErrorCode.DATABASE_ERROR, 500, 'Failed to process recovery request');
            }

            // 10. Log recovery request
            await createAuditLog(supabase, {
                user_id: user.id,
                action: 'recovery_requested',
                details: {
                    email: body.email,
                    recovery_token: recoveryToken,
                    expires_at: expiresAt.toISOString()
                },
                ip_address: ipAddress,
                user_agent: userAgent
            });

            // 11. Send recovery email (in a real implementation)
            // For now, we'll just log it
            console.log(`Recovery email would be sent to ${body.email} with token ${recoveryToken}`);
        } else {
            // Log failed recovery attempt (but don't reveal user doesn't exist)
            await createAuditLog(supabase, {
                action: 'recovery_requested_user_not_found',
                details: {
                    email: body.email,
                    reason: 'user_not_found'
                },
                ip_address: ipAddress,
                user_agent: userAgent
            });
        }

        // 12. Return success response (always the same to prevent enumeration)
        const response: RecoveryRequestResponse = {
            success: true,
            message: 'If an account with this email exists, you will receive a password reset link.'
        };

        return new Response(
            JSON.stringify(response),
            {
                status: 200,
                headers: { 
                    ...corsHeaders, 
                    'Content-Type': 'application/json'
                }
            }
        );

    } catch (error) {
        return handleUnknownError(error);
    }
});
