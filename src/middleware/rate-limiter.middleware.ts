import rateLimit from 'express-rate-limit';
import { config } from '../config/env.config';
import { logger } from '../utils/logger';

/**
 * Rate limiting middleware
 * Limits: 100 requests per 15 minutes per IP address
 * Logs when a request is rate-limited so it shows up in CloudWatch
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.maxRequests, // 100 requests per window
  message: 'Too many requests. Please try again later',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req, res) => {
    const requestId = (req as any).requestId;

    // Use request-scoped logger if available, otherwise create one
    const log = (req as any).log ?? logger.child(requestId || 'unknown', {
      method: req.method,
      path: req.originalUrl || req.path,
    });

    log.warn('RATE_LIMIT_EXCEEDED', {
      phase: 'middleware',
      ip: req.ip,
      endpoint: `${req.method} ${req.originalUrl || req.path}`,
    });

    res.status(429).json({
      status: 'error',
      message: 'Too many requests. Please try again later',
      errorCode: 'RATE_LIMIT_ERROR',
      requestId,
      data: null,
    });
  },
});
