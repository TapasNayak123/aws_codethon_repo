import { describe, it, expect } from 'vitest';
import { generateJWT, verifyJWT } from '../../../src/services/token.service';

describe('Token Service', () => {
  const testUserId = 'test-user-123';
  const testEmail = 'test@example.com';

  describe('generateJWT', () => {
    it('should generate a valid JWT token', () => {
      const token = generateJWT(testUserId, testEmail);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for same payload', async () => {
      const token1 = generateJWT(testUserId, testEmail);
      // Wait 1000ms (1 second) to ensure different iat timestamp
      await new Promise(resolve => setTimeout(resolve, 1000));
      const token2 = generateJWT(testUserId, testEmail);
      
      // Tokens will be different due to iat (issued at) timestamp
      expect(token1).not.toBe(token2);
    });

    it('should handle different user data', () => {
      const token = generateJWT('admin-456', 'admin@example.com');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyJWT', () => {
    it('should verify a valid token', () => {
      const token = generateJWT(testUserId, testEmail);
      const decoded = verifyJWT(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testUserId);
      expect(decoded.email).toBe(testEmail);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => verifyJWT(invalidToken)).toThrow('Invalid token');
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      
      expect(() => verifyJWT(malformedToken)).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => verifyJWT('')).toThrow();
    });

    it('should include standard JWT claims', () => {
      const token = generateJWT(testUserId, testEmail);
      const decoded = verifyJWT(token);
      
      expect(decoded.iat).toBeDefined(); // issued at
      expect(decoded.exp).toBeDefined(); // expiration
    });
  });
});
