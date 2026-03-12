import bcrypt from 'bcryptjs';

/**
 * Hash password using bcrypt with cost factor 12
 * Time complexity: ~300ms per operation
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(plainPassword, saltRounds);
}

/**
 * Verify password against hash using constant-time comparison
 * Time complexity: ~300ms per operation
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
