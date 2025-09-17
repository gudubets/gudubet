import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FraudAnalysisRequest {
  user_id: string;
  action_type: 'login' | 'deposit' | 'withdrawal' | 'registration';
  amount?: number;
  ip_address?: string;
  user_agent?: string;
  device_fingerprint?: string;
  metadata?: any;
}

const logStep = (step: string, details?: any) => {
  console.log(`[FRAUD-ANALYSIS] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

// VPN/Proxy detection using IP analysis
async function detectVPNProxy(ipAddress: string, supabase: any): Promise<{ isVPN: boolean; isProxy: boolean; isTor: boolean; isDatacenter: boolean; countryCode?: string; riskScore: number; }> {
  try {
    // Check if IP analysis exists and is recent (less than 24 hours)
    const { data: existingAnalysis } = await supabase
      .from("ip_analysis")
      .select("*")
      .eq("ip_address", ipAddress)
      .gte('last_checked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (existingAnalysis) {
      return {
        isVPN: existingAnalysis.is_vpn || false,
        isProxy: existingAnalysis.is_proxy || false,
        isTor: existingAnalysis.is_tor || false,
        isDatacenter: existingAnalysis.is_datacenter || false,
        countryCode: existingAnalysis.country_code,
        riskScore: existingAnalysis.risk_score || 0
      };
    }

    // Fetch IP information from external API
    const ipResponse = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting,query`);
    const ipInfo = await ipResponse.json();

    if (ipInfo.status === 'fail') {
      throw new Error(`IP API error: ${ipInfo.message || 'Unknown error'}`);
    }

    // Calculate risk factors
    let risk_score = 0;
    let threat_level = 'low';
    
    const is_proxy = ipInfo.proxy || false;
    const is_datacenter = ipInfo.hosting || false;
    
    // VPN detection based on ISP/Organization names
    const vpnKeywords = ['vpn', 'proxy', 'tunnel', 'private', 'anonymous', 'shield', 'secure'];
    const is_vpn = vpnKeywords.some(keyword => 
      (ipInfo.isp?.toLowerCase().includes(keyword) || 
       ipInfo.org?.toLowerCase().includes(keyword))
    );

    // Risk scoring
    if (is_proxy) risk_score += 40;
    if (is_vpn) risk_score += 30; 
    if (is_datacenter) risk_score += 45;

    // High-risk countries
    const highRiskCountries = ['AF', 'KP', 'IR', 'SY', 'RU', 'CN'];
    if (highRiskCountries.includes(ipInfo.countryCode)) {
      risk_score += 50;
    }

    // Determine threat level
    if (risk_score >= 70) threat_level = 'critical';
    else if (risk_score >= 50) threat_level = 'high';
    else if (risk_score >= 30) threat_level = 'medium';

    // Store analysis
    await supabase
      .from('ip_analysis')
      .upsert({
        ip_address: ipAddress,
        country_code: ipInfo.countryCode,
        city: ipInfo.city,
        region: ipInfo.regionName,
        timezone: ipInfo.timezone,
        is_vpn,
        is_proxy,
        is_tor: false,
        is_datacenter,
        risk_score,
        threat_level,
        last_checked_at: new Date().toISOString(),
        provider_data: {
          isp: ipInfo.isp,
          org: ipInfo.org,
          as: ipInfo.as,
          lat: ipInfo.lat,
          lon: ipInfo.lon
        },
        updated_at: new Date().toISOString()
      }, { onConflict: 'ip_address' });

    return {
      isVPN: is_vpn,
      isProxy: is_proxy,
      isTor: false,
      isDatacenter: is_datacenter,
      countryCode: ipInfo.countryCode,
      riskScore: risk_score
    };
  } catch (error) {
    console.error("VPN/Proxy detection error:", error);
    return {
      isVPN: false,
      isProxy: false,
      isTor: false,
      isDatacenter: false,
      riskScore: 0
    };
  }
}

