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

    // First calculate if user is eligible
    const { data: lossData, error: lossError } = await supabaseClient
      .rpc('calculate_user_losses', { p_user_id: userId, p_days: 30 });

    if (lossError) {
      console.error('Error calculating losses:', lossError);
      throw lossError;
    }

    const totalLoss = lossData || 0;
    
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

    if (netResult <= 0) {
      throw new Error('profit');
    }

    // Check if user already claimed loss bonus recently (within 30 days)
    const { data: recentClaimData } = await supabaseClient
      .from('bonus_events')
      .select('occurred_at')
      .eq('user_id', userId)
      .eq('type', 'loss_bonus_claimed')
      .gte('occurred_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(1)
      .single();

    if (recentClaimData) {
      throw new Error('already_claimed');
    }

    // Check if user has ever received a welcome bonus (first deposit bonus)
    const { data: firstDepositBonuses } = await supabaseClient
      .from('bonuses_new')
      .select('id')
      .eq('type', 'FIRST_DEPOSIT')
      .eq('is_active', true);

    if (firstDepositBonuses && firstDepositBonuses.length > 0) {
      const bonusIds = firstDepositBonuses.map(b => b.id);
      
      const { data: welcomeBonusData } = await supabaseClient
        .from('user_bonus_tracking')
        .select('id')
        .eq('user_id', userId)
        .in('bonus_id', bonusIds)
        .limit(1)
        .single();

      if (welcomeBonusData) {
        throw new Error('welcome_bonus_received');
      }
    }

    const bonusPercentage = 0.20; // 20% kayıp bonusu
    const bonusAmount = Math.floor(netResult * bonusPercentage);

    if (bonusAmount <= 0) {
      throw new Error('no_loss');
    }

    // Add bonus to user's balance
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    const currentBalance = profileData?.balance || 0;
    const newBalance = currentBalance + bonusAmount;

    // Update user balance
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating balance:', updateError);
      throw updateError;
    }

    // Record the bonus claim event
    const { error: eventError } = await supabaseClient
      .from('bonus_events')
      .insert({
        user_id: userId,
        type: 'loss_bonus_claimed',
        payload: {
          loss_amount: netResult,
          bonus_amount: bonusAmount,
          bonus_percentage: bonusPercentage,
          previous_balance: currentBalance,
          new_balance: newBalance
        }
      });

    if (eventError) {
      console.error('Error recording bonus event:', eventError);
      // Don't throw here as the main operation succeeded
    }

    console.log(`Loss bonus claimed: User ${userId}, Amount: ${bonusAmount}, Loss: ${netResult}`);

    return new Response(
      JSON.stringify({
        success: true,
        bonusAmount,
        newBalance,
        lossAmount: netResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error in claim-loss-bonus function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});