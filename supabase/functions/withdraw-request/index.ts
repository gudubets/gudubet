import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WithdrawalRequest {
  amount: number;
  currency?: string;
  payment_method_id?: string;
  bank_name?: string;
  iban?: string;
  account_holder?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Yetkilendirme başlığı eksik" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Geçersiz yetkilendirme" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Sadece POST method destekleniyor" }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: WithdrawalRequest = await req.json();
    
    // Validate input
    if (!body.amount || body.amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Geçerli bir miktar giriniz" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile to check for user_id
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, balance, kyc_level, kyc_status")
      .eq("auth_user_id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Kullanıcı profili bulunamadı" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has sufficient balance
    if (profile.balance < body.amount) {
      return new Response(
        JSON.stringify({ error: "Yetersiz bakiye" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check KYC requirements for large amounts
    if (body.amount > 1000 && profile.kyc_level === 'level_0') {
      return new Response(
        JSON.stringify({ 
          error: "1000 TL üzeri çekimler için KYC doğrulaması gereklidir",
          requires_kyc: true 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing pending withdrawals
    const { data: pendingWithdrawals } = await supabase
      .from("withdrawals")
      .select("id")
      .eq("user_id", profile.id)
      .eq("status", "pending");

    if (pendingWithdrawals && pendingWithdrawals.length > 0) {
      return new Response(
        JSON.stringify({ error: "Bekleyen çekim talebiniz bulunmaktadır" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate fees (simple 2% fee for now)
    const feeAmount = body.amount * 0.02;
    const netAmount = body.amount - feeAmount;

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .insert({
        user_id: profile.id,
        amount: body.amount,
        currency: body.currency || "TRY",
        fee_amount: feeAmount,
        net_amount: netAmount,
        status: "pending",
        risk_score: 0, // Will be calculated by triggers
        risk_flags: [],
        requires_kyc: body.amount > 1000 && profile.kyc_level === 'level_0',
        requires_manual_review: body.amount > 5000,
        metadata: {
          bank_name: body.bank_name,
          iban: body.iban,
          account_holder: body.account_holder,
          request_ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
          user_agent: req.headers.get("user-agent")
        }
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error("Withdrawal creation error:", withdrawalError);
      return new Response(
        JSON.stringify({ error: "Çekim talebi oluşturulamadı" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the activity
    await supabase.from("admin_activities").insert({
      admin_id: user.id,
      action_type: "withdrawal_requested",
      description: `Çekim talebi oluşturuldu: ${body.amount} ${body.currency || 'TRY'}`,
      target_type: "withdrawal",
      target_id: withdrawal.id,
      metadata: {
        amount: body.amount,
        currency: body.currency || 'TRY',
        user_id: profile.id
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        withdrawal_id: withdrawal.id,
        message: "Çekim talebiniz başarıyla oluşturuldu"
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in withdraw-request function:", error);
    return new Response(
      JSON.stringify({ error: "Sunucu hatası" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});