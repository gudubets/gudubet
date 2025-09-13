import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Calculate user losses using the existing database function
    const { data: lossData, error: lossError } = await supabaseClient
      .rpc('calculate_user_losses', { p_user_id: userId, p_days: 30 });

    if (lossError) {
      console.error('Error calculating losses:', lossError);
      throw lossError;
    }

    const totalLoss = lossData || 0;
    const bonusPercentage = 0.20; // 20% kayıp bonusu
    const bonusAmount = Math.floor(totalLoss * bonusPercentage);

    // Check if user has profit (should not be eligible)
    const { data: gameSessionsData, error: sessionsError } = await supabaseClient
      .from('game_sessions')
      .select('total_bet, total_win')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (sessionsError) {
      console.error('Error fetching game sessions:', sessionsError);
      throw sessionsError;
    }

    const totalBets = gameSessionsData?.reduce((sum, session) => sum + (session.total_bet || 0), 0) || 0;
    const totalWins = gameSessionsData?.reduce((sum, session) => sum + (session.total_win || 0), 0) || 0;
    const netResult = totalBets - totalWins;
    // Check if user has ever received a welcome bonus (first deposit bonus)  
    const { data: firstDepositBonuses } = await supabaseClient
      .from('bonuses_new')
      .select('id')
      .eq('type', 'FIRST_DEPOSIT')
      .eq('is_active', true);

    let hasWelcomeBonus = false;
    if (firstDepositBonuses && firstDepositBonuses.length > 0) {
      const bonusIds = firstDepositBonuses.map(b => b.id);
      
      const { data: welcomeBonusData } = await supabaseClient
        .from('user_bonus_tracking')
        .select('id')
        .eq('user_id', userId)
        .in('bonus_id', bonusIds)
        .limit(1)
        .single();

      hasWelcomeBonus = !!welcomeBonusData;
    }

    const isEligible = netResult > 0 && bonusAmount > 0 && !hasWelcomeBonus; // Not eligible if user has welcome bonus

    // Check when user last claimed loss bonus
    const { data: lastClaimData } = await supabaseClient
      .from('bonus_events')
      .select('occurred_at')
      .eq('user_id', userId)
      .eq('type', 'loss_bonus_claimed')
      .order('occurred_at', { ascending: false })
      .limit(1)
      .single();

    return new Response(
      JSON.stringify({
        totalLoss: netResult > 0 ? netResult : 0,
        isEligible,
        bonusAmount: isEligible ? bonusAmount : 0,
        lastClaimDate: lastClaimData?.occurred_at || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error in calculate-loss-bonus function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});