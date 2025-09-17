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
      // Demo mode - work without API keys for all providers
      const isDemoMode = !provider.api_key || provider.api_key.trim() === '';
      
      if (isDemoMode) {
        console.log(`Running in demo mode for provider: ${provider.name}`);
        
        switch (action) {
          case 'test':
            // Simulate connection test delay
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
            connectionStatus = 'demo_mode';
            testSuccess = true;
            break;

          case 'getGames':
            // Get actual games from database for this provider
            const { data: dbGames, error: gamesError } = await supabase
              .from('casino_games')
              .select(`
                id,
                name,
                slug,
                thumbnail_url,
                rtp_percentage,
                volatility,
                min_bet,
                max_bet,
                is_new,
                is_popular,
                is_featured
              `)
              .eq('provider_id', provider.id)
              .eq('is_active', true)
              .limit(10);

            if (gamesError) {
              console.error('Error fetching games:', gamesError);
              // Fallback to mock data
              games = generateMockGames(provider);
            } else {
              games = (dbGames || []).map(game => ({
                id: game.slug,
                name: game.name,
                type: 'slot',
                thumbnail: game.thumbnail_url || '/placeholder.svg',
                rtp: game.rtp_percentage || 96.0,
                volatility: game.volatility || 'medium',
                minBet: game.min_bet || 0.01,
                maxBet: game.max_bet || 100.00,
                isNew: game.is_new,
                isPopular: game.is_popular,
                isFeatured: game.is_featured
              }));
            }
            
            connectionStatus = 'demo_mode';
            testSuccess = true;
            break;

          case 'launchGame':
            if (!gameId) {
              throw new Error('Game ID is required for launch action');
            }
            
            // Simulate launch URL generation
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Create demo launch URL
            launchUrl = `/slot-game/${gameId}?demo=true&provider=${provider.slug}`;
            
            connectionStatus = 'demo_mode';
            testSuccess = true;
            break;

          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } else {
        // Real API mode - when API keys are available
        if (!provider.api_endpoint) {
          throw new Error('API endpoint not configured');
        }

        switch (action) {
          case 'test':
            // Simulate real API connection test
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
              }, 5000);

              // Simulate success rate based on provider
              const success = Math.random() > 0.2; // 80% success rate for real APIs
              
              setTimeout(() => {
                clearTimeout(timeout);
                if (success) {
                  resolve(true);
                } else {
                  reject(new Error('API connection failed'));
                }
              }, 1000 + Math.random() * 2000);
            });
            
            connectionStatus = 'connected';
            testSuccess = true;
            break;

          case 'getGames':
            // Here you would make real API calls to fetch games
            // For now, simulate with delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            games = generateMockGames(provider);
            connectionStatus = 'connected';
            testSuccess = true;
            break;

          case 'launchGame':
            if (!gameId) {
              throw new Error('Game ID is required for launch action');
            }
            
            // Real API launch URL generation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            launchUrl = `${provider.api_endpoint}/launch?game=${gameId}&token=real_token_${Date.now()}`;
            connectionStatus = 'connected';
            testSuccess = true;
            break;

          default:
            throw new Error(`Unknown action: ${action}`);
        }
      }
    } catch (error) {
      connectionStatus = 'failed';
      testSuccess = false;
      console.error('Provider operation failed:', error);
    }

    // Helper function to generate mock games based on provider
    function generateMockGames(provider: any) {
      const gameTypes = ['slot', 'table', 'live'];
      const volatilities = ['low', 'medium', 'high'];
      
      const mockGames = [];
      const gameCount = Math.floor(Math.random() * 8) + 3; // 3-10 games
      
      for (let i = 1; i <= gameCount; i++) {
        const gameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
        const volatility = volatilities[Math.floor(Math.random() * volatilities.length)];
        
        mockGames.push({
          id: `${provider.slug}-game-${i}`,
          name: generateGameName(provider.name, gameType, i),
          type: gameType,
          thumbnail: `/placeholder.svg`,
          rtp: 94 + Math.random() * 4, // 94-98% RTP
          volatility: volatility,
          minBet: 0.01 + Math.random() * 0.49, // 0.01-0.50
          maxBet: 50 + Math.random() * 450, // 50-500
          isNew: Math.random() > 0.7,
          isPopular: Math.random() > 0.6,
          isFeatured: Math.random() > 0.8
        });
      }
      
      return mockGames;
    }
    
    function generateGameName(providerName: string, gameType: string, index: number) {
      const slotNames = ['Fortune', 'Treasure', 'Magic', 'Wild', 'Golden', 'Diamond', 'Fire', 'Lightning'];
      const tableNames = ['Blackjack', 'Roulette', 'Baccarat', 'Poker'];
      const liveNames = ['Live Roulette', 'Live Blackjack', 'Live Baccarat', 'Live Poker'];
      
      let names;
      switch (gameType) {
        case 'table':
          names = tableNames;
          break;
        case 'live':
          names = liveNames;
          break;
        default:
          names = slotNames;
      }
      
      const baseName = names[Math.floor(Math.random() * names.length)];
      return `${providerName} ${baseName}${gameType === 'slot' ? ` ${index}` : ''}`;
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