import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { addLogEntry } from '../services/request-log.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to log all incoming requests and responses
 * Logs request start, end, duration, and status code
 * Uses correlation ID for tracking entire request lifecycle
 * Skips logging for health check endpoints to reduce log volume
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Skip logging for health check endpoints (reduces log spam from K8s probes)
  if (req.path === '/api/health') {
    return next();
  }

  const requestId = (req as any).requestId;
  const startTime = Date.now();

  // Create child logger with correlation ID
  const requestLogger = logger.child(requestId, {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  // Log request start
  requestLogger.info('Request started', {
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
    },
    query: req.query,
    body: sanitizeBody(req.body),
  });

  // Capture original end function
  const originalEnd = res.end;

  // Override res.end to log response
  res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
    const duration = Date.now() - startTime;

    // Log request completion
    requestLogger.info('Request completed', {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
    });

    // Capture to in-memory request log store for interactive monitoring
    addLogEntry({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl || req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      correlationId: requestId,
      userId: (req as any).user?.userId,
      requestBody: sanitizeBody(req.body),
      responseStatus: res.statusCode < 400 ? 'success' : 'error',
      errorMessage: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : undefined,
    });

    // Call original end function
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
}

/**
 * Sanitize request body to remove sensitive information from logs
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken'];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
}
