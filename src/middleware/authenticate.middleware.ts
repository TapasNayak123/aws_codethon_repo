import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../services/token.service';
import { AuthenticationError } from '../utils/error.util';
import { logger } from '../utils/logger';

/**
 * Middleware to authenticate requests using JWT tokens
 * Verifies token and attaches user information to request
 * Uses the request-scoped logger for correlation-traced output
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  // Use request-scoped logger; fall back for edge cases
  const log = (req as any).log ?? logger.child((req as any).requestId, {
    method: req.method,
    path: req.path,
  });

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      log.warn('AUTH_MISSING_HEADER', { phase: 'middleware' });
      throw new AuthenticationError('No token provided');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      log.warn('AUTH_MALFORMED_HEADER', { phase: 'middleware' });
      throw new AuthenticationError('Invalid token format. Use: Bearer <token>');
    }

    const token = parts[1];
    const payload = verifyJWT(token);

    (req as any).user = {
      userId: payload.userId,
      email: payload.email,
    };

    log.info('AUTH_SUCCESS', { phase: 'middleware', userId: payload.userId });
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      log.error('AUTH_UNEXPECTED_ERROR', {
        phase: 'middleware',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }
}
