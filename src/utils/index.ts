// Circuit Breaker Pattern
export {
  CircuitBreaker,
  CircuitBreakerOpenError,
  circuitBreakerRegistry,
  withCircuitBreaker,
  type CircuitState,
  type CircuitBreakerConfig,
  type CircuitBreakerStats,
} from './circuitBreaker';

// Retry Logic
export {
  retry,
  withRetry,
  retryWithCircuitBreaker,
  batchRetry,
  withTimeout,
  retryWithTimeout,
  RetryError,
  type RetryConfig,
  type RetryStats,
} from './retry';

// API Client
export {
  ApiClient,
  ApiError,
  apiClient,
  createApiClient,
  type ApiClientConfig,
  type RequestConfig,
  type ApiResponse,
} from './apiClient';

// Performance Utilities
export {
  memoize,
  debounce,
  throttle,
  rafThrottle,
  createLazyLoader,
  preloadResource,
  prefetchResource,
  preconnect,
  scheduleIdleWork,
  cancelIdleWork,
  collectWebVitals,
  getMemoryInfo,
  cleanupResources,
  trackResourcePerformance,
  type PerformanceMetrics,
} from './performance';
