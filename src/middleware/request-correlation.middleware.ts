import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to generate or extract request correlation ID
 * 
 * Correlation ID Flow:
 * 1. Check if client provided correlation ID in request headers
 * 2. If provided, use it (allows distributed tracing)
 * 3. If not provided, generate a new UUID
 * 4. Attach to request object for use in logging
 * 5. Return in response header for client reference
 * 
 * Supported Headers (checked in order):
 * - X-Correlation-ID (preferred)
 * - X-Request-ID (alternative)
 * - Correlation-ID (alternative)
 * 
 * Note: Correlation ID is OPTIONAL - clients don't need to provide it
 */
export function requestCorrelation(req: Request, res: Response, next: NextFunction): void {
  // Check for correlation ID in multiple possible headers (case-insensitive)
  const correlationId = 
    (req.headers['x-correlation-id'] as string) ||
    (req.headers['x-request-id'] as string) ||
    (req.headers['correlation-id'] as string) ||
    uuidv4(); // Generate new UUID if not provided

  // Attach to request object for use in other middleware/controllers
  (req as any).requestId = correlationId;

  // Set response headers (both for compatibility)
  res.setHeader('X-Correlation-ID', correlationId);
  res.setHeader('X-Request-ID', correlationId);

  next();
}
