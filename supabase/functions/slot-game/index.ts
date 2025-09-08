import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SpinRequest {
  gameSlug: string;
  betAmount: number;
  sessionId?: string;
}

interface SlotResult {
  reels: string[][];
  winAmount: number;
  winningLines: number[];
  multiplier: number;
  isWin: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      console.log('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { gameSlug, betAmount, sessionId }: SpinRequest = await req.json();

    console.log('Spin request:', { gameSlug, betAmount, sessionId, userId: user.id });

    // Get game configuration
    const { data: game, error: gameError } = await supabaseClient
      .from('slot_games')
      .select('*')
      .eq('slug', gameSlug)
      .eq('is_active', true)
      .single();

    if (gameError || !game) {
      console.log('Game error:', gameError);
      return new Response(
        JSON.stringify({ error: 'Game not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate bet amount
    if (betAmount < game.min_bet || betAmount > game.max_bet) {
      return new Response(
        JSON.stringify({ error: `Bet must be between ${game.min_bet} and ${game.max_bet}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user balance
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('balance, bonus_balance')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      console.log('User error:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const totalBalance = userData.balance + userData.bonus_balance;
    if (totalBalance < betAmount) {
      return new Response(
        JSON.stringify({ error: 'Insufficient balance' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate spin result using cryptographically secure random
    const spinResult = generateSpinResult(game);
    console.log('Spin result generated:', spinResult);

    // Calculate balance changes
    const balanceAfter = totalBalance - betAmount + spinResult.winAmount;
    
    // Deduct bet from regular balance first, then bonus if needed
    let newBalance = userData.balance;
    let newBonusBalance = userData.bonus_balance;
    
    if (userData.balance >= betAmount) {
      newBalance = userData.balance - betAmount;
    } else {
      const remainingBet = betAmount - userData.balance;
      newBalance = 0;
      newBonusBalance = userData.bonus_balance - remainingBet;
    }

    // Add winnings to regular balance
    newBalance += spinResult.winAmount;

    // Update user balance
    const { error: balanceError } = await supabaseClient
      .from('users')
      .update({ 
        balance: newBalance,
        bonus_balance: newBonusBalance
      })
      .eq('auth_user_id', user.id);

    if (balanceError) {
      console.log('Balance update error:', balanceError);
      return new Response(
        JSON.stringify({ error: 'Failed to update balance' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create or get session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabaseClient
        .from('slot_game_sessions')
        .insert({
          user_id: user.id,
          slot_game_id: game.id,
          total_spins: 0,
          total_bet: 0,
          total_win: 0,
          is_active: true
        })
        .select()
        .single();

      if (sessionError || !newSession) {
        console.log('Session creation error:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      currentSessionId = newSession.id;
    }

    // Update session statistics
    const { error: sessionUpdateError } = await supabaseClient
      .from('slot_game_sessions')
      .update({
        total_spins: supabaseClient.raw('total_spins + 1'),
        total_bet: supabaseClient.raw(`total_bet + ${betAmount}`),
        total_win: supabaseClient.raw(`total_win + ${spinResult.winAmount}`)
      })
      .eq('id', currentSessionId);

    if (sessionUpdateError) {
      console.log('Session update error:', sessionUpdateError);
    }

    // Record the spin
    const { error: spinError } = await supabaseClient
      .from('slot_game_spins')
      .insert({
        session_id: currentSessionId,
        user_id: user.id,
        slot_game_id: game.id,
        bet_amount: betAmount,
        win_amount: spinResult.winAmount,
        result: spinResult.reels,
        winning_lines: spinResult.winningLines,
        multiplier: spinResult.multiplier,
        balance_before: totalBalance,
        balance_after: balanceAfter
      });

    if (spinError) {
      console.log('Spin record error:', spinError);
    }

    return new Response(
      JSON.stringify({
        sessionId: currentSessionId,
        result: spinResult,
        newBalance: {
          balance: newBalance,
          bonusBalance: newBonusBalance,
          total: newBalance + newBonusBalance
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Slot game error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateSpinResult(game: any): SlotResult {
  const symbols = game.symbols;
  const paytable = game.paytable;
  const reels: string[][] = [];

  // Generate random reels
  for (let reel = 0; reel < game.reels; reel++) {
    reels[reel] = [];
    for (let row = 0; row < game.rows; row++) {
      // Use crypto.getRandomValues for secure randomness
      const randomArray = new Uint32Array(1);
      crypto.getRandomValues(randomArray);
      const randomIndex = randomArray[0] % symbols.length;
      reels[reel][row] = symbols[randomIndex];
    }
  }

  // Calculate wins
  let totalWin = 0;
  const winningLines: number[] = [];
  let multiplier = 1;

  // Simple payline calculation (horizontal lines)
  for (let line = 0; line < game.rows; line++) {
    const lineSymbols = [];
    for (let reel = 0; reel < game.reels; reel++) {
      lineSymbols.push(reels[reel][line]);
    }

    const win = calculateLineWin(lineSymbols, paytable);
    if (win > 0) {
      totalWin += win;
      winningLines.push(line);
    }
  }

  // Apply RTP adjustment (simulate house edge)
  const rtpFactor = game.rtp / 100;
  const randomArray = new Uint32Array(1);
  crypto.getRandomValues(randomArray);
  const rtpRoll = (randomArray[0] % 10000) / 10000; // 0 to 1
  
  if (rtpRoll > rtpFactor) {
    totalWin = Math.floor(totalWin * rtpFactor);
  }

  return {
    reels,
    winAmount: totalWin,
    winningLines,
    multiplier,
    isWin: totalWin > 0
  };
}

function calculateLineWin(symbols: string[], paytable: any): number {
  if (symbols.length < 3) return 0;

  // Count consecutive symbols from left
  const firstSymbol = symbols[0];
  if (firstSymbol === 'scatter') return 0; // Scatters don't count on paylines
  
  let count = 1;
  for (let i = 1; i < symbols.length; i++) {
    if (symbols[i] === firstSymbol || symbols[i] === 'wild') {
      count++;
    } else {
      break;
    }
  }

  // Check if we have a winning combination
  const symbolPayouts = paytable[firstSymbol];
  if (!symbolPayouts || count < 3) return 0;

  const payout = symbolPayouts[count.toString()] || 0;
  
  // Apply wild multiplier if any wilds are in the line
  let wildMultiplier = 1;
  if (symbols.includes('wild') && paytable.wild && paytable.wild.multiplier) {
    wildMultiplier = paytable.wild.multiplier;
  }

  return payout * wildMultiplier;
}