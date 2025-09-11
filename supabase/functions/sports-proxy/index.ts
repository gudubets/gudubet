import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting store (in-memory for demo - use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(identifier: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (userLimit.count >= limit) {
    return true;
  }
  
  userLimit.count++;
  return false;
}

function validateSportParameter(sport: string): boolean {
  const allowedSports = ['soccer', 'basketball', 'tennis', 'baseball', 'hockey', 'football'];
  return allowedSports.includes(sport);
}

function validateRegionParameter(region: string): boolean {
  const allowedRegions = ['us', 'uk', 'eu', 'au'];
  return allowedRegions.includes(region);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Rate limiting by user ID
    const identifier = user.id;
    if (isRateLimited(identifier, 50, 60000)) { // 50 requests per minute per user
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const apiKey = Deno.env.get('SPORTS_API_KEY');
    
    if (!apiKey) {
      throw new Error('Sports API key not configured');
    }

    const url = new URL(req.url);
    const sport = url.searchParams.get('sport') || 'soccer';
    const region = url.searchParams.get('region') || 'us';
    
    // Input validation and sanitization
    if (!validateSportParameter(sport)) {
      return new Response(JSON.stringify({ error: 'Invalid sport parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!validateRegionParameter(region)) {
      return new Response(JSON.stringify({ error: 'Invalid region parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Fetching odds for sport: ${sport}, region: ${region}`);

    // Fetch from The Odds API
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=${region}&markets=h2h&oddsFormat=decimal&dateFormat=iso`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      throw new Error(`Sports API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our frontend structure
    const transformedData = data.map((match: any) => ({
      id: match.id,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      sport: match.sport_title,
      league: match.sport_title,
      startTime: match.commence_time,
      status: 'upcoming',
      odds: {
        home: match.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === match.home_team)?.price || 2.0,
        away: match.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === match.away_team)?.price || 2.0,
        draw: match.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === 'Draw')?.price || 3.0
      }
    }));

    console.log(`Successfully fetched ${transformedData.length} matches`);

    return new Response(JSON.stringify({
      matches: transformedData,
      count: transformedData.length,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });

  } catch (error) {
    console.error('Error in sports-proxy function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      matches: [],
      count: 0
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  }
});