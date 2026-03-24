import { Request, Response, NextFunction } from 'express';
import * as UserService from '../services/user.service';
import * as TokenService from '../services/token.service';
import { successResponse } from '../utils/response-formatter';
import { RequestLogger } from '../utils/logger';

/**
 * Helper to get the request-scoped logger (attached by request-logger middleware)
 */
function getLog(req: Request): RequestLogger {
  return (req as any).log;
}

/**
 * User registration endpoint
 * POST /api/auth/register
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const log = getLog(req);
  const requestId = (req as any).requestId;

  try {
    log.info('REGISTER_START', { phase: 'controller', email: req.body.email });

    const { fullName, dateOfBirth, email, password } = req.body;

    const user = await UserService.createUser({ fullName, dateOfBirth, email, password }, log);

    log.info('REGISTER_SUCCESS', { phase: 'controller', userId: user.userId, email: user.email });

    res.status(201).json(
      successResponse('User registered successfully', user, requestId)
    );
  } catch (error) {
    log.error('REGISTER_FAILED', {
      phase: 'controller',
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
  const log = getLog(req);
  const requestId = (req as any).requestId;

  try {
    log.info('LOGIN_START', { phase: 'controller', email: req.body.email });

    const { email, password } = req.body;

    const { user } = await UserService.authenticateUser(email, password, log);

    const token = TokenService.generateJWT(user.userId, user.email);

    log.info('LOGIN_SUCCESS', { phase: 'controller', userId: user.userId });

    res.status(200).json(
      successResponse('Login successful', { token, user }, requestId)
    );
  } catch (error) {
    log.error('LOGIN_FAILED', {
      phase: 'controller',
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
  const log = getLog(req);
  const requestId = (req as any).requestId;
  const user = (req as any).user;

  try {
    log.info('GET_PROFILE_START', { phase: 'controller', userId: user.userId });

    const profile = await UserService.getUserProfile(user.userId, log);

    log.info('GET_PROFILE_SUCCESS', { phase: 'controller', userId: user.userId });

    res.status(200).json(
      successResponse('Profile retrieved successfully', profile, requestId)
    );
  } catch (error) {
    log.error('GET_PROFILE_FAILED', {
      phase: 'controller',
      userId: user.userId,
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
  const log = getLog(req);
  const requestId = (req as any).requestId;
  const user = (req as any).user;

  try {
    log.info('UPDATE_PROFILE_START', {
      phase: 'controller',
      userId: user.userId,
      fields: Object.keys(req.body),
    });

    const profile = await UserService.updateUserProfile(user.userId, req.body, log);

    log.info('UPDATE_PROFILE_SUCCESS', { phase: 'controller', userId: user.userId });

    res.status(200).json(
      successResponse('Profile updated successfully', profile, requestId)
    );
  } catch (error) {
    log.error('UPDATE_PROFILE_FAILED', {
      phase: 'controller',
      userId: user.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * Add product to favorites
 * POST /api/auth/favorites/:productId
 */
export async function addFavorite(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const log = getLog(req);
  const requestId = (req as any).requestId;
  const user = (req as any).user;

  try {
    const { productId } = req.params;

    log.info('ADD_FAVORITE_START', { phase: 'controller', userId: user.userId, productId });

    await UserService.addFavoriteProduct(user.userId, productId, log);

    log.info('ADD_FAVORITE_SUCCESS', { phase: 'controller', userId: user.userId, productId });

    res.status(200).json(
      successResponse('Product added to favorites', { productId }, requestId)
    );
  } catch (error) {
    log.error('ADD_FAVORITE_FAILED', {
      phase: 'controller',
      userId: user.userId,
      productId: req.params.productId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * Remove product from favorites
 * DELETE /api/auth/favorites/:productId
 */
export async function removeFavorite(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const log = getLog(req);
  const requestId = (req as any).requestId;
  const user = (req as any).user;

  try {
    const { productId } = req.params;

    log.info('REMOVE_FAVORITE_START', { phase: 'controller', userId: user.userId, productId });

    await UserService.removeFavoriteProduct(user.userId, productId, log);

    log.info('REMOVE_FAVORITE_SUCCESS', { phase: 'controller', userId: user.userId, productId });

    res.status(200).json(
      successResponse('Product removed from favorites', { productId }, requestId)
    );
  } catch (error) {
    log.error('REMOVE_FAVORITE_FAILED', {
      phase: 'controller',
      userId: user.userId,
      productId: req.params.productId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * Get user's favorite products
 * GET /api/auth/favorites
 */
export async function getFavorites(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const log = getLog(req);
  const requestId = (req as any).requestId;
  const user = (req as any).user;

  try {
    log.info('GET_FAVORITES_START', { phase: 'controller', userId: user.userId });

    const favoriteIds = await UserService.getFavoriteProducts(user.userId, log);

    log.info('GET_FAVORITES_SUCCESS', { phase: 'controller', userId: user.userId, count: favoriteIds.length });

    res.status(200).json(
      successResponse('Favorites retrieved successfully', { favoriteProducts: favoriteIds }, requestId)
    );
  } catch (error) {
    log.error('GET_FAVORITES_FAILED', {
      phase: 'controller',
      userId: user.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}
