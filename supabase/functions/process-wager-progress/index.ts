import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WagerProgressData {
  user_id: string;
  amount: number;
  category: string;
  provider: string;
  game_id?: string;
  wager_id: string;
  is_void?: boolean;
  currency?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const wagerData: WagerProgressData = await req.json();
    
    console.log(`Processing wager progress: ${JSON.stringify(wagerData)}`);

    // Get user's active bonuses
    const { data: activeBonuses, error: bonusError } = await supabaseClient
      .from("user_bonus_tracking")
      .select(`
        *,
        bonuses_new!inner(*),
        bonus_rules!inner(*)
      `)
      .eq("user_id", wagerData.user_id)
      .eq("status", "active")
      .gt("remaining_rollover", 0);

    if (bonusError) {
      throw new Error(`Error fetching active bonuses: ${bonusError.message}`);
    }

    if (!activeBonuses || activeBonuses.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No active bonuses with rollover requirements" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Process each active bonus
    for (const userBonus of activeBonuses) {
      const bonus = userBonus.bonuses_new;
      const rules = userBonus.bonus_rules[0]; // Assuming one rule set per bonus

      // Get category weight from rules
      let categoryWeight = 1.0;
      if (rules?.rules?.category_weights) {
        categoryWeight = rules.rules.category_weights[wagerData.category] || 0;
      }

      // Check if provider/game is excluded
      if (rules?.rules?.blacklist_games?.includes(`${wagerData.provider}-*`) ||
          rules?.rules?.blacklist_games?.includes(`${wagerData.provider}-${wagerData.game_id}`)) {
        categoryWeight = 0;
      }

      // Calculate progress contribution
      const progressContribution = wagerData.is_void ? 
        -Math.min(wagerData.amount * categoryWeight, userBonus.progress) : // Void: reduce progress
        wagerData.amount * categoryWeight; // Normal: add progress

      const newProgress = Math.max(0, userBonus.progress + progressContribution);
      const newRemainingRollover = Math.max(0, userBonus.remaining_rollover - progressContribution);

      // Update user bonus progress
      const { data: updatedBonus, error: updateError } = await supabaseClient
        .from("user_bonus_tracking")
        .update({
          progress: newProgress,
          remaining_rollover: newRemainingRollover,
          last_event_at: new Date().toISOString()
        })
        .eq("id", userBonus.id)
        .select()
        .single();

      if (updateError) {
        console.error(`Error updating bonus progress: ${updateError.message}`);
        continue;
      }

      // Log wager event
      await supabaseClient
        .from("bonus_events")
        .insert({
          user_id: wagerData.user_id,
          user_bonus_id: userBonus.id,
          type: wagerData.is_void ? "wager_voided" : "wager_placed",
          payload: {
            wager_id: wagerData.wager_id,
            amount: wagerData.amount,
            category: wagerData.category,
            provider: wagerData.provider,
            game_id: wagerData.game_id,
            category_weight: categoryWeight,
            progress_contribution: progressContribution,
            new_progress: newProgress,
            remaining_rollover: newRemainingRollover
          }
        });

      // Check if bonus is completed
      if (newRemainingRollover <= 0 && userBonus.status === "active") {
        // Mark as completed
        await supabaseClient
          .from("user_bonus_tracking")
          .update({
            status: "completed"
          })
          .eq("id", userBonus.id);

        // Transfer bonus amount from bonus wallet to main wallet
        const { data: bonusWallet } = await supabaseClient
          .from("bonus_wallets")
          .select("*")
          .eq("user_id", wagerData.user_id)
          .eq("type", "bonus")
          .eq("currency", userBonus.currency || "TRY")
          .single();

        const { data: mainWallet } = await supabaseClient
          .from("bonus_wallets")
          .select("*")
          .eq("user_id", wagerData.user_id)
          .eq("type", "main")
          .eq("currency", userBonus.currency || "TRY")
          .single();

        if (bonusWallet && mainWallet) {
          const transferAmount = Math.min(userBonus.granted_amount, bonusWallet.balance);
          
          if (transferAmount > 0) {
            // Debit from bonus wallet
            await supabaseClient
              .from("wallet_transactions")
              .insert({
                wallet_id: bonusWallet.id,
                direction: "debit",
                amount: transferAmount,
                ref_type: "bonus_completed",
                ref_id: userBonus.id,
                ledger_key: `bonus_complete_debit_${userBonus.id}`,
                meta: {
                  bonus_id: bonus.id,
                  transfer_to_main: true
                }
              });

            // Credit to main wallet
            await supabaseClient
              .from("wallet_transactions")
              .insert({
                wallet_id: mainWallet.id,
                direction: "credit",
                amount: transferAmount,
                ref_type: "bonus_completed",
                ref_id: userBonus.id,
                ledger_key: `bonus_complete_credit_${userBonus.id}`,
                meta: {
                  bonus_id: bonus.id,
                  transfer_from_bonus: true
                }
              });
          }
        }

        // Log bonus completed event
        await supabaseClient
          .from("bonus_events")
          .insert({
            user_id: wagerData.user_id,
            user_bonus_id: userBonus.id,
            type: "bonus_completed",
            payload: {
              bonus_id: bonus.id,
              completed_at: new Date().toISOString(),
              final_progress: newProgress,
              transferred_amount: Math.min(userBonus.granted_amount, bonusWallet?.balance || 0)
            }
          });

        // Audit log
        await supabaseClient
          .from("bonus_audit_logs")
          .insert({
            actor_type: "system",
            action: "bonus_completed",
            entity_type: "user_bonus",
            entity_id: userBonus.id,
            meta: {
              user_id: wagerData.user_id,
              bonus_id: bonus.id,
              final_progress: newProgress
            }
          });

        console.log(`Bonus ${userBonus.id} completed for user ${wagerData.user_id}`);
      } else {
        // Log progress update
        await supabaseClient
          .from("bonus_events")
          .insert({
            user_id: wagerData.user_id,
            user_bonus_id: userBonus.id,
            type: "bonus_progressed",
            payload: {
              progress_before: userBonus.progress,
              progress_after: newProgress,
              rollover_before: userBonus.remaining_rollover,
              rollover_after: newRemainingRollover,
              wager_amount: wagerData.amount,
              category_weight: categoryWeight
            }
          });
      }
    }

    console.log(`Wager progress processed for user ${wagerData.user_id}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Wager progress error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});