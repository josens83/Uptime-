/**
 * Security Service
 * Bank-level security implementation
 */

import { monitoring } from './monitoringService';

// ===== TYPES =====

export interface SecurityConfig {
  enableCSP: boolean;
  enableXSS: boolean;
  enableRateLimiting: boolean;
  rateLimitWindow: number;      // Time window in ms
  rateLimitMaxRequests: number; // Max requests per window
  sessionTimeout: number;       // Session timeout in ms
  enableAuditLog: boolean;
  sensitiveFields: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  details?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  success: boolean;
}

export interface RateLimitState {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// ===== DEFAULT CONFIGURATION =====

const DEFAULT_CONFIG: SecurityConfig = {
  enableCSP: true,
  enableXSS: true,
  enableRateLimiting: true,
  rateLimitWindow: 60000,      // 1 minute
  rateLimitMaxRequests: 100,    // 100 requests per minute
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  enableAuditLog: true,
  sensitiveFields: [
    'password',
    'token',
    'secret',
    'apiKey',
    'creditCard',
    'ssn',
    'pin',
    'cvv',
  ],
};

// ===== XSS PROTECTION =====

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return input.replace(/[&<>"'`=/]/g, (char) => map[char] || char);
}

/**
 * Sanitize URL to prevent javascript: attacks
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();

  // Block javascript: and data: protocols
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
    monitoring.warn('Blocked malicious URL', { url });
    return 'about:blank';
  }

  // Allow only http, https, mailto, tel protocols
  const validProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  const hasValidProtocol = validProtocols.some((p) => trimmed.startsWith(p));

  if (!hasValidProtocol && trimmed.includes(':')) {
    monitoring.warn('Blocked URL with unknown protocol', { url });
    return 'about:blank';
  }

  return url;
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    return sanitizeHtml(input);
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (input && typeof input === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeHtml(key)] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

// ===== CSRF PROTECTION =====

let csrfToken: string | null = null;

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  csrfToken = Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return csrfToken;
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string): boolean {
  if (!csrfToken || token !== csrfToken) {
    monitoring.warn('CSRF token validation failed');
    return false;
  }
  return true;
}

/**
 * Get current CSRF token
 */
export function getCsrfToken(): string {
  if (!csrfToken) {
    return generateCsrfToken();
  }
  return csrfToken;
}

// ===== RATE LIMITING =====

const rateLimitMap = new Map<string, RateLimitState>();

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  config: Partial<SecurityConfig> = {}
): { allowed: boolean; remaining: number; resetIn: number } {
  const { rateLimitWindow, rateLimitMaxRequests } = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();

  let state = rateLimitMap.get(key);

  // Reset if window has passed
  if (!state || now >= state.resetTime) {
    state = {
      count: 0,
      resetTime: now + rateLimitWindow,
      blocked: false,
    };
    rateLimitMap.set(key, state);
  }

  state.count++;
  const remaining = Math.max(0, rateLimitMaxRequests - state.count);
  const resetIn = state.resetTime - now;

  if (state.count > rateLimitMaxRequests) {
    if (!state.blocked) {
      state.blocked = true;
      monitoring.warn('Rate limit exceeded', { key, count: state.count });
    }
    return { allowed: false, remaining: 0, resetIn };
  }

  return { allowed: true, remaining, resetIn };
}

/**
 * Reset rate limit for a key
 */
export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

// ===== INPUT VALIDATION =====

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  alphanumeric?: boolean;
  custom?: (value: unknown) => boolean | string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

/**
 * Validate input against rules
 */
export function validate(
  data: Record<string, unknown>,
  rules: Record<string, ValidationRule>
): ValidationResult {
  const errors: Record<string, string[]> = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const fieldErrors: string[] = [];

    // Required check
    if (rule.required && (value === undefined || value === null || value === '')) {
      fieldErrors.push('This field is required');
    }

    if (value !== undefined && value !== null && value !== '') {
      const strValue = String(value);

      // Length checks
      if (rule.minLength && strValue.length < rule.minLength) {
        fieldErrors.push(`Minimum length is ${rule.minLength} characters`);
      }
      if (rule.maxLength && strValue.length > rule.maxLength) {
        fieldErrors.push(`Maximum length is ${rule.maxLength} characters`);
      }

      // Pattern check
      if (rule.pattern && !rule.pattern.test(strValue)) {
        fieldErrors.push('Invalid format');
      }

      // Email check
      if (rule.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(strValue)) {
          fieldErrors.push('Invalid email address');
        }
      }

      // URL check
      if (rule.url) {
        try {
          new URL(strValue);
        } catch {
          fieldErrors.push('Invalid URL');
        }
      }

      // Numeric check
      if (rule.numeric && isNaN(Number(strValue))) {
        fieldErrors.push('Must be a number');
      }

      // Alphanumeric check
      if (rule.alphanumeric && !/^[a-zA-Z0-9]+$/.test(strValue)) {
        fieldErrors.push('Must contain only letters and numbers');
      }

      // Custom validation
      if (rule.custom) {
        const result = rule.custom(value);
        if (result !== true) {
          fieldErrors.push(typeof result === 'string' ? result : 'Validation failed');
        }
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ===== SENSITIVE DATA PROTECTION =====

/**
 * Mask sensitive data in objects
 */
export function maskSensitiveData(
  data: Record<string, unknown>,
  sensitiveFields: string[] = DEFAULT_CONFIG.sensitiveFields
): Record<string, unknown> {
  const masked: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some((f) => lowerKey.includes(f.toLowerCase()));

    if (isSensitive) {
      if (typeof value === 'string') {
        masked[key] = value.length > 4 ? '****' + value.slice(-4) : '****';
      } else {
        masked[key] = '[REDACTED]';
      }
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      masked[key] = maskSensitiveData(value as Record<string, unknown>, sensitiveFields);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

// ===== ENCRYPTION HELPERS =====

/**
 * Generate secure random bytes
 */
export function generateSecureRandom(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash string using SHA-256
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate secure session ID
 */
export function generateSessionId(): string {
  return generateSecureRandom(32);
}

// ===== SESSION SECURITY =====

interface Session {
  id: string;
  userId: string;
  createdAt: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
}

const sessions = new Map<string, Session>();

/**
 * Create a new session
 */
export function createSession(userId: string): Session {
  const session: Session = {
    id: generateSessionId(),
    userId,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    userAgent: navigator.userAgent,
  };

  sessions.set(session.id, session);
  monitoring.info('Session created', { sessionId: session.id, userId });

  return session;
}

/**
 * Validate session
 */
export function validateSession(
  sessionId: string,
  config: Partial<SecurityConfig> = {}
): { valid: boolean; session?: Session; reason?: string } {
  const { sessionTimeout } = { ...DEFAULT_CONFIG, ...config };
  const session = sessions.get(sessionId);

  if (!session) {
    return { valid: false, reason: 'Session not found' };
  }

  // Check timeout
  if (Date.now() - session.lastActivity > sessionTimeout) {
    sessions.delete(sessionId);
    monitoring.info('Session expired', { sessionId });
    return { valid: false, reason: 'Session expired' };
  }

  // Update last activity
  session.lastActivity = Date.now();

  return { valid: true, session };
}

/**
 * Destroy session
 */
export function destroySession(sessionId: string): void {
  sessions.delete(sessionId);
  monitoring.info('Session destroyed', { sessionId });
}

// ===== AUDIT LOGGING =====

const auditLog: AuditLogEntry[] = [];
const MAX_AUDIT_LOG = 1000;

/**
 * Log security event
 */
export function logSecurityEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  if (!DEFAULT_CONFIG.enableAuditLog) return;

  const logEntry: AuditLogEntry = {
    id: generateSecureRandom(16),
    timestamp: new Date().toISOString(),
    ...entry,
  };

  auditLog.unshift(logEntry);
  if (auditLog.length > MAX_AUDIT_LOG) {
    auditLog.pop();
  }

  // Also log to monitoring
  const logLevel = entry.severity === 'critical' || entry.severity === 'high' ? 'warn' : 'info';
  monitoring.log(logLevel, `Security: ${entry.action}`, {
    ...maskSensitiveData(entry.details || {}),
    severity: entry.severity,
    success: entry.success,
  });
}

/**
 * Get audit log
 */
export function getAuditLog(
  options: {
    limit?: number;
    severity?: AuditLogEntry['severity'];
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): AuditLogEntry[] {
  let filtered = [...auditLog];

  if (options.severity) {
    filtered = filtered.filter((e) => e.severity === options.severity);
  }
  if (options.userId) {
    filtered = filtered.filter((e) => e.userId === options.userId);
  }
  if (options.startDate) {
    filtered = filtered.filter((e) => new Date(e.timestamp) >= options.startDate!);
  }
  if (options.endDate) {
    filtered = filtered.filter((e) => new Date(e.timestamp) <= options.endDate!);
  }

  return filtered.slice(0, options.limit || 100);
}

// ===== CONTENT SECURITY POLICY =====

/**
 * Get CSP header directives
 */
export function getCspDirectives(): Record<string, string[]> {
  return {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"], // Needed for Vite in dev
    'style-src': ["'self'", "'unsafe-inline'"],  // Needed for inline styles
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https:'],
    'connect-src': ["'self'", 'https:', 'wss:'],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
  };
}

/**
 * Build CSP header string
 */
export function buildCspHeader(): string {
  const directives = getCspDirectives();
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

// ===== SECURITY HEADERS =====

export function getSecurityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': buildCspHeader(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

// ===== EXPORTS =====

export const security = {
  sanitizeHtml,
  sanitizeUrl,
  sanitizeInput,
  generateCsrfToken,
  validateCsrfToken,
  getCsrfToken,
  checkRateLimit,
  resetRateLimit,
  validate,
  maskSensitiveData,
  generateSecureRandom,
  hashString,
  generateSessionId,
  createSession,
  validateSession,
  destroySession,
  logSecurityEvent,
  getAuditLog,
  getCspDirectives,
  buildCspHeader,
  getSecurityHeaders,
};

export default security;