// Velocity analysis for rapid actions
async function analyzeVelocity(userId: string, actionType: string, supabase: any): Promise<{ isViolation: boolean; count: number; timeWindow: string; maxAllowed: number; }> {
  try {
    const now = new Date();
    let timeWindow;
    let maxCount;
    
    // Define velocity rules based on action type
    switch (actionType) {
      case 'login':
        timeWindow = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes
        maxCount = 10;
        break;
      case 'deposit':
        timeWindow = new Date(now.getTime() - 60 * 60 * 1000); // 60 minutes
        maxCount = 5;
        break;
      case 'withdrawal':
        timeWindow = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes
        maxCount = 3;
        break;
      default:
        timeWindow = new Date(now.getTime() - 60 * 60 * 1000); // 60 minutes
        maxCount = 10;
    }

    // Count recent actions based on type
    let count = 0;
    
    if (actionType === 'login') {
      const { data: loginAttempts } = await supabase
        .from("login_attempts")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", timeWindow.toISOString());
      count = loginAttempts?.length || 0;
    } else if (actionType === 'deposit') {
      const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .neq("payment_method", "withdrawal")
        .gte("created_at", timeWindow.toISOString());
      count = payments?.length || 0;
    } else if (actionType === 'withdrawal') {
      const { data: withdrawals } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", timeWindow.toISOString());
      count = withdrawals?.length || 0;
    }

    return {
      isViolation: count >= maxCount,
      count,
      timeWindow: timeWindow.toISOString(),
      maxAllowed: maxCount
    };
  } catch (error) {
    console.error("Velocity analysis error:", error);
    return { isViolation: false, count: 0, timeWindow: "", maxAllowed: 0 };
  }
}

