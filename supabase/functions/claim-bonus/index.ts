import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClaimRequest {
  bonus_id: string;
  deposit_amount?: number;
  code?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { bonus_id, deposit_amount = 0, code }: ClaimRequest = await req.json();

    // Get bonus details
    const { data: bonus, error: bonusError } = await supabaseClient
      .from('bonuses_new')
      .select('*')
      .eq('id', bonus_id)
      .eq('is_active', true)
      .single();

    if (bonusError || !bonus) {
      return new Response(
        JSON.stringify({ error: 'Bonus not found or inactive' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check date validity
    const now = new Date();
    if (bonus.valid_from && new Date(bonus.valid_from) > now) {
      return new Response(
        JSON.stringify({ error: 'Bonus not yet active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    if (bonus.valid_to && new Date(bonus.valid_to) < now) {
      return new Response(
        JSON.stringify({ error: 'Bonus expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check code requirement
    if (bonus.requires_code && bonus.code !== code) {
      return new Response(
        JSON.stringify({ error: 'Invalid bonus code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check minimum deposit
    if (deposit_amount < (bonus.min_deposit || 0)) {
      return new Response(
        JSON.stringify({ error: 'Minimum deposit requirement not met' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check max per user
    const { count: existingCount } = await supabaseClient
      .from('user_bonus_tracking')
      .select('*', { count: 'exact' })
      .eq('user_id', profile.id)
      .eq('bonus_id', bonus_id)
      .in('status', ['active', 'completed', 'forfeited', 'expired']);

    if (existingCount && existingCount >= (bonus.max_per_user || 1)) {
      return new Response(
        JSON.stringify({ error: 'Maximum bonus claims exceeded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check cooldown
    if (bonus.cooldown_hours > 0) {
      const cooldownDate = new Date(now.getTime() - bonus.cooldown_hours * 60 * 60 * 1000);
      const { data: recentBonus } = await supabaseClient
        .from('user_bonus_tracking')
        .select('created_at')
        .eq('user_id', profile.id)
        .eq('bonus_id', bonus_id)
        .gte('created_at', cooldownDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentBonus) {
        return new Response(
          JSON.stringify({ error: 'Cooldown period active' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    // Calculate granted amount
    let granted_amount = 0;
    if (bonus.amount_type === 'percent') {
      granted_amount = Math.min(
        (deposit_amount * bonus.amount_value) / 100,
        bonus.max_cap || Number.MAX_SAFE_INTEGER
      );
    } else {
      granted_amount = Math.min(
        bonus.amount_value,
        bonus.max_cap || bonus.amount_value
      );
    }

    const remaining_rollover = granted_amount * (bonus.rollover_multiplier || 0);

    // Get or create bonus wallet
    let { data: wallet } = await supabaseClient
      .from('wallets')
      .select('id')
      .eq('user_id', profile.id)
      .eq('type', 'bonus')
      .single();

    if (!wallet) {
      const { data: newWallet, error: walletError } = await supabaseClient
        .from('wallets')
        .insert({
          user_id: profile.id,
          type: 'bonus',
          balance: 0,
          currency: 'TRY'
        })
        .select('id')
        .single();

      if (walletError) {
        throw walletError;
      }
      wallet = newWallet;
    }

    // Create user bonus tracking
    const { data: userBonus, error: trackingError } = await supabaseClient
      .from('user_bonus_tracking')
      .insert({
        user_id: profile.id,
        bonus_id: bonus_id,
        status: 'active',
        granted_amount: granted_amount,
        remaining_rollover: remaining_rollover,
        progress: 0,
        currency: 'TRY'
      })
      .select('id')
      .single();

    if (trackingError) {
      throw trackingError;
    }

    // Add wallet transaction
    await supabaseClient
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        direction: 'credit',
        amount: granted_amount,
        ref_type: 'bonus_claim',
        ref_id: userBonus.id,
        ledger_key: `bonus_grant_${userBonus.id}`,
        meta: {
          bonus_id: bonus_id,
          user_bonus_id: userBonus.id,
          deposit_amount: deposit_amount
        }
      });

    // Log bonus event
    await supabaseClient
      .from('bonus_events')
      .insert({
        user_id: profile.id,
        user_bonus_id: userBonus.id,
        type: 'bonus_granted',
        payload: {
          bonus_id: bonus_id,
          granted_amount: granted_amount,
          deposit_amount: deposit_amount,
          code: code
        }
      });

    return new Response(
      JSON.stringify({
        ok: true,
        user_bonus_id: userBonus.id,
        granted: granted_amount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});