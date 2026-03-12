const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!EMAIL_REGEX.test(email)) {
    return false;
  }

  // Reject IP addresses as domain
  const domain = email.split('@')[1];
  const ipRegex = /^\d+\.\d+\.\d+\.\d+$/;
  if (ipRegex.test(domain)) {
    return false;
  }

  return true;
}

/**
 * Check if email is a Gmail address
 */
export function isGmailAddress(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain === 'gmail.com';
}
