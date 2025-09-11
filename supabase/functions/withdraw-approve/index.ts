import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ReqBody = {
  action: 'approve' | 'reject' | 'paid';
  withdrawal_id: string;
  note?: string;
  provider_ref?: string;
  tx_hash?: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sUrl = Deno.env.get('SUPABASE_URL')!;
const sKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(sUrl, sKey, { auth: { persistSession: false } });

async function getAdminId(req: Request) {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const token = auth.replace(/^Bearer\s+/i, '');
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) return null;
  
  // Check if user is admin
  const { data: admin } = await sb
    .from('admins')
    .select('id, is_active')
    .eq('id', data.user.id)
    .single();
  
  if (!admin?.is_active) return null;
  return data.user.id;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    const adminId = await getAdminId(req);
    if (!adminId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const body = await req.json() as ReqBody;
    const { action, withdrawal_id, note, provider_ref, tx_hash } = body;

    if (!withdrawal_id || !action) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await sb
      .from('withdrawals')
      .select('id, user_id, amount, status, net_amount')
      .eq('id', withdrawal_id)
      .single();

    if (withdrawalError || !withdrawal) {
      return new Response(JSON.stringify({ error: 'Withdrawal not found' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (withdrawal.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Withdrawal already processed' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Update withdrawal status
    const updateData: any = {
      status: action === 'paid' ? 'paid' : action,
      reviewer_id: adminId,
      note: note || null,
      updated_at: new Date().toISOString()
    };

    if (provider_ref) updateData.provider_ref = provider_ref;
    if (tx_hash) updateData.tx_hash = tx_hash;

    const { error: updateError } = await sb
      .from('withdrawals')
      .update(updateData)
      .eq('id', withdrawal_id);

    if (updateError) throw updateError;

    // If approved, deduct from user balance
    if (action === 'approve') {
      console.log('Processing approval for withdrawal:', withdrawal_id, 'amount:', withdrawal.amount, 'user_id:', withdrawal.user_id);
      
      const { data: wallet, error: walletError } = await sb
        .from('wallets')
        .select('balance')
        .eq('user_id', withdrawal.user_id)
        .eq('type', 'main')
        .single();

      console.log('Wallet query result:', { wallet, walletError });

      if (walletError || !wallet) {
        console.error('Wallet not found:', { walletError, user_id: withdrawal.user_id });
        return new Response(JSON.stringify({ error: 'User wallet not found' }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      const newBalance = (wallet.balance || 0) - withdrawal.amount;
      console.log('Balance calculation:', { currentBalance: wallet.balance, withdrawalAmount: withdrawal.amount, newBalance });
      
      if (newBalance < 0) {
        console.error('Insufficient balance:', { currentBalance: wallet.balance, withdrawalAmount: withdrawal.amount });
        return new Response(JSON.stringify({ error: 'Insufficient balance' }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Update wallet balance
      const { error: balanceError } = await sb
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', withdrawal.user_id)
        .eq('type', 'main');

      console.log('Balance update result:', { balanceError, newBalance });

      if (balanceError) {
        console.error('Balance update failed:', balanceError);
        throw balanceError;
      }

      // Create wallet transaction record
      const { error: transactionError } = await sb.from('wallet_transactions').insert({
        user_id: withdrawal.user_id,
        wallet_type: 'main',
        transaction_type: 'withdrawal',
        amount: -withdrawal.amount,
        balance_before: wallet.balance,
        balance_after: newBalance,
        reference_id: withdrawal_id,
        reference_type: 'withdrawal',
        description: `Withdrawal approved: ${withdrawal.amount} TRY`
      });

      console.log('Transaction record result:', { transactionError });

      if (transactionError) {
        console.error('Failed to create transaction record:', transactionError);
      }
    }

    // Create audit log
    await sb.from('audit_logs').insert({
      actor_type: 'admin',
      actor_id: adminId,
      action: `withdrawal_${action}`,
      entity_type: 'withdrawal',
      entity_id: withdrawal_id,
      meta: { 
        action, 
        note: note || null, 
        provider_ref: provider_ref || null, 
        tx_hash: tx_hash || null,
        amount: withdrawal.amount 
      }
    });

    return new Response(JSON.stringify({ 
      ok: true, 
      status: action,
      message: `Withdrawal ${action} successfully`
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Withdrawal approve error:', error);
    return new Response(JSON.stringify({ error: 'Server Error' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});