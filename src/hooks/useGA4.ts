import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ga4 } from '@/lib/ga4';

export const useGA4 = () => {
  const location = useLocation();

  // Track page views automatically on route changes
  useEffect(() => {
    ga4.trackPageView(location.pathname + location.search);
  }, [location]);

  return {
    trackEvent: ga4.trackEvent.bind(ga4),
    trackPageView: ga4.trackPageView.bind(ga4),
    trackGameStart: ga4.trackGameStart.bind(ga4),
    trackGameEnd: ga4.trackGameEnd.bind(ga4),
    trackDeposit: ga4.trackDeposit.bind(ga4),
    trackWithdrawal: ga4.trackWithdrawal.bind(ga4),
    trackLogin: ga4.trackLogin.bind(ga4),
    trackSignUp: ga4.trackSignUp.bind(ga4),
    trackBonusClaim: ga4.trackBonusClaim.bind(ga4),
    trackConversion: ga4.trackConversion.bind(ga4),
    setUserProperties: ga4.setUserProperties.bind(ga4)
  };
};