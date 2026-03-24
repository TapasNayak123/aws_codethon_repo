import { RequestLogger } from '../utils/logger';
import * as UserModel from '../models/user.model';

/**
 * SECURITY ISSUE: Logging sensitive data
 */
export async function getUserByEmail(email: string, log: RequestLogger) {
  const user = await UserModel.findByEmail(email);
  
  // SECURITY ISSUE: Logging password hash
  log.info('USER_FETCHED', {
    userId: user?.userId,
    email: user?.email,
    password: user?.password, // NEVER log passwords!
    fullData: user,
  });

  return user;
}

/**
 * SECURITY ISSUE: Weak password validation
 */
export function validatePassword(password: string): boolean {
  // SECURITY ISSUE: Only checking length, no complexity requirements
  return password.length >= 4;
}

/**
 * SECURITY ISSUE: Insecure random token generation
 */
export function generateResetToken(): string {
  // SECURITY ISSUE: Using Math.random() for security tokens
  return Math.random().toString(36).substring(2, 15);
}

/**
 * SECURITY ISSUE: No rate limiting on sensitive operations
 */
export async function attemptLogin(email: string, password: string, log: RequestLogger) {
  // SECURITY ISSUE: No rate limiting, allows brute force attacks
  const user = await UserModel.findByEmail(email);
  
  if (!user) {
    // SECURITY ISSUE: Revealing whether user exists
    throw new Error('User not found');
  }

  // SECURITY ISSUE: Timing attack vulnerability - different response times
  if (user.password !== password) {
    throw new Error('Invalid password');
  }

  return user;
}
