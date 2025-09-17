import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LossBonusRequest {
  user_id?: string;
  loss_amount?: number;
  period_days?: number;
  should_grant?: boolean;
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

    // Get request data - support both old format (userId) and new format (user_id)
    const requestData = await req.json()
    const user_id = requestData.user_id || requestData.userId
    const { loss_amount, period_days = 30, should_grant = true }: LossBonusRequest = requestData

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Kullanıcı ID gerekli' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate user losses using the existing function
    const { data: totalLosses, error: lossError } = await supabaseClient
      .rpc('calculate_user_losses', {
        p_user_id: user_id,
        p_days: period_days
      })

    if (lossError) {
      console.error('Loss calculation error:', lossError)
      return new Response(
        JSON.stringify({ error: 'Kayıp hesaplanamadı' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile for bonus calculation
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, first_name, last_name, kyc_level, created_at')
      .eq('id', user_id)
      .single()

    if (profileError || !profile) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Kullanıcı profili bulunamadı' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already has a recent loss bonus
    const { data: recentBonus, error: bonusCheckError } = await supabaseClient
      .from('bonus_requests')
      .select('id, created_at')
      .eq('user_id', user_id)
      .eq('bonus_type', 'cashback')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('created_at', { ascending: false })
      .limit(1)

    if (bonusCheckError) {
      console.error('Bonus check error:', bonusCheckError)
    }

    if (recentBonus && recentBonus.length > 0) {
      console.log(`User ${user_id} already has a recent loss bonus, skipping`)
      return new Response(
        JSON.stringify({ 
          success: false, 
          totalLoss: totalLosses || 0,
          isEligible: false,
          bonusAmount: 0,
          message: 'Son 7 gün içinde zaten cashback bonusu alınmış',
          recent_bonus_date: recentBonus[0].created_at,
          lastClaimDate: recentBonus[0].created_at
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Determine loss bonus amount based on loss level
    let bonus_percentage = 0
    let max_bonus = 0

    if (totalLosses >= 5000) {
      bonus_percentage = 15 // 15% for high losses
      max_bonus = 2000
    } else if (totalLosses >= 2000) {
      bonus_percentage = 10 // 10% for medium losses
      max_bonus = 1000
    } else if (totalLosses >= 500) {
      bonus_percentage = 5 // 5% for small losses
      max_bonus = 250
    }

    // Only grant bonus if losses are significant enough
    if (bonus_percentage === 0 || totalLosses < 500) {
      console.log(`User ${user_id} losses (${totalLosses}) not significant enough for bonus`)
      return new Response(
        JSON.stringify({ 
          success: false, 
          totalLoss: totalLosses || 0,
          isEligible: false,
          bonusAmount: 0,
          message: 'Kayıp miktarı cashback bonusu için yeterli değil',
          total_losses: totalLosses,
          required_minimum: 500,
          lastClaimDate: null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate bonus amount
    const bonus_amount = Math.min((totalLosses * bonus_percentage) / 100, max_bonus)

    // If should_grant is false, just return calculation
    if (!should_grant) {
      return new Response(
        JSON.stringify({
          success: true,
          totalLoss: totalLosses || 0,
          isEligible: true,
          bonusAmount: bonus_amount,
          bonus_percentage: bonus_percentage,
          max_bonus: max_bonus,
          lastClaimDate: null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create bonus request
    const { data: bonusRequest, error: bonusRequestError } = await supabaseClient
      .from('bonus_requests')
      .insert({
        user_id: user_id,
        bonus_type: 'cashback',
        requested_amount: bonus_amount,
        loss_amount: totalLosses,
        status: 'approved', // Auto-approve loss bonuses
        approved_at: new Date().toISOString(),
        metadata: {
          calculation_period_days: period_days,
          total_losses: totalLosses,
          bonus_percentage: bonus_percentage,
          max_bonus: max_bonus,
          auto_granted: true
        }
      })
      .select()
      .single()

    if (bonusRequestError) {
      console.error('Bonus request creation error:', bonusRequestError)
      return new Response(
        JSON.stringify({ error: 'Bonus talebi oluşturulamadı' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update user's bonus balance
    const { data: currentProfile, error: currentProfileError } = await supabaseClient
      .from('profiles')
      .select('bonus_balance')
      .eq('id', user_id)
      .single()

    if (!currentProfileError && currentProfile) {
      const newBonusBalance = (currentProfile.bonus_balance || 0) + bonus_amount
      
      const { error: balanceUpdateError } = await supabaseClient
        .from('profiles')
        .update({ 
          bonus_balance: newBonusBalance
        })
        .eq('id', user_id)

      if (balanceUpdateError) {
        console.error('Bonus balance update error:', balanceUpdateError)
      }
    }

    // Create bonus event
    await supabaseClient
      .from('bonus_events')
      .insert({
        user_id: user_id,
        type: 'loss_bonus_claimed',
        payload: {
          bonus_amount: bonus_amount,
          total_losses: totalLosses,
          bonus_percentage: bonus_percentage,
          bonus_request_id: bonusRequest.id
        }
      })

    // Log user behavior
    await supabaseClient
      .from('user_behavior_logs')
      .insert({
        user_id: user_id,
        action_type: 'loss_bonus_granted',
        metadata: {
          bonus_amount: bonus_amount,
          total_losses: totalLosses,
          bonus_percentage: bonus_percentage,
          bonus_request_id: bonusRequest.id
        },
        amount: bonus_amount
      })

    console.log(`Loss bonus granted: ${bonus_amount} to user ${user_id} for losses: ${totalLosses}`)

    return new Response(
      JSON.stringify({
        success: true,
        totalLoss: totalLosses || 0,
        isEligible: true,
        bonusAmount: bonus_amount,
        bonus_percentage: bonus_percentage,
        bonus_request_id: bonusRequest.id,
        message: `Tebrikler! ${bonus_percentage}% cashback bonusu hesabınıza yatırıldı (₺${bonus_amount})`,
        lastClaimDate: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Loss bonus calculation error:', error)
    return new Response(
      JSON.stringify({ error: 'Kayıp bonusu hesaplanırken hata oluştu' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})