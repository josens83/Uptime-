/**
 * Comprehensive Monitoring & Observability Service
 * Uber-level monitoring, logging, and metrics collection
 */

import { collectWebVitals, getMemoryInfo, PerformanceMetrics } from '../utils/performance';
import { circuitBreakerRegistry, CircuitBreakerStats } from '../utils/circuitBreaker';
import { errorService, ProcessedError } from './errorService';

// ===== TYPES =====

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  tags?: string[];
  source?: string;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
  duration?: number;
}

export interface Metric {
  name: string;
  value: number;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  tags?: Record<string, string>;
  timestamp: number;
}

export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'running' | 'completed' | 'error';
  tags?: Record<string, string>;
  logs?: Array<{ timestamp: number; message: string }>;
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  lastCheck: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface SystemMetrics {
  timestamp: number;
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    usagePercentage: number;
  } | null;
  performance: PerformanceMetrics | null;
  circuitBreakers: Record<string, CircuitBreakerStats>;
  errors: {
    total: number;
    last5Minutes: number;
    bySeverity: Record<string, number>;
  };
  activeSessions: number;
  pageViews: number;
}

// ===== CONFIGURATION =====

interface MonitoringConfig {
  logLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  sampleRate: number;
  bufferSize: number;
  flushInterval: number;
  enablePerformance: boolean;
  enableTracing: boolean;
}

const DEFAULT_CONFIG: MonitoringConfig = {
  logLevel: 'info',
  enableConsole: true,
  enableRemote: false,
  sampleRate: 1.0,
  bufferSize: 100,
  flushInterval: 30000,
  enablePerformance: true,
  enableTracing: true,
};

// Log level priorities
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

// ===== MONITORING SERVICE =====

class MonitoringService {
  private config: MonitoringConfig;
  private logBuffer: LogEntry[] = [];
  private metricBuffer: Metric[] = [];
  private activeSpans: Map<string, Span> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private sessionId: string;
  private userId?: string;
  private pageViews = 0;
  private flushIntervalId?: ReturnType<typeof setInterval>;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateId();

    // Start flush interval
    if (this.config.enableRemote) {
      this.flushIntervalId = setInterval(() => this.flush(), this.config.flushInterval);
    }

