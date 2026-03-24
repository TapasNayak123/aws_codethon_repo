export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
  requestId?: string;
  timestamp?: string;
}

export interface ErrorResponse extends ApiResponse<null> {
  status: 'error';
  errorCode?: string;
}
