import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('SPORTS_API_KEY');
    
    if (!apiKey) {
      throw new Error('Sports API key not configured');
    }

    const url = new URL(req.url);
    const sport = url.searchParams.get('sport') || 'soccer';
    const region = url.searchParams.get('region') || 'us';
    
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