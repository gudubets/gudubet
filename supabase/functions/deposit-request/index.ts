import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DepositRequest {
  amount: number;
  bank_account_id: string;
  user_account_name: string;
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
    const { amount, bank_account_id, user_account_name }: DepositRequest = await req.json()

    // Validate input
    if (!amount || amount < 10 || amount > 50000) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz miktar. Min: ₺10, Max: ₺50,000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!bank_account_id) {
      return new Response(
        JSON.stringify({ error: 'Banka hesabı seçimi gerekli' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!user_account_name) {
      return new Response(
        JSON.stringify({ error: 'Hesap sahibi adı gerekli' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, first_name, last_name, kyc_level')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Kullanıcı profili bulunamadı' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create deposit record
    const { data: deposit, error: depositError } = await supabaseClient
      .from('deposits')
      .insert({
        user_id: profile.id,
        amount: amount,
        bank_account_id: bank_account_id,
        user_account_name: user_account_name || `${profile.first_name} ${profile.last_name}`,
        status: 'pending'
      })
      .select()
      .single()

    if (depositError) {
      console.error('Deposit creation error:', depositError)
      return new Response(
        JSON.stringify({ error: 'Para yatırma talebi oluşturulamadı' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create payment record for tracking
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: profile.id,
        amount: amount,
        currency: 'TRY',
        payment_method: 'bank_transfer',
        status: 'pending',
        transaction_type: 'deposit',
        reference_id: deposit.id,
        metadata: {
          deposit_id: deposit.id,
          bank_account_id: bank_account_id
        }
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      // Don't fail the request, just log the error
    }

    // Log user behavior
    await supabaseClient
      .from('user_behavior_logs')
      .insert({
        user_id: profile.id,
        action_type: 'deposit_request',
        metadata: {
          amount: amount,
          bank_account_id: bank_account_id,
          deposit_id: deposit.id
        },
        amount: amount,
        ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })

    console.log(`Deposit request created: ${deposit.id} for user ${user.id}, amount: ${amount}`)

    return new Response(
      JSON.stringify({
        success: true,
        deposit_id: deposit.id,
        amount: amount,
        status: 'pending',
        message: 'Para yatırma talebiniz başarıyla oluşturuldu. İnceleme süreci 5-10 dakika sürebilir.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Deposit request error:', error)
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası oluştu' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})