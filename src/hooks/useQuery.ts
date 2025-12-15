import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { retry, RetryConfig } from '../utils/retry';

/**
 * React Query-like Data Fetching Hook
 * With caching, retry, and automatic refetch
 */

export interface QueryOptions<T> {
  queryKey: string | (string | number | boolean | undefined | null)[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;        // Time in ms before data is considered stale
  cacheTime?: number;        // Time in ms to keep unused data in cache
  refetchInterval?: number;  // Auto refetch interval in ms
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  retry?: boolean | number | Partial<RetryConfig>;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: (data: T | undefined, error: Error | null) => void;
  initialData?: T;
  placeholderData?: T;
  select?: (data: T) => T;
}

export interface QueryResult<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  isStale: boolean;
  refetch: () => Promise<void>;
  remove: () => void;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleTime: number;
}

// Global cache
const queryCache = new Map<string, CacheEntry<unknown>>();
const subscribers = new Map<string, Set<() => void>>();

// Normalize query key to string
function normalizeKey(key: string | (string | number | boolean | undefined | null)[]): string {
  if (typeof key === 'string') return key;
  return JSON.stringify(key);
}

// Check if cache entry is stale
function isStale<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp > entry.staleTime;
}

// Subscribe to cache updates
function subscribe(key: string, callback: () => void): () => void {
  if (!subscribers.has(key)) {
    subscribers.set(key, new Set());
  }
  subscribers.get(key)!.add(callback);

  return () => {
    subscribers.get(key)?.delete(callback);
    if (subscribers.get(key)?.size === 0) {
      subscribers.delete(key);
    }
  };
}

// Notify subscribers
function notifySubscribers(key: string): void {
  subscribers.get(key)?.forEach(callback => callback());
}

// Set cache entry
function setCache<T>(key: string, data: T, staleTime: number): void {
  queryCache.set(key, {
    data,
    timestamp: Date.now(),
    staleTime,
  });
  notifySubscribers(key);
}

// Get cache entry
function getCache<T>(key: string): CacheEntry<T> | undefined {
  return queryCache.get(key) as CacheEntry<T> | undefined;
}

// Remove cache entry
function removeCache(key: string): void {
  queryCache.delete(key);
  notifySubscribers(key);
}

export function useQuery<T>(options: QueryOptions<T>): QueryResult<T> {
  const {
    queryKey,
    queryFn,
    enabled = true,
    staleTime = 0,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    refetchInterval,
    refetchOnWindowFocus = true,
    refetchOnReconnect = true,
    retry: retryOption = true,
    onSuccess,
    onError,
    onSettled,
    initialData,
    placeholderData,
    select,
  } = options;

  const key = normalizeKey(queryKey);
  const [, forceUpdate] = useState({});
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  // Get cached data
  const cached = getCache<T>(key);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Determine current state
  const data = useMemo(() => {
    let result = cached?.data ?? initialData ?? placeholderData;
    if (result && select) {
      result = select(result);
    }
    return result;
  }, [cached?.data, initialData, placeholderData, select]);

  const isStaleData = cached ? isStale(cached) : true;
  const isLoading = !cached && !data && isFetching;
  const isSuccess = !!data && !error;
  const isError = !!error;

  // Fetch function
  const fetch = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    setIsFetching(true);
    setError(null);

    try {
      let result: T;

      if (retryOption) {
        const retryConfig: Partial<RetryConfig> = typeof retryOption === 'object'
          ? retryOption
          : { maxAttempts: typeof retryOption === 'number' ? retryOption : 3 };

        result = await retry(queryFn, retryConfig);
      } else {
        result = await queryFn();
      }

      if (mountedRef.current) {
        setCache(key, result, staleTime);
        onSuccess?.(result);
        onSettled?.(result, null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        setError(error);
        onError?.(error);
        onSettled?.(undefined, error);
      }
    } finally {
      if (mountedRef.current) {
        setIsFetching(false);
      }
      fetchingRef.current = false;
    }
  }, [key, queryFn, retryOption, staleTime, onSuccess, onError, onSettled]);

  // Refetch function
  const refetch = useCallback(async () => {
    await fetch();
  }, [fetch]);

  // Remove from cache
  const remove = useCallback(() => {
    removeCache(key);
  }, [key]);

  // Subscribe to cache updates
  useEffect(() => {
    const unsubscribe = subscribe(key, () => forceUpdate({}));
    return unsubscribe;
  }, [key]);

  // Initial fetch and refetch on stale
  useEffect(() => {
    if (!enabled) return;

    if (!cached || isStale(cached)) {
      fetch();
    }
  }, [enabled, key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch interval
  useEffect(() => {
    if (!enabled || !refetchInterval) return;

    const intervalId = setInterval(fetch, refetchInterval);
    return () => clearInterval(intervalId);
  }, [enabled, refetchInterval, fetch]);

  // Refetch on window focus
  useEffect(() => {
    if (!enabled || !refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (cached && isStale(cached)) {
        fetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enabled, refetchOnWindowFocus, fetch, cached]);

  // Refetch on reconnect
  useEffect(() => {
    if (!enabled || !refetchOnReconnect) return;

    const handleOnline = () => {
      if (cached && isStale(cached)) {
        fetch();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [enabled, refetchOnReconnect, fetch, cached]);

  // Cache cleanup on unmount after cacheTime
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      // Schedule cache cleanup
      setTimeout(() => {
        // Only remove if no active subscribers
        if (!subscribers.has(key) || subscribers.get(key)!.size === 0) {
          removeCache(key);
        }
      }, cacheTime);
    };
  }, [key, cacheTime]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    isStale: isStaleData,
    refetch,
    remove,
  };
}

// Mutation hook
export interface MutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
  onMutate?: (variables: TVariables) => void | Promise<void>;
  retry?: boolean | number;
}

export interface MutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | undefined;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useMutation<TData, TVariables = void>(
  options: MutationOptions<TData, TVariables>
): MutationResult<TData, TVariables> {
  const {
    mutationFn,
    onSuccess,
    onError,
    onSettled,
    onMutate,
    retry: retryOption = false,
  } = options;

  const [data, setData] = useState<TData | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setError(null);

    try {
      await onMutate?.(variables);

      let result: TData;

      if (retryOption) {
        const maxAttempts = typeof retryOption === 'number' ? retryOption : 3;
        result = await retry(() => mutationFn(variables), { maxAttempts });
      } else {
        result = await mutationFn(variables);
      }

      setData(result);
      onSuccess?.(result, variables);
      onSettled?.(result, null, variables);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error, variables);
      onSettled?.(undefined, error, variables);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, onSuccess, onError, onSettled, onMutate, retryOption]);

  const mutate = useCallback((variables: TVariables) => {
    mutateAsync(variables).catch(() => {
      // Error is already handled
    });
  }, [mutateAsync]);

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    mutate,
    mutateAsync,
    data,
    error,
    isLoading,
    isError: !!error,
    isSuccess: !!data && !error,
    reset,
  };
}

// Invalidate queries
export function invalidateQueries(keyPrefix: string): void {
  const normalizedPrefix = typeof keyPrefix === 'string' ? keyPrefix : JSON.stringify(keyPrefix);

  queryCache.forEach((_, key) => {
    if (key.startsWith(normalizedPrefix)) {
      const entry = queryCache.get(key);
      if (entry) {
        // Mark as stale
        (entry as CacheEntry<unknown>).timestamp = 0;
      }
      notifySubscribers(key);
    }
  });
}

// Clear all cache
export function clearQueryCache(): void {
  queryCache.clear();
  subscribers.forEach((_, key) => notifySubscribers(key));
}
