import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessBonusRequest {
  request_id: string;
  action: 'approve' | 'reject';
  admin_note?: string;
  rejection_reason?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { request_id, action, admin_note, rejection_reason }: ProcessBonusRequest = await req.json();

    // Get admin user from auth header
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify admin status
    const { data: adminData } = await supabase
      .from('admins')
      .select('id, is_active')
      .eq('id', user.id)
      .single();

    if (!adminData?.is_active) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the bonus request
    const { data: bonusRequest, error: requestError } = await supabase
      .from('bonus_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (requestError || !bonusRequest) {
      return new Response(JSON.stringify({ error: 'Bonus request not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (bonusRequest.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Request already processed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'approve') {
      // Process approval
      const updateData: any = {
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        admin_note
      };

      // Update the bonus request
      const { error: updateError } = await supabase
        .from('bonus_requests')
        .update(updateData)
        .eq('id', request_id);

      if (updateError) {
        throw updateError;
      }

      // Grant the bonus using database function
      if (bonusRequest.metadata?.bonus_id) {
        const { data: grantResult, error: grantError } = await supabase.rpc(
          'grant_bonus_to_user',
          {
            p_user_id: bonusRequest.user_id,
            p_bonus_id: bonusRequest.metadata.bonus_id,
            p_deposit_amount: bonusRequest.deposit_amount
          }
        );

        if (grantError) {
          console.error('Error granting bonus:', grantError);
          throw new Error('Bonus verilirken hata oluştu');
        }

        if (grantResult?.error) {
          throw new Error(grantResult.error);
        }

        console.log('Bonus granted successfully:', grantResult);
      } else {
        console.warn('No bonus_id in metadata, granting basic bonus');
        await grantBonus(bonusRequest, supabase);
      }

      // Log the approval
      await supabase
        .from('bonus_audit_logs')
        .insert({
          action: 'approve_request',
          entity_type: 'bonus_request',
          entity_id: request_id,
          actor_id: user.id,
          actor_type: 'admin',
          meta: {
            bonus_type: bonusRequest.bonus_type,
            requested_amount: bonusRequest.requested_amount,
            admin_note
          }
        });

    } else if (action === 'reject') {
      // Process rejection
      const updateData: any = {
        status: 'rejected',
        approved_by: user.id,
        rejection_reason,
        admin_note
      };

      // Update the bonus request
      const { error: updateError } = await supabase
        .from('bonus_requests')
        .update(updateData)
        .eq('id', request_id);

      if (updateError) {
        throw updateError;
      }

      // Log the rejection
      await supabase
        .from('bonus_audit_logs')
        .insert({
          action: 'reject_request',
          entity_type: 'bonus_request',
          entity_id: request_id,
          actor_id: user.id,
          actor_type: 'admin',
          meta: {
            bonus_type: bonusRequest.bonus_type,
            rejection_reason,
            admin_note
          }
        });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing bonus request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function grantBonus(bonusRequest: any, supabase: any) {
  // Get or create user's bonus wallet
  let { data: wallet } = await supabase
    .from('bonus_wallets')
    .select('*')
    .eq('user_id', bonusRequest.user_id)
    .eq('type', 'bonus')
    .single();

  if (!wallet) {
    const { data: newWallet, error: walletError } = await supabase
      .from('bonus_wallets')
      .insert({
        user_id: bonusRequest.user_id,
        type: 'bonus',
        balance: 0,
        currency: 'TRY'
      })
      .select()
      .single();

    if (walletError) throw walletError;
    wallet = newWallet;
  }

  // Calculate bonus amount based on type and rules
  let bonusAmount = calculateBonusAmount(bonusRequest);

  if (bonusAmount > 0) {
    // Credit the bonus to user's wallet
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        direction: 'credit',
        amount: bonusAmount,
        transaction_type: 'bonus_grant',
        description: `${bonusRequest.bonus_type} bonus granted`,
        metadata: {
          bonus_request_id: bonusRequest.id,
          bonus_type: bonusRequest.bonus_type
        }
      });

    if (transactionError) throw transactionError;

    // Update user's bonus balance in profiles table
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('bonus_balance')
      .eq('id', bonusRequest.user_id)
      .single();

    const currentBonusBalance = currentProfile?.bonus_balance || 0;
    const newBonusBalance = currentBonusBalance + bonusAmount;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ bonus_balance: newBonusBalance })
      .eq('id', bonusRequest.user_id);

    if (profileError) {
      console.error('Error updating profile bonus balance:', profileError);
      // Don't throw error here as the bonus was already granted to wallet
    }

    // Create bonus event
    await supabase
      .from('bonus_events')
      .insert({
        user_id: bonusRequest.user_id,
        type: 'bonus_granted',
        payload: {
          bonus_type: bonusRequest.bonus_type,
          amount: bonusAmount,
          request_id: bonusRequest.id
        }
      });
  }
}

function calculateBonusAmount(bonusRequest: any): number {
  // Basic calculation logic - this can be enhanced based on business rules
  const { bonus_type, requested_amount, deposit_amount, loss_amount } = bonusRequest;

  switch (bonus_type) {
    case 'birthday':
      return requested_amount || 50; // Default birthday bonus

    case 'welcome':
      return requested_amount || 100; // Default welcome bonus

    case 'cashback':
      // 10% of losses, max 500 TL
      return Math.min((loss_amount || 0) * 0.1, 500);

    case 'freebet':
      // 20% of deposit, max 200 TL
      return Math.min((deposit_amount || 0) * 0.2, 200);

    case 'deposit':
      // 15% of deposit, max 300 TL
      return Math.min((deposit_amount || 0) * 0.15, 300);

    case 'vip_platinum':
      return requested_amount || 1000; // VIP bonus

    default:
      return requested_amount || 0;
  }
}