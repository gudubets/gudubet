import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  amount: number;
  currency?: string;
  payment_method: string;
  provider_id?: string;
  return_url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user from users table
    const { data: userData } = await supabaseClient
      .from("users")
      .select("id, balance, bonus_balance, kyc_status")
      .eq("auth_user_id", user.id)
      .single();

    if (!userData) {
      throw new Error("User profile not found");
    }

    const { amount, currency = "TRY", payment_method, provider_id, return_url } = await req.json() as PaymentRequest;

    // Validate input
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!payment_method) {
      throw new Error("Payment method is required");
    }

    // Get user's IP address for fraud detection
    const ip_address = req.headers.get("CF-Connecting-IP") || req.headers.get("X-Forwarded-For") || "127.0.0.1";
    const user_agent = req.headers.get("User-Agent") || "";

    // Calculate risk score
    const { data: riskScore } = await supabaseClient.rpc("calculate_payment_risk_score", {
      _user_id: userData.id,
      _amount: amount,
      _currency: currency,
      _ip_address: ip_address
    });

    // Generate idempotency key
    const idempotency_key = `payment_${userData.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get payment provider
    let provider = null;
    if (provider_id) {
      const { data: providerData } = await supabaseClient
        .from("payment_providers")
        .select("*")
        .eq("id", provider_id)
        .eq("is_active", true)
        .single();
      provider = providerData;
    } else {
      // Default to first available provider for the payment method
      const { data: providerData } = await supabaseClient
        .from("payment_providers")
        .select("*")
        .eq("provider_type", payment_method === "credit_card" ? "card" : payment_method)
        .eq("is_active", true)
        .order("priority", { ascending: true })
        .limit(1)
        .single();
      provider = providerData;
    }

    if (!provider) {
      throw new Error("No available payment provider for this method");
    }

    // Check amount limits
    if (amount < provider.min_amount || amount > provider.max_amount) {
      throw new Error(`Amount must be between ${provider.min_amount} and ${provider.max_amount} ${currency}`);
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: userData.id,
        provider_id: provider.id,
        payment_method,
        amount,
        currency,
        status: "pending",
        idempotency_key,
        risk_score: riskScore || 0,
        fraud_check_status: riskScore > 50 ? "manual_review" : "passed",
        payment_data: {
          user_agent,
          ip_address,
          return_url
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Payment creation error:", paymentError);
      throw new Error("Failed to create payment record");
    }

    // Mock payment processing based on provider
    let payment_url = null;
    let provider_reference = null;

    if (provider.slug === "stripe") {
      // Mock Stripe integration
      provider_reference = `pi_mock_${Date.now()}`;
      payment_url = `https://checkout.stripe.com/pay/mock?payment_intent=${provider_reference}`;
    } else if (provider.slug === "paytr") {
      // Mock PayTR integration
      provider_reference = `paytr_${Date.now()}`;
      payment_url = `https://www.paytr.com/odeme/mock?token=${provider_reference}`;
    } else if (provider.slug === "iyzico") {
      // Mock Iyzico integration
      provider_reference = `iyz_${Date.now()}`;
      payment_url = `https://sandbox-api.iyzipay.com/payment/mock?token=${provider_reference}`;
    } else if (provider.slug === "papara") {
      // Mock Papara integration
      provider_reference = `pp_${Date.now()}`;
      payment_url = `https://merchant.papara.com/payment/mock?id=${provider_reference}`;
    } else {
      // Bank transfer - no external URL needed
      provider_reference = `bt_${Date.now()}`;
    }

    // Update payment with provider reference
    await supabaseClient
      .from("payments")
      .update({
        provider_reference,
        status: payment_method === "bank_transfer" ? "processing" : "pending"
      })
      .eq("id", payment.id);

    // Log activity
    await supabaseClient
      .from("admin_activities")
      .insert({
        admin_id: user.id,
        action_type: "payment_initiated",
        description: `Payment of ${amount} ${currency} initiated via ${payment_method}`,
        target_type: "payment",
        target_id: payment.id,
        metadata: {
          amount,
          currency,
          payment_method,
          provider: provider.name,
          risk_score: riskScore
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        provider_reference,
        payment_url,
        status: payment_method === "bank_transfer" ? "processing" : "pending",
        risk_score: riskScore,
        fraud_check_status: riskScore > 50 ? "manual_review" : "passed",
        bank_details: payment_method === "bank_transfer" ? {
          bank_name: "Example Bank",
          iban: "TR33 0006 1005 1978 6457 8413 26",
          account_holder: "Casino Platform Ltd",
          reference: provider_reference
        } : null
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});