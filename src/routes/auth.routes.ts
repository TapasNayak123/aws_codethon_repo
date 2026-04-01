import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
} from '../controllers/auth.controller';
import { validateBody, validateParams } from '../middleware/schema-validator.middleware';
import { registerSchema, loginSchema, updateProfileSchema } from '../schemas/auth.schemas';
import { authenticate } from '../middleware/authenticate.middleware';
import { productIdParamSchema } from '../middleware/schema-validator.middleware';

const router = Router();

/**
 * User registration
 * POST /api/auth/register
 */
router.post('/register', validateBody(registerSchema), register);

/**
 * User login
 * POST /api/auth/login
 */
router.post('/login', validateBody(loginSchema), login);

/**
 * Get user profile (requires authentication)
 * GET /api/auth/profile
 */
router.get('/profile', authenticate, getProfile);

/**
 * Update user profile (requires authentication)
 * PUT /api/auth/profile
 */
router.put('/profile', authenticate, validateBody(updateProfileSchema), updateProfile);

/**
 * Get user's favorite products (requires authentication)
 * GET /api/auth/favorites
 */
router.get('/favorites', authenticate, getFavorites);

/**
 * Add product to favorites (requires authentication)
 * POST /api/auth/favorites/:productId
 */
router.post('/favorites/:productId', authenticate, validateParams(productIdParamSchema), addFavorite);

/**
 * Remove product from favorites (requires authentication)
 * DELETE /api/auth/favorites/:productId
 */
router.delete('/favorites/:productId', authenticate, validateParams(productIdParamSchema), removeFavorite);

export default router;
