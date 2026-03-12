import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse } from '../../../src/utils/response-formatter';

describe('Response Formatter', () => {
  describe('successResponse', () => {
    it('should format success response with data', () => {
      const data = { id: '123', name: 'Test' };
      const message = 'Operation successful';
      
      const response = successResponse(message, data);
      
      expect(response.status).toBe('success');
      expect(response.message).toBe(message);
      expect(response.data).toEqual(data);
    });

    it('should format success response without data', () => {
      const message = 'Operation successful';
      
      const response = successResponse(message);
      
      expect(response.status).toBe('success');
      expect(response.message).toBe(message);
      expect(response.data).toBeNull();
    });

    it('should handle null data explicitly', () => {
      const message = 'Operation successful';
      
      const response = successResponse(message, null);
      
      expect(response.status).toBe('success');
      expect(response.message).toBe(message);
      expect(response.data).toBeNull();
    });

    it('should handle array data', () => {
      const data = [{ id: '1' }, { id: '2' }];
      const message = 'Items retrieved';
      
      const response = successResponse(message, data);
      
      expect(response.status).toBe('success');
      expect(response.data).toEqual(data);
    });

    it('should include requestId when provided', () => {
      const message = 'Operation successful';
      const data = { id: '123' };
      const requestId = 'req-123';
      
      const response = successResponse(message, data, requestId);
      
      expect(response.requestId).toBe(requestId);
    });
  });

  describe('errorResponse', () => {
    it('should format error response with message only', () => {
      const message = 'An error occurred';
      
      const response = errorResponse(message);
      
      expect(response.status).toBe('error');
      expect(response.message).toBe(message);
      expect(response.data).toBeNull();
    });

    it('should format error response with errorCode', () => {
      const message = 'Validation failed';
      const errorCode = 'VALIDATION_ERROR';
      
      const response = errorResponse(message, errorCode);
      
      expect(response.status).toBe('error');
      expect(response.message).toBe(message);
      expect(response.errorCode).toBe(errorCode);
    });

    it('should include requestId when provided', () => {
      const message = 'Error occurred';
      const errorCode = 'INTERNAL_ERROR';
      const requestId = 'req-456';
      
      const response = errorResponse(message, errorCode, requestId);
      
      expect(response.status).toBe('error');
      expect(response.requestId).toBe(requestId);
    });

    it('should handle error without errorCode', () => {
      const message = 'Something went wrong';
      
      const response = errorResponse(message);
      
      expect(response.status).toBe('error');
      expect(response.message).toBe(message);
      expect(response.errorCode).toBeUndefined();
    });
  });
});
