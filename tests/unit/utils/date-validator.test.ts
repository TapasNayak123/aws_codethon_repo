import { describe, it, expect } from 'vitest';
import { isValidDate, isMinimumAge, calculateAge, isFutureDate } from '../../../src/utils/date-validator';

describe('Date Validator', () => {
  describe('isValidDate', () => {
    it('should return true for valid date strings', () => {
      const validDates = [
        '1990-01-01',
        '2000-12-31',
        '1985-06-15',
        '2024-02-29', // leap year
      ];

      validDates.forEach(date => {
        expect(isValidDate(date)).toBe(true);
      });
    });

    it('should return false for invalid date strings', () => {
      const invalidDates = [
        'invalid',
        '2024-13-01', // invalid month
        '2024-01-32', // invalid day
        '2023-02-29', // not a leap year
        '01-01-1990', // wrong format
        '',
      ];

      invalidDates.forEach(date => {
        expect(isValidDate(date)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(isValidDate('2024-01-01')).toBe(true);
      expect(isValidDate('1900-01-01')).toBe(true);
      expect(isValidDate('2100-12-31')).toBe(true);
    });
  });

  describe('isMinimumAge', () => {
    it('should return true for users 18 years or older', () => {
      const today = new Date();
      const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      const twentyYearsAgo = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
      
      expect(isMinimumAge(eighteenYearsAgo.toISOString().split('T')[0], 18)).toBe(true);
      expect(isMinimumAge(twentyYearsAgo.toISOString().split('T')[0], 18)).toBe(true);
    });

    it('should return false for users under 18', () => {
      const today = new Date();
      const seventeenYearsAgo = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
      const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
      
      expect(isMinimumAge(seventeenYearsAgo.toISOString().split('T')[0], 18)).toBe(false);
      expect(isMinimumAge(tenYearsAgo.toISOString().split('T')[0], 18)).toBe(false);
    });

    it('should handle exactly 18 years old', () => {
      const today = new Date();
      const exactlyEighteen = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      
      expect(isMinimumAge(exactlyEighteen.toISOString().split('T')[0], 18)).toBe(true);
    });
  });

  describe('calculateAge', () => {
    it('should calculate correct age', () => {
      const today = new Date();
      const twentyYearsAgo = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
      
      expect(calculateAge(twentyYearsAgo.toISOString().split('T')[0])).toBe(20);
    });
  });

  describe('isFutureDate', () => {
    it('should return true for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      expect(isFutureDate(tomorrow.toISOString().split('T')[0])).toBe(true);
    });

    it('should return false for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      expect(isFutureDate(yesterday.toISOString().split('T')[0])).toBe(false);
    });
  });
});
