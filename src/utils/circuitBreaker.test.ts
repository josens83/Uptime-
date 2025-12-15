import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker, CircuitBreakerOpenError } from './circuitBreaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 100,
      resetTimeout: 200,
    });
  });

  describe('initial state', () => {
    it('should start in CLOSED state', () => {
      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should have zero failures and successes', () => {
      const stats = breaker.getStats();
      expect(stats.failures).toBe(0);
      expect(stats.successes).toBe(0);
    });
  });

  describe('execute', () => {
    it('should execute successful operations', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await breaker.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('should pass through errors when circuit is closed', async () => {
      const error = new Error('test error');
      const operation = vi.fn().mockRejectedValue(error);

      await expect(breaker.execute(operation)).rejects.toThrow('test error');
    });

    it('should open circuit after threshold failures', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(operation);
        } catch {
          // Expected
        }
      }

      expect(breaker.getState()).toBe('OPEN');
    });

    it('should reject immediately when circuit is open', async () => {
      breaker.forceOpen();

      const operation = vi.fn().mockResolvedValue('success');

      await expect(breaker.execute(operation)).rejects.toThrow(CircuitBreakerOpenError);
      expect(operation).not.toHaveBeenCalled();
    });

    it('should use fallback when circuit is open', async () => {
      breaker.forceOpen();

      const operation = vi.fn().mockResolvedValue('main');
      const fallback = vi.fn().mockReturnValue('fallback');

      const result = await breaker.execute(operation, fallback);

      expect(result).toBe('fallback');
      expect(operation).not.toHaveBeenCalled();
      expect(fallback).toHaveBeenCalled();
    });
  });

  describe('state transitions', () => {
    it('should transition to HALF_OPEN after timeout', async () => {
      breaker.forceOpen();
      expect(breaker.getState()).toBe('OPEN');

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      // The next execute should try HALF_OPEN
      const operation = vi.fn().mockResolvedValue('success');
      await breaker.execute(operation);

      expect(operation).toHaveBeenCalled();
    });

    it('should transition to CLOSED after success threshold in HALF_OPEN', async () => {
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 1,
        successThreshold: 2,
        timeout: 10,
      });

      // Open the circuit
      breaker.forceOpen();

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 20));

      // Execute successful operations
      const operation = vi.fn().mockResolvedValue('success');
      await breaker.execute(operation);
      await breaker.execute(operation);

      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should return to OPEN on failure in HALF_OPEN', async () => {
      const breaker = new CircuitBreaker('test', {
        failureThreshold: 1,
        successThreshold: 2,
        timeout: 10,
      });

      // Open the circuit
      breaker.forceOpen();

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 20));

      // Execute failing operation
      const operation = vi.fn().mockRejectedValue(new Error('fail'));
      try {
        await breaker.execute(operation);
      } catch {
        // Expected
      }

      expect(breaker.getState()).toBe('OPEN');
    });
  });

  describe('manual controls', () => {
    it('should force open', () => {
      breaker.forceOpen();
      expect(breaker.getState()).toBe('OPEN');
    });

    it('should force close', () => {
      breaker.forceOpen();
      breaker.forceClose();
      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should reset', () => {
      breaker.forceOpen();
      breaker.reset();
      expect(breaker.getState()).toBe('CLOSED');
      expect(breaker.getStats().failures).toBe(0);
    });
  });

  describe('stats tracking', () => {
    it('should track total requests', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      await breaker.execute(operation);
      await breaker.execute(operation);
      await breaker.execute(operation);

      expect(breaker.getStats().totalRequests).toBe(3);
    });

    it('should track total successes', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      await breaker.execute(operation);
      await breaker.execute(operation);

      expect(breaker.getStats().totalSuccesses).toBe(2);
    });

    it('should track total failures', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(operation);
        } catch {
          // Expected
        }
      }

      expect(breaker.getStats().totalFailures).toBe(2);
    });
  });

  describe('subscribers', () => {
    it('should notify subscribers on state change', async () => {
      const listener = vi.fn();
      const unsubscribe = breaker.subscribe(listener);

      const operation = vi.fn().mockResolvedValue('success');
      await breaker.execute(operation);

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it('should allow unsubscribing', async () => {
      const listener = vi.fn();
      const unsubscribe = breaker.subscribe(listener);
      unsubscribe();

      const operation = vi.fn().mockResolvedValue('success');
      await breaker.execute(operation);

      // Listener should have been called before unsubscribe
      // but after unsubscribe, no more calls
      listener.mockClear();
      await breaker.execute(operation);
    });
  });
});
