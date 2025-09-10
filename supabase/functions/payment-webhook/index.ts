import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "https://deno.land/std@0.190.0/crypto/mod.ts";

// Webhook signature verification functions
const verifyStripeSignature = (payload: string, signature: string, secret: string): boolean => {
  try {
    const expectedSignature = createHmac("sha256", secret).update(payload).digest("hex");
    const providedSignature = signature.replace("sha256=", "");
    return expectedSignature === providedSignature;
  } catch {
    return false;
  }
};

const verifyPayTRSignature = (payload: any, signature: string, secret: string): boolean => {
  try {
    // PayTR uses MD5 hash of specific fields
    const hashString = `${payload.merchant_oid}${payload.status}${payload.total_amount}${secret}`;
    const expectedHash = createHmac("md5", "").update(hashString).digest("hex");
    return expectedHash === signature;
  } catch {
    return false;
  }
};

const verifyIyzicoSignature = (payload: string, signature: string, secret: string): boolean => {
  try {
    const expectedSignature = createHmac("sha1", secret).update(payload).digest("base64");
    return expectedSignature === signature;
  } catch {
    return false;
  }
};

const verifyPaparaSignature = (payload: any, signature: string, secret: string): boolean => {
  try {
    // Papara uses HMAC-SHA256 of specific fields
    const dataToSign = `${payload.id}${payload.status}${payload.amount}${secret}`;
    const expectedSignature = createHmac("sha256", secret).update(dataToSign).digest("hex");
    return expectedSignature === signature;
  } catch {
    return false;
  }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for webhook processing
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const provider = url.searchParams.get("provider") || "unknown";
    
    const body = await req.text();
    const signature = req.headers.get("signature") || req.headers.get("x-signature") || req.headers.get("x-hub-signature-256") || "";

    console.log(`Webhook received from ${provider}`);

    // Get provider webhook secret for signature verification
    const webhookSecrets = {
      stripe: Deno.env.get("STRIPE_WEBHOOK_SECRET"),
      paytr: Deno.env.get("PAYTR_WEBHOOK_SECRET"),
      iyzico: Deno.env.get("IYZICO_WEBHOOK_SECRET"),
      papara: Deno.env.get("PAPARA_WEBHOOK_SECRET"),
    };

    const webhookSecret = webhookSecrets[provider as keyof typeof webhookSecrets];
    if (!webhookSecret) {
      throw new Error(`Webhook secret not configured for provider: ${provider}`);
    }

    // Parse webhook data
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch {
      throw new Error("Invalid JSON payload");
    }

    // Verify signature based on provider
    let signatureValid = false;
    switch (provider) {
      case "stripe":
        signatureValid = verifyStripeSignature(body, signature, webhookSecret);
        break;
      case "paytr":
        signatureValid = verifyPayTRSignature(webhookData, signature, webhookSecret);
        break;
      case "iyzico":
        signatureValid = verifyIyzicoSignature(body, signature, webhookSecret);
        break;
      case "papara":
        signatureValid = verifyPaparaSignature(webhookData, signature, webhookSecret);
        break;
      default:
        throw new Error(`Unknown payment provider: ${provider}`);
    }

    if (!signatureValid) {
      console.error(`Invalid signature for ${provider} webhook`);
      throw new Error("Invalid webhook signature");
    }

    // Create idempotency key from webhook data
    const idempotencyKey = createHmac("sha256", "webhook-idempotency")
      .update(`${provider}-${JSON.stringify(webhookData)}`)
      .digest("hex");

    // Check if webhook was already processed (idempotency check)
    const { data: existingWebhook } = await supabaseClient
      .from("payment_webhooks")
      .select("id, processed, payment_id")
      .eq("idempotency_key", idempotencyKey)
      .single();

    if (existingWebhook?.processed) {
      console.log(`Webhook already processed with idempotency key: ${idempotencyKey}`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Webhook already processed",
          payment_id: existingWebhook.payment_id
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Log webhook for debugging (with idempotency key)
    const { data: webhookLog } = await supabaseClient
      .from("payment_webhooks")
      .insert({
        provider_slug: provider,
        webhook_type: "payment_status",
        payload: webhookData,
        signature,
        idempotency_key: idempotencyKey,
        processed: false
      })
      .select()
      .single();

    let paymentId = null;
    let newStatus = "pending";

    // Extract payment data based on provider
    switch (provider) {
      case "stripe":
        if (webhookData.type === "payment_intent.succeeded") {
          paymentId = webhookData.data.object.metadata?.payment_id;
          newStatus = "completed";
        } else if (webhookData.type === "payment_intent.payment_failed") {
          paymentId = webhookData.data.object.metadata?.payment_id;
          newStatus = "failed";
        }
        break;

      case "paytr":
        paymentId = webhookData.merchant_oid;
        if (webhookData.status === "success") {
          newStatus = "completed";
        } else {
          newStatus = "failed";
        }
        break;

      case "iyzico":
        paymentId = webhookData.paymentId;
        if (webhookData.status === "success") {
          newStatus = "completed";
        } else {
          newStatus = "failed";
        }
        break;

      case "papara":
        paymentId = webhookData.id;
        if (webhookData.status === 1) { // 1 = success in Papara
          newStatus = "completed";
        } else {
          newStatus = "failed";
        }
        break;
    }

    if (!paymentId) {
      throw new Error("Payment ID not found in webhook");
    }

    // Find payment by provider reference
    const { data: payment } = await supabaseClient
      .from("payments")
      .select("*, users!fk_payments_user_id(id, auth_user_id, balance)")
      .eq("provider_reference", paymentId)
      .single();

    if (!payment) {
      throw new Error(`Payment not found for reference: ${paymentId}`);
    }

    // Check if payment is already in final state (additional idempotency check)
    if (payment.status === "completed" || payment.status === "failed") {
      console.log(`Payment ${payment.id} already in final state: ${payment.status}`);
      
      // Mark webhook as processed
      await supabaseClient
        .from("payment_webhooks")
        .update({
          processed: true,
          payment_id: payment.id,
          processed_at: new Date().toISOString()
        })
        .eq("id", webhookLog.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment already processed",
          payment_id: payment.id,
          status: payment.status
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Update payment status
    const updateData: any = {
      status: newStatus,
      provider_status: JSON.stringify(webhookData),
      webhook_data: webhookData,
      processed_at: new Date().toISOString()
    };

    if (newStatus === "failed" && webhookData.error) {
      updateData.failure_reason = webhookData.error.message || webhookData.error;
    }

    const { error: updateError } = await supabaseClient
      .from("payments")
      .update(updateData)
      .eq("id", payment.id);

    if (updateError) {
      throw new Error(`Failed to update payment: ${updateError.message}`);
    }

    // If payment is completed, update user balance
    if (newStatus === "completed") {
      const { error: balanceError } = await supabaseClient
        .from("users")
        .update({
          balance: parseFloat(payment.users.balance) + parseFloat(payment.amount)
        })
        .eq("id", payment.user_id);

      if (balanceError) {
        console.error("Failed to update user balance:", balanceError);
        throw new Error(`Failed to update user balance: ${balanceError.message}`);
      }

      // Log successful deposit
      await supabaseClient
        .from("admin_activities")
        .insert({
          admin_id: payment.users.auth_user_id,
          action_type: "payment_completed",
          description: `Payment of ${payment.amount} ${payment.currency} completed successfully`,
          target_type: "payment",
          target_id: payment.id,
          metadata: {
            provider: provider,
            amount: payment.amount,
            currency: payment.currency,
            idempotency_key: idempotencyKey
          }
        });
    }

    // Mark webhook as processed
    await supabaseClient
      .from("payment_webhooks")
      .update({
        processed: true,
        payment_id: payment.id,
        processed_at: new Date().toISOString()
      })
      .eq("id", webhookLog.id);

    console.log(`Webhook processed successfully for payment ${payment.id}, new status: ${newStatus}`);

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        status: newStatus,
        idempotency_key: idempotencyKey
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Webhook processing error:", error);
    
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