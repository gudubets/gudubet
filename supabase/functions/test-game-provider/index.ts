import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestProviderRequest {
  providerId: string;
  action?: 'test' | 'getGames' | 'launchGame';
  gameId?: string;
}

interface TestProviderResponse {
  success: boolean;
  error?: string;
  provider?: any;
  connectionStatus?: string;
  games?: any[];
  launchUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', user.id)
      .eq('is_active', true)
      .single();

    if (adminError || !admin) {
      throw new Error('Admin access required');
    }

    const { providerId, action = 'test', gameId }: TestProviderRequest = await req.json();

    if (!providerId) {
      throw new Error('Provider ID is required');
    }

    console.log('Testing provider:', providerId);

    // Get provider details
    const { data: provider, error: providerError } = await supabase
      .from('game_providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      throw new Error('Provider not found');
    }

    // Handle different actions
    let connectionStatus = 'unknown';
    let testSuccess = false;
    let games: any[] = [];
    let launchUrl = '';

    try {
      // For external providers, we would typically make API calls here
      if (provider.provider_type === 'external') {
        if (!provider.api_endpoint) {
          throw new Error('API endpoint not configured');
        }

        switch (action) {
          case 'test':
            // Simulate connection test
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
              }, 5000);

              // Simulate random success/failure for demo
              const success = Math.random() > 0.3; // 70% success rate
              
              setTimeout(() => {
                clearTimeout(timeout);
                if (success) {
                  resolve(true);
                } else {
                  reject(new Error('API connection failed'));
                }
              }, 1000 + Math.random() * 2000); // 1-3 seconds delay
            });
            
            connectionStatus = 'connected';
            testSuccess = true;
            break;

          case 'getGames':
            // Simulate game list retrieval
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
            
            // Mock game list based on provider
            games = [
              {
                id: `${provider.slug}-game-1`,
                name: `${provider.name} Slot 1`,
                type: 'slot',
                thumbnail: `/placeholder.svg`,
                rtp: 96.5,
                volatility: 'medium'
              },
              {
                id: `${provider.slug}-game-2`,
                name: `${provider.name} Blackjack`,
                type: 'table',
                thumbnail: `/placeholder.svg`,
                rtp: 99.5,
                volatility: 'low'
              },
              {
                id: `${provider.slug}-game-3`,
                name: `${provider.name} Roulette`,
                type: 'live',
                thumbnail: `/placeholder.svg`,
                rtp: 97.3,
                volatility: 'medium'
              }
            ];
            
            connectionStatus = 'connected';
            testSuccess = true;
            break;

          case 'launchGame':
            if (!gameId) {
              throw new Error('Game ID is required for launch action');
            }
            
            // Simulate launch URL generation
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
            
            // Mock launch URL
            launchUrl = `${provider.api_endpoint}/launch?game=${gameId}&mode=demo&token=demo_token_${Date.now()}`;
            
            connectionStatus = 'connected';
            testSuccess = true;
            break;

          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } else {
        // Custom provider - simulate success
        connectionStatus = 'available';
        testSuccess = true;
        
        if (action === 'getGames') {
          games = [
            {
              id: 'custom-slot-1',
              name: 'Custom Mega Slots',
              type: 'slot',
              thumbnail: `/placeholder.svg`,
              rtp: 95.0,
              volatility: 'high'
            }
          ];
        } else if (action === 'launchGame' && gameId) {
          launchUrl = `/slot-game/${gameId}`;
        }
      }
    } catch (error) {
      connectionStatus = 'failed';
      testSuccess = false;
      console.error('Provider operation failed:', error);
    }

    const response: TestProviderResponse = {
      success: testSuccess,
      provider: {
        id: provider.id,
        name: provider.name,
        type: provider.provider_type,
        status: provider.status
      },
      connectionStatus,
      games: games.length > 0 ? games : undefined,
      launchUrl: launchUrl || undefined,
      error: testSuccess ? undefined : `Operation failed: ${connectionStatus}`
    };

    return new Response(JSON.stringify(response), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });

  } catch (error) {
    console.error('Test provider error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    );
  }
});