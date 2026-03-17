import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
} from '../controllers/auth.controller';
import {
  registrationValidation,
  loginValidation,
  updateProfileValidation,
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
 * Get user profile (requires authentication)
 * GET /api/auth/profile
 */
router.get('/profile', authenticate, getProfile);

/**
 * Update user profile (requires authentication)
 * PUT /api/auth/profile
 */
router.put('/profile', authenticate, updateProfileValidation, updateProfile);

export default router;
