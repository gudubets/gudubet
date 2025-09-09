import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    // Create Supabase client using service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const user = userData.user;

    // Parse request body
    const body: PaymentRequest = await req.json();
    const { amount, currency = "TRY", payment_method, provider_id, return_url } = body;

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!payment_method) {
      throw new Error("Payment method is required");
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error("User profile not found");
    }

    // Get user IP and User-Agent for fraud detection
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Calculate risk score (placeholder for now)
    let riskScore = 0;
    try {
      const { data: riskData } = await supabaseClient.rpc("calculate_payment_risk_score", {
        p_user_id: userProfile.id,
        p_amount: amount,
        p_currency: currency,
        p_payment_method: payment_method,
        p_ip_address: ip,
        p_user_agent: userAgent
      });
      riskScore = riskData || 0;
    } catch (error) {
      console.log("Risk calculation failed:", error);
      riskScore = 25; // Default medium risk
    }

    // Get payment provider if specified
    let selectedProvider = null;
    if (provider_id) {
      const { data: provider } = await supabaseClient
        .from("payment_providers")
        .select("*")
        .eq("id", provider_id)
        .eq("is_active", true)
        .single();
      
      selectedProvider = provider;
    } else {
      // Select first active provider matching payment method
      const { data: providers } = await supabaseClient
        .from("payment_providers")
        .select("*")
        .eq("is_active", true)
        .contains("supported_currencies", [currency])
        .limit(1);
      
      selectedProvider = providers?.[0] || null;
    }

    if (!selectedProvider) {
      throw new Error("No suitable payment provider found");
    }

    // Validate amount against provider limits
    if (amount < selectedProvider.min_amount || amount > selectedProvider.max_amount) {
      throw new Error(`Amount must be between ${selectedProvider.min_amount} and ${selectedProvider.max_amount} ${currency}`);
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: userProfile.id,
        amount,
        currency,
        payment_method,
        provider_id: selectedProvider.id,
        status: "pending",
        risk_score: riskScore,
        fraud_check_status: riskScore > 75 ? "high_risk" : riskScore > 50 ? "medium_risk" : "low_risk",
        ip_address: ip,
        user_agent: userAgent,
        metadata: {
          provider_name: selectedProvider.name,
          provider_slug: selectedProvider.slug
        }
      })
      .select()
      .single();

    if (paymentError) {
      throw new Error(`Failed to create payment: ${paymentError.message}`);
    }

    // Initialize Stripe (will only work when STRIPE_SECRET_KEY is set)
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      // For now, return a mock response when Stripe key is not set
      const { error: updateError } = await supabaseClient
        .from("payments")
        .update({
          status: "pending",
          provider_reference: `mock_${Date.now()}`,
          updated_at: new Date().toISOString()
        })
        .eq("id", payment.id);

      if (updateError) {
        console.error("Failed to update payment:", updateError);
      }

      // Log admin activity
      await supabaseClient.from("admin_activities").insert({
        admin_id: userProfile.id,
        action: "payment_initiated",
        entity_type: "payment",
        entity_id: payment.id,
        description: `Payment initiated: ${amount} ${currency} via ${selectedProvider.name}`,
        metadata: {
          amount,
          currency,
          payment_method,
          provider: selectedProvider.name,
          risk_score: riskScore
        }
      });

      return new Response(JSON.stringify({
        success: true,
        payment_id: payment.id,
        message: "Payment created successfully. Stripe integration pending - please add STRIPE_SECRET_KEY to complete setup.",
        amount,
        currency,
        provider: selectedProvider.name
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Process with Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: user.email!,
      limit: 1 
    });

    let customerId = null;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Convert currency to Stripe format
    const stripeCurrency = currency.toLowerCase();
    
    // Convert amount to smallest currency unit
    const stripeAmount = Math.round(amount * (stripeCurrency === 'try' ? 100 : stripeCurrency === 'usd' ? 100 : stripeCurrency === 'eur' ? 100 : 100));

    // Create Stripe checkout session
    const origin = req.headers.get("origin") || "http://localhost:8080";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email!,
      line_items: [
        {
          price_data: {
            currency: stripeCurrency,
            product_data: {
              name: "Deposit",
              description: `Deposit to your account via ${selectedProvider.name}`,
            },
            unit_amount: stripeAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-methods?canceled=true`,
      metadata: {
        payment_id: payment.id,
        user_id: userProfile.id,
        provider_id: selectedProvider.id
      }
    });

    // Update payment with Stripe session info
    const { error: updateError } = await supabaseClient
      .from("payments")
      .update({
        provider_reference: session.id,
        metadata: {
          ...payment.metadata,
          stripe_session_id: session.id,
          stripe_session_url: session.url
        },
        updated_at: new Date().toISOString()
      })
      .eq("id", payment.id);

    if (updateError) {
      console.error("Failed to update payment:", updateError);
    }

    // Log admin activity
    await supabaseClient.from("admin_activities").insert({
      admin_id: userProfile.id,
      action: "payment_initiated",
      entity_type: "payment", 
      entity_id: payment.id,
      description: `Payment initiated: ${amount} ${currency} via ${selectedProvider.name}`,
      metadata: {
        amount,
        currency,
        payment_method,
        provider: selectedProvider.name,
        risk_score: riskScore,
        stripe_session_id: session.id
      }
    });

    return new Response(JSON.stringify({
      success: true,
      payment_id: payment.id,
      payment_url: session.url,
      session_id: session.id,
      amount,
      currency,
      provider: selectedProvider.name
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});