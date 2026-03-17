import { CreateUserDTO, UserResponseDTO, UserProfileResponseDTO, UpdateUserDTO } from '../types/user.types';
import * as UserModel from '../models/user.model';
import * as PasswordService from './password.service';
import { AuthenticationError, NotFoundError, ConflictError } from '../utils/error.util';

/**
 * Create a new user account
 */
export async function createUser(userData: CreateUserDTO): Promise<UserResponseDTO> {
  // Check for duplicate email before creating
  const existingUser = await UserModel.findByEmail(userData.email);
  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

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
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfileResponseDTO> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

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
export async function updateUserProfile(userId: string, updateData: UpdateUserDTO): Promise<UserProfileResponseDTO> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  await UserModel.updateProfile(userId, updateData);

  const updated = await UserModel.findById(userId);

  return {
    userId: updated!.userId,
    email: updated!.email,
    fullName: updated!.fullName,
    dateOfBirth: updated!.dateOfBirth,
    createdAt: updated!.createdAt,
    updatedAt: updated!.updatedAt,
  };
}