    // Subscribe to errors
    errorService.subscribe((error) => this.onError(error));

    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.pageViews++;
        this.log('info', 'Page became visible', { pageViews: this.pageViews });
      }
    });
  }

  // ===== LOGGING =====

  log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.logLevel]) {
      return;
    }

    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      sessionId: this.sessionId,
      userId: this.userId,
    };

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Buffer for remote
    if (this.config.enableRemote) {
      this.logBuffer.push(entry);
      if (this.logBuffer.length >= this.config.bufferSize) {
        this.flush();
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  fatal(message: string, context?: Record<string, unknown>): void {
    this.log('fatal', message, context);
    // Immediately flush fatal errors
    this.flush();
  }

  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const logFn = entry.level === 'error' || entry.level === 'fatal'
      ? console.error
      : entry.level === 'warn'
        ? console.warn
        : entry.level === 'debug'
          ? console.debug
          : console.log;

    if (entry.context) {
      logFn(prefix, entry.message, entry.context);
    } else {
      logFn(prefix, entry.message);
    }
  }

  // ===== METRICS =====

  counter(name: string, value = 1, tags?: Record<string, string>): void {
    this.recordMetric({ name, value, type: 'counter', tags, timestamp: Date.now() });
  }

  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric({ name, value, type: 'gauge', tags, timestamp: Date.now() });
  }

  histogram(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric({ name, value, type: 'histogram', tags, timestamp: Date.now() });
  }

  timer(name: string, duration: number, tags?: Record<string, string>): void {
    this.recordMetric({ name, value: duration, type: 'timer', tags, timestamp: Date.now() });
  }

  private recordMetric(metric: Metric): void {
    if (Math.random() > this.config.sampleRate) {
      return;
    }

    this.metricBuffer.push(metric);

    if (this.metricBuffer.length >= this.config.bufferSize) {
      this.flush();
    }
  }

  // ===== TRACING =====

  startSpan(name: string, parentSpanId?: string): Span {
    const span: Span = {
      traceId: parentSpanId ? this.getTraceId(parentSpanId) : this.generateId(),
      spanId: this.generateId(),
      parentSpanId,
      name,
      startTime: performance.now(),
      status: 'running',
      logs: [],
    };

    this.activeSpans.set(span.spanId, span);
    this.log('debug', `Span started: ${name}`, { spanId: span.spanId, traceId: span.traceId });

    return span;
  }

  endSpan(spanId: string, status: 'completed' | 'error' = 'completed'): Span | undefined {
    const span = this.activeSpans.get(spanId);
    if (!span) return undefined;

    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;

    this.activeSpans.delete(spanId);
    this.timer(`span.${span.name}`, span.duration);
    this.log('debug', `Span ended: ${span.name}`, {
      spanId: span.spanId,
      duration: span.duration,
      status,
    });

    return span;
  }

  addSpanLog(spanId: string, message: string): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.logs?.push({ timestamp: Date.now(), message });
    }
  }

  private getTraceId(spanId: string): string {
    const span = this.activeSpans.get(spanId);
    return span?.traceId || this.generateId();
  }

  // Helper for timing operations
  async trace<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const span = this.startSpan(name);
    try {
      const result = await operation();
      this.endSpan(span.spanId, 'completed');
      return result;
    } catch (error) {
      this.addSpanLog(span.spanId, `Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      this.endSpan(span.spanId, 'error');
      throw error;
    }
  }

  // ===== HEALTH CHECKS =====

  registerHealthCheck(
    name: string,
    check: () => Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; message?: string }>
  ): void {
    const runCheck = async () => {
      const startTime = performance.now();
      try {
        const result = await check();
        this.healthChecks.set(name, {
          name,
          status: result.status,
          message: result.message,
          lastCheck: Date.now(),
          duration: performance.now() - startTime,
        });
      } catch (error) {
        this.healthChecks.set(name, {
          name,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: Date.now(),
          duration: performance.now() - startTime,
        });
      }
    };

    // Run immediately and periodically
    runCheck();
    setInterval(runCheck, 60000); // Every minute
  }

  getHealthStatus(): {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    checks: HealthCheck[];
  } {
    const checks = Array.from(this.healthChecks.values());

    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    for (const check of checks) {
      if (check.status === 'unhealthy') {
        overall = 'unhealthy';
        break;
      }
      if (check.status === 'degraded') {
        overall = 'degraded';
      }
    }

    return { overall, checks };
  }

  // ===== SYSTEM METRICS =====

  async collectSystemMetrics(): Promise<SystemMetrics> {
    const [webVitals, errorStats] = await Promise.all([
      this.config.enablePerformance ? collectWebVitals() : null,
      Promise.resolve(errorService.getStats()),
    ]);

    return {
      timestamp: Date.now(),
      memory: getMemoryInfo(),
      performance: webVitals,
      circuitBreakers: circuitBreakerRegistry.getAllStats(),
      errors: errorStats,
      activeSessions: 1, // Could be updated with real session tracking
      pageViews: this.pageViews,
    };
  }

  // ===== ERROR HANDLING =====

  private onError(error: ProcessedError): void {
    this.counter('error', 1, { code: error.code, severity: error.severity });
    this.log(error.severity === 'critical' ? 'fatal' : 'error', error.message, {
      errorId: error.id,
      code: error.code,
      context: error.context,
    });
  }

  // ===== USER CONTEXT =====

  setUserId(userId: string): void {
    this.userId = userId;
    this.log('info', 'User identified', { userId });
  }

  clearUserId(): void {
    this.log('info', 'User signed out', { userId: this.userId });
    this.userId = undefined;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // ===== FLUSH & CLEANUP =====

  async flush(): Promise<void> {
    if (!this.config.enableRemote || (!this.logBuffer.length && !this.metricBuffer.length)) {
      return;
    }

    const logs = [...this.logBuffer];
    const metrics = [...this.metricBuffer];

    this.logBuffer = [];
    this.metricBuffer = [];

    if (this.config.remoteEndpoint) {
      try {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logs, metrics, sessionId: this.sessionId }),
          keepalive: true,
        });
      } catch (error) {
        // Re-add to buffer on failure (with limit)
        this.logBuffer = [...logs.slice(-50), ...this.logBuffer].slice(-this.config.bufferSize);
        this.metricBuffer = [...metrics.slice(-50), ...this.metricBuffer].slice(-this.config.bufferSize);
        console.error('[Monitoring] Failed to flush:', error);
      }
    }
  }

  destroy(): void {
    this.flush();
    if (this.flushIntervalId) {
      clearInterval(this.flushIntervalId);
    }
  }

  // ===== UTILITIES =====

  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  // Get all metrics
  getMetrics(): Metric[] {
    return [...this.metricBuffer];
  }

  // Export data for debugging
  exportData(): {
    logs: LogEntry[];
    metrics: Metric[];
    health: { overall: string; checks: HealthCheck[] };
    sessionId: string;
  } {
    return {
      logs: this.getLogs(),
      metrics: this.getMetrics(),
      health: this.getHealthStatus(),
      sessionId: this.sessionId,
    };
  }
}

// Singleton instance
export const monitoring = new MonitoringService({
  logLevel: import.meta.env.DEV ? 'debug' : 'info',
  enableConsole: true,
  enableRemote: false,
});

// Register default health checks
monitoring.registerHealthCheck('memory', async () => {
  const memory = getMemoryInfo();
  if (!memory) return { status: 'healthy', message: 'Memory info not available' };

  if (memory.usagePercentage > 90) {
    return { status: 'unhealthy', message: `Memory usage at ${memory.usagePercentage.toFixed(1)}%` };
  }
  if (memory.usagePercentage > 75) {
    return { status: 'degraded', message: `Memory usage at ${memory.usagePercentage.toFixed(1)}%` };
  }
  return { status: 'healthy', message: `Memory usage at ${memory.usagePercentage.toFixed(1)}%` };
});

monitoring.registerHealthCheck('circuitBreakers', async () => {
  const stats = circuitBreakerRegistry.getAllStats();
  const openBreakers = Object.entries(stats).filter(([, s]) => s.state === 'OPEN');

  if (openBreakers.length > 0) {
    return {
      status: 'degraded',
      message: `${openBreakers.length} circuit breaker(s) open: ${openBreakers.map(([n]) => n).join(', ')}`,
    };
  }
  return { status: 'healthy', message: 'All circuit breakers closed' };
});

// Convenience exports
export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => monitoring.debug(message, context),
  info: (message: string, context?: Record<string, unknown>) => monitoring.info(message, context),
  warn: (message: string, context?: Record<string, unknown>) => monitoring.warn(message, context),
  error: (message: string, context?: Record<string, unknown>) => monitoring.error(message, context),
  fatal: (message: string, context?: Record<string, unknown>) => monitoring.fatal(message, context),
};

export const metrics = {
  counter: (name: string, value?: number, tags?: Record<string, string>) =>
    monitoring.counter(name, value, tags),
  gauge: (name: string, value: number, tags?: Record<string, string>) =>
    monitoring.gauge(name, value, tags),
  histogram: (name: string, value: number, tags?: Record<string, string>) =>
    monitoring.histogram(name, value, tags),
  timer: (name: string, duration: number, tags?: Record<string, string>) =>
    monitoring.timer(name, duration, tags),
};

export const tracer = {
  startSpan: (name: string, parentSpanId?: string) => monitoring.startSpan(name, parentSpanId),
  endSpan: (spanId: string, status?: 'completed' | 'error') => monitoring.endSpan(spanId, status),
  trace: <T>(name: string, operation: () => Promise<T>) => monitoring.trace(name, operation),
};
