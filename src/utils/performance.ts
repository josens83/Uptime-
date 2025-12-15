/**
 * Performance Optimization Utilities
 * Google-level performance patterns
 */

// ===== MEMOIZATION =====

type AnyFunction = (...args: unknown[]) => unknown;

/**
 * Memoize function results with LRU cache
 */
export function memoize<T extends AnyFunction>(
  fn: T,
  options: {
    maxSize?: number;
    ttl?: number; // Time to live in ms
    keyResolver?: (...args: Parameters<T>) => string;
  } = {}
): T {
  const { maxSize = 100, ttl, keyResolver } = options;
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();

  const getKey = keyResolver || ((...args: unknown[]) => JSON.stringify(args));

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey(...args);
    const cached = cache.get(key);

    if (cached) {
      // Check TTL
      if (!ttl || Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
      cache.delete(key);
    }

    const result = fn(...args) as ReturnType<T>;

    // LRU eviction
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  }) as T;
}

// ===== DEBOUNCE & THROTTLE =====

/**
 * Debounce function calls
 */
export function debounce<T extends AnyFunction>(
  fn: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean; maxWait?: number } = {}
): T & { cancel: () => void; flush: () => void } {
  const { leading = false, trailing = true, maxWait } = options;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let maxTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  let result: ReturnType<T>;

  const invokeFunc = () => {
    if (lastArgs) {
      result = fn(...lastArgs) as ReturnType<T>;
      lastArgs = null;
    }
  };

  const leadingEdge = () => {
    if (leading) {
      invokeFunc();
    }
    if (maxWait !== undefined) {
      maxTimeoutId = setTimeout(() => {
        if (trailing && lastArgs) {
          invokeFunc();
        }
        maxTimeoutId = null;
      }, maxWait);
    }
  };

  const trailingEdge = () => {
    timeoutId = null;
    if (trailing && lastArgs) {
      invokeFunc();
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
      maxTimeoutId = null;
    }
  };

  const debounced = ((...args: Parameters<T>): ReturnType<T> => {
    const now = Date.now();
    const isFirstCall = lastCallTime === null;
    lastCallTime = now;
    lastArgs = args;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (isFirstCall) {
      leadingEdge();
    }

    timeoutId = setTimeout(trailingEdge, delay);
    return result;
  }) as T & { cancel: () => void; flush: () => void };

  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (maxTimeoutId) clearTimeout(maxTimeoutId);
    timeoutId = null;
    maxTimeoutId = null;
    lastCallTime = null;
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      trailingEdge();
    }
  };

  return debounced;
}

/**
 * Throttle function calls
 */
export function throttle<T extends AnyFunction>(
  fn: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void } {
  const { leading = true, trailing = true } = options;

  let lastFunc: ReturnType<typeof setTimeout> | null = null;
  let lastRan: number | null = null;
  let result: ReturnType<T>;

  const throttled = ((...args: Parameters<T>): ReturnType<T> => {
    const now = Date.now();

    if (!lastRan && !leading) {
      lastRan = now;
    }

    if (lastRan && now - lastRan >= limit) {
      if (lastFunc) {
        clearTimeout(lastFunc);
        lastFunc = null;
      }
      lastRan = now;
      result = fn(...args) as ReturnType<T>;
    } else if (trailing) {
      if (lastFunc) {
        clearTimeout(lastFunc);
      }
      lastFunc = setTimeout(() => {
        if (!lastRan || now - lastRan >= limit) {
          lastRan = Date.now();
          result = fn(...args) as ReturnType<T>;
          lastFunc = null;
        }
      }, limit - (lastRan ? now - lastRan : 0));
    }

    return result;
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (lastFunc) {
      clearTimeout(lastFunc);
      lastFunc = null;
    }
    lastRan = null;
  };

  return throttled;
}

// ===== REQUEST ANIMATION FRAME =====

/**
 * RAF-based throttle for smooth animations
 */
export function rafThrottle<T extends AnyFunction>(fn: T): T & { cancel: () => void } {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = ((...args: Parameters<T>) => {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          fn(...lastArgs);
        }
        rafId = null;
      });
    }
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  return throttled;
}

