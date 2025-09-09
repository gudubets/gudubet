import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IPAnalysisRequest {
  ip_address: string;
  user_id?: string;
  action_type?: string;
  amount?: number;
  device_fingerprint?: string;
}

interface IPAPIResponse {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
  proxy: boolean;
  hosting: boolean;
}

const logStep = (step: string, details?: any) => {
  console.log(`[FRAUD-ANALYSIS] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting fraud analysis");

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { ip_address, user_id, action_type, amount, device_fingerprint }: IPAnalysisRequest = await req.json();
    
    if (!ip_address) {
      throw new Error('IP address is required');
    }

    logStep("Analyzing IP", { ip_address, user_id, action_type });

    // Check if IP analysis already exists and is recent (less than 24 hours old)
    const { data: existingAnalysis } = await supabaseClient
      .from('ip_analysis')
      .select('*')
      .eq('ip_address', ip_address)
      .gte('last_checked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    let ipData;
    
    if (existingAnalysis) {
      logStep("Using existing IP analysis", { id: existingAnalysis.id });
      ipData = existingAnalysis;
    } else {
      logStep("Fetching new IP analysis from external API");

      // Fetch IP information from ip-api.com (free tier)
      const ipResponse = await fetch(`http://ip-api.com/json/${ip_address}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting,query`);
      const ipInfo: IPAPIResponse = await ipResponse.json();

      if (ipInfo.status === 'fail') {
        throw new Error(`IP API error: ${ipInfo.message || 'Unknown error'}`);
      }

      logStep("IP API response received", { country: ipInfo.country, city: ipInfo.city, proxy: ipInfo.proxy, hosting: ipInfo.hosting });

      // Calculate risk factors
      let risk_score = 0;
      let threat_level = 'low';
      
      // VPN/Proxy detection (basic)
      const is_proxy = ipInfo.proxy || false;
      const is_datacenter = ipInfo.hosting || false;
      
      // Simple VPN detection based on ISP/Organization names
      const vpnKeywords = ['vpn', 'proxy', 'tunnel', 'private', 'anonymous', 'shield', 'secure'];
      const is_vpn = vpnKeywords.some(keyword => 
        (ipInfo.isp?.toLowerCase().includes(keyword) || 
         ipInfo.org?.toLowerCase().includes(keyword))
      );

      // Risk scoring
      if (is_proxy) risk_score += 40;
      if (is_vpn) risk_score += 30; 
      if (is_datacenter) risk_score += 45;

      // High-risk countries (basic list)
      const highRiskCountries = ['AF', 'KP', 'IR', 'SY', 'RU', 'CN'];
      if (highRiskCountries.includes(ipInfo.countryCode)) {
        risk_score += 50;
      }

      // Determine threat level
      if (risk_score >= 70) threat_level = 'critical';
      else if (risk_score >= 50) threat_level = 'high';
      else if (risk_score >= 30) threat_level = 'medium';

      // Store IP analysis in database
      const { data: newAnalysis, error: insertError } = await supabaseClient
        .from('ip_analysis')
        .upsert({
          ip_address,
          country_code: ipInfo.countryCode,
          city: ipInfo.city,
          region: ipInfo.regionName,
          timezone: ipInfo.timezone,
          is_vpn,
          is_proxy,
          is_tor: false, // Would need specialized API for Tor detection
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
        }, { onConflict: 'ip_address' })
        .select()
        .single();

      if (insertError) {
        logStep("Error inserting IP analysis", insertError);
        throw insertError;
      }

      ipData = newAnalysis;
      logStep("IP analysis stored", { id: newAnalysis.id, risk_score, threat_level });
    }

    // Log user behavior if user_id is provided
    if (user_id) {
      const behaviorData = {
        user_id,
        action_type: action_type || 'general',
        ip_address,
        device_fingerprint,
        amount,
        currency: 'TRY',
        metadata: {
          ip_analysis_id: ipData.id,
          country: ipData.country_code,
          city: ipData.city
        },
        risk_flags: []
      };

      // Add risk flags based on IP analysis
      if (ipData.is_vpn) behaviorData.risk_flags.push('vpn_usage');
      if (ipData.is_proxy) behaviorData.risk_flags.push('proxy_usage');
      if (ipData.is_datacenter) behaviorData.risk_flags.push('datacenter_ip');
      if (ipData.risk_score >= 50) behaviorData.risk_flags.push('high_risk_ip');

      const { error: behaviorError } = await supabaseClient
        .from('user_behavior_logs')
        .insert(behaviorData);

      if (behaviorError) {
        logStep("Error logging user behavior", behaviorError);
      } else {
        logStep("User behavior logged");
      }

      // Create fraud alerts for high-risk activities
      if (ipData.risk_score >= 60) {
        const alertDescription = `High-risk IP activity detected from ${ipData.city}, ${ipData.country_code}`;
        const evidence = {
          ip_address,
          risk_score: ipData.risk_score,
          threat_level: ipData.threat_level,
          is_vpn: ipData.is_vpn,
          is_proxy: ipData.is_proxy,
          is_datacenter: ipData.is_datacenter,
          action_type,
          amount
        };

        const { error: alertError } = await supabaseClient
          .from('fraud_alerts')
          .insert({
            user_id,
            alert_type: 'ip_analysis',
            severity: ipData.threat_level,
            description: alertDescription,
            evidence
          });

        if (alertError) {
          logStep("Error creating fraud alert", alertError);
        } else {
          logStep("Fraud alert created");
        }
      }

      // Update or create user risk profile
      if (amount && amount > 0) {
        const comprehensiveRiskScore = await supabaseClient.rpc('calculate_comprehensive_risk_score', {
          _user_id: user_id,
          _amount: amount,
          _currency: 'TRY',
          _ip_address: ip_address,
          _device_fingerprint: device_fingerprint,
          _action_type: action_type || 'general'
        });

        if (comprehensiveRiskScore.data !== null) {
          logStep("Comprehensive risk score calculated", { score: comprehensiveRiskScore.data });
          
          const riskLevel = comprehensiveRiskScore.data >= 70 ? 'critical' :
                           comprehensiveRiskScore.data >= 50 ? 'high' :
                           comprehensiveRiskScore.data >= 30 ? 'medium' : 'low';

          await supabaseClient
            .from('user_risk_profiles')
            .upsert({
              user_id,
              overall_risk_score: comprehensiveRiskScore.data,
              risk_level: riskLevel,
              geo_risk_score: ipData.risk_score,
              last_assessment_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        }
      }
    }

    logStep("Analysis completed successfully");

    return new Response(JSON.stringify({
      success: true,
      ip_analysis: {
        ip_address: ipData.ip_address,
        country_code: ipData.country_code,
        city: ipData.city,
        is_vpn: ipData.is_vpn,
        is_proxy: ipData.is_proxy,
        is_datacenter: ipData.is_datacenter,
        risk_score: ipData.risk_score,
        threat_level: ipData.threat_level
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});