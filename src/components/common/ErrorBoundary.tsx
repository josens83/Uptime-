import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Error Boundary with Fallback UI
 * Netflix-style graceful error handling
 */

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  level?: 'page' | 'section' | 'component' | 'silent';
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error
    console.error(`[ErrorBoundary:${this.props.name || 'unnamed'}]`, error, errorInfo);

    // Report to monitoring
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Could send to error tracking service here
    this.reportError(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // TODO: Send to error tracking service (Sentry, etc.)
    const errorReport = {
      name: this.props.name,
      level: this.props.level,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    console.log('[ErrorBoundary] Error report:', errorReport);

    // Store locally for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('errorReports') || '[]');
      errors.push(errorReport);
      // Keep only last 50 errors
      if (errors.length > 50) errors.shift();
      localStorage.setItem('errorReports', JSON.stringify(errors));
    } catch {
      // Ignore storage errors
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError && error) {
      // Custom fallback
      if (fallback) {
        if (typeof fallback === 'function') {
          return <>{fallback(error, this.handleReset)}</>;
        }
        return <>{fallback}</>;
      }

      // Silent level - render nothing
      if (level === 'silent') {
        return null;
      }

      // Default error UI based on level
      return <DefaultErrorUI error={error} level={level} onRetry={this.handleReset} />;
    }

    return children;
  }
}

// Default Error UI Component
interface DefaultErrorUIProps {
  error: Error;
  level: 'page' | 'section' | 'component';
  onRetry: () => void;
}

function DefaultErrorUI({ error, level, onRetry }: DefaultErrorUIProps) {
  const styles = {
    page: 'min-h-screen flex items-center justify-center bg-gray-900',
    section: 'min-h-64 flex items-center justify-center bg-gray-800/50 rounded-xl',
    component: 'p-4 flex items-center justify-center bg-gray-800/30 rounded-lg',
  };

  const sizes = {
    page: 'max-w-lg',
    section: 'max-w-md',
    component: 'max-w-xs',
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles[level]}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className={`text-center p-6 ${sizes[level]}`}>
          {/* Error Icon */}
          <div className={`mx-auto mb-4 ${level === 'page' ? 'w-20 h-20' : 'w-12 h-12'}`}>
            <svg
              className="w-full h-full text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3
            className={`font-bold text-white mb-2 ${
              level === 'page' ? 'text-2xl' : 'text-lg'
            }`}
          >
            {level === 'page' ? '문제가 발생했습니다' : '오류'}
          </h3>

          {/* Message */}
          <p className="text-gray-400 mb-4 text-sm">
            {level === 'page'
              ? '죄송합니다. 예상치 못한 오류가 발생했습니다.'
              : error.message || '잠시 후 다시 시도해주세요.'}
          </p>

          {/* Error Details (Page level only) */}
          {level === 'page' && (
            <details className="mb-4 text-left">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                기술적 세부 정보
              </summary>
              <pre className="mt-2 p-2 bg-gray-900 rounded text-xs text-red-400 overflow-auto max-h-32">
                {error.name}: {error.message}
              </pre>
            </details>
          )}

          {/* Retry Button */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                       transition-colors text-sm font-medium"
            >
              다시 시도
            </button>
            {level === 'page' && (
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg
                         transition-colors text-sm font-medium"
              >
                페이지 새로고침
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

// Suspense Error Boundary for async components
interface SuspenseErrorBoundaryProps extends ErrorBoundaryProps {
  loadingFallback?: ReactNode;
}

export function SuspenseErrorBoundary({
  children,
  loadingFallback = <DefaultLoadingUI />,
  ...errorBoundaryProps
}: SuspenseErrorBoundaryProps) {
  return (
    <ErrorBoundary {...errorBoundaryProps}>
      <React.Suspense fallback={loadingFallback}>{children}</React.Suspense>
    </ErrorBoundary>
  );
}

// Default Loading UI
function DefaultLoadingUI() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// Query Error Boundary for data fetching
interface QueryErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  retryText?: string;
}

export function QueryErrorBoundary({
  children,
  onRetry,
  retryText = '다시 시도',
}: QueryErrorBoundaryProps) {
  const [key, setKey] = React.useState(0);

  const handleRetry = () => {
    setKey(prev => prev + 1);
    onRetry?.();
  };

  return (
    <ErrorBoundary
      key={key}
      fallback={(error, reset) => (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">데이터 로드 실패</span>
          </div>
          <p className="text-sm text-gray-400 mb-3">{error.message}</p>
          <button
            onClick={() => {
              reset();
              handleRetry();
            }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            {retryText}
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
