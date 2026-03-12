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
