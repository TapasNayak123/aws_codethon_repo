import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { isAppError } from '../utils/error.util';

/**
 * Centralized error handling middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = (req as any).requestId;

  // Log error
  logger.error('Error occurred', {
    requestId,
    error: err.message,
    method: req.method,
    path: req.path,
  });

  // Determine status code and error code
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';

  if (isAppError(err)) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message,
    errorCode,
    requestId,
    data: null,
  });
}
