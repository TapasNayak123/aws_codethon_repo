import {
  capitalizeFirstLetter,
  truncateString,
  reverseString,
  slugify,
  parseJson,
} from '../../../src/utils/string-helper';

describe('String Helper Utilities', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });
  });

  describe('truncateString', () => {
    it('should truncate long strings', () => {
      const longString = 'This is a very long string that needs truncation';
      expect(truncateString(longString, 20)).toBe('This is a very long ...');
    });

    it('should not truncate short strings', () => {
      expect(truncateString('Short', 10)).toBe('Short');
    });
  });

  describe('reverseString', () => {
    it('should reverse a string', () => {
      expect(reverseString('hello')).toBe('olleh');
    });

    // ISSUE: This test will fail intentionally
    it('should handle empty string', () => {
      expect(reverseString('')).toBe('not empty'); // Wrong expectation
    });
  });

  describe('slugify', () => {
    it('should convert string to slug', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
    });

    it('should handle special characters', () => {
      expect(slugify('Test@#$%String')).toBe('teststring');
    });
  });

  describe('parseJson', () => {
    it('should parse valid JSON', () => {
      const json = '{"name":"John","age":30}';
      const result = parseJson(json);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should return null for invalid JSON', () => {
      expect(parseJson('invalid json')).toBeNull();
    });
  });
});
