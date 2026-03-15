import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as FavouriteService from '../services/favourite.service';
import { successResponse } from '../utils/response-formatter';
import { ValidationError } from '../utils/error.util';
import { logger } from '../utils/logger';

/**
 * Add a product to favourites
 * POST /api/favourites
 */
export async function addFavourite(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = (req as any).requestId;
  const requestLogger = logger.child(requestId, {
    endpoint: 'POST /api/favourites',
  });

  try {
    requestLogger.info('Processing add to favourites');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      requestLogger.warn('Validation failed', {
        errors: errors.array().map((e) => ({ field: e.type === 'field' ? e.path : 'body', message: e.msg })),
      });
      throw new ValidationError(errors.array()[0].msg);
    }

    const { userId } = (req as any).user;
    const { productId } = req.body;

    const favourite = await FavouriteService.addFavourite(userId, productId);

    requestLogger.info('Product added to favourites', { favouriteId: favourite.favouriteId, productId });

    res.status(201).json(
      successResponse('Product added to favourites', favourite, requestId)
    );
  } catch (error) {
    requestLogger.error('Failed to add favourite', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * Get user's favourites
 * GET /api/favourites
 */
export async function getFavourites(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = (req as any).requestId;
  const requestLogger = logger.child(requestId, {
    endpoint: 'GET /api/favourites',
  });

  try {
    requestLogger.info('Fetching user favourites');

    const { userId } = (req as any).user;

    const favourites = await FavouriteService.getUserFavourites(userId);

    requestLogger.info('Favourites retrieved', { count: favourites.length });

    res.status(200).json(
      successResponse(`Retrieved ${favourites.length} favourite(s)`, { favourites, count: favourites.length }, requestId)
    );
  } catch (error) {
    requestLogger.error('Failed to retrieve favourites', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * Remove a product from favourites
 * DELETE /api/favourites/:favouriteId
 */
export async function removeFavourite(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = (req as any).requestId;
  const requestLogger = logger.child(requestId, {
    endpoint: 'DELETE /api/favourites/:favouriteId',
  });

  try {
    requestLogger.info('Processing remove from favourites');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      requestLogger.warn('Validation failed', {
        errors: errors.array().map((e) => ({ field: e.type === 'field' ? e.path : 'body', message: e.msg })),
      });
      throw new ValidationError(errors.array()[0].msg);
    }

    const { userId } = (req as any).user;
    const { favouriteId } = req.params;

    await FavouriteService.removeFavourite(userId, favouriteId);

    requestLogger.info('Favourite removed', { favouriteId });

    res.status(200).json(
      successResponse('Favourite removed successfully', null, requestId)
    );
  } catch (error) {
    requestLogger.error('Failed to remove favourite', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}
