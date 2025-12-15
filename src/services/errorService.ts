/**
 * Centralized Error Handling Service
 * Production-grade error management with user-friendly messages
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface ProcessedError {
  id: string;
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  suggestedAction?: string;
  retryable: boolean;
  originalError?: unknown;
  context?: ErrorContext;
  timestamp: string;
}

// Error code to user-friendly message mapping
const ERROR_MESSAGES: Record<string, { message: string; action?: string }> = {
  // Network errors
  NETWORK_ERROR: {
    message: '네트워크 연결을 확인해주세요.',
    action: '인터넷 연결 상태를 확인하고 다시 시도하세요.',
  },
  TIMEOUT: {
    message: '요청 시간이 초과되었습니다.',
    action: '잠시 후 다시 시도해주세요.',
  },
  CONNECTION_REFUSED: {
    message: '서버에 연결할 수 없습니다.',
    action: '잠시 후 다시 시도하거나 관리자에게 문의하세요.',
  },

  // Authentication errors
  UNAUTHORIZED: {
    message: '로그인이 필요합니다.',
    action: '다시 로그인해주세요.',
  },
  SESSION_EXPIRED: {
    message: '세션이 만료되었습니다.',
    action: '다시 로그인해주세요.',
  },
  INVALID_CREDENTIALS: {
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
    action: '입력 정보를 확인하고 다시 시도하세요.',
  },
  FORBIDDEN: {
    message: '접근 권한이 없습니다.',
    action: '관리자에게 권한을 요청하세요.',
  },

  // Validation errors
  VALIDATION_ERROR: {
    message: '입력 정보를 확인해주세요.',
    action: '필수 항목을 모두 올바르게 입력하세요.',
  },
  INVALID_INPUT: {
    message: '올바르지 않은 입력입니다.',
    action: '입력 형식을 확인하세요.',
  },

  // Resource errors
  NOT_FOUND: {
    message: '요청한 정보를 찾을 수 없습니다.',
    action: '주소를 확인하거나 이전 페이지로 돌아가세요.',
  },
  CONFLICT: {
    message: '이미 존재하는 데이터입니다.',
    action: '다른 값으로 시도하세요.',
  },

  // Server errors
  SERVER_ERROR: {
    message: '서버 오류가 발생했습니다.',
    action: '잠시 후 다시 시도하거나 관리자에게 문의하세요.',
  },
  SERVICE_UNAVAILABLE: {
    message: '서비스가 일시적으로 이용 불가합니다.',
    action: '잠시 후 다시 시도해주세요.',
  },

  // Rate limiting
  RATE_LIMITED: {
    message: '너무 많은 요청을 보냈습니다.',
    action: '잠시 후 다시 시도해주세요.',
  },

  // Game specific
  GAME_STATE_INVALID: {
    message: '게임 상태가 올바르지 않습니다.',
    action: '게임을 다시 시작해주세요.',
  },
  INSUFFICIENT_RESOURCES: {
    message: '자원이 부족합니다.',
    action: '더 많은 자원을 모으세요.',
  },

  // Default
  UNKNOWN: {
    message: '알 수 없는 오류가 발생했습니다.',
    action: '문제가 계속되면 관리자에게 문의하세요.',
  },
};

// HTTP status to error code mapping
const STATUS_TO_ERROR_CODE: Record<number, string> = {
  0: 'NETWORK_ERROR',
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  408: 'TIMEOUT',
  409: 'CONFLICT',
  429: 'RATE_LIMITED',
  500: 'SERVER_ERROR',
  502: 'SERVER_ERROR',
  503: 'SERVICE_UNAVAILABLE',
  504: 'TIMEOUT',
};

// Error patterns for classification
const ERROR_PATTERNS: Array<{ pattern: RegExp; code: string }> = [
  { pattern: /network/i, code: 'NETWORK_ERROR' },
  { pattern: /timeout/i, code: 'TIMEOUT' },
  { pattern: /ECONNREFUSED|ECONNRESET/i, code: 'CONNECTION_REFUSED' },
  { pattern: /unauthorized|unauthenticated/i, code: 'UNAUTHORIZED' },
  { pattern: /forbidden/i, code: 'FORBIDDEN' },
  { pattern: /not found/i, code: 'NOT_FOUND' },
  { pattern: /validation|invalid/i, code: 'VALIDATION_ERROR' },
  { pattern: /rate limit|too many requests/i, code: 'RATE_LIMITED' },
];

class ErrorService {
  private errorLog: ProcessedError[] = [];
  private maxLogSize = 100;
  private listeners: Set<(error: ProcessedError) => void> = new Set();

  /**
   * Process any error into a standardized format
   */
  process(error: unknown, context?: ErrorContext): ProcessedError {
    const processedError = this.classifyError(error, context);
    this.log(processedError);
    this.notify(processedError);
    return processedError;
  }

  private classifyError(error: unknown, context?: ErrorContext): ProcessedError {
    let code = 'UNKNOWN';
    let originalMessage = 'Unknown error';
    let status: number | undefined;

    // Extract error information
    if (error instanceof Error) {
      originalMessage = error.message;

      // Check for API error with status
      if ('status' in error && typeof (error as { status: unknown }).status === 'number') {
        status = (error as { status: number }).status;
        code = STATUS_TO_ERROR_CODE[status] || 'UNKNOWN';
      }

      // Check for error code
      if ('code' in error && typeof (error as { code: unknown }).code === 'string') {
        code = (error as { code: string }).code;
      }
    } else if (typeof error === 'string') {
      originalMessage = error;
    }

    // Pattern matching if no code yet
    if (code === 'UNKNOWN') {
      for (const { pattern, code: patternCode } of ERROR_PATTERNS) {
        if (pattern.test(originalMessage)) {
          code = patternCode;
          break;
        }
      }
    }

    // Get user-friendly message
    const errorInfo = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN;

    // Determine severity
    const severity = this.determineSeverity(code, status);

    // Determine if retryable
    const retryable = this.isRetryable(code, status);

    return {
      id: this.generateErrorId(),
      code,
      message: originalMessage,
      userMessage: errorInfo.message,
      severity,
      recoverable: severity !== 'critical',
      suggestedAction: errorInfo.action,
      retryable,
      originalError: error,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  private determineSeverity(code: string, status?: number): ProcessedError['severity'] {
    // Critical errors
    if (['SERVER_ERROR', 'SERVICE_UNAVAILABLE'].includes(code) || (status && status >= 500)) {
      return 'critical';
    }

    // High severity
    if (['UNAUTHORIZED', 'FORBIDDEN', 'CONNECTION_REFUSED'].includes(code)) {
      return 'high';
    }

    // Medium severity
    if (['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMITED'].includes(code)) {
      return 'medium';
    }

    // Low severity
    return 'low';
  }

  private isRetryable(code: string, status?: number): boolean {
    const nonRetryableCodes = [
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'VALIDATION_ERROR',
      'INVALID_INPUT',
      'CONFLICT',
    ];

    if (nonRetryableCodes.includes(code)) {
      return false;
    }

    // 4xx errors are generally not retryable
    if (status && status >= 400 && status < 500) {
      return false;
    }

    return true;
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(error: ProcessedError): void {
    this.errorLog.unshift(error);

    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop();
    }

    // Console logging based on severity
    const logMethod = error.severity === 'critical' || error.severity === 'high'
      ? console.error
      : error.severity === 'medium'
        ? console.warn
        : console.log;

    logMethod(`[ErrorService] ${error.code}:`, error.message, error.context);
  }

  private notify(error: ProcessedError): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('[ErrorService] Listener error:', e);
      }
    });
  }

  /**
   * Subscribe to error events
   */
  subscribe(listener: (error: ProcessedError) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get error log
   */
  getErrorLog(): ProcessedError[] {
    return [...this.errorLog];
  }

  /**
   * Get error statistics
   */
  getStats() {
    const now = Date.now();
    const last5Minutes = this.errorLog.filter(
      e => now - new Date(e.timestamp).getTime() < 5 * 60 * 1000
    );

    const byCode = this.errorLog.reduce((acc, e) => {
      acc[e.code] = (acc[e.code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = this.errorLog.reduce((acc, e) => {
      acc[e.severity] = (acc[e.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.errorLog.length,
      last5Minutes: last5Minutes.length,
      byCode,
      bySeverity,
      criticalCount: bySeverity.critical || 0,
    };
  }

  /**
   * Clear error log
   */
  clear(): void {
    this.errorLog = [];
  }

  /**
   * Create a user-friendly error message component
   */
  getUserFriendlyMessage(error: unknown): { message: string; action?: string } {
    const processed = this.classifyError(error);
    return {
      message: processed.userMessage,
      action: processed.suggestedAction,
    };
  }
}

export const errorService = new ErrorService();

// Helper function for quick error processing
export function handleError(error: unknown, context?: ErrorContext): ProcessedError {
  return errorService.process(error, context);
}

// Helper hook for React components
export function useErrorHandler() {
  return {
    handleError: (error: unknown, context?: ErrorContext) => handleError(error, context),
    getUserMessage: (error: unknown) => errorService.getUserFriendlyMessage(error),
    subscribe: (listener: (error: ProcessedError) => void) => errorService.subscribe(listener),
    getStats: () => errorService.getStats(),
  };
}
