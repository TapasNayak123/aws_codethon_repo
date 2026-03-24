import { Request, Response, NextFunction } from 'express';
import { logger, RequestLogger } from '../utils/logger';
import { addLogEntry } from '../services/request-log.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to log the full request-to-response journey with correlation ID tracing.
 *
 * Attaches a child logger (req.log) so every downstream layer — controllers,
 * services, models — can log with the same correlationId without recreating it.
 *
 * Journey logged:
 *   1. REQUEST_RECEIVED  — incoming request with headers, query, sanitized body
 *   2. (downstream logs from middleware, controllers, services, models)
 *   3. REQUEST_COMPLETED — final status code + duration
 *
 * Skips health-check endpoints to avoid K8s probe log spam.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Skip logging for health check endpoints (reduces log spam from K8s probes)
  if (req.path === '/api/health') {
    return next();
  }

  const correlationId: string = (req as any).requestId;
  const startTime = Date.now();

  // Create a child logger bound to this request's correlation ID + route info
  const reqLog: RequestLogger = logger.child(correlationId, {
    method: req.method,
    path: req.originalUrl || req.path,
  });

  // Attach to request so controllers/services/models can use req.log directly
  (req as any).log = reqLog;

  // ── Step 1: Log request arrival ──
  reqLog.info('REQUEST_RECEIVED', {
    phase: 'request',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type'],
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    body: sanitizeBody(req.body),
  });

  // ── Step 3: Log response completion (wraps res.end) ──
  const originalEnd = res.end;

  res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Choose log level based on status code
    const logMethod = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    reqLog[logMethod]('REQUEST_COMPLETED', {
      phase: 'response',
      statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
    });

    // Capture to in-memory request log store for interactive monitoring
    addLogEntry({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl || req.path,
      statusCode,
      duration: `${duration}ms`,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      correlationId,
      userId: (req as any).user?.userId,
      requestBody: sanitizeBody(req.body),
      responseStatus: statusCode < 400 ? 'success' : 'error',
      errorMessage: statusCode >= 400 ? `HTTP ${statusCode}` : undefined,
    });

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
