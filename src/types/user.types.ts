export interface User {
  userId: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  fullName: string;
  dateOfBirth: string;
  email: string;
  password: string;
}

export interface UserResponseDTO {
  userId: string;
  email: string;
  fullName: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface ResetPasswordRequestDTO {
  token: string;
  newPassword: string;
}
