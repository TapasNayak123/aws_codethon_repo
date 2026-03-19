import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
} from '../controllers/auth.controller';
import { validateBody } from '../middleware/schema-validator.middleware';
import { registerSchema, loginSchema, updateProfileSchema } from '../schemas/auth.schemas';
import { authenticate } from '../middleware/authenticate.middleware';

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

export default router;
