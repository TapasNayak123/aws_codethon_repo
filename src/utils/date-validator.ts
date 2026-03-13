/**
 * Validate if a string is a valid date in YYYY-MM-DD format
 */
export function isValidDate(dateString: string): boolean {
  // Check format with regex
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  // Parse and validate date
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return false;
  }

  // Verify the date components match (catches invalid dates like 2024-13-01)
  const [year, month, day] = dateString.split('-').map(Number);
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
}

/**
 * Calculate age from date of birth
 * Uses proper date comparison to handle timezones correctly
 */
export function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth + 'T00:00:00Z');
  const today = new Date();
  
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birthDate.getUTCMonth();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
    age--;
  }
  
  return age;
}

/**
 * Check if date of birth meets minimum age requirement
 */
export function isMinimumAge(dateOfBirth: string, minimumAge: number): boolean {
  const age = calculateAge(dateOfBirth);
  return age >= minimumAge;
}

/**
 * Check if date is in the future
 */
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return date > today;
}
