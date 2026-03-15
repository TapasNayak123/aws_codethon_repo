import { Router } from 'express';
import * as FavouriteController from '../controllers/favourite.controller';
import * as FavouriteValidators from '../validators/favourite.validators';
import { authenticate } from '../middleware/authenticate.middleware';

const router = Router();

/**
 * POST /api/favourites
 * Add a product to favourites (requires authentication)
 */
router.post(
  '/',
  authenticate,
  FavouriteValidators.addFavouriteValidation,
  FavouriteController.addFavourite
);

/**
 * GET /api/favourites
 * Get user's favourites (requires authentication)
 */
router.get('/', authenticate, FavouriteController.getFavourites);

/**
 * DELETE /api/favourites/:favouriteId
 * Remove a favourite (requires authentication)
 */
router.delete(
  '/:favouriteId',
  authenticate,
  FavouriteValidators.removeFavouriteValidation,
  FavouriteController.removeFavourite
);

export default router;
