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
    const requestBody = await req.json()
    console.log('Withdrawal request received:', requestBody)
    
    const { amount, method, payout_details, iban, papara_id, phone, asset, network, address, tag }: any = requestBody

    // Build payout_details object based on method
    let finalPayoutDetails = payout_details;
    
    if (!finalPayoutDetails) {
      switch (method) {
        case 'bank':
          finalPayoutDetails = {
            iban: iban,
            account_holder_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
          };
          break;
        case 'papara':
          finalPayoutDetails = {
            papara_id: papara_id,
            phone: phone
          };
          break;
        case 'crypto':
          finalPayoutDetails = {
            asset: asset,
            network: network,
            address: address,
            tag: tag
          };
          break;
        default:
          finalPayoutDetails = {};
      }
    }

    console.log('Final payout details:', finalPayoutDetails)

    // Validate input
    if (!amount || amount < 20 || amount > 10000) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz miktar. Min: ₺20, Max: ₺10,000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!method || !finalPayoutDetails) {
      console.error('Missing method or payout details:', { method, finalPayoutDetails })
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
      .maybeSingle()

    if (profileError) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Profil hatası: ' + profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!profile) {
      console.error('Profile not found for user:', user.id)
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
        _user_id: profile.id,
        _amount: amount
      })

    if (kycError) {
      console.error('KYC check error:', kycError)
      return new Response(
        JSON.stringify({ error: 'KYC kontrol hatası: ' + kycError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('KYC Check result:', kycCheck)

    // No fees - full amount goes to user
    const feeAmount = 0;
    const netAmount = amount;

    // Create withdrawal record - the trigger will handle KYC validation
    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from('withdrawals')
      .insert({
        user_id: profile.id,
        amount: amount,
        net_amount: netAmount,
        fee_amount: feeAmount,
        currency: 'TRY',
        method: method,
        payout_details: finalPayoutDetails,
        status: 'pending'
      })
      .select()
      .maybeSingle()

    if (withdrawalError) {
      console.error('Withdrawal creation error:', withdrawalError)
      
      // Check if it's a KYC rejection from trigger
      if (withdrawalError.message?.includes('KYC') || withdrawalError.message?.includes('limit')) {
        return new Response(
          JSON.stringify({ 
            error: withdrawalError.message,
            kyc_info: kycCheck,
            requires_kyc: true
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Çekim talebi oluşturulamadı: ' + withdrawalError.message,
          details: withdrawalError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!withdrawal) {
      console.error('Withdrawal not created - no data returned')
      return new Response(
        JSON.stringify({ error: 'Çekim talebi oluşturulamadı - veri döndürülmedi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get or create user's main wallet
    const { data: wallet, error: walletFindError } = await supabaseClient
      .from('wallets')
      .select('id')
      .eq('user_id', profile.id)
      .eq('type', 'main')
      .maybeSingle()

    let walletId = wallet?.id;
    
    if (!wallet && !walletFindError) {
      // Create main wallet if doesn't exist
      const { data: newWallet, error: walletCreateError } = await supabaseClient
        .from('wallets')
        .insert({
          user_id: profile.id,
          type: 'main',
          currency: 'TRY',
          balance: 0
        })
        .select('id')
        .single()

      if (walletCreateError) {
        console.error('Wallet creation error:', walletCreateError)
      } else {
        walletId = newWallet?.id;
      }
    }

    // Create wallet transaction for withdrawal hold (if wallet exists)
    if (walletId) {
      const { error: walletError } = await supabaseClient
        .from('wallet_transactions')
        .insert({
          wallet_id: walletId,
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
    }

    // Log user behavior
    await supabaseClient
      .from('user_behavior_logs')
      .insert({
        user_id: profile.id,
        action_type: 'withdrawal_request',
        metadata: {
          amount: amount,
          method: method,
          withdrawal_id: withdrawal.id
        },
        amount: amount,
        ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })

    console.log(`Withdrawal request created: ${withdrawal.id} for user ${user.id}, amount: ${amount}`)

    const responseData: any = {
      success: true,
      withdrawal_id: withdrawal.id,
      amount: amount,
      net_amount: netAmount,
      fee_amount: feeAmount,
      status: withdrawal.status,
      message: withdrawal.requires_kyc 
        ? 'Çekim talebiniz KYC incelemesi gerektiriyor. Lütfen kimlik belgelerinizi yükleyiniz.'
        : 'Çekim talebiniz başarıyla oluşturuldu. İnceleme süreci 1-24 saat sürebilir.'
    }

    // Add KYC info if limits were exceeded
    if (!kycCheck?.allowed) {
      responseData.kyc_info = {
        reason: kycCheck.reason,
        daily_limit: kycCheck.daily_limit,
        daily_remaining: kycCheck.daily_remaining,
        monthly_limit: kycCheck.monthly_limit,
        monthly_remaining: kycCheck.monthly_remaining
      }
      responseData.message = 'Çekim talebiniz oluşturuldu ancak KYC limit kontrolü nedeniyle manuel inceleme gerekiyor.'
    }

    return new Response(
      JSON.stringify(responseData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Withdrawal request error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Sunucu hatası oluştu',
        message: error instanceof Error ? error.message : 'Bilinmeyen hata',
        details: error
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})