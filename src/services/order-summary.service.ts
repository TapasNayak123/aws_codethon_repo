/**
 * Generate order summaries with pricing calculations
 */

// ERROR: Missing import for formatPrice function
// import { formatPrice } from '../utils/price-formatter';

import { RequestLogger } from '../utils/logger';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderSummary {
  items: OrderItem[];
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
}

/**
 * Generate order summary with formatted prices
 */
export async function generateOrderSummary(
  items: OrderItem[],
  taxRate: number,
  shippingCost: number,
  log: RequestLogger
): Promise<OrderSummary> {
  log.info('ORDER_SUMMARY_GENERATING', { phase: 'service', itemCount: items.length });

  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount + shippingCost;

  log.info('ORDER_SUMMARY_CALCULATED', { 
    phase: 'service', 
    subtotal, 
    taxAmount, 
    shippingCost, 
    total 
  });

  return {
    items,
    subtotal: formatPrice(subtotal), // ERROR: formatPrice is not imported
    tax: formatPrice(taxAmount),
    shipping: formatPrice(shippingCost),
    total: formatPrice(total),
  };
}

/**
 * Calculate order total
 */
export function calculateOrderTotal(
  items: OrderItem[],
  taxRate: number,
  shippingCost: number
): number {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const taxAmount = subtotal * taxRate;
  return subtotal + taxAmount + shippingCost;
}
