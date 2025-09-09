import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IPAnalysis {
  ip_address: string;
  country_code: string;
  city: string;
  is_vpn: boolean;
  is_proxy: boolean;
  is_datacenter: boolean;
  risk_score: number;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
}

interface FraudAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: any;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  created_at: string;
}

interface UserRiskProfile {
  id: string;
  user_id: string;
  overall_risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  kyc_risk_score: number;
  behavioral_risk_score: number;
  payment_risk_score: number;
  geo_risk_score: number;
  device_risk_score: number;
  velocity_risk_score: number;
  last_assessment_at: string;
}

export const useFraudDetection = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate device fingerprint
  const generateDeviceFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Fingerprint', 2, 2);
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      memory: (navigator as any).deviceMemory || 'unknown',
      cores: navigator.hardwareConcurrency || 'unknown'
    };
    
    return btoa(JSON.stringify(fingerprint));
  }, []);

  // Get client IP (simplified - in production, use a more reliable method)
  const getClientIP = useCallback(async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting client IP:', error);
      return null;
    }
  }, []);

  // Analyze IP for fraud indicators
  const analyzeIP = useCallback(async (
    ipAddress: string,
    userId?: string,
    actionType?: string,
    amount?: number
  ): Promise<IPAnalysis | null> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('fraud-analysis', {
        body: {
          ip_address: ipAddress,
          user_id: userId,
          action_type: actionType,
          amount: amount,
          device_fingerprint: generateDeviceFingerprint()
        }
      });

      if (error) throw error;

      if (data?.success) {
        return data.ip_analysis;
      } else {
        throw new Error(data?.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing IP:', error);
      toast({
        title: "Hata",
        description: "IP analizi sırasında bir hata oluştu.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [generateDeviceFingerprint, toast]);

  // Log user behavior for anomaly detection
  const logUserBehavior = useCallback(async (
    userId: string,
    actionType: string,
    metadata: any = {},
    amount?: number
  ) => {
    try {
      const ipAddress = await getClientIP();
      const deviceFingerprint = generateDeviceFingerprint();

      const { error } = await supabase
        .from('user_behavior_logs')
        .insert({
          user_id: userId,
          action_type: actionType,
          ip_address: ipAddress,
          device_fingerprint: deviceFingerprint,
          amount: amount,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        });

      if (error) {
        console.error('Error logging user behavior:', error);
      }
    } catch (error) {
      console.error('Error in logUserBehavior:', error);
    }
  }, [getClientIP, generateDeviceFingerprint]);

  // Get user's fraud alerts
  const getUserFraudAlerts = useCallback(async (userId: string): Promise<FraudAlert[]> => {
    try {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[] || [];
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
      return [];
    }
  }, []);

  // Get user's risk profile
  const getUserRiskProfile = useCallback(async (userId: string): Promise<UserRiskProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_risk_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as any;
    } catch (error) {
      console.error('Error fetching user risk profile:', error);
      return null;
    }
  }, []);

  // Auto-analyze current session
  const analyzeCurrentSession = useCallback(async (userId?: string, actionType: string = 'page_visit') => {
    const ipAddress = await getClientIP();
    if (ipAddress && userId) {
      return analyzeIP(ipAddress, userId, actionType);
    }
    return null;
  }, [getClientIP, analyzeIP]);

  // Device fingerprint management
  const trackDeviceFingerprint = useCallback(async (userId: string) => {
    try {
      const fingerprint = generateDeviceFingerprint();
      
      const { data: existingDevice } = await supabase
        .from('device_fingerprints')
        .select('*')
        .eq('user_id', userId)
        .eq('fingerprint_hash', fingerprint)
        .single();

      if (existingDevice) {
        // Update usage count and last seen
        await supabase
          .from('device_fingerprints')
          .update({
            usage_count: existingDevice.usage_count + 1,
            last_seen_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingDevice.id);
      } else {
        // Create new device fingerprint record
        await supabase
          .from('device_fingerprints')
          .insert({
            user_id: userId,
            fingerprint_hash: fingerprint,
            browser_info: {
              userAgent: navigator.userAgent,
              language: navigator.language,
              platform: navigator.platform
            },
            screen_resolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language
          });
      }
    } catch (error) {
      console.error('Error tracking device fingerprint:', error);
    }
  }, [generateDeviceFingerprint]);

  return {
    loading,
    analyzeIP,
    logUserBehavior,
    getUserFraudAlerts,
    getUserRiskProfile,
    analyzeCurrentSession,
    trackDeviceFingerprint,
    generateDeviceFingerprint,
    getClientIP
  };
};