import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WithdrawalRequest {
  amount: number;
  method: string;
  payout_details: any;
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
    const { amount, method, payout_details }: WithdrawalRequest = await req.json()

    // Validate input
    if (!amount || amount < 20 || amount > 10000) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz miktar. Min: ₺20, Max: ₺10,000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!method || !payout_details) {
      return new Response(
        JSON.stringify({ error: 'Çekim yöntemi ve hesap bilgileri gerekli' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile and balance
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, first_name, last_name, balance, kyc_level, kyc_status')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Kullanıcı profili bulunamadı' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check balance
    if (profile.balance < amount) {
      return new Response(
        JSON.stringify({ 
          error: 'Yetersiz bakiye',
          current_balance: profile.balance,
          requested_amount: amount
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check KYC limits using the existing function
    const { data: kycCheck, error: kycError } = await supabaseClient
      .rpc('check_kyc_withdrawal_limit', {
        _user_id: user.id,
        _amount: amount
      })

    if (kycError) {
      console.error('KYC check error:', kycError)
      return new Response(
        JSON.stringify({ error: 'KYC kontrol hatası' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create withdrawal record - the trigger will handle KYC validation
    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from('withdrawals')
      .insert({
        user_id: profile.id,
        amount: amount,
        currency: 'TRY',
        method: method,
        payout_details: payout_details,
        status: 'pending'
      })
      .select()
      .single()

    if (withdrawalError) {
      console.error('Withdrawal creation error:', withdrawalError)
      return new Response(
        JSON.stringify({ error: 'Çekim talebi oluşturulamadı: ' + withdrawalError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create pending wallet transaction (will be confirmed when withdrawal is approved)
    const { error: walletError } = await supabaseClient
      .from('wallet_transactions')
      .insert({
        wallet_id: (await supabaseClient
          .from('wallets')
          .select('id')
          .eq('user_id', profile.id)
          .eq('type', 'main')
          .single()).data?.id,
        direction: 'debit',
        amount: amount,
        ref_type: 'withdrawal_hold',
        ref_id: withdrawal.id,
        ledger_key: 'WITHDRAWAL_HOLD',
        meta: {
          withdrawal_id: withdrawal.id,
          method: method
        }
      })

    if (walletError) {
      console.error('Wallet transaction error:', walletError)
      // Don't fail the request, the withdrawal was created
    }

    // Log user behavior
    await supabaseClient
      .from('user_behavior_logs')
      .insert({
        user_id: profile.id,
        action_type: 'withdrawal_request',
        action_details: {
          amount: amount,
          method: method,
          withdrawal_id: withdrawal.id
        },
        ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })

    console.log(`Withdrawal request created: ${withdrawal.id} for user ${user.id}, amount: ${amount}`)

    const responseData: any = {
      success: true,
      withdrawal_id: withdrawal.id,
      amount: amount,
      status: withdrawal.status,
      message: withdrawal.requires_kyc 
        ? 'Çekim talebiniz KYC incelemesi gerektiriyor. Lütfen kimlik belgelerinizi yükleyiniz.'
        : 'Çekim talebiniz başarıyla oluşturuldu. İnceleme süreci 1-24 saat sürebilir.'
    }

    // Add KYC info if limits were exceeded
    if (!kycCheck.allowed) {
      responseData.kyc_info = {
        reason: kycCheck.reason,
        daily_limit: kycCheck.daily_limit,
        daily_remaining: kycCheck.daily_remaining,
        monthly_limit: kycCheck.monthly_limit,
        monthly_remaining: kycCheck.monthly_remaining
      }
    }

    return new Response(
      JSON.stringify(responseData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Withdrawal request error:', error)
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası oluştu' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})