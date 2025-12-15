/**
 * Production-Grade API Client
 * Built-in resilience patterns: retry, circuit breaker, timeout
 */

import { CircuitBreaker, circuitBreakerRegistry, CircuitBreakerConfig } from './circuitBreaker';
import { retry, RetryConfig, withTimeout } from './retry';

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  headers?: Record<string, string>;
  retry?: Partial<RetryConfig>;
  circuitBreaker?: Partial<CircuitBreakerConfig>;
  enableCircuitBreaker?: boolean;
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onError?: (error: ApiError) => void;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  timeout?: number;
  skipRetry?: boolean;
  skipCircuitBreaker?: boolean;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
  duration: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isTimeout(): boolean {
    return this.message.includes('timeout');
  }
}

const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: '',
  timeout: 30000,
  enableCircuitBreaker: true,
  retry: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  },
  circuitBreaker: {
    failureThreshold: 5,
    timeout: 30000,
  },
};

export class ApiClient {
  private config: ApiClientConfig;
  private circuitBreaker?: CircuitBreaker;
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>> = [];
  private responseInterceptors: Array<(response: ApiResponse) => ApiResponse | Promise<ApiResponse>> = [];

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (this.config.enableCircuitBreaker) {
      this.circuitBreaker = circuitBreakerRegistry.get(
        `api-${this.config.baseUrl}`,
        this.config.circuitBreaker
      );
    }

    if (config.onRequest) {
      this.requestInterceptors.push(config.onRequest);
    }

    if (config.onResponse) {
      this.responseInterceptors.push(config.onResponse as (response: ApiResponse) => ApiResponse);
    }
  }

  addRequestInterceptor(
    interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  ): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(
    interceptor: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>
  ): void {
    this.responseInterceptors.push(interceptor);
  }

  private buildUrl(url: string, params?: Record<string, string | number | boolean>): string {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;

    if (!params || Object.keys(params).length === 0) {
      return fullUrl;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    return `${fullUrl}?${searchParams.toString()}`;
  }

  private async executeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const startTime = performance.now();

    // Apply request interceptors
    let requestConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      requestConfig = await interceptor(requestConfig);
    }

    const url = this.buildUrl(requestConfig.url, requestConfig.params);
    const timeout = requestConfig.timeout || this.config.timeout;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...requestConfig.headers,
    };

    const fetchOptions: RequestInit = {
      method: requestConfig.method,
      headers,
    };

    if (requestConfig.data && ['POST', 'PUT', 'PATCH'].includes(requestConfig.method)) {
      fetchOptions.body = JSON.stringify(requestConfig.data);
    }

    try {
      const response = await withTimeout(
        () => fetch(url, fetchOptions),
        timeout,
        `Request timeout after ${timeout}ms`
      );

      const duration = performance.now() - startTime;

      let data: T;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      if (!response.ok) {
        throw new ApiError(
          `HTTP Error ${response.status}: ${response.statusText}`,
          response.status,
          data
        );
      }

      let apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        headers: response.headers,
        duration,
      };

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        apiResponse = (await interceptor(apiResponse as ApiResponse)) as ApiResponse<T>;
      }

      return apiResponse;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        const apiError = new ApiError(
          error.message,
          0, // Network error
          undefined,
          error
        );

        if (this.config.onError) {
          this.config.onError(apiError);
        }

        throw apiError;
      }

      throw new ApiError('Unknown error', 0, undefined, error);
    }
  }

  private async requestWithResilience<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const operation = () => this.executeRequest<T>(config);

    // Skip circuit breaker if requested
    if (config.skipCircuitBreaker || !this.circuitBreaker) {
      if (config.skipRetry) {
        return operation();
      }
      return retry(operation, this.config.retry);
    }

    // Use circuit breaker with retry
    return this.circuitBreaker.execute(async () => {
      if (config.skipRetry) {
        return operation();
      }
      return retry(operation, this.config.retry);
    });
  }

  // HTTP Methods
  async get<T>(url: string, config: Partial<RequestConfig> = {}): Promise<ApiResponse<T>> {
    return this.requestWithResilience<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: unknown, config: Partial<RequestConfig> = {}): Promise<ApiResponse<T>> {
    return this.requestWithResilience<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: unknown, config: Partial<RequestConfig> = {}): Promise<ApiResponse<T>> {
    return this.requestWithResilience<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T>(url: string, data?: unknown, config: Partial<RequestConfig> = {}): Promise<ApiResponse<T>> {
    return this.requestWithResilience<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T>(url: string, config: Partial<RequestConfig> = {}): Promise<ApiResponse<T>> {
    return this.requestWithResilience<T>({ ...config, method: 'DELETE', url });
  }

  // Get circuit breaker stats
  getCircuitBreakerStats() {
    return this.circuitBreaker?.getStats();
  }
}

// Default API client instance
export const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
});

// Create client for specific service
export function createApiClient(
  serviceName: string,
  config: Partial<ApiClientConfig> = {}
): ApiClient {
  return new ApiClient({
    ...config,
    circuitBreaker: {
      ...config.circuitBreaker,
    },
  });
}
