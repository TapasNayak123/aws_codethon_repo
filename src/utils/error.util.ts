/**
 * Base error class with HTTP status code
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errorCode: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/**
 * 401 Unauthorized - Authentication failures
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Invalid email or password') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

/**
 * 409 Conflict - Duplicate resource
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

/**
 * Check if error is an instance of AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
