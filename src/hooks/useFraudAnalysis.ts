import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FraudAnalysisParams {
  user_id: string;
  action_type: 'login' | 'deposit' | 'withdrawal' | 'registration';
  amount?: number;
  ip_address?: string;
  user_agent?: string;
  device_fingerprint?: string;
  metadata?: any;
}

interface FraudAnalysisResult {
  success: boolean;
  risk_score: number;
  requires_manual_review: boolean;
  violations_count: number;
  violations: any[];
  action_required: string;
  analysis_summary: {
    vpn_proxy_detected: boolean;
    velocity_violation: boolean;
    device_suspicious: boolean;
  };
}

export const useFraudAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeAction = async (params: FraudAnalysisParams): Promise<FraudAnalysisResult | null> => {
    try {
      setIsAnalyzing(true);

      // Get client IP if not provided
      if (!params.ip_address) {
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          params.ip_address = ipData.ip;
        } catch {
          params.ip_address = '127.0.0.1'; // Fallback
        }
      }

      // Generate device fingerprint if not provided
      if (!params.device_fingerprint) {
        params.device_fingerprint = generateDeviceFingerprint();
      }

      // Call fraud analysis function
      const { data, error } = await supabase.functions.invoke('fraud-analysis', {
        body: params
      });

      if (error) {
        console.error('Fraud analysis error:', error);
        toast({
          title: "Fraud Analysis Error",
          description: "Failed to analyze request for fraud patterns",
          variant: "destructive",
        });
        return null;
      }

      // Handle manual review requirement
      if (data.requires_manual_review) {
        toast({
          title: "Security Review Required",
          description: "Your request requires manual review for security purposes",
          variant: "destructive",
        });
      }

      return data as FraudAnalysisResult;
    } catch (error) {
      console.error('Fraud analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to complete fraud analysis",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate a simple device fingerprint
  const generateDeviceFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 2, 2);
    const canvasData = canvas.toDataURL();

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvasData.slice(-50), // Last 50 chars of canvas fingerprint
      hardwareConcurrency: navigator.hardwareConcurrency,
    };

    return btoa(JSON.stringify(fingerprint)).slice(0, 32);
  };

  return {
    analyzeAction,
    isAnalyzing,
  };
};