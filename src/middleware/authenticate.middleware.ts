import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../services/token.service';
import { AuthenticationError } from '../utils/error.util';

/**
 * Middleware to authenticate requests using JWT tokens
 * Verifies token and attaches user information to request
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError('No token provided');
    }

    // Expected format: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthenticationError('Invalid token format. Use: Bearer <token>');
    }

    const token = parts[1];

    // Verify token
    const payload = verifyJWT(token);

    // Attach user information to request
    (req as any).user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}
