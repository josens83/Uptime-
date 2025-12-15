import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sanitizeHtml,
  sanitizeUrl,
  sanitizeInput,
  validate,
  maskSensitiveData,
  checkRateLimit,
  resetRateLimit,
  generateSecureRandom,
  generateSessionId,
} from './securityService';

describe('Security Service', () => {
  describe('sanitizeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(sanitizeHtml('foo & bar')).toBe('foo &amp; bar');
    });

    it('should escape quotes', () => {
      expect(sanitizeHtml('He said "hello"')).toBe('He said &quot;hello&quot;');
    });

    it('should handle empty strings', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('should handle strings without special characters', () => {
      expect(sanitizeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('sanitizeUrl', () => {
    it('should block javascript: URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('about:blank');
    });

    it('should block data: URLs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('about:blank');
    });

    it('should allow http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should allow https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('should allow mailto URLs', () => {
      expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    });

    it('should block unknown protocols', () => {
      expect(sanitizeUrl('unknown:something')).toBe('about:blank');
    });

    it('should allow relative URLs', () => {
      expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize string values', () => {
      expect(sanitizeInput('<script>xss</script>')).toBe(
        '&lt;script&gt;xss&lt;&#x2F;script&gt;'
      );
    });

    it('should sanitize nested objects', () => {
      const input = {
        name: '<b>Test</b>',
        nested: {
          value: '<script>xss</script>',
        },
      };

      const result = sanitizeInput(input) as Record<string, unknown>;
      expect(result.name).toBe('&lt;b&gt;Test&lt;&#x2F;b&gt;');
      expect((result.nested as Record<string, unknown>).value).toBe(
        '&lt;script&gt;xss&lt;&#x2F;script&gt;'
      );
    });

    it('should sanitize arrays', () => {
      const input = ['<b>1</b>', '<i>2</i>'];
      const result = sanitizeInput(input) as string[];
      expect(result[0]).toBe('&lt;b&gt;1&lt;&#x2F;b&gt;');
      expect(result[1]).toBe('&lt;i&gt;2&lt;&#x2F;i&gt;');
    });

    it('should pass through numbers', () => {
      expect(sanitizeInput(123)).toBe(123);
    });

    it('should pass through booleans', () => {
      expect(sanitizeInput(true)).toBe(true);
    });
  });

  describe('validate', () => {
    it('should validate required fields', () => {
      const result = validate({ name: '' }, { name: { required: true } });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toContain('This field is required');
    });

    it('should validate minimum length', () => {
      const result = validate({ name: 'ab' }, { name: { minLength: 3 } });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toContain('Minimum length is 3 characters');
    });

    it('should validate maximum length', () => {
      const result = validate({ name: 'abcdef' }, { name: { maxLength: 5 } });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toContain('Maximum length is 5 characters');
    });

    it('should validate email format', () => {
      const result = validate({ email: 'invalid' }, { email: { email: true } });
      expect(result.valid).toBe(false);
      expect(result.errors.email).toContain('Invalid email address');
    });

    it('should pass valid email', () => {
      const result = validate(
        { email: 'test@example.com' },
        { email: { email: true } }
      );
      expect(result.valid).toBe(true);
    });

    it('should validate URL format', () => {
      const result = validate({ website: 'invalid' }, { website: { url: true } });
      expect(result.valid).toBe(false);
      expect(result.errors.website).toContain('Invalid URL');
    });

    it('should validate numeric values', () => {
      const result = validate({ age: 'abc' }, { age: { numeric: true } });
      expect(result.valid).toBe(false);
      expect(result.errors.age).toContain('Must be a number');
    });

    it('should validate alphanumeric values', () => {
      const result = validate(
        { username: 'user@123' },
        { username: { alphanumeric: true } }
      );
      expect(result.valid).toBe(false);
      expect(result.errors.username).toContain('Must contain only letters and numbers');
    });

    it('should validate custom rules', () => {
      const result = validate(
        { value: 5 },
        { value: { custom: (v) => (v as number) > 10 || 'Must be greater than 10' } }
      );
      expect(result.valid).toBe(false);
      expect(result.errors.value).toContain('Must be greater than 10');
    });

    it('should pass valid data', () => {
      const result = validate(
        { name: 'John', email: 'john@example.com', age: '25' },
        {
          name: { required: true, minLength: 2 },
          email: { required: true, email: true },
          age: { numeric: true },
        }
      );
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask password fields', () => {
      const result = maskSensitiveData({ password: 'secret123' });
      expect(result.password).toBe('****3123');
    });

    it('should mask token fields', () => {
      const result = maskSensitiveData({ apiToken: 'abc123456789' });
      expect(result.apiToken).toBe('****6789');
    });

    it('should mask short sensitive values completely', () => {
      const result = maskSensitiveData({ password: 'abc' });
      expect(result.password).toBe('****');
    });

    it('should not mask non-sensitive fields', () => {
      const result = maskSensitiveData({ username: 'john' });
      expect(result.username).toBe('john');
    });

    it('should handle nested objects', () => {
      const result = maskSensitiveData({
        user: {
          name: 'John',
          password: 'secret123',
        },
      }) as Record<string, Record<string, string>>;
      expect(result.user.name).toBe('John');
      expect(result.user.password).toBe('****3123');
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      resetRateLimit('test-key');
    });

    it('should allow requests within limit', () => {
      const result = checkRateLimit('test-key', { rateLimitMaxRequests: 5 });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should block requests exceeding limit', () => {
      const config = { rateLimitMaxRequests: 3 };

      for (let i = 0; i < 3; i++) {
        checkRateLimit('test-key', config);
      }

      const result = checkRateLimit('test-key', config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track remaining requests', () => {
      const config = { rateLimitMaxRequests: 5 };

      checkRateLimit('test-key', config);
      checkRateLimit('test-key', config);

      const result = checkRateLimit('test-key', config);
      expect(result.remaining).toBe(2);
    });
  });

  describe('generateSecureRandom', () => {
    it('should generate string of correct length', () => {
      const result = generateSecureRandom(16);
      expect(result.length).toBe(32); // 16 bytes = 32 hex characters
    });

    it('should generate unique values', () => {
      const values = new Set();
      for (let i = 0; i < 100; i++) {
        values.add(generateSecureRandom(16));
      }
      expect(values.size).toBe(100);
    });
  });

  describe('generateSessionId', () => {
    it('should generate session ID of correct length', () => {
      const result = generateSessionId();
      expect(result.length).toBe(64); // 32 bytes = 64 hex characters
    });

    it('should generate unique session IDs', () => {
      const values = new Set();
      for (let i = 0; i < 100; i++) {
        values.add(generateSessionId());
      }
      expect(values.size).toBe(100);
    });
  });
});
