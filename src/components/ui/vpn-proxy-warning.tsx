import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const VPNProxyWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Only check for logged in users
    const checkVPNProxy = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setIsDetecting(true);

        // Get client IP
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipResponse.json();

        if (!ip) return;

        // Check if we already have analysis for this IP
        const { data: ipAnalysis } = await supabase
          .from('ip_analysis')
          .select('*')
          .eq('ip_address', ip)
          .single();

        if (ipAnalysis && (ipAnalysis.is_vpn || ipAnalysis.is_proxy || ipAnalysis.is_tor || ipAnalysis.is_datacenter)) {
          setDetectionResult(ipAnalysis);
          setShowWarning(true);
        } else if (!ipAnalysis) {
          // If no analysis exists, trigger fraud analysis to create one
          const deviceFingerprint = btoa(JSON.stringify({
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }));

          const { data: fraudResult } = await supabase.functions.invoke('fraud-analysis', {
            body: {
              user_id: user.id,
              action_type: 'login',
              ip_address: ip,
              user_agent: navigator.userAgent,
              device_fingerprint: deviceFingerprint
            }
          });

          if (fraudResult?.success && fraudResult.analysis_summary?.vpn_proxy_detected) {
            // Re-fetch the analysis after fraud detection
            const { data: newAnalysis } = await supabase
              .from('ip_analysis')
              .select('*')
              .eq('ip_address', ip)
              .single();

            if (newAnalysis) {
              setDetectionResult(newAnalysis);
              setShowWarning(true);
            }
          }
        }
      } catch (error) {
        console.error('VPN/Proxy detection error:', error);
      } finally {
        setIsDetecting(false);
      }
    };

    // Check after a short delay to not impact initial load
    const timer = setTimeout(checkVPNProxy, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowWarning(false);
    localStorage.setItem('vpn-warning-dismissed', Date.now().toString());
  };

  const handleUnderstand = () => {
    toast({
      title: "Bilgi Alındı",
      description: "VPN/Proxy kullanımı not edildi. Hesabınız güvenlik incelemesindedir.",
      duration: 5000
    });
    handleDismiss();
  };

  // Don't show if dismissed recently (within 24 hours)
  const lastDismissed = localStorage.getItem('vpn-warning-dismissed');
  if (lastDismissed && Date.now() - parseInt(lastDismissed) < 24 * 60 * 60 * 1000) {
    return null;
  }

  if (!showWarning || !detectionResult) {
    return null;
  }

  const getConnectionType = () => {
    if (detectionResult.is_tor) return { type: "Tor Network", icon: "🧅", color: "text-purple-600" };
    if (detectionResult.is_proxy) return { type: "Proxy Server", icon: "🔄", color: "text-orange-600" };
    if (detectionResult.is_vpn) return { type: "VPN Connection", icon: "🛡️", color: "text-blue-600" };
    if (detectionResult.is_datacenter) return { type: "Datacenter IP", icon: "🏢", color: "text-gray-600" };
    return { type: "Proxy/VPN", icon: "⚠️", color: "text-red-600" };
  };

  const connectionInfo = getConnectionType();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                🛡️ Güvenlik Uyarısı
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <AlertDescription className="text-orange-700 dark:text-orange-300 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{connectionInfo.icon}</span>
                <span className={`font-medium ${connectionInfo.color}`}>
                  {connectionInfo.type} Tespit Edildi
                </span>
              </div>
              
              <p className="text-sm">
                Hesabınız güvenlik nedeniyle inceleme altına alınmıştır. Bu durum:
              </p>
              
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Para yatırma/çekme işlemlerinde gecikmelere</li>
                <li>Manuel onay gereksinimlerine</li>
                <li>Ek kimlik doğrulamalarına sebep olabilir</li>
              </ul>
              
              <div className="flex items-center gap-2 text-xs bg-orange-100 dark:bg-orange-900 p-2 rounded">
                <Shield className="h-3 w-3" />
                <span>Risk Skoru: {detectionResult.risk_score}/100</span>
              </div>
            </AlertDescription>
            
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleUnderstand}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Anladım
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                Kapat
              </Button>
            </div>
          </div>
        </div>
      </Alert>
    </div>
  );
};