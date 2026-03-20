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

/**
 * Serialize error to a plain object for logging or API responses
 * Useful for structured logging and debugging
 * 
 * @param error - The error to serialize
 * @returns Plain object representation of the error
 * 
 * @example
 * const error = new ValidationError('Invalid email');
 * const serialized = serializeError(error);
 * logger.error('Request failed', serialized);
 */
export function serializeError(error: unknown): Record<string, unknown> {
  if (isAppError(error)) {
    return {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: 'UnknownError',
    message: String(error),
  };
}

/**
 * Extract safe error message for client responses
 * Prevents leaking sensitive information in production
 * 
 * @param error - The error to extract message from
 * @param includeDetails - Whether to include detailed error info (default: false in production)
 * @returns Safe error message string
 * 
 * @example
 * const error = new Error('Database connection failed: invalid credentials');
 * const safeMessage = getSafeErrorMessage(error, false);
 * // Returns: "An unexpected error occurred"
 */
export function getSafeErrorMessage(
  error: unknown,
  includeDetails: boolean = process.env.NODE_ENV !== 'production'
): string {
  if (isAppError(error)) {
    // AppErrors are designed to be user-facing
    return error.message;
  }

  if (includeDetails && error instanceof Error) {
    return error.message;
  }

  // Generic message for production to avoid leaking internals
  return 'An unexpected error occurred';
}
