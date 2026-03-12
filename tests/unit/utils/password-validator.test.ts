import { describe, it, expect } from 'vitest';
import { validatePassword } from '../../../src/utils/password-validator';

describe('Password Validator', () => {
  describe('validatePassword', () => {
    it('should return valid for strong passwords', () => {
      const strongPasswords = [
        'Test1234',
        'MyPass123',
        'Secure1Pass',
        'Admin2024',
      ];

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject passwords shorter than 8 characters', () => {
      const result = validatePassword('Test12');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('test1234');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePassword('TEST1234');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('TestPass');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should return multiple errors for weak passwords', () => {
      const result = validatePassword('test');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should handle empty password', () => {
      const result = validatePassword('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should accept passwords with special characters', () => {
      const result = validatePassword('Test1234!@#');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
