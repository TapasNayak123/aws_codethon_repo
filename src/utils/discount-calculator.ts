/**
 * Calculate discount percentage for a product
 */
export function calculateDiscount(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0) {
    throw new Error('Original price must be greater than 0');
  }
  
  if (discountedPrice < 0) {
    throw new Error('Discounted price cannot be negative');
  }
  
  if (discountedPrice > originalPrice) {
    throw new Error('Discounted price cannot be greater than original price');
  }
  
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return discount
  // ERROR: Missing semicolon - should be easy for AI to fix
}

/**
 * Apply discount to price
 */
export function applyDiscount(price: number, discountPercentage: number): number {
  if (price <= 0) {
    throw new Error('Price must be greater than 0');
  }
  
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100');
  }
  
  return price - (price * discountPercentage / 100);
}

/**
 * Check if product is on sale
 */
export function isOnSale(originalPrice: number, currentPrice: number): boolean {
  return currentPrice < originalPrice;
}
