// Supabase Edge Function per invio email inviti
// Deploy: supabase functions deploy send-invite-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      })
    }

    const { inviteToken } = await req.json()
    
    if (!inviteToken || !inviteToken.email || !inviteToken.token) {
      return new Response(
        JSON.stringify({ error: 'Missing invite data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Crea client Supabase con service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Genera link invito
    const inviteLink = `${req.headers.get('origin') || 'http://localhost:3003'}/accept-invite?token=${inviteToken.token}`

    // Invia email usando Supabase Auth
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(
      inviteToken.email,
      {
        data: {
          invite_link: inviteLink,
          role: inviteToken.role,
          company_id: inviteToken.company_id,
        },
        redirectTo: inviteLink,
      }
    )

    if (error) {
      console.error('Error sending invite:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

