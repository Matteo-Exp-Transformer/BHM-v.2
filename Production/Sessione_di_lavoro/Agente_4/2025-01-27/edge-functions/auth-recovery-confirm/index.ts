// =============================================================================
// EDGE FUNCTION: auth-recovery-confirm
// POST /auth/recovery/confirm
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateRecoveryConfirm, AggregateValidationError } from '../shared/validation.ts';
import { errorResponse, ErrorCode, handleUnknownError, tokenExpiredError, tokenInvalidError } from '../shared/errors.ts';
import { RecoveryConfirmRequest, RecoveryConfirmResponse } from '../shared/types.ts';
import { 
    hashPassword, 
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
        const body: RecoveryConfirmRequest = await req.json();

        // 4. Validate input
        try {
            validateRecoveryConfirm(body);
        } catch (error) {
            if (error instanceof AggregateValidationError) {
                return errorResponse(ErrorCode.VALIDATION_ERROR, 400, 'Validation failed', error.toJSON().details);
            }
            throw error;
        }

        // 5. Get request metadata
        const ipAddress = getUserIP(req);
        const userAgent = getUserAgent(req);

        // 6. Find recovery session
        const { data: recoverySession, error: sessionError } = await supabase
            .from('sessions')
            .select(`
                *,
                users!inner(id, email, first_name, last_name)
            `)
            .eq('token', body.token)
            .eq('csrf_token', 'recovery') // Special marker for recovery
            .eq('is_active', true)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (sessionError || !recoverySession) {
            await createAuditLog(supabase, {
                action: 'recovery_confirm_failed_invalid_token',
                details: {
                    token: body.token,
                    reason: 'token_not_found_or_expired'
                },
                ip_address: ipAddress,
                user_agent: userAgent
            });

            return tokenInvalidError();
        }

        // 7. Check if token is expired
        if (new Date(recoverySession.expires_at) <= new Date()) {
            await createAuditLog(supabase, {
                user_id: recoverySession.user_id,
                action: 'recovery_confirm_failed_token_expired',
                details: {
                    token: body.token,
                    expires_at: recoverySession.expires_at
                },
                ip_address: ipAddress,
                user_agent: userAgent
            });

            return tokenExpiredError();
        }

        // 8. Hash new password
        const hashedPassword = await hashPassword(body.password);

        // 9. Update user password
        const { error: updateError } = await supabase
            .from('users')
            .update({
                password_hash: hashedPassword,
                failed_login_attempts: 0, // Reset failed attempts
                locked_until: null, // Unlock account
                updated_at: new Date().toISOString()
            })
            .eq('id', recoverySession.user_id);

        if (updateError) {
            console.error('Failed to update password:', updateError);
            return errorResponse(ErrorCode.DATABASE_ERROR, 500, 'Failed to update password');
        }

        // 10. Deactivate recovery session
        await supabase
            .from('sessions')
            .update({ 
                is_active: false,
                last_activity_at: new Date().toISOString()
            })
            .eq('id', recoverySession.id);

        // 11. Deactivate all other sessions for this user (force re-login)
        await supabase
            .from('sessions')
            .update({ 
                is_active: false,
                last_activity_at: new Date().toISOString()
            })
            .eq('user_id', recoverySession.user_id)
            .neq('id', recoverySession.id);

        // 12. Log successful password reset
        await createAuditLog(supabase, {
            user_id: recoverySession.user_id,
            action: 'password_reset_success',
            details: {
                email: recoverySession.users.email,
                recovery_token: body.token,
                session_id: recoverySession.id
            },
            ip_address: ipAddress,
            user_agent: userAgent
        });

        // 13. Return success response
        const response: RecoveryConfirmResponse = {
            success: true,
            message: 'Password has been reset successfully. Please log in with your new password.'
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
