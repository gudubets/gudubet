import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GameResult {
  session_id: string;
  game_id: string;
  bet_amount: number;
  win_amount: number;
  rounds_played: number;
  session_duration?: number;
  result_data?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get request data
    const gameResult: GameResult = await req.json()
    const { session_id, game_id, bet_amount, win_amount, rounds_played, session_duration, result_data } = gameResult

    // Validate input
    if (!session_id || !game_id || bet_amount < 0 || win_amount < 0) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz oyun sonucu verisi' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile and current balance
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, balance, bonus_balance')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Kullanıcı profili bulunamadı' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has sufficient balance for bet
    if (profile.balance < bet_amount) {
      return new Response(
        JSON.stringify({ 
          error: 'Yetersiz bakiye',
          current_balance: profile.balance,
          bet_amount: bet_amount
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get or create wallet
    let { data: wallet } = await supabaseClient
      .from('wallets')
      .select('id')
      .eq('user_id', profile.id)
      .eq('type', 'main')
      .single()

    if (!wallet) {
      const { data: newWallet, error: walletError } = await supabaseClient
        .from('wallets')
        .insert({
          user_id: profile.id,
          type: 'main',
          currency: 'TRY',
          balance: profile.balance
        })
        .select()
        .single()

      if (walletError) {
        console.error('Wallet creation error:', walletError)
        return new Response(
          JSON.stringify({ error: 'Cüzdan oluşturulamadı' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      wallet = newWallet
    }

    // Update or create game session
    const { data: session, error: sessionError } = await supabaseClient
      .from('game_sessions')
      .upsert({
        id: session_id,
        user_id: profile.id,
        game_id: game_id,
        total_bet: bet_amount,
        total_win: win_amount,
        rounds_played: rounds_played,
        session_duration: session_duration || 0,
        status: 'completed',
        ended_at: new Date().toISOString(),
        result_data: result_data
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Session update error:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Oyun oturumu güncellenemedi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create wallet transactions for bet and win
    const transactions = []

    // Debit for bet
    if (bet_amount > 0) {
      transactions.push({
        wallet_id: wallet.id,
        direction: 'debit',
        amount: bet_amount,
        ref_type: 'game_bet',
        ref_id: session_id,
        ledger_key: 'GAME_BET',
        meta: {
          game_id: game_id,
          session_id: session_id,
          bet_amount: bet_amount
        }
      })
    }

    // Credit for win
    if (win_amount > 0) {
      transactions.push({
        wallet_id: wallet.id,
        direction: 'credit',
        amount: win_amount,
        ref_type: 'game_win',
        ref_id: session_id,
        ledger_key: 'GAME_WIN',
        meta: {
          game_id: game_id,
          session_id: session_id,
          win_amount: win_amount
        }
      })
    }

    // Insert wallet transactions
    if (transactions.length > 0) {
      const { error: transactionError } = await supabaseClient
        .from('wallet_transactions')
        .insert(transactions)

      if (transactionError) {
        console.error('Transaction error:', transactionError)
        return new Response(
          JSON.stringify({ error: 'Bakiye güncellenemedi' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Calculate new balance
    const new_balance = profile.balance - bet_amount + win_amount

    // Update user profile balance
    const { error: balanceUpdateError } = await supabaseClient
      .from('profiles')
      .update({ 
        balance: new_balance,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (balanceUpdateError) {
      console.error('Balance update error:', balanceUpdateError)
    }

    // Log user behavior
    await supabaseClient
      .from('user_behavior_logs')
      .insert({
        user_id: profile.id,
        action_type: 'game_completed',
        metadata: {
          game_id: game_id,
          session_id: session_id,
          bet_amount: bet_amount,
          win_amount: win_amount,
          net_result: win_amount - bet_amount,
          rounds_played: rounds_played
        },
        amount: win_amount - bet_amount,
        ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })

    // Check for loss bonus eligibility (if user lost)
    if (bet_amount > win_amount) {
      const loss_amount = bet_amount - win_amount
      
      // Invoke loss bonus calculation
      try {
        await supabaseClient.functions.invoke('calculate-loss-bonus', {
          body: {
            user_id: profile.id,
            loss_amount: loss_amount
          }
        })
      } catch (error) {
        console.error('Loss bonus calculation error:', error)
        // Don't fail the main request
      }
    }

    // Broadcast balance update for real-time UI updates
    const channel = supabaseClient.channel('balance_updates')
    await channel.send({
      type: 'broadcast',
      event: 'balance_updated',
      payload: {
        user_id: profile.id,
        new_balance: new_balance,
        old_balance: profile.balance,
        change: new_balance - profile.balance
      }
    })

    console.log(`Game session processed: ${session_id} for user ${user.id}, bet: ${bet_amount}, win: ${win_amount}, new balance: ${new_balance}`)

    return new Response(
      JSON.stringify({
        success: true,
        session_id: session_id,
        new_balance: new_balance,
        net_result: win_amount - bet_amount,
        message: win_amount > bet_amount ? 'Tebrikler! Kazandınız!' : 'Oyun tamamlandı'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Game session processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Oyun oturumu işlenirken hata oluştu' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})