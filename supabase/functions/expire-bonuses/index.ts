import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting bonus expiry job...");

    const now = new Date().toISOString();

    // Find expired bonuses
    const { data: expiredBonuses, error: fetchError } = await supabaseClient
      .from("user_bonus_tracking")
      .select(`
        *,
        bonuses_new!inner(*)
      `)
      .in("status", ["eligible", "active"])
      .or(`expires_at.lt.${now},bonuses_new.valid_to.lt.${now}`);

    if (fetchError) {
      throw new Error(`Error fetching expired bonuses: ${fetchError.message}`);
    }

    if (!expiredBonuses || expiredBonuses.length === 0) {
      console.log("No expired bonuses found");
      return new Response(JSON.stringify({ 
        message: "No expired bonuses found",
        processed: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Found ${expiredBonuses.length} expired bonuses`);

    let processedCount = 0;
    let errorCount = 0;

    // Process each expired bonus
    for (const userBonus of expiredBonuses) {
      try {
        console.log(`Processing expired bonus: ${userBonus.id}`);

        // Update status to expired
        const { error: updateError } = await supabaseClient
          .from("user_bonus_tracking")
          .update({
            status: "expired",
            last_event_at: now
          })
          .eq("id", userBonus.id);

        if (updateError) {
          console.error(`Error updating bonus ${userBonus.id}: ${updateError.message}`);
          errorCount++;
          continue;
        }

        // If there's remaining bonus balance, remove it
        if (userBonus.status === "active" && userBonus.granted_amount > 0) {
          const { data: bonusWallet } = await supabaseClient
            .from("bonus_wallets")
            .select("*")
            .eq("user_id", userBonus.user_id)
            .eq("type", "bonus")
            .eq("currency", userBonus.currency || "TRY")
            .single();

          if (bonusWallet && bonusWallet.balance > 0) {
            // Remove remaining bonus balance
            await supabaseClient
              .from("wallet_transactions")
              .insert({
                wallet_id: bonusWallet.id,
                direction: "debit",
                amount: Math.min(bonusWallet.balance, userBonus.granted_amount),
                ref_type: "bonus_expired",
                ref_id: userBonus.id,
                ledger_key: `bonus_expire_${userBonus.id}`,
                meta: {
                  bonus_id: userBonus.bonus_id,
                  reason: "bonus_expired",
                  expired_at: now
                }
              });
          }
        }

        // Log bonus expired event
        await supabaseClient
          .from("bonus_events")
          .insert({
            user_id: userBonus.user_id,
            user_bonus_id: userBonus.id,
            type: "bonus_expired",
            payload: {
              bonus_id: userBonus.bonus_id,
              expired_at: now,
              progress: userBonus.progress,
              remaining_rollover: userBonus.remaining_rollover,
              granted_amount: userBonus.granted_amount
            }
          });

        // Audit log
        await supabaseClient
          .from("bonus_audit_logs")
          .insert({
            actor_type: "system",
            action: "bonus_expired",
            entity_type: "user_bonus",
            entity_id: userBonus.id,
            meta: {
              user_id: userBonus.user_id,
              bonus_id: userBonus.bonus_id,
              expired_at: now,
              progress: userBonus.progress,
              remaining_rollover: userBonus.remaining_rollover
            }
          });

        processedCount++;
        console.log(`Expired bonus ${userBonus.id} for user ${userBonus.user_id}`);

      } catch (bonusError) {
        console.error(`Error processing bonus ${userBonus.id}:`, bonusError);
        errorCount++;
      }
    }

    console.log(`Bonus expiry job completed. Processed: ${processedCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({ 
      success: true,
      processed: processedCount,
      errors: errorCount,
      total_found: expiredBonuses.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Bonus expiry job error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});