// Device fingerprint analysis
async function analyzeDeviceFingerprint(userId: string, deviceFingerprint: string, supabase: any): Promise<{ isSuspicious: boolean; reason?: string; userCount?: number; isNewDevice: boolean; }> {
  try {
    if (!deviceFingerprint) {
      return { isSuspicious: false, isNewDevice: false };
    }

    // Check how many users are using this device
    const { data: deviceUsers } = await supabase
      .from("device_fingerprints")
      .select("user_id, first_seen_at")
      .eq("fingerprint_hash", deviceFingerprint);

    const uniqueUsers = new Set(deviceUsers?.map(d => d.user_id) || []);
    const userCount = uniqueUsers.size;

    // Check if this is a new device for this user
    const { data: existingFingerprint } = await supabase
      .from("device_fingerprints")
      .select("*")
      .eq("user_id", userId)
      .eq("fingerprint_hash", deviceFingerprint)
      .single();

    const isNewDevice = !existingFingerprint;

    // Update or create device fingerprint record
    if (isNewDevice) {
      await supabase
        .from("device_fingerprints")
        .insert({
          user_id: userId,
          fingerprint_hash: deviceFingerprint,
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          usage_count: 1
        });
    } else {
      await supabase
        .from("device_fingerprints")
        .update({
          last_seen_at: new Date().toISOString(),
          usage_count: existingFingerprint.usage_count + 1
        })
        .eq("id", existingFingerprint.id);
    }

    // Flag suspicious patterns
    if (userCount > 3) {
      return { 
        isSuspicious: true, 
        reason: "Device used by multiple users", 
        userCount,
        isNewDevice
      };
    }

    if (isNewDevice) {
      return { 
        isSuspicious: true, 
        reason: "New device detected", 
        userCount,
        isNewDevice
      };
    }

    return { isSuspicious: false, userCount, isNewDevice };
  } catch (error) {
    console.error("Device fingerprint analysis error:", error);
    return { isSuspicious: false, isNewDevice: false };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { user_id, action_type, amount, ip_address, user_agent, device_fingerprint, metadata } = 
      await req.json() as FraudAnalysisRequest;

    if (!user_id) {
      throw new Error('User ID is required');
    }

    logStep("Fraud analysis started", { user_id, action_type, amount });

    let totalRiskScore = 0;
    const violations: any[] = [];
    let requiresManualReview = false;

    // 1. VPN/Proxy Detection
    if (ip_address) {
      const vpnAnalysis = await detectVPNProxy(ip_address, supabase);
      
      if (vpnAnalysis.isVPN || vpnAnalysis.isProxy || vpnAnalysis.isTor || vpnAnalysis.isDatacenter) {
        totalRiskScore += vpnAnalysis.riskScore;
        requiresManualReview = true;
        violations.push({
          rule_type: "ip_analysis",
          severity: "high",
          details: vpnAnalysis,
          risk_score: vpnAnalysis.riskScore
        });
        logStep("VPN/Proxy violation detected", vpnAnalysis);
      }
    }

    // 2. Velocity Analysis
    const velocityAnalysis = await analyzeVelocity(user_id, action_type, supabase);
    if (velocityAnalysis.isViolation) {
      const riskImpact = action_type === 'withdrawal' ? 75 : 
                         action_type === 'deposit' ? 70 : 60;
      totalRiskScore += riskImpact;
      requiresManualReview = true;
      violations.push({
        rule_type: "velocity",
        severity: "high",
        details: velocityAnalysis,
        risk_score: riskImpact
      });
      logStep("Velocity violation detected", velocityAnalysis);
    }

    // 3. Device Fingerprint Analysis
    if (device_fingerprint) {
      const deviceAnalysis = await analyzeDeviceFingerprint(user_id, device_fingerprint, supabase);
      
      if (deviceAnalysis.isSuspicious) {
        const riskImpact = deviceAnalysis.reason === "Device used by multiple users" ? 70 : 
                          deviceAnalysis.reason === "New device detected" ? 65 : 50;
        totalRiskScore += riskImpact;
        
        if (riskImpact >= 65) {
          requiresManualReview = true;
        }
        
        violations.push({
          rule_type: "device_fingerprint",
          severity: riskImpact >= 65 ? "high" : "medium",
          details: deviceAnalysis,
          risk_score: riskImpact
        });
        logStep("Device fingerprint violation detected", deviceAnalysis);
      }
    }

    // 4. Combined Rules Check
    if (violations.some(v => v.rule_type === "ip_analysis") && 
        violations.some(v => v.rule_type === "velocity")) {
      totalRiskScore += 20; // Bonus risk for multiple red flags
      requiresManualReview = true;
      logStep("Multiple violations detected - escalating to manual review");
    }

    // Cap risk score at 100
    totalRiskScore = Math.min(totalRiskScore, 100);

    // Create fraud incident if violations detected
    if (violations.length > 0) {
      const { data: incident } = await supabase
        .from("fraud_incidents")
        .insert({
          user_id,
          incident_type: action_type,
          severity: totalRiskScore >= 80 ? 'critical' : 
                   totalRiskScore >= 60 ? 'high' : 
                   totalRiskScore >= 40 ? 'medium' : 'low',
          details: {
            action_type,
            amount,
            ip_address,
            user_agent,
            device_fingerprint,
            violations,
            metadata
          },
          risk_score: totalRiskScore,
          status: requiresManualReview ? 'open' : 'resolved',
          auto_resolved: !requiresManualReview
        })
        .select()
        .single();

      logStep("Fraud incident created", { incident_id: incident?.id, severity: incident?.severity });

      // Update user's fraud status if manual review is required
      if (requiresManualReview) {
        await supabase
          .from("users")
          .update({
            fraud_status: "flagged",
            last_fraud_check: new Date().toISOString()
          })
          .eq("id", user_id);

        // Create fraud alert for admins
        await supabase
          .from("fraud_alerts")
          .insert({
            user_id,
            alert_type: "fraud_detection",
            severity: totalRiskScore >= 80 ? 'high' : 'medium',
            description: `Fraud detected: ${violations.map(v => v.rule_type).join(", ")} - Risk Score: ${totalRiskScore}`,
            evidence: {
              violations,
              action_type,
              amount,
              ip_address,
              total_risk_score: totalRiskScore
            },
            status: 'open'
          });

        logStep("User flagged for manual review", { user_id, fraud_status: "flagged" });
      }
    } else {
      // Update last fraud check for clean users
      await supabase
        .from("users")
        .update({
          last_fraud_check: new Date().toISOString()
        })
        .eq("id", user_id);
      
      logStep("No violations detected - user clean");
    }

    // Update user risk profile
    try {
      const { error: riskUpdateError } = await supabase.functions.invoke('update-user-risk-profile', {
        body: {
          user_id,
          fraud_analysis_result: {
            risk_score: totalRiskScore,
            violations,
            analysis_summary: {
              vpn_proxy_detected: violations.some(v => v.rule_type === "ip_analysis"),
              velocity_violation: violations.some(v => v.rule_type === "velocity"),
              device_suspicious: violations.some(v => v.rule_type === "device_fingerprint")
            }
          },
          action_type,
          ip_address
        }
      });

      if (riskUpdateError) {
        console.error("Risk profile update failed:", riskUpdateError);
      } else {
        logStep("Risk profile updated successfully");
      }
    } catch (riskError) {
      console.error("Risk profile update error:", riskError);
    }

    logStep("Fraud analysis completed", { 
      risk_score: totalRiskScore, 
      manual_review: requiresManualReview,
      violations_count: violations.length 
    });

    return new Response(
      JSON.stringify({
        success: true,
        risk_score: totalRiskScore,
        requires_manual_review: requiresManualReview,
        violations_count: violations.length,
        violations,
        action_required: requiresManualReview ? "manual_review" : "none",
        analysis_summary: {
          vpn_proxy_detected: violations.some(v => v.rule_type === "ip_analysis"),
          velocity_violation: violations.some(v => v.rule_type === "velocity"),
          device_suspicious: violations.some(v => v.rule_type === "device_fingerprint")
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