// ===== LAZY LOADING =====

/**
 * Intersection Observer-based lazy loading
 */
export function createLazyLoader(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): {
  observe: (element: Element) => void;
  unobserve: (element: Element) => void;
  disconnect: () => void;
} {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });

  return {
    observe: (element: Element) => observer.observe(element),
    unobserve: (element: Element) => observer.unobserve(element),
    disconnect: () => observer.disconnect(),
  };
}

// ===== RESOURCE HINTS =====

/**
 * Preload critical resources
 */
export function preloadResource(
  url: string,
  as: 'script' | 'style' | 'image' | 'font' | 'fetch'
): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;

  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * Prefetch resources for future navigation
 */
export function prefetchResource(url: string): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Preconnect to origin
 */
export function preconnect(origin: string, crossOrigin = true): void {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

// ===== IDLE CALLBACK =====

/**
 * Schedule work during idle periods
 */
export function scheduleIdleWork(
  callback: () => void,
  options: { timeout?: number } = {}
): number {
  if ('requestIdleCallback' in window) {
    return (window as Window & { requestIdleCallback: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number }).requestIdleCallback(callback, options);
  }

  // Fallback for Safari
  return setTimeout(callback, 1) as unknown as number;
}

export function cancelIdleWork(id: number): void {
  if ('cancelIdleCallback' in window) {
    (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

// ===== PERFORMANCE METRICS =====

export interface PerformanceMetrics {
  fcp: number | null;  // First Contentful Paint
  lcp: number | null;  // Largest Contentful Paint
  fid: number | null;  // First Input Delay
  cls: number | null;  // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  domLoad: number | null;
  pageLoad: number | null;
}

/**
 * Collect Core Web Vitals
 */
export function collectWebVitals(): Promise<PerformanceMetrics> {
  return new Promise((resolve) => {
    const metrics: PerformanceMetrics = {
      fcp: null,
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null,
      domLoad: null,
      pageLoad: null,
    };

    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navigation) {
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
      metrics.domLoad = navigation.domContentLoadedEventEnd - navigation.startTime;
      metrics.pageLoad = navigation.loadEventEnd - navigation.startTime;
    }

    // Get paint timing
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
    if (fcp) {
      metrics.fcp = fcp.startTime;
    }

    // LCP Observer
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            metrics.lcp = lastEntry.startTime;
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // FID Observer
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const firstEntry = entries[0] as PerformanceEventTiming | undefined;
          if (firstEntry && 'processingStart' in firstEntry) {
            metrics.fid = firstEntry.processingStart - firstEntry.startTime;
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

        // CLS Observer
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as LayoutShift).hadRecentInput) {
              clsValue += (entry as LayoutShift).value;
            }
          }
          metrics.cls = clsValue;
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch {
        // Some observers may not be supported
      }
    }

    // Resolve after a delay to collect metrics
    setTimeout(() => resolve(metrics), 3000);
  });
}

// Type for layout shift entries
interface LayoutShift extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

// ===== MEMORY MANAGEMENT =====

/**
 * Get memory usage info (Chrome only)
 */
export function getMemoryInfo(): {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
} | null {
  const memory = (performance as Performance & { memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } }).memory;

  if (memory) {
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }
  return null;
}

/**
 * Clean up resources and suggest garbage collection
 */
export function cleanupResources(): void {
  // Clear performance entries to free memory
  if (performance.clearResourceTimings) {
    performance.clearResourceTimings();
  }

  // Clear marks and measures
  performance.clearMarks();
  performance.clearMeasures();

  // Suggest garbage collection (only works in some environments)
  if ((window as Window & { gc?: () => void }).gc) {
    (window as Window & { gc: () => void }).gc();
  }
}

// ===== BUNDLE ANALYSIS =====

/**
 * Track resource loading performance
 */
export function trackResourcePerformance(): Map<string, {
  name: string;
  duration: number;
  size: number;
  type: string;
}> {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const map = new Map();

  resources.forEach(resource => {
    map.set(resource.name, {
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize || 0,
      type: resource.initiatorType,
    });
  });

  return map;
}
