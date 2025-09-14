import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_name: string;
  event_category: string;
  event_properties?: Record<string, any>;
  session_id?: string;
  page_url?: string;
}

interface DashboardKPIs {
  total_users: number;
  active_users_30d: number;
  total_deposits_30d: number;
  total_withdrawals_30d: number;
  ggr_30d: number;
  ngr_30d: number;
  avg_deposit_amount: number;
  new_users_today: number;
  active_sessions: number;
}

interface DailyMetric {
  metric_date: string;
  dau: number;
  new_registrations: number;
  total_deposits: number;
  total_withdrawals: number;
  ggr: number;
  ngr: number;
  total_bets: number;
  total_wins: number;
  game_sessions: number;
  avg_session_duration: number;
}

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);

  // Track analytics event
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('analytics_events')
        .insert({
          user_id: user?.id,
          event_name: event.event_name,
          event_category: event.event_category,
          event_properties: event.event_properties || {},
          session_id: event.session_id || localStorage.getItem('session_id'),
          ip_address: null, // Will be filled by trigger
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          page_url: event.page_url || window.location.href,
          device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
        });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, []);

  // Load dashboard KPIs
  const loadKPIs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_dashboard_kpis', { days_back: 30 });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setKpis(data[0]);
      }
    } catch (error) {
      console.error('Error loading KPIs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load daily metrics
  const loadDailyMetrics = useCallback(async (days: number = 30) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .gte('metric_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('metric_date', { ascending: true });

      if (error) throw error;
      setDailyMetrics(data || []);
    } catch (error) {
      console.error('Error loading daily metrics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate metrics for a specific date
  const calculateDailyMetrics = useCallback(async (date?: string) => {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const { error } = await supabase.rpc('calculate_daily_metrics', { target_date: targetDate });
      
      if (error) throw error;
      
      // Reload metrics after calculation
      await loadDailyMetrics();
    } catch (error) {
      console.error('Error calculating daily metrics:', error);
    }
  }, [loadDailyMetrics]);

  // Track common events
  const trackPageView = useCallback((page: string) => {
    trackEvent({
      event_name: 'page_view',
      event_category: 'navigation',
      event_properties: { page },
      page_url: window.location.href
    });
  }, [trackEvent]);

  const trackUserAction = useCallback((action: string, properties?: Record<string, any>) => {
    trackEvent({
      event_name: action,
      event_category: 'user_action',
      event_properties: properties
    });
  }, [trackEvent]);

  const trackGameAction = useCallback((action: string, gameId?: string, properties?: Record<string, any>) => {
    trackEvent({
      event_name: action,
      event_category: 'gaming',
      event_properties: {
        game_id: gameId,
        ...properties
      }
    });
  }, [trackEvent]);

  const trackTransaction = useCallback((action: string, amount?: number, currency?: string, properties?: Record<string, any>) => {
    trackEvent({
      event_name: action,
      event_category: 'transaction',
      event_properties: {
        amount,
        currency,
        ...properties
      }
    });
  }, [trackEvent]);

  return {
    loading,
    kpis,
    dailyMetrics,
    trackEvent,
    trackPageView,
    trackUserAction,
    trackGameAction,
    trackTransaction,
    loadKPIs,
    loadDailyMetrics,
    calculateDailyMetrics
  };
};