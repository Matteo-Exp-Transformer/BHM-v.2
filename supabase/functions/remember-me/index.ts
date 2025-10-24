import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { rememberMe, userId, sessionDuration } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (rememberMe) {
      // Set session to expire in 30 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Update user metadata with remember me info
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            remember_me: true,
            session_expires_at: expiresAt.toISOString(),
            remember_me_enabled_at: new Date().toISOString(),
          }
        }
      );

      if (updateError) {
        console.error('Error updating user for remember me:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to enable remember me' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`✅ Remember Me enabled for user ${userId}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Remember Me enabled for 30 days',
          expiresAt: expiresAt.toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Disable remember me - set standard session duration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            remember_me: false,
            session_expires_at: expiresAt.toISOString(),
            remember_me_disabled_at: new Date().toISOString(),
          }
        }
      );

      if (updateError) {
        console.error('Error updating user to disable remember me:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to disable remember me' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`✅ Remember Me disabled for user ${userId}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Remember Me disabled - session expires in 24 hours',
          expiresAt: expiresAt.toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in remember-me function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
