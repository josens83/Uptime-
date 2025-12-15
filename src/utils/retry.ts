/**
 * Retry Logic with Exponential Backoff
 * Production-grade retry mechanism with jitter
 */

export interface RetryConfig {
  maxAttempts: number;           // Maximum number of retry attempts
  baseDelay: number;             // Initial delay in ms
  maxDelay: number;              // Maximum delay in ms
  backoffMultiplier: number;     // Multiplier for exponential backoff
  jitter: boolean;               // Add randomness to prevent thundering herd
  retryableErrors?: string[];    // Error types to retry (empty = all)
  nonRetryableErrors?: string[]; // Error types to never retry
  onRetry?: (attempt: number, error: unknown, delay: number) => void;
  shouldRetry?: (error: unknown) => boolean;
}

export interface RetryStats {
  attempts: number;
  totalDelay: number;
  errors: unknown[];
  success: boolean;
  finalError?: unknown;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  retryableErrors: [],
  nonRetryableErrors: ['ValidationError', 'AuthenticationError', 'ForbiddenError'],
};

// Common non-retryable error patterns
const NON_RETRYABLE_PATTERNS = [
  /invalid/i,
  /unauthorized/i,
  /forbidden/i,
  /not found/i,
  /bad request/i,
  /validation/i,
];

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly errors: unknown[]
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  config: RetryConfig
): number {
  let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  delay = Math.min(delay, config.maxDelay);

  if (config.jitter) {
    // Add ±25% jitter
    const jitterFactor = 0.75 + Math.random() * 0.5;
    delay = Math.floor(delay * jitterFactor);
  }

  return delay;
}

/**
 * Check if an error should be retried
 */
function isRetryable(error: unknown, config: RetryConfig): boolean {
  // Custom retry checker takes precedence
  if (config.shouldRetry) {
    return config.shouldRetry(error);
  }

  const errorName = error instanceof Error ? error.name : 'UnknownError';
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Check non-retryable errors first
  if (config.nonRetryableErrors?.includes(errorName)) {
    return false;
  }

  // Check against non-retryable patterns
  for (const pattern of NON_RETRYABLE_PATTERNS) {
    if (pattern.test(errorMessage)) {
      return false;
    }
  }

  // If specific retryable errors are defined, only retry those
  if (config.retryableErrors && config.retryableErrors.length > 0) {
    return config.retryableErrors.includes(errorName);
  }

  // By default, retry network-related errors
  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /ECONNRESET/,
    /ETIMEDOUT/,
    /ECONNREFUSED/,
    /socket hang up/i,
    /503/,
    /502/,
    /500/,
    /rate limit/i,
    /too many requests/i,
  ];

  return retryablePatterns.some(pattern => pattern.test(errorMessage));
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute an operation with retry logic
 */
export async function retry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const fullConfig: RetryConfig = { ...DEFAULT_CONFIG, ...config };
  const errors: unknown[] = [];
  let totalDelay = 0;

  for (let attempt = 1; attempt <= fullConfig.maxAttempts; attempt++) {
    try {
      const result = await operation();
      if (attempt > 1) {
        console.log(`[Retry] Succeeded after ${attempt} attempts`);
      }
      return result;
    } catch (error) {
      errors.push(error);

      const isLastAttempt = attempt === fullConfig.maxAttempts;
      const shouldRetry = !isLastAttempt && isRetryable(error, fullConfig);

      console.warn(
        `[Retry] Attempt ${attempt}/${fullConfig.maxAttempts} failed:`,
        error instanceof Error ? error.message : error
      );

      if (!shouldRetry) {
        if (!isLastAttempt) {
          console.warn('[Retry] Error is not retryable, giving up');
        }
        throw error;
      }

      const delay = calculateDelay(attempt, fullConfig);
      totalDelay += delay;

      console.log(`[Retry] Waiting ${delay}ms before retry...`);

      if (fullConfig.onRetry) {
        fullConfig.onRetry(attempt, error, delay);
      }

      await sleep(delay);
    }
  }

  // Should never reach here, but just in case
  throw new RetryError(
    `All ${fullConfig.maxAttempts} attempts failed`,
    fullConfig.maxAttempts,
    errors
  );
}

/**
 * Create a retryable version of a function
 */
export function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  config: Partial<RetryConfig> = {}
): T {
  return (async (...args: Parameters<T>) => {
    return retry(() => fn(...args) as Promise<unknown>, config);
  }) as T;
}

/**
 * Retry with circuit breaker integration
 */
export async function retryWithCircuitBreaker<T>(
  operation: () => Promise<T>,
  circuitBreakerName: string,
  retryConfig: Partial<RetryConfig> = {},
  fallback?: () => T | Promise<T>
): Promise<T> {
  const { circuitBreakerRegistry } = await import('./circuitBreaker');
  const breaker = circuitBreakerRegistry.get(circuitBreakerName);

  return breaker.execute(
    () => retry(operation, retryConfig),
    fallback
  );
}

/**
 * Batch retry - retry multiple operations with shared config
 */
export async function batchRetry<T>(
  operations: Array<() => Promise<T>>,
  config: Partial<RetryConfig> = {}
): Promise<Array<{ success: boolean; result?: T; error?: unknown }>> {
  return Promise.all(
    operations.map(async operation => {
      try {
        const result = await retry(operation, config);
        return { success: true, result };
      } catch (error) {
        return { success: false, error };
      }
    })
  );
}

/**
 * Timeout wrapper for operations
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Combined retry with timeout
 */
export async function retryWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> {
  return retry(
    () => withTimeout(operation, timeoutMs),
    retryConfig
  );
}
