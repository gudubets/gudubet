import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-signature",
};

interface PaymentWebhookData {
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  provider_ref: string;
  method: string;
  provider: string;
}

// Rate limiting store for webhook endpoints
const webhookRateLimit = new Map<string, { count: number; resetTime: number }>();

function validatePaymentData(data: any): data is PaymentWebhookData {
  return (
    typeof data.user_id === 'string' &&
    typeof data.amount === 'number' &&
    typeof data.currency === 'string' &&
    typeof data.status === 'string' &&
    typeof data.provider_ref === 'string' &&
    typeof data.method === 'string' &&
    typeof data.provider === 'string' &&
    data.amount > 0 &&
    data.amount <= 1000000 && // Max 1M TRY
    ['TRY', 'USD', 'EUR'].includes(data.currency) &&
    ['pending', 'confirmed', 'failed', 'cancelled'].includes(data.status) &&
    ['bank_transfer', 'credit_card', 'papara', 'crypto'].includes(data.method)
  );
}

function sanitizeString(str: string): string {
  return str.replace(/[<>\"'&]/g, '').substring(0, 255);
}

function isWebhookRateLimited(ip: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const ipLimit = webhookRateLimit.get(ip);
  
  if (!ipLimit || now > ipLimit.resetTime) {
    webhookRateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (ipLimit.count >= limit) {
    return true;
  }
  
  ipLimit.count++;
  return false;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (isWebhookRateLimited(clientIP, 10, 60000)) { // 10 requests per minute per IP
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // HMAC signature verification (REQUIRED)
    const signature = req.headers.get("x-signature");
    const body = await req.text();
    const secret = Deno.env.get("PAYMENT_WEBHOOK_SECRET") ?? "";
    
    if (!signature || !secret) {
      console.error("Missing signature or webhook secret");
      return new Response("Unauthorized - Missing signature", { status: 401, headers: corsHeaders });
    }

    if (signature) {
      const expectedSignature = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      
      const calculatedSignature = await crypto.subtle.sign(
        "HMAC",
        expectedSignature,
        new TextEncoder().encode(body)
      );
      
      const calculatedHex = Array.from(new Uint8Array(calculatedSignature))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      if (signature !== `sha256=${calculatedHex}`) {
        console.error("Invalid signature");
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }
    }

    const rawPaymentData = JSON.parse(body);
    
    // Input validation and sanitization
    if (!validatePaymentData(rawPaymentData)) {
      console.error("Invalid payment data:", rawPaymentData);
      return new Response(JSON.stringify({ error: 'Invalid payment data format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Sanitize string inputs
    const paymentData: PaymentWebhookData = {
      ...rawPaymentData,
      user_id: sanitizeString(rawPaymentData.user_id),
      currency: sanitizeString(rawPaymentData.currency),
      status: sanitizeString(rawPaymentData.status),
      provider_ref: sanitizeString(rawPaymentData.provider_ref),
      method: sanitizeString(rawPaymentData.method),
      provider: sanitizeString(rawPaymentData.provider)
    };

    const idempotencyKey = req.headers.get("idempotency-key") || `${paymentData.provider_ref}_${Date.now()}`;

    console.log(`Processing payment webhook for user: ${paymentData.user_id}, amount: ${paymentData.amount}`);

    // Insert/update payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .upsert({
        user_id: paymentData.user_id,
        provider: paymentData.provider,
        method: paymentData.method,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        provider_ref: paymentData.provider_ref,
        idempotency_key: idempotencyKey,
        meta: { webhook_received_at: new Date().toISOString() }
      }, { 
        onConflict: "idempotency_key",
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Payment insert error:", paymentError);
      return new Response(JSON.stringify({ error: paymentError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // If payment is confirmed, trigger bonus logic
    if (paymentData.status === "confirmed") {
      // Create deposit event
      await supabaseClient
        .from("bonus_events")
        .insert({
          user_id: paymentData.user_id,
          type: "deposit_made",
          payload: {
            payment_id: payment.id,
            amount: paymentData.amount,
            currency: paymentData.currency,
            method: paymentData.method
          }
        });

      // Check for eligible bonuses
      const { data: eligibleBonuses } = await supabaseClient
        .from("bonuses_new")
        .select(`
          *,
          bonus_rules(*)
        `)
        .eq("is_active", true)
        .eq("auto_grant", true)
        .lte("min_deposit", paymentData.amount)
        .or(`valid_from.is.null,valid_from.lte.${new Date().toISOString()}`)
        .or(`valid_to.is.null,valid_to.gte.${new Date().toISOString()}`);

      // Grant first eligible bonus
      if (eligibleBonuses && eligibleBonuses.length > 0) {
        const bonus = eligibleBonuses[0];
        let bonusAmount = 0;

        if (bonus.amount_type === "percent") {
          bonusAmount = (paymentData.amount * bonus.amount_value) / 100;
          if (bonus.max_cap) {
            bonusAmount = Math.min(bonusAmount, bonus.max_cap);
          }
        } else {
          bonusAmount = bonus.amount_value;
        }

        // Check if user already has this bonus
        const { data: existingBonus } = await supabaseClient
          .from("user_bonus_tracking")
          .select("*")
          .eq("user_id", paymentData.user_id)
          .eq("bonus_id", bonus.id)
          .in("status", ["eligible", "active"])
          .maybeSingle();

        if (!existingBonus) {
          // Create user bonus
          const { data: userBonus, error: bonusError } = await supabaseClient
            .from("user_bonus_tracking")
            .insert({
              user_id: paymentData.user_id,
              bonus_id: bonus.id,
              status: "active",
              granted_amount: bonusAmount,
              remaining_rollover: bonusAmount * bonus.rollover_multiplier,
              currency: paymentData.currency,
              expires_at: bonus.valid_days ? 
                new Date(Date.now() + bonus.valid_days * 24 * 60 * 60 * 1000).toISOString() : 
                null
            })
            .select()
            .single();

          if (!bonusError && userBonus) {
            // Ensure user has bonus wallet
            await supabaseClient
              .from("bonus_wallets")
              .upsert({
                user_id: paymentData.user_id,
                type: "bonus",
                currency: paymentData.currency
              }, {
                onConflict: "user_id,type,currency",
                ignoreDuplicates: true
              });

            // Get bonus wallet
            const { data: bonusWallet } = await supabaseClient
              .from("bonus_wallets")
              .select("*")
              .eq("user_id", paymentData.user_id)
              .eq("type", "bonus")
              .eq("currency", paymentData.currency)
              .single();

            if (bonusWallet) {
              // Add bonus to wallet (double-entry)
              await supabaseClient
                .from("wallet_transactions")
                .insert({
                  wallet_id: bonusWallet.id,
                  direction: "credit",
                  amount: bonusAmount,
                  ref_type: "bonus_granted",
                  ref_id: userBonus.id,
                  ledger_key: `bonus_grant_${userBonus.id}`,
                  meta: { 
                    bonus_id: bonus.id,
                    payment_id: payment.id,
                    bonus_type: bonus.type
                  }
                });

              // Log bonus granted event
              await supabaseClient
                .from("bonus_events")
                .insert({
                  user_id: paymentData.user_id,
                  user_bonus_id: userBonus.id,
                  type: "bonus_granted",
                  payload: {
                    bonus_id: bonus.id,
                    amount: bonusAmount,
                    rollover_requirement: bonusAmount * bonus.rollover_multiplier
                  }
                });

              // Audit log
              await supabaseClient
                .from("bonus_audit_logs")
                .insert({
                  actor_type: "system",
                  action: "bonus_auto_granted",
                  entity_type: "user_bonus",
                  entity_id: userBonus.id,
                  meta: {
                    user_id: paymentData.user_id,
                    bonus_id: bonus.id,
                    amount: bonusAmount,
                    trigger: "deposit_made"
                  }
                });
            }
          }
        }
      }
    }

    console.log(`Payment webhook processed successfully for user ${paymentData.user_id}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Payment webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});