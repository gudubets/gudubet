import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestProviderRequest {
  providerId: string;
}

interface TestProviderResponse {
  success: boolean;
  error?: string;
  provider?: any;
  connectionStatus?: string;
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

    const { providerId }: TestProviderRequest = await req.json();

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

    // Simulate provider connection test
    let connectionStatus = 'unknown';
    let testSuccess = false;

    try {
      // For external providers, we would typically make API calls here
      if (provider.provider_type === 'external') {
        if (provider.api_endpoint) {
          // Simulate API test with timeout
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
        } else {
          throw new Error('API endpoint not configured');
        }
      } else {
        // Custom provider - always pass for now
        connectionStatus = 'available';
        testSuccess = true;
      }
    } catch (error) {
      connectionStatus = 'failed';
      testSuccess = false;
      console.error('Provider test failed:', error);
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
      error: testSuccess ? undefined : `Connection test failed: ${connectionStatus}`
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