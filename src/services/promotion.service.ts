/**
 * Handle promotional pricing and discounts
 */

import { calculateDiscount } from '../utils/discount-calculator';
import { RequestLogger } from '../utils/logger';

export interface Promotion {
  promotionId: string;
  name: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
}

/**
 * Apply promotion to product price
 */
export async function applyPromotion(
  originalPrice: number,
  promotion: Promotion,
  log: RequestLogger
): Promise<number> {
  log.info('PROMOTION_APPLYING', { 
    phase: 'service', 
    promotionId: promotion.promotionId,
    originalPrice 
  });

  // ERROR: calculateDiscount is not imported but used here
  const discountAmount = calculateDiscount(originalPrice, promotion.discountPercentage);
  const finalPrice = originalPrice - discountAmount;

  log.info('PROMOTION_APPLIED', { 
    phase: 'service', 
    promotionId: promotion.promotionId,
    finalPrice 
  });

  return finalPrice;
}

/**
 * Check if promotion is currently active
 */
export function isPromotionActive(promotion: Promotion): boolean {
  const now = new Date();
  const start = new Date(promotion.startDate);
  const end = new Date(promotion.endDate);
  
  return now >= start && now <= end;
}
