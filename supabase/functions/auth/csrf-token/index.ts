// =============================================================================
// SUPABASE EDGE FUNCTION: auth/csrf-token
// GET /functions/v1/auth/csrf-token
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * CORS headers per sviluppo e produzione
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 ore
}

/**
 * Handler principale per endpoint CSRF
 */
serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Solo richieste GET sono permesse
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ 
        error: 'Method not allowed. Only GET requests are supported.' 
      }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Genera token CSRF sicuro
    const csrfToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 ore
    
    // Salva in database o session (implementazione storage sicuro)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Salva token in database per validazione futura
      const { error } = await supabase
        .from('csrf_tokens')
        .insert({
          token: csrfToken,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        })
      
      if (error) {
        console.warn('Failed to store CSRF token:', error)
        // Non bloccare la risposta se il salvataggio fallisce
      }
    }
    
    return new Response(JSON.stringify({
      csrf_token: csrfToken,
      expires_at: expiresAt.toISOString(),
      success: true
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
