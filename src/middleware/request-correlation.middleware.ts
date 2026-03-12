import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to generate or extract request correlation ID
 * Attaches requestId to request object and sets response header
 */
export function requestCorrelation(req: Request, res: Response, next: NextFunction): void {
  // Check for existing X-Request-ID header
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();

  // Attach to request object for use in other middleware/controllers
  (req as any).requestId = requestId;

  // Set response header
  res.setHeader('X-Request-ID', requestId);

  next();
}
