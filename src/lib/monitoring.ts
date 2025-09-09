// Monitoring and Analytics Library
export class MonitoringService {
  private static instance: MonitoringService;
  private metricsQueue: any[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public init() {
    if (this.isInitialized) return;
    
    // Initialize Sentry for error tracking
    this.initSentry();
    
    // Start performance monitoring
    this.initPerformanceMonitoring();
    
    // Set up custom metrics collection
    this.initCustomMetrics();
    
    this.isInitialized = true;
    console.log('Monitoring service initialized');
  }

  private initSentry() {
    // Sentry initialization would go here
    // For now, we'll use a custom error handler
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', {
        message: event.error?.message || event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  private initPerformanceMonitoring() {
    // Performance Observer for monitoring
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackMetric('performance', {
            name: entry.name,
            type: entry.entryType,
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });

      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    }
  }

  private initCustomMetrics() {
    // Track page views
    this.trackPageView();
    
    // Track user interactions
    this.trackUserInteractions();
    
    // Flush metrics every 30 seconds
    setInterval(() => {
      this.flushMetrics();
    }, 30000);
  }

  public trackPageView(path?: string) {
    this.trackMetric('pageview', {
      path: path || window.location.pathname,
      referrer: document.referrer,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  }

  public trackEvent(eventName: string, properties: Record<string, any> = {}) {
    this.trackMetric('event', {
      name: eventName,
      properties,
      timestamp: Date.now()
    });
  }

  public trackGameLaunch(gameId: string, provider: string) {
    this.trackEvent('game_launch', {
      gameId,
      provider,
      timestamp: Date.now()
    });
  }

  public trackPayment(amount: number, currency: string, method: string, status: string) {
    this.trackEvent('payment', {
      amount,
      currency,
      method,
      status,
      timestamp: Date.now()
    });
  }

  public trackFraudAlert(riskScore: number, reason: string, userId?: string) {
    this.trackEvent('fraud_alert', {
      riskScore,
      reason,
      userId,
      timestamp: Date.now(),
      severity: riskScore > 80 ? 'high' : riskScore > 60 ? 'medium' : 'low'
    });
  }

  public logError(message: string, details: Record<string, any> = {}) {
    const error = {
      message,
      details,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      level: 'error'
    };

    this.metricsQueue.push({ type: 'error', data: error });
    
    // Also log to console in development
    if (import.meta.env.DEV) {
      console.error('Monitoring Error:', error);
    }
  }

  public logWarning(message: string, details: Record<string, any> = {}) {
    this.trackMetric('warning', {
      message,
      details,
      timestamp: Date.now()
    });
  }

  private trackUserInteractions() {
    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.closest('button');
        const buttonText = button?.textContent?.trim();
        const dataTestId = button?.getAttribute('data-testid');
        
        this.trackEvent('button_click', {
          text: buttonText,
          testId: dataTestId,
          className: button?.className
        });
      }

      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.closest('a');
        this.trackEvent('link_click', {
          href: link?.href,
          text: link?.textContent?.trim()
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent('form_submit', {
        formId: form.id,
        action: form.action,
        method: form.method
      });
    });
  }

  private trackMetric(type: string, data: Record<string, any>) {
    this.metricsQueue.push({
      type,
      data,
      timestamp: Date.now()
    });

    // Auto-flush if queue gets large
    if (this.metricsQueue.length > 50) {
      this.flushMetrics();
    }
  }

  private async flushMetrics() {
    if (this.metricsQueue.length === 0) return;

    const metricsToSend = [...this.metricsQueue];
    this.metricsQueue = [];

    try {
      // Send to your analytics endpoint
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ metrics: metricsToSend })
      });

      if (!response.ok) {
        console.warn('Failed to send metrics:', response.statusText);
        // Re-add failed metrics to queue (with limit)
        this.metricsQueue.unshift(...metricsToSend.slice(0, 25));
      }
    } catch (error) {
      console.warn('Error sending metrics:', error);
      // Re-add failed metrics to queue (with limit)
      this.metricsQueue.unshift(...metricsToSend.slice(0, 25));
    }
  }

  // Health check endpoint
  public getHealthStatus() {
    return {
      monitoring: this.isInitialized,
      queueSize: this.metricsQueue.length,
      performance: {
        memory: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : null,
        timing: performance.timing ? {
          loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
          domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
        } : null
      }
    };
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();

// Auto-initialize
if (typeof window !== 'undefined') {
  monitoring.init();
}