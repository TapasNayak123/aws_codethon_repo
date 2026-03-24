/**
 * Validate product quantities for orders
 */

export interface QuantityValidation {
  isValid: boolean;
  message?: string;
}

/**
 * Validate order quantity
 */
export function validateOrderQuantity(
  requestedQuantity: number,
  availableQuantity: number,
  minOrderQuantity: number = 1,
  maxOrderQuantity: number = 100
): QuantityValidation {
  if (requestedQuantity < minOrderQuantity) {
    return {
      isValid: false,
      message: `Minimum order quantity is ${minOrderQuantity}`
    }
    // ERROR: Missing semicolon - easy for AI to fix
  }
  
  if (requestedQuantity > maxOrderQuantity) {
    return {
      isValid: false,
      message: `Maximum order quantity is ${maxOrderQuantity}`,
    };
  }
  
  if (requestedQuantity > availableQuantity) {
    return {
      isValid: false,
      message: `Only ${availableQuantity} items available`,
    };
  }
  
  return {
    isValid: true,
  };
}

/**
 * Check if quantity is in stock
 */
export function isInStock(availableQuantity: number): boolean {
  return availableQuantity > 0;
}

/**
 * Calculate remaining stock after order
 */
export function calculateRemainingStock(
  currentStock: number,
  orderedQuantity: number
): number {
  return Math.max(0, currentStock - orderedQuantity);
}
