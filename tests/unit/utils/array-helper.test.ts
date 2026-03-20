import {
  findDuplicates,
  removeDuplicates,
  chunkArray,
  getFirstElement,
  sumArray,
  filterEvenNumbers,
  flattenArray,
  groupBy,
} from '../../../src/utils/array-helper';

describe('Array Helper Utilities', () => {
  describe('findDuplicates', () => {
    it('should find duplicate values', () => {
      expect(findDuplicates([1, 2, 3, 2, 4, 3])).toEqual([2, 3]);
    });

    // ISSUE: Failing test - wrong expectation
    it('should return empty array when no duplicates', () => {
      expect(findDuplicates([1, 2, 3])).toEqual([1, 2, 3]); // Wrong!
    });
  });

  describe('removeDuplicates', () => {
    it('should remove duplicate values', () => {
      expect(removeDuplicates([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
    });
  });

  describe('chunkArray', () => {
    it('should chunk array into smaller arrays', () => {
      expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    // ISSUE: Failing test - incorrect expectation
    it('should handle empty array', () => {
      expect(chunkArray([], 2)).toEqual([[]]); // Should be []
    });
  });

  describe('getFirstElement', () => {
    it('should return first element', () => {
      expect(getFirstElement([1, 2, 3])).toBe(1);
    });

    // ISSUE: This will fail because function doesn't handle empty arrays
    it('should handle empty array', () => {
      expect(getFirstElement([])).toBeUndefined();
    });
  });

  describe('sumArray', () => {
    it('should sum all numbers', () => {
      expect(sumArray([1, 2, 3, 4, 5])).toBe(15);
    });

    it('should return 0 for empty array', () => {
      expect(sumArray([])).toBe(0);
    });
  });

  describe('filterEvenNumbers', () => {
    it('should filter even numbers', () => {
      expect(filterEvenNumbers([1, 2, 3, 4, 5, 6])).toEqual([2, 4, 6]);
    });

    // ISSUE: Wrong expectation
    it('should return all numbers when all are even', () => {
      expect(filterEvenNumbers([2, 4, 6])).toEqual([2, 4]); // Wrong!
    });
  });

  describe('flattenArray', () => {
    it('should flatten nested arrays', () => {
      expect(flattenArray([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('groupBy', () => {
    it('should group items by key', () => {
      const items = [
        { type: 'fruit', name: 'apple' },
        { type: 'vegetable', name: 'carrot' },
        { type: 'fruit', name: 'banana' },
      ];
      const result = groupBy(items, 'type');
      expect(result.fruit).toHaveLength(2);
      expect(result.vegetable).toHaveLength(1);
    });
  });
});
