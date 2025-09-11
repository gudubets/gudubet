import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const url = Deno.env.get('SUPABASE_URL')!;
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(url, key, { auth: { persistSession: false } });

function getIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
         req.headers.get("cf-connecting-ip") || 
         "0.0.0.0";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const auth = req.headers.get('authorization');
    if (!auth) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const token = auth.replace(/^Bearer\s+/i, '');
    const { data: userData } = await supabase.auth.getUser(token);
    
    if (!userData?.user) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const user_id = userData.user.id;
    const body = await req.json();
    
    if (!body.device_fp) {
      return new Response('Bad Request: device_fp required', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const ip = getIP(req);

    // Upsert device information
    await supabase.from('user_devices').upsert({
      user_id,
      device_fp: body.device_fp,
      user_agent: body.user_agent || null,
      platform: body.platform || null,
      language: body.language || null,
      timezone: body.timezone || null,
      screen: body.screen || null,
      first_seen_ip: ip,
      last_seen_ip: ip
    }, { 
      onConflict: 'user_id,device_fp',
      ignoreDuplicates: false 
    });

    // Log device event
    await supabase.from('device_events').insert({
      user_id,
      device_fp: body.device_fp,
      ip,
      event: body.event || 'visit',
      meta: { 
        user_agent: body.user_agent,
        platform: body.platform,
        language: body.language,
        timezone: body.timezone,
        screen: body.screen
      }
    });

    console.log(`Device tracking successful for user ${user_id}, fp: ${body.device_fp.slice(0, 8)}...`);

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { 
        ...corsHeaders,
        'content-type': 'application/json' 
      } 
    });
    
  } catch (error) {
    console.error('Device tracking error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), { 
      status: 500, 
      headers: { 
        ...corsHeaders,
        'content-type': 'application/json' 
      } 
    });
  }
});