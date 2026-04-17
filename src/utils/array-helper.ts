/**
 * Array Helper Utilities
 */

// ISSUE 1: Function with implicit any return type
export function findDuplicates(arr: any[]): any[] {
  return arr.filter((item, index) => arr.indexOf(item) !== index);
}

// ISSUE 2: Unused import and parameter
export function removeDuplicates(arr: any[]): any[] {
  return [...new Set(arr)];
}

// ISSUE 3: Console.log left in code
export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ISSUE 4: Missing error handling
export function getFirstElement<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error('Array is empty');
  }
  return arr[0];
}

// ISSUE 5: Inefficient code that could be simplified
export function sumArray(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0);
}

// ISSUE 6: Using var instead of const/let
export function filterEvenNumbers(numbers: number[]): number[] {
  let result = [];
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] % 2 === 0) {
      result.push(numbers[i]);
    }
  }
  return result;
}

// ISSUE 7: Missing semicolon
export function flattenArray<T>(arr: T[][]): T[] {
  return arr.flat();
}

// ISSUE 8: Incorrect type annotation (should be more specific)
export function groupBy<T extends object>(arr: T[], key: keyof T): { [key: string]: T[] } {
  return arr.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as { [key: string]: T[] });
}