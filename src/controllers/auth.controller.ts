import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as UserService from '../services/user.service';
import * as TokenService from '../services/token.service';
import { ValidationError } from '../utils/error.util';

/**
 * User registration endpoint
 * POST /api/auth/register
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { fullName, dateOfBirth, email, password } = req.body;

    // Create user
    const user = await UserService.createUser({
      fullName,
      dateOfBirth,
      email,
      password,
    });

    const requestId = (req as any).requestId;

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: user,
      requestId,
    });
  } catch (error) {
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
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { email, password } = req.body;

    // Authenticate user
    const { user } = await UserService.authenticateUser(email, password);

    // Generate JWT token
    const token = TokenService.generateJWT(user.userId, user.email);

    const requestId = (req as any).requestId;

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
    next(error);
  }
}

/**
 * Rate a product
 * POST /api/auth/ratings/:productId
 */
export async function rateProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const log = getLog(req);
  const requestId = (req as any).requestId;
  const user = (req as any).user;

  try {
    const { productId } = req.params;
    const { rating } = req.body;

    log.info('RATE_PRODUCT_START', { phase: 'controller', userId: user.userId, productId, rating });

    await UserService.rateProduct(user.userId, productId, rating, log);

    log.info('RATE_PRODUCT_SUCCESS', { phase: 'controller', userId: user.userId, productId });

    res.status(200).json(
      successResponse('Product rated successfully', { productId, rating }, requestId)
    );
  } catch (error) {
    log.error('RATE_PRODUCT_FAILED', {
      phase: 'controller',
      userId: user.userId,
      productId: req.params.productId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * Get user's product ratings
 * GET /api/auth/ratings
 */
export async function getRatings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const log = getLog(req);
  const requestId = (req as any).requestId;
  const user = (req as any).user;

  try {
    log.info('GET_RATINGS_START', { phase: 'controller', userId: user.userId });

    const ratings = await UserService.getUserRatings(user.userId, log);

    log.info('GET_RATINGS_SUCCESS', { phase: 'controller', userId: user.userId, count: Object.keys(ratings).length });

    res.status(200).json(
      successResponse('Ratings retrieved successfully', { productRatings: ratings }, requestId)
    );
  } catch (error) {
    log.error('GET_RATINGS_FAILED', {
      phase: 'controller',
      userId: user.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}
