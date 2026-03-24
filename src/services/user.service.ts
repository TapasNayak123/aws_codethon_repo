import { CreateUserDTO, UserResponseDTO } from '../types/user.types';
import * as UserModel from '../models/user.model';
import * as PasswordService from './password.service';
import { AuthenticationError } from '../utils/error.util';

/**
 * Create a new user account
 */
export async function createUser(userData: CreateUserDTO): Promise<UserResponseDTO> {
  const hashedPassword = await PasswordService.hashPassword(userData.password);

  const user = await UserModel.create({
    ...userData,
    password: hashedPassword,
  });

  return {
    userId: user.userId,
    email: user.email,
    fullName: user.fullName,
  };
}

/**
 * Authenticate user credentials
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: UserResponseDTO }> {
  const user = await UserModel.findByEmail(email);

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  const isPasswordValid = await PasswordService.verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  return {
    user: {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
    },
  };
}

/**
 * Rate a product
 */
export async function rateProduct(
  userId: string,
  productId: string,
  rating: number,
  log: RequestLogger
): Promise<void> {
  log.info('RATE_PRODUCT_START', { phase: 'service', userId, productId, rating });

  if (rating < 1 || rating > 5) {
    log.warn('RATE_PRODUCT_INVALID_RATING', { phase: 'service', rating });
    throw new ValidationError('Rating must be between 1 and 5');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    log.warn('RATE_PRODUCT_USER_NOT_FOUND', { phase: 'service', userId });
    throw new NotFoundError('User not found');
  }

  await UserModel.rateProduct(userId, productId, rating);

  log.info('RATE_PRODUCT_SUCCESS', { phase: 'service', userId, productId, rating });
}

/**
 * Get user's product ratings
 */
export async function getUserRatings(
  userId: string,
  log: RequestLogger
): Promise<Record<string, number>> {
  log.info('GET_RATINGS_START', { phase: 'service', userId });

  const user = await UserModel.findById(userId);
  if (!user) {
    log.warn('GET_RATINGS_USER_NOT_FOUND', { phase: 'service', userId });
    throw new NotFoundError('User not found');
  }

  const ratings = await UserModel.getUserRatings(userId);

  log.info('GET_RATINGS_SUCCESS', { phase: 'service', userId, count: Object.keys(ratings).length });

  return ratings;
}
