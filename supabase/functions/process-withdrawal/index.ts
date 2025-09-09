import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessWithdrawalRequest {
  withdrawal_id: string;
}

interface ProcessWithdrawalResponse {
  success: boolean;
  message: string;
  withdrawal_id?: string;
  transaction_id?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Authenticate admin user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    // Verify admin privileges
    const { data: adminData, error: adminError } = await supabaseClient
      .from('admins')
      .select('id, role_type, is_active')
      .eq('id', userData.user.id)
      .single();

    if (adminError || !adminData || !adminData.is_active) {
      throw new Error('Insufficient privileges');
    }

    console.log(`Processing withdrawal - Admin: ${adminData.id}`);

    // Parse request body
    const { withdrawal_id }: ProcessWithdrawalRequest = await req.json();

    if (!withdrawal_id) {
      throw new Error('withdrawal_id is required');
    }

    // Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from('withdrawals')
      .select(`
        *,
        users!inner(id, email, first_name, last_name, balance),
        payment_methods(id, method_type, provider, account_info)
      `)
      .eq('id', withdrawal_id)
      .single();

    if (withdrawalError || !withdrawal) {
      throw new Error('Withdrawal not found');
    }

    console.log(`Found withdrawal: ${withdrawal.id}, Status: ${withdrawal.status}, Amount: ${withdrawal.amount}`);

    // Check if withdrawal is in approved status
    if (withdrawal.status !== 'approved') {
      throw new Error('Withdrawal must be approved before processing');
    }

    // Check user balance
    const userBalance = withdrawal.users?.balance || 0;
    if (userBalance < withdrawal.amount) {
      throw new Error('Insufficient user balance');
    }

    // Update withdrawal status to processing
    const { error: updateError } = await supabaseClient
      .from('withdrawals')
      .update({
        status: 'processing',
        processed_at: new Date().toISOString(),
        metadata: {
          ...withdrawal.metadata,
          processing_started_at: new Date().toISOString(),
          processed_by: adminData.id
        }
      })
      .eq('id', withdrawal_id);

    if (updateError) {
      throw new Error(`Failed to update withdrawal status: ${updateError.message}`);
    }

    console.log(`Updated withdrawal status to processing`);

    // Simulate payment processing based on provider
    let providerResponse;
    let transactionId;
    let processingSuccess = true;

    try {
      const paymentMethod = withdrawal.payment_methods;
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      // Generate transaction ID
      transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      console.log(`Processing payment via ${paymentMethod.provider} for method ${paymentMethod.method_type}`);

      // Simulate provider-specific processing
      switch (paymentMethod.provider.toLowerCase()) {
        case 'stripe':
          // Simulate Stripe payout processing
          providerResponse = {
            id: transactionId,
            status: 'pending',
            amount: withdrawal.amount,
            currency: withdrawal.currency,
            method: 'bank_transfer',
            estimated_arrival: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          };
          break;

        case 'iyzico':
          // Simulate iyzico payout processing
          providerResponse = {
            payoutId: transactionId,
            status: 'WAITING_FOR_APPROVAL',
            amount: withdrawal.amount,
            currency: withdrawal.currency,
            payoutMethod: paymentMethod.method_type
          };
          break;

        case 'paytr':
          // Simulate PayTR payout processing
          providerResponse = {
            merchant_oid: transactionId,
            status: 'success',
            amount: withdrawal.amount * 100, // PayTR uses kuruş
            currency: withdrawal.currency
          };
          break;

        default:
          // Generic provider simulation
          providerResponse = {
            id: transactionId,
            status: 'processing',
            amount: withdrawal.amount,
            currency: withdrawal.currency
          };
      }

      console.log(`Provider response:`, providerResponse);

      // Simulate processing delay (remove in production)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real implementation, you would make actual API calls to payment providers here
      // For simulation, we'll randomly succeed/fail based on risk score
      const shouldFail = withdrawal.risk_score > 80 && Math.random() < 0.3;
      
      if (shouldFail) {
        processingSuccess = false;
        throw new Error('Provider rejected the transaction due to high risk');
      }

    } catch (providerError) {
      console.error('Provider processing failed:', providerError);
      processingSuccess = false;
      
      // Update withdrawal status to failed
      await supabaseClient
        .from('withdrawals')
        .update({
          status: 'failed',
          provider_response: {
            error: providerError.message,
            failed_at: new Date().toISOString()
          },
          metadata: {
            ...withdrawal.metadata,
            processing_failed_at: new Date().toISOString(),
            failure_reason: providerError.message
          }
        })
        .eq('id', withdrawal_id);

      throw new Error(`Payment processing failed: ${providerError.message}`);
    }

    if (processingSuccess) {
      // Deduct amount from user balance
      const newBalance = userBalance - withdrawal.amount;
      
      const { error: balanceUpdateError } = await supabaseClient
        .from('users')
        .update({ balance: newBalance })
        .eq('id', withdrawal.user_id);

      if (balanceUpdateError) {
        console.error('Failed to update user balance:', balanceUpdateError);
        
        // Revert withdrawal status
        await supabaseClient
          .from('withdrawals')
          .update({
            status: 'approved',
            processed_at: null,
            metadata: {
              ...withdrawal.metadata,
              balance_update_failed: true,
              error: balanceUpdateError.message
            }
          })
          .eq('id', withdrawal_id);

        throw new Error('Failed to update user balance');
      }

      console.log(`Updated user balance from ${userBalance} to ${newBalance}`);

      // Update withdrawal status to completed
      const { error: completionError } = await supabaseClient
        .from('withdrawals')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          provider_reference: transactionId,
          provider_response: providerResponse,
          metadata: {
            ...withdrawal.metadata,
            completed_at: new Date().toISOString(),
            transaction_id: transactionId,
            provider_response: providerResponse
          }
        })
        .eq('id', withdrawal_id);

      if (completionError) {
        console.error('Failed to update withdrawal completion:', completionError);
        throw new Error('Failed to mark withdrawal as completed');
      }

      console.log(`Withdrawal ${withdrawal_id} completed successfully`);

      // Log admin activity
      await supabaseClient
        .from('admin_activities')
        .insert({
          admin_id: adminData.id,
          action_type: 'withdrawal_processed',
          target_type: 'withdrawal',
          target_id: withdrawal_id,
          description: `Processed withdrawal of ₺${withdrawal.amount} for user ${withdrawal.users?.email}`,
          metadata: {
            withdrawal_id,
            user_id: withdrawal.user_id,
            amount: withdrawal.amount,
            transaction_id: transactionId,
            provider: paymentMethod?.provider
          }
        });
    }

    const response: ProcessWithdrawalResponse = {
      success: true,
      message: 'Withdrawal processed successfully',
      withdrawal_id: withdrawal_id,
      transaction_id: transactionId
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in process-withdrawal function:', error);
    
    const response: ProcessWithdrawalResponse = {
      success: false,
      message: 'Processing failed',
      error: error.message
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});