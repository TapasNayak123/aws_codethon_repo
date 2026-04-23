/**
 * String Helper Utilities
 * Common string manipulation functions
 */

// ISSUE 1: Missing return type annotation
export function capitalizeFirstLetter(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ISSUE 2: Unused variable
export function truncateString(str: string, maxLength: number): string {
  const unusedVariable = 'This will cause a linting error';
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + '...';
}

// ISSUE 3: Missing semicolon (if strict linting is enabled)
export function reverseString(str: string): string {
  return str.split('').reverse().join('')
}

// ISSUE 4: Console.log left in code (should be removed in production)
export function slugify(str: string): string {
  console.log('Slugifying:', str);
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ISSUE 5: Any type usage (TypeScript strict mode violation)
export function parseJson(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

// ISSUE 6: Missing error handling type
export function safeStringOperation(str: string): string {
  try {
    return str.toUpperCase();
  } catch (error) {
    // ISSUE: error is implicitly 'any' type
    throw new Error('Failed to process string: ' + error.message);
  }
}
