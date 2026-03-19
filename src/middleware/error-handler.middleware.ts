import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { isAppError } from '../utils/error.util';

/**
 * Centralized error handling middleware
 * Uses the request-scoped logger (req.log) when available, falls back to
 * creating a child logger from the correlation ID.
 *
 * Logs the actual error message clearly so CloudWatch entries are
 * immediately understandable without digging into metadata.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = (req as any).requestId;

  // Prefer the request-scoped logger; fall back for edge cases
  // (e.g. errors before request-logger middleware ran)
  const errorLog = (req as any).log ?? logger.child(requestId, {
    method: req.method,
    path: req.path,
  });

  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';

  if (isAppError(err)) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
  }

  if (statusCode >= 500) {
    errorLog.error(`ERROR_HANDLER_SERVER_ERROR: ${err.message}`, {
      phase: 'error-handler',
      errorCode,
      statusCode,
      stack: err.stack,
    });
  } else {
    errorLog.warn(`ERROR_HANDLER_CLIENT_ERROR: ${message}`, {
      phase: 'error-handler',
      errorCode,
      statusCode,
    });
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    errorCode,
    requestId,
    data: null,
  });
}
