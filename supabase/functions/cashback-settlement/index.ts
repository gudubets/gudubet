import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CashbackCalculation {
  user_id: string;
  total_bets: number;
  total_wins: number;
  net_loss: number;
  cashback_percentage: number;
  cashback_amount: number;
  currency: string;
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

    console.log("Starting cashback settlement job...");

    const cashbackWindowDays = parseInt(Deno.env.get("CASHBACK_WINDOW_DAYS") || "7");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - cashbackWindowDays);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday

    console.log(`Calculating cashback for period: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Get active cashback bonuses
    const { data: cashbackBonuses, error: bonusError } = await supabaseClient
      .from("bonuses_new")
      .select("*")
      .eq("type", "CASHBACK")
      .eq("is_active", true)
      .lte("valid_from", endDate.toISOString())
      .gte("valid_to", endDate.toISOString());

    if (bonusError) {
      throw new Error(`Error fetching cashback bonuses: ${bonusError.message}`);
    }

    if (!cashbackBonuses || cashbackBonuses.length === 0) {
      console.log("No active cashback bonuses found");
      return new Response(JSON.stringify({ 
        message: "No active cashback bonuses found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const cashbackBonus = cashbackBonuses[0]; // Use first active cashback bonus

    // Calculate user losses for the period
    const { data: userStats, error: statsError } = await supabaseClient
      .rpc("calculate_user_cashback_stats", {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        min_loss_amount: cashbackBonus.min_deposit || 0
      });

    if (statsError) {
      throw new Error(`Error calculating user stats: ${statsError.message}`);
    }

    if (!userStats || userStats.length === 0) {
      console.log("No users eligible for cashback");
      return new Response(JSON.stringify({ 
        message: "No users eligible for cashback" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Found ${userStats.length} users eligible for cashback`);

    let processedCount = 0;
    let errorCount = 0;
    let totalCashbackAmount = 0;

    // Process each eligible user
    for (const userStat of userStats) {
      try {
        console.log(`Processing cashback for user: ${userStat.user_id}`);

        const netLoss = userStat.total_bets - userStat.total_wins;
        
        if (netLoss <= 0) {
          console.log(`User ${userStat.user_id} has no net loss, skipping`);
          continue;
        }

        // Calculate cashback amount
        let cashbackAmount = 0;
        if (cashbackBonus.amount_type === "percent") {
          cashbackAmount = (netLoss * cashbackBonus.amount_value) / 100;
        } else {
          cashbackAmount = cashbackBonus.amount_value;
        }

        // Apply max cap if exists
        if (cashbackBonus.max_cap && cashbackAmount > cashbackBonus.max_cap) {
          cashbackAmount = cashbackBonus.max_cap;
        }

        // Check if user already received cashback for this period
        const { data: existingCashback } = await supabaseClient
          .from("user_bonus_tracking")
          .select("*")
          .eq("user_id", userStat.user_id)
          .eq("bonus_id", cashbackBonus.id)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString())
          .maybeSingle();

        if (existingCashback) {
          console.log(`User ${userStat.user_id} already received cashback for this period`);
          continue;
        }

        // Create cashback bonus
        const { data: userBonus, error: bonusInsertError } = await supabaseClient
          .from("user_bonus_tracking")
          .insert({
            user_id: userStat.user_id,
            bonus_id: cashbackBonus.id,
            status: "active",
            granted_amount: cashbackAmount,
            remaining_rollover: cashbackAmount * (cashbackBonus.rollover_multiplier || 1),
            currency: userStat.currency || "TRY",
            expires_at: cashbackBonus.valid_days ? 
              new Date(Date.now() + cashbackBonus.valid_days * 24 * 60 * 60 * 1000).toISOString() : 
              null
          })
          .select()
          .single();

        if (bonusInsertError) {
          console.error(`Error creating cashback bonus for user ${userStat.user_id}:`, bonusInsertError);
          errorCount++;
          continue;
        }

        // Ensure user has bonus wallet
        await supabaseClient
          .from("bonus_wallets")
          .upsert({
            user_id: userStat.user_id,
            type: "bonus",
            currency: userStat.currency || "TRY"
          }, {
            onConflict: "user_id,type,currency",
            ignoreDuplicates: true
          });

        // Get bonus wallet
        const { data: bonusWallet } = await supabaseClient
          .from("bonus_wallets")
          .select("*")
          .eq("user_id", userStat.user_id)
          .eq("type", "bonus")
          .eq("currency", userStat.currency || "TRY")
          .single();

        if (bonusWallet) {
          // Add cashback to bonus wallet
          await supabaseClient
            .from("wallet_transactions")
            .insert({
              wallet_id: bonusWallet.id,
              direction: "credit",
              amount: cashbackAmount,
              ref_type: "cashback_granted",
              ref_id: userBonus.id,
              ledger_key: `cashback_grant_${userBonus.id}`,
              meta: {
                bonus_id: cashbackBonus.id,
                period_start: startDate.toISOString(),
                period_end: endDate.toISOString(),
                net_loss: netLoss,
                cashback_percentage: cashbackBonus.amount_value
              }
            });

          // Log cashback granted event
          await supabaseClient
            .from("bonus_events")
            .insert({
              user_id: userStat.user_id,
              user_bonus_id: userBonus.id,
              type: "bonus_granted",
              payload: {
                bonus_id: cashbackBonus.id,
                bonus_type: "CASHBACK",
                amount: cashbackAmount,
                net_loss: netLoss,
                period_start: startDate.toISOString(),
                period_end: endDate.toISOString(),
                rollover_requirement: cashbackAmount * (cashbackBonus.rollover_multiplier || 1)
              }
            });

          // Audit log
          await supabaseClient
            .from("bonus_audit_logs")
            .insert({
              actor_type: "system",
              action: "cashback_granted",
              entity_type: "user_bonus",
              entity_id: userBonus.id,
              meta: {
                user_id: userStat.user_id,
                bonus_id: cashbackBonus.id,
                amount: cashbackAmount,
                net_loss: netLoss,
                period_start: startDate.toISOString(),
                period_end: endDate.toISOString()
              }
            });
        }

        processedCount++;
        totalCashbackAmount += cashbackAmount;
        console.log(`Cashback ${cashbackAmount} granted to user ${userStat.user_id}`);

      } catch (userError) {
        console.error(`Error processing cashback for user ${userStat.user_id}:`, userError);
        errorCount++;
      }
    }

    console.log(`Cashback settlement completed. Processed: ${processedCount}, Errors: ${errorCount}, Total Amount: ${totalCashbackAmount}`);

    return new Response(JSON.stringify({ 
      success: true,
      processed: processedCount,
      errors: errorCount,
      total_cashback_amount: totalCashbackAmount,
      period_start: startDate.toISOString(),
      period_end: endDate.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Cashback settlement error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

// Dummy function definition for stats calculation (should be implemented in DB)
/* 
CREATE OR REPLACE FUNCTION calculate_user_cashback_stats(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  min_loss_amount NUMERIC DEFAULT 0
) RETURNS TABLE (
  user_id UUID,
  total_bets NUMERIC,
  total_wins NUMERIC,
  currency TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gs.user_id,
    COALESCE(SUM(gs.total_bet), 0) as total_bets,
    COALESCE(SUM(gs.total_win), 0) as total_wins,
    'TRY'::TEXT as currency
  FROM game_sessions gs
  WHERE gs.created_at >= start_date
    AND gs.created_at <= end_date
    AND gs.status = 'completed'
  GROUP BY gs.user_id
  HAVING (COALESCE(SUM(gs.total_bet), 0) - COALESCE(SUM(gs.total_win), 0)) >= min_loss_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/