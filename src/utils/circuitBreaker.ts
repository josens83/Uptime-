/**
 * Circuit Breaker Pattern Implementation
 * Netflix Hystrix-inspired resilience pattern
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening
  successThreshold: number;      // Successes needed to close from half-open
  timeout: number;               // Time in ms before trying half-open
  resetTimeout: number;          // Time in ms to reset failure count
  monitorInterval: number;       // Interval for health checks
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 30000,        // 30 seconds
  resetTimeout: 60000,   // 1 minute
  monitorInterval: 5000, // 5 seconds
};

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;
  private config: CircuitBreakerConfig;
  private name: string;
  private listeners: Set<(stats: CircuitBreakerStats) => void> = new Set();

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.name = name;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async execute<T>(operation: () => Promise<T>, fallback?: () => T | Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.transitionTo('HALF_OPEN');
      } else {
        console.warn(`[CircuitBreaker:${this.name}] Circuit is OPEN, rejecting request`);
        if (fallback) {
          return fallback();
        }
        throw new CircuitBreakerOpenError(this.name, this.getStats());
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);

      if (fallback) {
        console.log(`[CircuitBreaker:${this.name}] Using fallback after failure`);
        return fallback();
      }

      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    return Date.now() - this.lastFailureTime >= this.config.timeout;
  }

  private onSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.totalSuccesses++;

    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.transitionTo('CLOSED');
      }
    } else if (this.state === 'CLOSED') {
      // Reset failure count after successful request
      if (this.lastFailureTime &&
          Date.now() - this.lastFailureTime >= this.config.resetTimeout) {
        this.failures = 0;
      }
    }

    this.notifyListeners();
  }

  private onFailure(error: unknown): void {
    this.lastFailureTime = Date.now();
    this.failures++;
    this.totalFailures++;

    console.error(`[CircuitBreaker:${this.name}] Failure recorded:`, error);

    if (this.state === 'HALF_OPEN') {
      // Any failure in half-open immediately opens the circuit
      this.transitionTo('OPEN');
    } else if (this.state === 'CLOSED') {
      if (this.failures >= this.config.failureThreshold) {
        this.transitionTo('OPEN');
      }
    }

    this.notifyListeners();
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    console.log(`[CircuitBreaker:${this.name}] State transition: ${oldState} -> ${newState}`);

    if (newState === 'CLOSED') {
      this.failures = 0;
      this.successes = 0;
    } else if (newState === 'HALF_OPEN') {
      this.successes = 0;
    }

    this.notifyListeners();
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
    };
  }

  getState(): CircuitState {
    return this.state;
  }

  getName(): string {
    return this.name;
  }

  // Manual controls
  forceOpen(): void {
    this.transitionTo('OPEN');
  }

  forceClose(): void {
    this.transitionTo('CLOSED');
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.notifyListeners();
  }

  // Event listeners
  subscribe(listener: (stats: CircuitBreakerStats) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const stats = this.getStats();
    this.listeners.forEach(listener => listener(stats));
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(
    public readonly circuitName: string,
    public readonly stats: CircuitBreakerStats
  ) {
    super(`Circuit breaker '${circuitName}' is open`);
    this.name = 'CircuitBreakerOpenError';
  }
}

// Circuit Breaker Registry for managing multiple breakers
class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();

  get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, config));
    }
    return this.breakers.get(name)!;
  }

  getAll(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }

  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    this.breakers.forEach((breaker, name) => {
      stats[name] = breaker.getStats();
    });
    return stats;
  }

  resetAll(): void {
    this.breakers.forEach(breaker => breaker.reset());
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();

// Decorator function for easy circuit breaker application
export function withCircuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(
  name: string,
  fn: T,
  fallback?: () => ReturnType<T>,
  config?: Partial<CircuitBreakerConfig>
): T {
  const breaker = circuitBreakerRegistry.get(name, config);

  return (async (...args: Parameters<T>) => {
    return breaker.execute(
      () => fn(...args) as Promise<unknown>,
      fallback as (() => unknown) | undefined
    );
  }) as T;
}
