const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Check if email is a Gmail address
 */
export function isGmailAddress(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain === 'gmail.com';
}
