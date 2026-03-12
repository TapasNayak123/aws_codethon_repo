import rateLimit from 'express-rate-limit';
import { config } from '../config/env.config';

/**
 * Rate limiting middleware
 * Limits: 100 requests per 15 minutes per IP address
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.maxRequests, // 100 requests per window
  message: 'Too many requests. Please try again later',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req, res) => {
    const requestId = (req as any).requestId;
    res.status(429).json({
      status: 'error',
      message: 'Too many requests. Please try again later',
      errorCode: 'RATE_LIMIT_ERROR',
      requestId,
      data: null,
    });
  },
});
