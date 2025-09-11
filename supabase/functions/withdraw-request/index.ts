// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Method = 'bank' | 'papara' | 'crypto';

type ReqBody = {
  amount: number;
  method: Method; // 'bank' | 'papara' | 'crypto'
  currency?: string;
  // bank
  iban?: string;
  // papara
  papara_id?: string; // numeric id
  phone?: string;     // +90...
  // crypto
  asset?: string;     // BTC, ETH, USDT
  network?: string;   // BTC, ETH, TRC20, BEP20, SOL, MATIC
  address?: string;
  tag?: string;       // memo/tag optional
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sUrl = Deno.env.get('SUPABASE_URL')!;
const sKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(sUrl, sKey, { auth: { persistSession: false } });

async function getUserId(req: Request) {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const token = auth.replace(/^Bearer\s+/i, '');
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id as string;
}

function isTRIBAN(v?: string) {
  return !!v && /^TR\d{24}$/i.test(v.replace(/\s+/g,''));
}

function isPhone(v?: string) {
  return !!v && /^\+?[0-9]{10,14}$/.test(v);
}

function isPaparaId(v?: string) {
  return !!v && /^[0-9]{6,12}$/.test(v);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    const userId = await getUserId(req);
    if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const body = await req.json() as ReqBody;
    const amount = Number(body.amount || 0);
    if (!amount || amount <= 0) return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // risk: blocked kullanıcı çekim açamaz
    const { data: lastRisk } = await sb
      .from('risk_flags').select('status')
      .eq('user_id', userId).order('created_at', { ascending: false })
      .limit(1).maybeSingle();
    if (lastRisk?.status === 'blocked') return new Response(JSON.stringify({ error: 'User blocked' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Get user profile to check for user_id
    const { data: profile, error: profileError } = await sb
      .from("profiles")
      .select("id, user_id")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Kullanıcı profili bulunamadı" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user balance from wallets
    const { data: walletData, error: walletError } = await sb
      .from("wallets")
      .select("balance")
      .eq("user_id", profile.id)
      .eq("type", "main")
      .single();

    if (walletError || !walletData) {
      return new Response(
        JSON.stringify({ error: "Bakiye bilgisi bulunamadı" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentBalance = walletData.balance || 0;
    if (currentBalance < amount) {
      return new Response(
        JSON.stringify({ error: "Yetersiz bakiye" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // method-specific validation + payout_details
    let payout: Record<string, any> = {};
    if (body.method === 'bank') {
      if (!isTRIBAN(body.iban)) return new Response(JSON.stringify({ error: 'Invalid IBAN' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      payout = { method: 'bank', iban: body.iban?.replace(/\s+/g,'').toUpperCase() };
    } else if (body.method === 'papara') {
      if (!(isPaparaId(body.papara_id) || isPhone(body.phone))) {
        return new Response(JSON.stringify({ error: 'Papara id or phone required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      payout = { method: 'papara', papara_id: body.papara_id ?? null, phone: body.phone ?? null };
    } else if (body.method === 'crypto') {
      const allowedAssets = ['BTC','ETH','USDT'];
      const allowedNetworks = ['BTC','ETH','TRC20','BEP20','SOL','MATIC'];
      if (!body.asset || !allowedAssets.includes(body.asset.toUpperCase()))
        return new Response(JSON.stringify({ error: 'Unsupported asset' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (!body.network || !allowedNetworks.includes(body.network.toUpperCase()))
        return new Response(JSON.stringify({ error: 'Unsupported network' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (!body.address || body.address.length < 10)
        return new Response(JSON.stringify({ error: 'Invalid address' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      payout = { method: 'crypto', asset: body.asset.toUpperCase(), network: body.network.toUpperCase(), address: body.address, tag: body.tag ?? null };
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported method' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Calculate fees (simple 2% fee for now)
    const feeAmount = amount * 0.02;

    // talep oluştur
    const { data: wd, error: wdErr } = await sb
      .from('withdrawals')
      .insert({
        user_id: profile.id,
        amount,
        currency: body.currency ?? 'TRY',
        status: 'pending',
        method: body.method,
        payout_details: payout,
        network: payout.network ?? null,
        asset: payout.asset ?? null,
        fee: feeAmount
      })
      .select('*').single();
    if (wdErr) throw wdErr;

    await sb.from('audit_logs').insert({
      actor_type: 'user', actor_id: userId, action: 'withdraw_request',
      entity_type: 'withdrawal', entity_id: wd.id, meta: { method: body.method, payout }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      withdrawal_id: wd.id,
      message: "Çekim talebiniz başarıyla oluşturuldu"
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});