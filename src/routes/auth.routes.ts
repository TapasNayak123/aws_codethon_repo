import { Router } from 'express';
import {
  register,
  login,
  rateProduct,
  getRatings,
} from '../controllers/auth.controller';
import {
  registrationValidation,
  loginValidation,
} from '../validators/auth.validators';
import { authenticate } from '../middleware/authenticate.middleware';

const router = Router();

/**
 * User registration
 * POST /api/auth/register
 */
router.post('/register', registrationValidation, register);

/**
 * User login
 * POST /api/auth/login
 */
router.post('/login', loginValidation, login);

/**
 * Get user's product ratings (requires authentication)
 * GET /api/auth/ratings
 */
router.get('/ratings', authenticate, getRatings);

/**
 * Rate a product (requires authentication)
 * POST /api/auth/ratings/:productId
 */
router.post('/ratings/:productId', authenticate, rateProduct);

export default router;
