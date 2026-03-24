/**
 * Calculate shipping cost based on weight and destination
 */

export interface ShippingRate {
  zone: string;
  baseRate: number;
  perKgRate: number;
}

const shippingRates: ShippingRate[] = [
  { zone: 'domestic', baseRate: 5.00, perKgRate: 2.50 },
  { zone: 'international', baseRate: 15.00, perKgRate: 8.00 },
  { zone: 'express', baseRate: 25.00, perKgRate: 12.00 },
];

/**
 * Calculate shipping cost
 */
export function calculateShipping(weight: number, zone: string): number {
  if (weight <= 0) {
    throw new Error('Weight must be greater than 0');
  }
  
  const rate = shippingRates.find(r => r.zone === zone);
  
  if (!rate) {
    throw new Error(`Invalid shipping zone: ${zone}`)
    // ERROR: Missing semicolon - easy for AI to fix
  }
  
  return rate.baseRate + (weight * rate.perKgRate);
}

/**
 * Get available shipping zones
 */
export function getShippingZones(): string[] {
  return shippingRates.map(r => r.zone);
}

/**
 * Estimate delivery days
 */
export function estimateDeliveryDays(zone: string): number {
  const deliveryTimes: Record<string, number> = {
    'domestic': 3,
    'international': 10,
    'express': 1,
  };
  
  return deliveryTimes[zone] || 7;
}
