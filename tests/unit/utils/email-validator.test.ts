import { describe, it, expect } from 'vitest';
import { isValidEmail, isGmailAddress } from '../../../src/utils/email-validator';

describe('Email Validator', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'test123@test-domain.com',
        'a@b.c',
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should return false for invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'test@',
        'test @example.com',
        'test@example',
        '',
        'test@@example.com',
        'test@.com',
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(isValidEmail('a@b.co')).toBe(true);
      expect(isValidEmail('test@localhost')).toBe(false);
      expect(isValidEmail('test@192.168.1.1')).toBe(false);
    });
  });

  describe('isGmailAddress', () => {
    it('should return true for Gmail addresses', () => {
      const gmailAddresses = [
        'test@gmail.com',
        'user.name@gmail.com',
        'test123@gmail.com',
      ];

      gmailAddresses.forEach(email => {
        expect(isGmailAddress(email)).toBe(true);
      });
    });

    it('should return false for non-Gmail addresses', () => {
      const nonGmailAddresses = [
        'test@yahoo.com',
        'user@outlook.com',
        'test@example.com',
        'test@gmailcom',
        'test@gmail.co.uk',
      ];

      nonGmailAddresses.forEach(email => {
        expect(isGmailAddress(email)).toBe(false);
      });
    });

    it('should be case insensitive', () => {
      expect(isGmailAddress('test@GMAIL.COM')).toBe(true);
      expect(isGmailAddress('test@Gmail.com')).toBe(true);
    });
  });
});
