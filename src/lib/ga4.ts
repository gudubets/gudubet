import ReactGA from 'react-ga4';

// GA4 Configuration
const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // This will be replaced with your actual GA4 ID

interface GA4Event {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

class GA4Service {
  private isInitialized = false;

  init(measurementId?: string) {
    if (this.isInitialized) return;
    
    const gaId = measurementId || GA4_MEASUREMENT_ID;
    
    try {
      ReactGA.initialize(gaId, {
        testMode: process.env.NODE_ENV === 'development',
        gtagOptions: {
          debug_mode: process.env.NODE_ENV === 'development'
        }
      });
      
      this.isInitialized = true;
      console.log('GA4 initialized with ID:', gaId);
    } catch (error) {
      console.error('GA4 initialization failed:', error);
    }
  }

  // Track page views
  trackPageView(path?: string) {
    if (!this.isInitialized) return;
    
    try {
      ReactGA.send({
        hitType: 'pageview',
        page: path || window.location.pathname + window.location.search
      });
    } catch (error) {
      console.error('GA4 page view tracking failed:', error);
    }
  }

  // Track custom events
  trackEvent(event: GA4Event) {
    if (!this.isInitialized) return;
    
    try {
      ReactGA.event(event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters
      });
    } catch (error) {
      console.error('GA4 event tracking failed:', error);
    }
  }

  // Gaming specific events
  trackGameStart(gameId: string, gameType: string, provider?: string) {
    this.trackEvent({
      action: 'game_start',
      category: 'gaming',
      label: gameId,
      custom_parameters: {
        game_type: gameType,
        provider: provider
      }
    });
  }

  trackGameEnd(gameId: string, duration: number, outcome?: string) {
    this.trackEvent({
      action: 'game_end',
      category: 'gaming',
      label: gameId,
      value: duration,
      custom_parameters: {
        outcome: outcome
      }
    });
  }

  // Transaction events
  trackPurchase(transactionId: string, value: number, currency: string, items?: any[]) {
    if (!this.isInitialized) return;
    
    try {
      ReactGA.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: currency,
        items: items || []
      });
    } catch (error) {
      console.error('GA4 purchase tracking failed:', error);
    }
  }

  trackDeposit(amount: number, currency: string, method: string) {
    this.trackEvent({
      action: 'deposit',
      category: 'transaction',
      value: amount,
      custom_parameters: {
        currency: currency,
        payment_method: method
      }
    });
  }

  trackWithdrawal(amount: number, currency: string, method: string) {
    this.trackEvent({
      action: 'withdrawal',
      category: 'transaction',
      value: amount,
      custom_parameters: {
        currency: currency,
        payment_method: method
      }
    });
  }

  // User engagement events
  trackLogin(method: string) {
    if (!this.isInitialized) return;
    
    try {
      ReactGA.gtag('event', 'login', {
        method: method
      });
    } catch (error) {
      console.error('GA4 login tracking failed:', error);
    }
  }

  trackSignUp(method: string) {
    if (!this.isInitialized) return;
    
    try {
      ReactGA.gtag('event', 'sign_up', {
        method: method
      });
    } catch (error) {
      console.error('GA4 sign up tracking failed:', error);
    }
  }

  // Bonus and promotion events
  trackBonusClaim(bonusId: string, bonusType: string, amount?: number) {
    this.trackEvent({
      action: 'bonus_claim',
      category: 'promotion',
      label: bonusId,
      value: amount,
      custom_parameters: {
        bonus_type: bonusType
      }
    });
  }

  // Custom conversion events
  trackConversion(conversionType: string, value?: number) {
    this.trackEvent({
      action: 'conversion',
      category: 'engagement',
      label: conversionType,
      value: value
    });
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>) {
    if (!this.isInitialized) return;
    
    try {
      ReactGA.gtag('config', GA4_MEASUREMENT_ID, {
        custom_map: properties
      });
    } catch (error) {
      console.error('GA4 user properties failed:', error);
    }
  }
}

// Export singleton instance
export const ga4 = new GA4Service();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Initialize with environment variable or default
  ga4.init();
}