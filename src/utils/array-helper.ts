/**
 * Array Helper Utilities
 */

// ISSUE 1: Function with implicit any return type
export function findDuplicates(arr) {
  return arr.filter((item, index) => arr.indexOf(item) !== index);
}

// ISSUE 2: Unused import and parameter
import { Request } from 'express';

export function removeDuplicates(arr: any[]): any[] {
  const unusedParam = 'not used';
  return [...new Set(arr)];
}

// ISSUE 3: Console.log left in code
export function chunkArray<T>(arr: T[], size: number): T[][] {
  console.log('Chunking array with size:', size);
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ISSUE 4: Missing error handling
export function getFirstElement<T>(arr: T[]): T {
  return arr[0]; // Should check if array is empty
}

// ISSUE 5: Inefficient code that could be simplified
export function sumArray(numbers: number[]): number {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum = sum + numbers[i];
  }
  return sum;
}

// ISSUE 6: Using var instead of const/let
export function filterEvenNumbers(numbers: number[]): number[] {
  var result = [];
  for (var i = 0; i < numbers.length; i++) {
    if (numbers[i] % 2 === 0) {
      result.push(numbers[i]);
    }
  }
  return result;
}

// ISSUE 7: Missing semicolon
export function flattenArray<T>(arr: T[][]): T[] {
  return arr.flat()
}

// ISSUE 8: Incorrect type annotation (should be more specific)
export function groupBy(arr: any[], key: string): any {
  return arr.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}
