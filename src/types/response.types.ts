export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
  timestamp?: string;
  requestId?: string;
}

export interface ErrorResponse extends ApiResponse<null> {
  status: 'error';
  errorCode?: string;
}
