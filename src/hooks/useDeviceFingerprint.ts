import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return crypto.subtle.digest('SHA-256', data).then(buffer =>
    Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  );
}

async function computeDeviceFingerprint(): Promise<string> {
  const nav = navigator as any;
  const screen = window.screen;
  
  const components = [
    nav.userAgent || '',
    nav.language || '',
    nav.platform || '',
    String(nav.hardwareConcurrency || ''),
    String(nav.deviceMemory || ''),
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    String(new Date().getTimezoneOffset()),
    nav.cookieEnabled ? '1' : '0'
  ];
  
  const fingerprint = components.join('|');
  return sha256(fingerprint);
}

export function useSendDeviceFingerprintOnMount() {
  useEffect(() => {
    // Only track once per session
    const sessionTracked = sessionStorage.getItem('device_tracked');
    if (sessionTracked) return;
    
    let stopped = false;
    
    const trackDevice = async () => {
      try {
        // Get current user session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Use cached fingerprint if available
        let fingerprint = localStorage.getItem('device_fp');
        if (!fingerprint) {
          fingerprint = await computeDeviceFingerprint();
          localStorage.setItem('device_fp', fingerprint);
        }
        
        if (stopped) return;

        const payload = {
          device_fp: fingerprint,
          user_agent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
          event: 'visit'
        };

        await supabase.functions.invoke('device-track', { 
          body: payload 
        });

        // Mark as tracked for this session
        sessionStorage.setItem('device_tracked', 'true');
        
        console.log('Device fingerprint tracked successfully');
      } catch (error) {
        console.error('Device tracking failed:', error);
      }
    };

    // Delay tracking to avoid blocking initial render
    const timer = setTimeout(trackDevice, 1000);
    
    return () => { 
      stopped = true;
      clearTimeout(timer);
    };
  }, []);
}

export async function trackDeviceEvent(event: string, metadata?: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fingerprint = await computeDeviceFingerprint();
    
    const payload = {
      device_fp: fingerprint,
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      event,
      metadata
    };

    await supabase.functions.invoke('device-track', { 
      body: payload 
    });

  } catch (error) {
    console.error('Device event tracking failed:', error);
  }
}