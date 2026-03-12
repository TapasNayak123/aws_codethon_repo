import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import { JWTPayload } from '../types/token.types';
import { AuthenticationError } from '../utils/error.util';

/**
 * Generate JWT token for authenticated user
 * Expiration: 1 hour (3600 seconds)
 */
export function generateJWT(userId: string, email: string): string {
  const payload = {
    userId,
    email,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiration,
  } as jwt.SignOptions);
}

/**
 * Verify and decode JWT token
 * Throws error if token invalid or expired
 */
export function verifyJWT(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token has expired');
    }
    throw new AuthenticationError('Invalid token');
  }
}
