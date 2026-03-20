import { ApiResponse, ErrorResponse } from '../types/response.types';

/**
 * Create a standardized success response
 * 
 * @param message - Success message to return
 * @param data - Response data payload
 * @param requestId - Optional request correlation ID
 * @returns Formatted success response
 * 
 * @example
 * successResponse('User created successfully', { id: '123', name: 'John' }, 'req-abc-123')
 */
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

/**
 * Create a standardized error response
 * 
 * @param message - Error message to return
 * @param errorCode - Optional error code for client handling
 * @param requestId - Optional request correlation ID
 * @returns Formatted error response
 * 
 * @example
 * errorResponse('User not found', 'USER_NOT_FOUND', 'req-abc-123')
 */
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

/**
 * Create a paginated success response
 * 
 * @param message - Success message
 * @param items - Array of items for current page
 * @param pagination - Pagination metadata
 * @param requestId - Optional request correlation ID
 * @returns Formatted paginated response
 * 
 * @example
 * paginatedResponse('Products retrieved', products, { page: 1, limit: 10, total: 100 })
 */
export function paginatedResponse<T>(
  message: string,
  items: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  },
  requestId?: string
): ApiResponse<{
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const totalPages = pagination.totalPages ?? Math.ceil(pagination.total / pagination.limit);
  
  return successResponse(
    message,
    {
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
    },
    requestId
  );
}

/**
 * Create a response for created resources (HTTP 201)
 * 
 * @param message - Success message
 * @param data - Created resource data
 * @param resourceId - ID of the created resource
 * @param requestId - Optional request correlation ID
 * @returns Formatted creation response
 * 
 * @example
 * createdResponse('User created successfully', userData, '123', 'req-abc-123')
 */
export function createdResponse<T>(
  message: string,
  data: T,
  resourceId: string,
  requestId?: string
): ApiResponse<T & { id: string }> {
  return {
    status: 'success',
    message,
    data: {
      ...data,
      id: resourceId,
    },
    ...(requestId && { requestId }),
  };
}

/**
 * Create a no-content success response (HTTP 204)
 * Useful for DELETE operations or updates with no response body
 * 
 * @param message - Success message
 * @param requestId - Optional request correlation ID
 * @returns Formatted no-content response
 * 
 * @example
 * noContentResponse('User deleted successfully', 'req-abc-123')
 */
export function noContentResponse(
  message: string,
  requestId?: string
): ApiResponse<null> {
  return successResponse(message, null, requestId);
}
