/**
 * Calculate discount amount based on percentage
 * @param originalPrice - The original price
 * @param discountPercentage - The discount percentage (0-100)
 * @returns The discount amount
 */
export function calculateDiscount(originalPrice: number, discountPercentage: number): number {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100');
  }
  return (originalPrice * discountPercentage) / 100;
}

/**
 * Calculate final price after discount
 * @param originalPrice - The original price
 * @param discountPercentage - The discount percentage (0-100)
 * @returns The final price after discount
 */
export function calculateFinalPrice(originalPrice: number, discountPercentage: number): number {
  const discountAmount = calculateDiscount(originalPrice, discountPercentage);
  return originalPrice - discountAmount;
}
