// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ClaimBody = {
  bonus_id: string;
  deposit_amount?: number; // optional (percent tipinde gerekli)
  code?: string; // requires_code ise gerekebilir
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

async function getUserIdFromAuth(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const token = auth.replace(/^Bearer\s+/i, "");
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    const userId = await getUserIdFromAuth(req);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const body = (await req.json()) as ClaimBody;
    if (!body.bonus_id) return new Response("Missing bonus_id", { status: 400 });

    // Bonus'u çek
    const { data: bonus, error: bErr } = await supabase
      .from("bonuses_new")
      .select("*")
      .eq("id", body.bonus_id)
      .eq("is_active", true)
      .lte("valid_from", new Date().toISOString())
      .gte("valid_to", new Date().toISOString())
      .single();
    if (bErr || !bonus) return new Response("Bonus not available", { status: 400 });

    if (bonus.requires_code && (!body.code || body.code !== bonus.code)) {
      return new Response("Invalid code", { status: 400 });
    }

    // Eligibility (basit)
    if (bonus.max_per_user && bonus.max_per_user > 0) {
      const { data: cnt } = await supabase
        .from("user_bonus_tracking")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("bonus_id", bonus.id);
      if ((cnt?.length ?? 0) >= bonus.max_per_user) {
        return new Response("Max per user exceeded", { status: 400 });
      }
    }

    // granted_amount hesapla
    const deposit = Number(body.deposit_amount || 0);
    let granted = 0;
    if (bonus.amount_type === "percent") {
      if (deposit <= 0) return new Response("deposit_amount required for percent bonus", { status: 400 });
      granted = Math.min((deposit * Number(bonus.amount_value)) / 100, Number(bonus.max_cap || deposit));
    } else { // fixed
      granted = Number(bonus.amount_value);
      if (bonus.max_cap) granted = Math.min(granted, Number(bonus.max_cap));
    }

    if (Number(bonus.min_deposit || 0) > 0 && deposit < Number(bonus.min_deposit)) {
      return new Response("Below min_deposit", { status: 400 });
    }

    const rolloverTarget = Number(granted) * Number(bonus.rollover_multiplier || 0);

    // user_bonus_tracking: active
    const { data: ub, error: ubErr } = await supabase
      .from("user_bonus_tracking")
      .insert({
        user_id: userId,
        bonus_id: bonus.id,
        status: "active",
        granted_amount: granted,
        remaining_rollover: rolloverTarget,
        progress: 0,
        currency: bonus.currency || "TRY",
        expires_at: bonus.valid_to,
        last_event_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (ubErr) throw ubErr;

    // Bonus cüzdanı kredi
    const { data: bw } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "bonus")
      .maybeSingle();

    let bonusWalletId = bw?.id as string | undefined;
    if (!bonusWalletId) {
      const { data: newW } = await supabase
        .from("wallets")
        .insert({ user_id: userId, type: "bonus", currency: bonus.currency || "TRY" })
        .select("*")
        .single();
      bonusWalletId = newW?.id;
    }

    if (granted > 0 && bonusWalletId) {
      await supabase.from("wallet_transactions").insert({
        wallet_id: bonusWalletId,
        direction: "credit",
        amount: granted,
        ref_type: "bonus_claim",
        ref_id: ub.id,
        ledger_key: "BONUS_GRANT",
        meta: { bonus_id: bonus.id },
      });
    }

    await supabase.from("bonus_events").insert({
      user_id: userId,
      user_bonus_id: ub.id,
      type: "bonus_granted",
      payload: { origin: "claim", granted },
    });

    return new Response(JSON.stringify({ ok: true, user_bonus_id: ub.id, granted }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("Server Error", { status: 500 });
  }
});