// =============================================================================
// EDGE FUNCTION: auth-csrf-token
// GET /auth/csrf-token
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { errorResponse, ErrorCode, handleUnknownError } from '../shared/errors.ts';
import { CsrfTokenResponse } from '../shared/types.ts';
import { generateCsrfToken, CSRF_CONFIG, createAuditLog, getUserIP, getUserAgent } from '../shared/business-logic.ts';

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
        // 1. Only allow GET requests
        if (req.method !== 'GET') {
            return errorResponse(ErrorCode.BAD_REQUEST, 405, 'Method not allowed');
        }

        // 2. Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 3. Generate CSRF token
        const csrfToken = generateCsrfToken();
        const expiresAt = new Date(Date.now() + CSRF_CONFIG.LIFETIME);

        // 4. Get request metadata
        const ipAddress = getUserIP(req);
        const userAgent = getUserAgent(req);

        // 5. Create audit log entry
        await createAuditLog(supabase, {
            action: 'csrf_token_generated',
            resource_type: 'csrf_token',
            details: {
                token_length: csrfToken.length,
                expires_at: expiresAt.toISOString()
            },
            ip_address: ipAddress,
            user_agent: userAgent
        });

        // 6. Return CSRF token
        const response: CsrfTokenResponse = {
            csrf_token: csrfToken,
            expires_at: expiresAt.toISOString()
        };

        return new Response(
            JSON.stringify(response),
            {
                status: 200,
                headers: { 
                    ...corsHeaders, 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }
        );

    } catch (error) {
        return handleUnknownError(error);
    }
});
