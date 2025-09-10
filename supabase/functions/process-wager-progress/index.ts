// functions/process-wager-progress/index.ts
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { 
        status: 405,
        headers: corsHeaders
      });
    }

    const body = await req.json() as {
      user_id: string;
      amount: number;
      category: string;
      provider?: string;
      wager_id?: string;
      is_void?: boolean;
    };

    console.log("Processing wager progress:", body);

    // aktif bonusu çek
    const { data: ub } = await supabase
      .from("user_bonus_tracking")
      .select("*")
      .eq("user_id", body.user_id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!ub) {
      console.log("No active bonus found");
      return new Response(JSON.stringify({ ok: true, noActiveBonus: true }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body.is_void) {
      console.log("Wager is void, skipping progress");
      return new Response(JSON.stringify({ ok: true, void: true }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // bonus kurallarını al → category_weights
    const { data: rule } = await supabase
      .from("bonus_rules")
      .select("rules")
      .eq("bonus_id", ub.bonus_id)
      .maybeSingle();

    const weights = rule?.rules?.category_weights ?? { 
      slots: 1.0, 
      live: 0.1, 
      casino: 0.8, 
      sports: 0.3 
    };
    const weight = Number(weights[body.category] ?? 0);
    const progressInc = Math.max(0, body.amount * weight);

    console.log(`Weight for ${body.category}: ${weight}, Progress increment: ${progressInc}`);

    // yeni progress/remaining
    const newProgress = Number(ub.wagered_amount || 0) + progressInc;
    const newRemaining = Math.max(0, Number(ub.required_wagering) - newProgress);

    const updates: any = {
      wagered_amount: newProgress,
      remaining_wagering: newRemaining,
      updated_at: new Date().toISOString(),
    };

    let completed = false;
    if (newRemaining <= 0) {
      updates.status = "completed";
      updates.completed_at = new Date().toISOString();
      completed = true;
    }

    const { error: updErr } = await supabase
      .from("user_bonus_tracking")
      .update(updates)
      .eq("id", ub.id);

    if (updErr) {
      console.error("Update error:", updErr);
      throw updErr;
    }

    // event log
    await supabase.from("bonus_events").insert({
      user_id: body.user_id,
      user_bonus_id: ub.id,
      type: completed ? "bonus_completed" : "bonus_progressed",
      payload: { 
        progressInc, 
        category: body.category, 
        wager_id: body.wager_id,
        newProgress,
        newRemaining
      },
    });

    // tamamlandıysa bonus cüzdandan ana cüzdana aktar
    if (completed) {
      console.log("Bonus completed, transferring funds");
      
      // bonus cüzdanını bul
      const { data: bonusWallet } = await supabase
        .from("bonus_wallets")
        .select("*")
        .eq("user_id", body.user_id)
        .eq("type", "deposit_bonus")
        .maybeSingle();

      if (bonusWallet && bonusWallet.balance > 0) {
        const amountToMove = bonusWallet.balance;
        
        // Bonus cüzdandan çek
        await supabase.from("wallet_transactions").insert({
          wallet_id: bonusWallet.id,
          direction: "debit",
          amount: amountToMove,
          transaction_type: "bonus_conversion",
          description: "Bonus converted to real money",
          metadata: { 
            user_bonus_id: ub.id,
            from: "bonus",
            to: "main"
          }
        });

        // Kullanıcının ana bakiyesini güncelle
        const { data: user } = await supabase
          .from("users")
          .select("balance")
          .eq("id", body.user_id)
          .single();

        if (user) {
          await supabase
            .from("users")
            .update({ 
              balance: Number(user.balance) + amountToMove,
              updated_at: new Date().toISOString()
            })
            .eq("id", body.user_id);
        }

        // Bonus completion event
        await supabase.from("bonus_events").insert({
          user_id: body.user_id,
          user_bonus_id: ub.id,
          type: "bonus_funds_transferred",
          payload: { 
            amount: amountToMove,
            from: "bonus_wallet",
            to: "main_balance"
          },
        });

        console.log(`Transferred ${amountToMove} from bonus to main wallet`);
      }
    }

    console.log("Wager progress processed successfully");
    return new Response(JSON.stringify({ 
      ok: true, 
      completed, 
      newProgress, 
      newRemaining,
      progressInc,
      weight
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (e) {
    console.error("Error processing wager progress:", e);
    return new Response(JSON.stringify({ error: "Server Error", details: e.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});