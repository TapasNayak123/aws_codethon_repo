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
