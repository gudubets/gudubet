import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WithdrawalRequest {
  amount: number;
  currency?: string;
  withdrawal_method: string;
  bank_details?: {
    iban?: string;
    bank_name?: string;
    account_holder?: string;
    swift_code?: string;
  };
  e_wallet_details?: {
    wallet_type?: string;
    wallet_address?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user from users table
    const { data: userData } = await supabaseClient
      .from("users")
      .select("id, balance, bonus_balance, kyc_status")
      .eq("auth_user_id", user.id)
      .single();

    if (!userData) {
      throw new Error("User profile not found");
    }

    const { amount, currency = "TRY", withdrawal_method, bank_details, e_wallet_details } = await req.json() as WithdrawalRequest;

    // Validate input
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!withdrawal_method) {
      throw new Error("Withdrawal method is required");
    }

    // Check if user has sufficient balance
    if (userData.balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Check KYC status
    if (userData.kyc_status !== "verified" && amount > 1000) {
      throw new Error("KYC verification required for withdrawals over 1000 TRY");
    }

    // Check for existing pending withdrawals
    const { data: pendingWithdrawals } = await supabaseClient
      .from("withdrawals")
      .select("amount")
      .eq("user_id", userData.id)
      .eq("status", "pending");

    const totalPendingAmount = pendingWithdrawals?.reduce((sum, w) => sum + parseFloat(w.amount), 0) || 0;

    if (totalPendingAmount + amount > userData.balance) {
      throw new Error("Total pending withdrawals exceed available balance");
    }

    // Get user's IP address for fraud detection
    const ip_address = req.headers.get("CF-Connecting-IP") || req.headers.get("X-Forwarded-For") || "127.0.0.1";

    // Calculate risk score for withdrawal
    const { data: riskScore } = await supabaseClient.rpc("calculate_payment_risk_score", {
      _user_id: userData.id,
      _amount: amount,
      _currency: currency,
      _ip_address: ip_address
    });

    // Determine if auto-approval is possible
    const auto_approved = amount <= 500 && userData.kyc_status === "verified" && (riskScore || 0) < 30;

    // Calculate processing fee (example: 1% or minimum 5 TRY)
    const processing_fee = Math.max(amount * 0.01, 5);
    const net_amount = amount - processing_fee;

    // Prepare withdrawal details based on method
    let withdrawal_details = {};
    if (withdrawal_method === "bank_transfer" && bank_details) {
      withdrawal_details = {
        iban: bank_details.iban,
        bank_name: bank_details.bank_name,
        account_holder: bank_details.account_holder,
        swift_code: bank_details.swift_code
      };
    } else if (withdrawal_method === "e_wallet" && e_wallet_details) {
      withdrawal_details = {
        wallet_type: e_wallet_details.wallet_type,
        wallet_address: e_wallet_details.wallet_address
      };
    }

    // Create withdrawal record
    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from("withdrawals")
      .insert({
        user_id: userData.id,
        amount,
        currency,
        withdrawal_method,
        bank_details: withdrawal_details,
        status: auto_approved ? "approved" : "pending",
        risk_score: riskScore || 0,
        kyc_status: userData.kyc_status,
        processing_fee,
        net_amount,
        auto_approved,
        approved_at: auto_approved ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error("Withdrawal creation error:", withdrawalError);
      throw new Error("Failed to create withdrawal request");
    }

    // If auto-approved, update user balance immediately
    if (auto_approved) {
      await supabaseClient
        .from("users")
        .update({
          balance: userData.balance - amount
        })
        .eq("id", userData.id);
    }

    // Log activity
    await supabaseClient
      .from("admin_activities")
      .insert({
        admin_id: user.id,
        action_type: "withdrawal_requested",
        description: `Withdrawal of ${amount} ${currency} requested via ${withdrawal_method}`,
        target_type: "withdrawal",
        target_id: withdrawal.id,
        metadata: {
          amount,
          currency,
          withdrawal_method,
          auto_approved,
          risk_score: riskScore,
          processing_fee,
          net_amount
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        withdrawal_id: withdrawal.id,
        status: withdrawal.status,
        auto_approved,
        processing_fee,
        net_amount,
        risk_score: riskScore,
        estimated_processing_time: withdrawal_method === "bank_transfer" ? "1-3 business days" : "24 hours"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Withdrawal processing error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});