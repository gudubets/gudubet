// Analytics utilities for tracking user behavior and events
import { supabase } from '@/integrations/supabase/client';

// Session management
let sessionId: string | null = null;

export const initSession = () => {
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

export const getSessionId = () => {
  if (!sessionId) {
    sessionId = localStorage.getItem('session_id') || initSession();
  }
  return sessionId;
};

// Event tracking utilities
export const trackAnalyticsEvent = async (
  eventName: string,
  category: string,
  properties: Record<string, any> = {}
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase
      .from('analytics_events')
      .insert({
        user_id: user?.id,
        event_name: eventName,
        event_category: category,
        event_properties: properties,
        session_id: getSessionId(),
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
      });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Common event tracking functions
export const trackPageView = (page: string) => {
  trackAnalyticsEvent('page_view', 'navigation', { page });
};

export const trackButtonClick = (buttonName: string, context?: string) => {
  trackAnalyticsEvent('button_click', 'ui', { button_name: buttonName, context });
};

export const trackGameStart = (gameId: string, gameType: string, provider?: string) => {
  trackAnalyticsEvent('game_start', 'gaming', { 
    game_id: gameId, 
    game_type: gameType,
    provider
  });
};

export const trackGameEnd = (gameId: string, duration: number, outcome?: string) => {
  trackAnalyticsEvent('game_end', 'gaming', { 
    game_id: gameId,
    duration_seconds: duration,
    outcome
  });
};

export const trackDeposit = (amount: number, currency: string, method: string) => {
  trackAnalyticsEvent('deposit', 'transaction', { 
    amount,
    currency,
    payment_method: method
  });
};

export const trackWithdrawal = (amount: number, currency: string, method: string) => {
  trackAnalyticsEvent('withdrawal', 'transaction', { 
    amount,
    currency,
    payment_method: method
  });
};

export const trackBonusClaim = (bonusId: string, bonusType: string, amount?: number) => {
  trackAnalyticsEvent('bonus_claim', 'promotion', { 
    bonus_id: bonusId,
    bonus_type: bonusType,
    amount
  });
};

export const trackRegistration = (method: string) => {
  trackAnalyticsEvent('user_registration', 'auth', { 
    registration_method: method
  });
};

export const trackLogin = (method: string) => {
  trackAnalyticsEvent('user_login', 'auth', { 
    login_method: method
  });
};

// Auto-initialize session when module loads
if (typeof window !== 'undefined') {
  initSession();
}