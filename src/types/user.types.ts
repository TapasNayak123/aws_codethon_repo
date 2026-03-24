export interface User {
  userId: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
  password: string;
  favoriteProducts?: string[];
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

export interface UpdateUserDTO {
  fullName?: string;
  dateOfBirth?: string;
}

export interface UserProfileResponseDTO {
  userId: string;
  email: string;
  fullName: string;
  dateOfBirth: string;
  favoriteProducts?: string[];
  createdAt: string;
  updatedAt: string;
}


