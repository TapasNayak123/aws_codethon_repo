import { ApiResponse, ErrorResponse } from '../types/response.types';

export function successResponse<T>(
  message: string,
  data: T | null = null,
  requestId?: string
): ApiResponse<T> {
  return {
    status: 'success',
    message,
    data,
    ...(requestId && { requestId }),
  };
}

export function errorResponse(
  message: string,
  errorCode?: string,
  requestId?: string
): ErrorResponse {
  return {
    status: 'error',
    message,
    data: null,
    ...(errorCode && { errorCode }),
    ...(requestId && { requestId }),
  };
}
