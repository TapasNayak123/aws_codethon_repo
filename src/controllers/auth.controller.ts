import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as UserService from '../services/user.service';
import * as TokenService from '../services/token.service';
import { ValidationError } from '../utils/error.util';
import { logger } from '../utils/logger';

/**
 * User registration endpoint
 * POST /api/auth/register
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = (req as any).requestId;
  const requestLogger = logger.child(requestId, {
    endpoint: 'POST /api/auth/register',
  });

  try {
    requestLogger.info('Processing user registration');

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      requestLogger.warn('Validation failed', {
        errors: errors.array().map(e => ({ field: e.type === 'field' ? e.path : 'body', message: e.msg })),
      });
      throw new ValidationError(errors.array()[0].msg);
    }

    const { fullName, dateOfBirth, email, password } = req.body;

    requestLogger.debug('Creating user', { email, fullName });

    // Create user
    const user = await UserService.createUser({
      fullName,
      dateOfBirth,
      email,
      password,
    });

    requestLogger.info('User registered successfully', { userId: user.userId, email: user.email });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: user,
      requestId,
    });
  } catch (error) {
    requestLogger.error('Registration failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * User login endpoint
 * POST /api/auth/login
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = (req as any).requestId;
  const requestLogger = logger.child(requestId, {
    endpoint: 'POST /api/auth/login',
  });

  try {
    requestLogger.info('Processing user login');

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      requestLogger.warn('Validation failed', {
        errors: errors.array().map(e => ({ field: e.type === 'field' ? e.path : 'body', message: e.msg })),
      });
      throw new ValidationError(errors.array()[0].msg);
    }

    const { email, password } = req.body;

    requestLogger.debug('Authenticating user', { email });

    // Authenticate user
    const { user } = await UserService.authenticateUser(email, password);

    // Generate JWT token
    const token = TokenService.generateJWT(user.userId, user.email);

    requestLogger.info('User logged in successfully', { userId: user.userId, email: user.email });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user,
      },
      requestId,
    });
  } catch (error) {
    requestLogger.error('Login failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}


/**
 * Get user profile
 * GET /api/auth/profile
 */
export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = (req as any).requestId;
  const user = (req as any).user;
  const requestLogger = logger.child(requestId, {
    endpoint: 'GET /api/auth/profile',
  });

  try {
    requestLogger.info('Fetching user profile', { userId: user.userId });

    const profile = await UserService.getUserProfile(user.userId);

    requestLogger.info('Profile retrieved successfully', { userId: user.userId });

    res.status(200).json({
      status: 'success',
      message: 'Profile retrieved successfully',
      data: profile,
      requestId,
    });
  } catch (error) {
    requestLogger.error('Failed to retrieve profile', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = (req as any).requestId;
  const user = (req as any).user;
  const requestLogger = logger.child(requestId, {
    endpoint: 'PUT /api/auth/profile',
  });

  try {
    requestLogger.info('Processing profile update', { userId: user.userId });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      requestLogger.warn('Profile update validation failed', {
        errors: errors.array().map(e => ({ field: e.type === 'field' ? e.path : 'body', message: e.msg })),
      });
      throw new ValidationError(errors.array()[0].msg);
    }

    const updateData = req.body;

    const profile = await UserService.updateUserProfile(user.userId, updateData);

    requestLogger.info('Profile updated successfully', { userId: user.userId });

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: profile,
      requestId,
    });
  } catch (error) {
    requestLogger.error('Profile update failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}
