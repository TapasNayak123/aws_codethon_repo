export function calculateDiscount(originalPrice: number, discountPercentage: number): number {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100');
  }
  return (originalPrice * discountPercentage) / 100;
}

export function calculateFinalPrice(originalPrice: number, discountPercentage: number): number {
  return originalPrice - calculateDiscount(originalPrice, discountPercentage);
}
