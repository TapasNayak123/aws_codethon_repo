import { Router } from 'express';
import {
  register,
  login,
} from '../controllers/auth.controller';
import {
  registrationValidation,
  loginValidation,
} from '../validators/auth.validators';

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

export default router;
