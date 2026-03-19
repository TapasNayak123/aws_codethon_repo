import { logger as winstonLogger } from '../config/logger.config';

/**
 * Structured child logger interface
 * Every method automatically includes correlationId and base metadata
 */
export interface RequestLogger {
  info: (message: string, meta?: Record<string, any>) => void;
  warn: (message: string, meta?: Record<string, any>) => void;
  error: (message: string, meta?: Record<string, any>) => void;
  debug: (message: string, meta?: Record<string, any>) => void;
}

/**
 * Enhanced logger with correlation ID support
 * Provides structured logging with automatic timestamp and correlation ID tracking
 *
 * Usage patterns:
 *   - Standalone: logger.info('Server started', { port: 3000 })
 *   - Per-request: const reqLog = logger.child(correlationId, { method, path })
 *                  reqLog.info('Processing request')
 */
class CorrelationLogger {
  private log(level: string, message: string, meta: Record<string, any> = {}) {
    winstonLogger.log(level, message, meta);
  }

  /**
   * Create a child logger bound to a correlation ID
   * All logs from this child automatically include the correlationId + any base metadata
   */
  child(correlationId: string, additionalMeta: Record<string, any> = {}): RequestLogger {
    return {
      info: (message: string, meta: Record<string, any> = {}) =>
        this.log('info', message, { correlationId, ...additionalMeta, ...meta }),
      warn: (message: string, meta: Record<string, any> = {}) =>
        this.log('warn', message, { correlationId, ...additionalMeta, ...meta }),
      error: (message: string, meta: Record<string, any> = {}) =>
        this.log('error', message, { correlationId, ...additionalMeta, ...meta }),
      debug: (message: string, meta: Record<string, any> = {}) =>
        this.log('debug', message, { correlationId, ...additionalMeta, ...meta }),
    };
  }

  info(message: string, meta: Record<string, any> = {}) {
    this.log('info', message, meta);
  }

  warn(message: string, meta: Record<string, any> = {}) {
    this.log('warn', message, meta);
  }

  error(message: string, meta: Record<string, any> = {}) {
    this.log('error', message, meta);
  }

  debug(message: string, meta: Record<string, any> = {}) {
    this.log('debug', message, meta);
  }
}

export const logger = new CorrelationLogger();
