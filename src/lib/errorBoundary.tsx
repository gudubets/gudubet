import React from 'react';
import { monitoring } from './monitoring';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error to monitoring service
    monitoring.logError('React Error Boundary', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      url: window.location.href,
      timestamp: Date.now()
    });

    // In development, also log to console
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          reset={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; reset: () => void }> = ({ error, reset }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg border p-6 text-center">
        <div className="text-destructive mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Bir hata oluştu
        </h2>
        
        <p className="text-muted-foreground mb-4">
          Beklenmeyen bir hata meydana geldi. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
        </p>
        
        {import.meta.env.DEV && error && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
              Hata Detayları (Geliştirici Modu)
            </summary>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={reset}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Tekrar Dene
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/90 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for functional components
export const useErrorHandler = () => {
  return React.useCallback((error: Error, errorInfo?: string) => {
    monitoring.logError('Manual Error Report', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      additionalInfo: errorInfo,
      url: window.location.href,
      timestamp: Date.now()
    });
  }, []);
};