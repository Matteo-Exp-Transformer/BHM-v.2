// =============================================================================
// EDGE FUNCTION: auth-logout
// POST /auth/logout
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { errorResponse, ErrorCode, handleUnknownError } from '../shared/errors.ts';
import { LogoutResponse } from '../shared/types.ts';
import { createAuditLog, getUserIP, getUserAgent } from '../shared/business-logic.ts';

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

        // 2. Get session token from cookie or header
        const sessionToken = req.headers.get('cookie')?.match(/session_token=([^;]+)/)?.[1] ||
                           req.headers.get('authorization')?.replace('Bearer ', '');

        if (!sessionToken) {
            return errorResponse(ErrorCode.UNAUTHORIZED, 401, 'Session token required');
        }

        // 3. Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 4. Find session
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .select(`
                *,
                users!inner(id, email)
            `)
            .eq('token', sessionToken)
            .eq('is_active', true)
            .single();

        if (sessionError || !session) {
            return errorResponse(ErrorCode.UNAUTHORIZED, 401, 'Invalid session');
        }

        // 5. Get request metadata
        const ipAddress = getUserIP(req);
        const userAgent = getUserAgent(req);

        // 6. Deactivate session
        const { error: updateError } = await supabase
            .from('sessions')
            .update({ 
                is_active: false,
                last_activity_at: new Date().toISOString()
            })
            .eq('id', session.id);

        if (updateError) {
            console.error('Failed to deactivate session:', updateError);
            return errorResponse(ErrorCode.DATABASE_ERROR, 500, 'Failed to logout');
        }

        // 7. Log logout
        await createAuditLog(supabase, {
            user_id: session.user_id,
            action: 'logout_success',
            details: {
                session_id: session.id,
                email: session.users.email
            },
            ip_address: ipAddress,
            user_agent: userAgent
        });

        // 8. Return success response
        const response: LogoutResponse = {
            success: true,
            message: 'Logged out successfully'
        };

        return new Response(
            JSON.stringify(response),
            {
                status: 200,
                headers: { 
                    ...corsHeaders, 
                    'Content-Type': 'application/json',
                    'Set-Cookie': 'session_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
                    'Set-Cookie': 'csrf_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
                }
            }
        );

    } catch (error) {
        return handleUnknownError(error);
    }
});
