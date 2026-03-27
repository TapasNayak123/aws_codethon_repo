/**
 * Request Validation Utilities
 * Common validation helpers for API request data
 */

/**
 * Validate phone number format (international format)
 * Supports formats: +1234567890, +1-234-567-8900, +1 (234) 567-8900
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove all spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Check if it starts with + and has 10-15 digits
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate string is not empty or only whitespace
 */
export function isNonEmptyString(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate string length is within range
 */
export function isValidLength(
  value: string,
  min: number,
  max: number
): boolean {
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * Validate numeric string (can be parsed as number)
 */
export function isNumericString(value: string): boolean {
  return !isNaN(Number(value)) && isNonEmptyString(value);
}

/**
 * Validate alphanumeric string (letters and numbers only)
 */
export function isAlphanumeric(value: string): boolean {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(value);
}

/**
 * Validate array has minimum number of items
 */
export function hasMinItems<T>(array: T[], min: number): boolean {
  return Array.isArray(array) && array.length >= min;
}

/**
 * Validate object has required keys
 */
export function hasRequiredKeys(
  obj: Record<string, any>,
  requiredKeys: string[]
): boolean {
  return requiredKeys.every((key) => key in obj);
}

/**
 * Sanitize string by removing HTML tags
 */
export function sanitizeHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

/**
 * Validate ISO date string format
 */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString();
}
