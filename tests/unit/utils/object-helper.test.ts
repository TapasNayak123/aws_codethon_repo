import {
  deepClone,
  mergeObjects,
  getNestedValue,
  setNestedValue,
  pickProperties,
  omitProperties,
  flattenObject,
  isEmptyObject,
} from '../../../src/utils/object-helper';

describe('Object Helper Utilities', () => {
  describe('deepClone', () => {
    it('should deep clone an object', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);
      cloned.b.c = 3;
      expect(original.b.c).toBe(2);
    });

    // ISSUE: Wrong expectation
    it('should handle empty object', () => {
      expect(deepClone({})).toEqual({ empty: true }); // Wrong!
    });
  });

  describe('mergeObjects', () => {
    it('should merge two objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      expect(mergeObjects(obj1, obj2)).toEqual({ a: 1, b: 3, c: 4 });
    });
  });

  describe('getNestedValue', () => {
    it('should get nested value', () => {
      const obj = { a: { b: { c: 'value' } } };
      expect(getNestedValue(obj, 'a.b.c')).toBe('value');
    });

    // ISSUE: This will fail - function doesn't handle missing paths well
    it('should return undefined for missing path', () => {
      const obj = { a: { b: 'value' } };
      expect(getNestedValue(obj, 'a.b.c.d')).toBeNull(); // Should be undefined
    });
  });

  describe('setNestedValue', () => {
    it('should set nested value', () => {
      const obj = { a: { b: {} } };
      setNestedValue(obj, 'a.b.c', 'value');
      expect(obj.a.b.c).toBe('value');
    });

    // ISSUE: Wrong expectation
    it('should create nested structure', () => {
      const obj = {};
      setNestedValue(obj, 'a.b.c', 'value');
      expect(obj).toEqual({ a: { b: 'value' } }); // Wrong structure!
    });
  });

  describe('pickProperties', () => {
    it('should pick specified properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pickProperties(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    // ISSUE: Wrong expectation
    it('should handle non-existent keys', () => {
      const obj = { a: 1, b: 2 };
      expect(pickProperties(obj, ['a', 'z'])).toEqual({ a: 1, z: undefined }); // Wrong!
    });
  });

  describe('omitProperties', () => {
    it('should omit specified properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omitProperties(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('flattenObject', () => {
    it('should flatten nested object', () => {
      const obj = { a: { b: { c: 1 } }, d: 2 };
      expect(flattenObject(obj)).toEqual({ 'a.b.c': 1, d: 2 });
    });

    // ISSUE: This will fail - function doesn't handle null properly
    it('should handle null values', () => {
      const obj = { a: null, b: 2 };
      expect(flattenObject(obj)).toEqual({ a: null, b: 2 });
    });
  });

  describe('isEmptyObject', () => {
    it('should return true for empty object', () => {
      expect(isEmptyObject({})).toBe(true);
    });

    it('should return false for non-empty object', () => {
      expect(isEmptyObject({ a: 1 })).toBe(false);
    });

    // ISSUE: This will fail - function doesn't handle null
    it('should handle null', () => {
      expect(isEmptyObject(null as any)).toBe(true);
    });
  });
});
