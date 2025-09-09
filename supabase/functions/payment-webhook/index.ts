import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHash, createHmac } from "https://deno.land/std@0.190.0/crypto/mod.ts";

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
    const signature = req.headers.get("signature") || req.headers.get("x-signature") || "";

    console.log(`Webhook received from ${provider}:`, body);

    // Log webhook for debugging
    await supabaseClient
      .from("payment_webhooks")
      .insert({
        provider_slug: provider,
        webhook_type: "payment_status",
        payload: JSON.parse(body),
        signature
      });

    let webhookData;
    let paymentId = null;
    let newStatus = "pending";

    // Process webhook based on provider
    switch (provider) {
      case "stripe":
        webhookData = JSON.parse(body);
        if (webhookData.type === "payment_intent.succeeded") {
          paymentId = webhookData.data.object.metadata?.payment_id;
          newStatus = "completed";
        } else if (webhookData.type === "payment_intent.payment_failed") {
          paymentId = webhookData.data.object.metadata?.payment_id;
          newStatus = "failed";
        }
        break;

      case "paytr":
        webhookData = JSON.parse(body);
        paymentId = webhookData.merchant_oid;
        if (webhookData.status === "success") {
          newStatus = "completed";
        } else {
          newStatus = "failed";
        }
        break;

      case "iyzico":
        webhookData = JSON.parse(body);
        paymentId = webhookData.paymentId;
        if (webhookData.status === "success") {
          newStatus = "completed";
        } else {
          newStatus = "failed";
        }
        break;

      case "papara":
        webhookData = JSON.parse(body);
        paymentId = webhookData.id;
        if (webhookData.status === 1) { // 1 = success in Papara
          newStatus = "completed";
        } else {
          newStatus = "failed";
        }
        break;

      default:
        throw new Error(`Unknown payment provider: ${provider}`);
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
            currency: payment.currency
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
      .eq("provider_slug", provider)
      .eq("payload", JSON.parse(body));

    console.log(`Webhook processed successfully for payment ${payment.id}, new status: ${newStatus}`);

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        status: newStatus
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