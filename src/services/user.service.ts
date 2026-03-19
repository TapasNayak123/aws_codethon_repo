import { CreateUserDTO, UserResponseDTO, UserProfileResponseDTO, UpdateUserDTO } from '../types/user.types';
import * as UserModel from '../models/user.model';
import * as PasswordService from './password.service';
import { AuthenticationError, NotFoundError, ConflictError, ValidationError } from '../utils/error.util';
import { isGmailAddress } from '../utils/email-validator';
import { isValidDate, isMinimumAge, isFutureDate } from '../utils/date-validator';
import { validatePassword } from '../utils/password-validator';
import { RequestLogger } from '../utils/logger';

/**
 * Create a new user account
 */
export async function createUser(userData: CreateUserDTO, log: RequestLogger): Promise<UserResponseDTO> {
  log.info('USER_CREATE_VALIDATING', { phase: 'service', email: userData.email });

  // Business rule: only Gmail addresses allowed
  if (!isGmailAddress(userData.email)) {
    log.warn('USER_CREATE_INVALID_EMAIL', { phase: 'service', email: userData.email, reason: 'Not a Gmail address' });
    throw new ValidationError('Only Gmail addresses are allowed for registration');
  }

  // Business rule: date of birth must be valid and not in the future
  if (!isValidDate(userData.dateOfBirth)) {
    log.warn('USER_CREATE_INVALID_DOB', { phase: 'service', reason: 'Invalid date format' });
    throw new ValidationError('Invalid date of birth');
  }
  if (isFutureDate(userData.dateOfBirth)) {
    log.warn('USER_CREATE_INVALID_DOB', { phase: 'service', reason: 'Future date' });
    throw new ValidationError('Date of birth cannot be in the future');
  }

  // Business rule: must be at least 18 years old
  if (!isMinimumAge(userData.dateOfBirth, 18)) {
    log.warn('USER_CREATE_UNDERAGE', { phase: 'service', reason: 'Under 18' });
    throw new ValidationError('You must be at least 18 years old to register');
  }

  // Business rule: password strength validation
  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.isValid) {
    log.warn('USER_CREATE_WEAK_PASSWORD', { phase: 'service', errors: passwordValidation.errors });
    throw new ValidationError(passwordValidation.errors.join(', '));
  }

  // Check for duplicate email before creating
  log.debug('USER_CREATE_CHECKING_DUPLICATE', { phase: 'service', email: userData.email });
  const existingUser = await UserModel.findByEmail(userData.email);
  if (existingUser) {
    log.warn('USER_CREATE_DUPLICATE_EMAIL', { phase: 'service', email: userData.email });
    throw new ConflictError('An account with this email already exists');
  }

  log.debug('USER_CREATE_HASHING_PASSWORD', { phase: 'service' });
  const hashedPassword = await PasswordService.hashPassword(userData.password);

  log.info('USER_CREATE_PERSISTING', { phase: 'service', email: userData.email });
  const user = await UserModel.create({
    ...userData,
    password: hashedPassword,
  });

  log.info('USER_CREATE_SUCCESS', { phase: 'service', userId: user.userId });

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
  password: string,
  log: RequestLogger
): Promise<{ user: UserResponseDTO }> {
  log.info('USER_AUTH_START', { phase: 'service', email });

  const user = await UserModel.findByEmail(email);

  if (!user) {
    log.warn('USER_AUTH_NOT_FOUND', { phase: 'service', email });
    throw new AuthenticationError('Invalid email or password');
  }

  log.debug('USER_AUTH_VERIFYING_PASSWORD', { phase: 'service', userId: user.userId });
  const isPasswordValid = await PasswordService.verifyPassword(password, user.password);

  if (!isPasswordValid) {
    log.warn('USER_AUTH_INVALID_PASSWORD', { phase: 'service', userId: user.userId });
    throw new AuthenticationError('Invalid email or password');
  }

  log.info('USER_AUTH_SUCCESS', { phase: 'service', userId: user.userId });

  return {
    user: {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
    },
  };
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string, log: RequestLogger): Promise<UserProfileResponseDTO> {
  log.info('USER_PROFILE_FETCH', { phase: 'service', userId });

  const user = await UserModel.findById(userId);

  if (!user) {
    log.warn('USER_PROFILE_NOT_FOUND', { phase: 'service', userId });
    throw new NotFoundError('User not found');
  }

  log.info('USER_PROFILE_FOUND', { phase: 'service', userId });

  return {
    userId: user.userId,
    email: user.email,
    fullName: user.fullName,
    dateOfBirth: user.dateOfBirth,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updateData: UpdateUserDTO,
  log: RequestLogger
): Promise<UserProfileResponseDTO> {
  log.info('USER_PROFILE_UPDATE_START', { phase: 'service', userId, fields: Object.keys(updateData) });

  const user = await UserModel.findById(userId);

  if (!user) {
    log.warn('USER_PROFILE_UPDATE_NOT_FOUND', { phase: 'service', userId });
    throw new NotFoundError('User not found');
  }

  // Business rule: validate date of birth if being updated
  if (updateData.dateOfBirth) {
    if (!isValidDate(updateData.dateOfBirth)) {
      log.warn('USER_PROFILE_UPDATE_INVALID_DOB', { phase: 'service', reason: 'Invalid date format' });
      throw new ValidationError('Invalid date of birth');
    }
    if (isFutureDate(updateData.dateOfBirth)) {
      log.warn('USER_PROFILE_UPDATE_INVALID_DOB', { phase: 'service', reason: 'Future date' });
      throw new ValidationError('Date of birth cannot be in the future');
    }
    if (!isMinimumAge(updateData.dateOfBirth, 18)) {
      log.warn('USER_PROFILE_UPDATE_UNDERAGE', { phase: 'service', reason: 'Under 18' });
      throw new ValidationError('You must be at least 18 years old');
    }
  }

  await UserModel.updateProfile(userId, updateData);

  const updated = await UserModel.findById(userId);

  if (!updated) {
    log.error('USER_PROFILE_UPDATE_LOST', { phase: 'service', userId });
    throw new NotFoundError('User not found after update');
  }

  log.info('USER_PROFILE_UPDATE_SUCCESS', { phase: 'service', userId });

  return {
    userId: updated.userId,
    email: updated.email,
    fullName: updated.fullName,
    dateOfBirth: updated.dateOfBirth,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}
