import { logger as winstonLogger } from '../config/logger.config';

/**
 * Enhanced logger with correlation ID support
 * Provides structured logging with automatic timestamp and correlation ID tracking
 */
class CorrelationLogger {
  /**
   * Internal log method
   * Note: Timestamp is added by Winston format, no need to add here
   */
  private log(level: string, message: string, meta: any = {}) {
    winstonLogger.log(level, message, meta);
  }

  /**
   * Create a child logger with correlation ID
   * Use this to track all logs for a specific request
   * 
   * @param correlationId - Unique request identifier
   * @param additionalMeta - Additional metadata to include in all logs
   * @returns Child logger with correlation ID attached
   */
  child(correlationId: string, additionalMeta: any = {}) {
    return {
      info: (message: string, meta: any = {}) =>
        this.log('info', message, { correlationId, ...additionalMeta, ...meta }),
      warn: (message: string, meta: any = {}) =>
        this.log('warn', message, { correlationId, ...additionalMeta, ...meta }),
      error: (message: string, meta: any = {}) =>
        this.log('error', message, { correlationId, ...additionalMeta, ...meta }),
      debug: (message: string, meta: any = {}) =>
        this.log('debug', message, { correlationId, ...additionalMeta, ...meta }),
    };
  }

  /**
   * Log info level message
   */
  info(message: string, meta: any = {}) {
    this.log('info', message, meta);
  }

  /**
   * Log warning level message
   */
  warn(message: string, meta: any = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Log error level message
   */
  error(message: string, meta: any = {}) {
    this.log('error', message, meta);
  }

  /**
   * Log debug level message
   */
  debug(message: string, meta: any = {}) {
    this.log('debug', message, meta);
  }
}

export const logger = new CorrelationLogger();
