import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateRiskProfileRequest {
  user_id: string;
  fraud_analysis_result?: {
    risk_score: number;
    violations?: any[];
    analysis_summary?: {
      vpn_proxy_detected?: boolean;
      velocity_violation?: boolean;
      device_suspicious?: boolean;
    };
  };
  action_type?: string;
  ip_address?: string;
}

const logStep = (step: string, details?: any) => {
  console.log(`[RISK-PROFILE] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { user_id, fraud_analysis_result, action_type, ip_address } = 
      await req.json() as UpdateRiskProfileRequest;

    if (!user_id) {
      throw new Error('User ID is required');
    }

    logStep("Risk profile update started", { user_id, action_type });

    // Get or create user risk profile
    const { data: existingProfile } = await supabase
      .from("user_risk_profiles")
      .select("*")
      .eq("user_id", user_id)
      .single();

    let overallRiskScore = 0;
    let kycRiskScore = 0;
    let behavioralRiskScore = 0;
    let paymentRiskScore = 0;
    let geoRiskScore = 0;
    let deviceRiskScore = 0;
    let velocityRiskScore = 0;

    // Use existing scores as base
    if (existingProfile) {
      overallRiskScore = existingProfile.overall_risk_score || 0;
      kycRiskScore = existingProfile.kyc_risk_score || 0;
      behavioralRiskScore = existingProfile.behavioral_risk_score || 0;
      paymentRiskScore = existingProfile.payment_risk_score || 0;
      geoRiskScore = existingProfile.geo_risk_score || 0;
      deviceRiskScore = existingProfile.device_risk_score || 0;
      velocityRiskScore = existingProfile.velocity_risk_score || 0;
    }

    // Update risk scores based on fraud analysis result
    if (fraud_analysis_result) {
      const { risk_score, violations, analysis_summary } = fraud_analysis_result;
      
      // Update specific risk components
      if (analysis_summary?.vpn_proxy_detected) {
        geoRiskScore = Math.max(geoRiskScore, 70);
        logStep("Geo risk updated due to VPN/Proxy", { geo_risk: geoRiskScore });
      }

      if (analysis_summary?.velocity_violation) {
        velocityRiskScore = Math.max(velocityRiskScore, 80);
        logStep("Velocity risk updated", { velocity_risk: velocityRiskScore });
      }

      if (analysis_summary?.device_suspicious) {
        deviceRiskScore = Math.max(deviceRiskScore, 60);
        logStep("Device risk updated", { device_risk: deviceRiskScore });
      }

      // Update behavioral risk based on violations
      if (violations && violations.length > 0) {
        const violationRisk = Math.min(violations.length * 25, 90);
        behavioralRiskScore = Math.max(behavioralRiskScore, violationRisk);
        logStep("Behavioral risk updated", { behavioral_risk: behavioralRiskScore });
      }
    }

    // Calculate overall risk score (weighted average)
    overallRiskScore = Math.round(
      (kycRiskScore * 0.15) +
      (behavioralRiskScore * 0.25) +
      (paymentRiskScore * 0.20) +
      (geoRiskScore * 0.20) +
      (deviceRiskScore * 0.10) +
      (velocityRiskScore * 0.10)
    );

    // Determine risk level
    let riskLevel = 'low';
    if (overallRiskScore >= 80) riskLevel = 'critical';
    else if (overallRiskScore >= 60) riskLevel = 'high';
    else if (overallRiskScore >= 40) riskLevel = 'medium';

    // Upsert risk profile
    const { error: upsertError } = await supabase
      .from("user_risk_profiles")
      .upsert({
        user_id,
        overall_risk_score: overallRiskScore,
        risk_level: riskLevel,
        kyc_risk_score: kycRiskScore,
        behavioral_risk_score: behavioralRiskScore,
        payment_risk_score: paymentRiskScore,
        geo_risk_score: geoRiskScore,
        device_risk_score: deviceRiskScore,
        velocity_risk_score: velocityRiskScore,
        last_assessment_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (upsertError) {
      throw upsertError;
    }

    logStep("Risk profile updated successfully", { 
      user_id, 
      overall_risk_score: overallRiskScore, 
      risk_level: riskLevel 
    });

    // If high risk, create additional monitoring
    if (riskLevel === 'high' || riskLevel === 'critical') {
      await supabase
        .from("fraud_alerts")
        .insert({
          user_id,
          alert_type: "high_risk_profile",
          severity: riskLevel === 'critical' ? 'high' : 'medium',
          description: `User risk profile updated to ${riskLevel} - Overall risk score: ${overallRiskScore}`,
          evidence: {
            risk_breakdown: {
              kyc: kycRiskScore,
              behavioral: behavioralRiskScore,
              payment: paymentRiskScore,
              geo: geoRiskScore,
              device: deviceRiskScore,
              velocity: velocityRiskScore
            },
            action_type,
            ip_address
          },
          status: 'open'
        });

      logStep("High risk alert created", { risk_level: riskLevel });
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id,
        risk_profile: {
          overall_risk_score: overallRiskScore,
          risk_level: riskLevel,
          kyc_risk_score: kycRiskScore,
          behavioral_risk_score: behavioralRiskScore,
          payment_risk_score: paymentRiskScore,
          geo_risk_score: geoRiskScore,
          device_risk_score: deviceRiskScore,
          velocity_risk_score: velocityRiskScore
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    logStep("ERROR", { message: error.message });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});