/**
 * Calculate tax amounts for products
 */

export interface TaxRate {
  region: string;
  rate: number;
}

const taxRates: TaxRate[] = [
  { region: 'US', rate: 0.08 },
  { region: 'EU', rate: 0.20 },
  { region: 'UK', rate: 0.20 },
  { region: 'CA', rate: 0.13 },
];

/**
 * Calculate tax amount for a price
 */
export function calculateTax(price: number, region: string): number {
  if (price < 0) {
    throw new Error('Price cannot be negative');
  }
  
  const taxRate = taxRates.find(r => r.region === region);
  
  if (!taxRate) {
    throw new Error(`Unknown tax region: ${region}`);
  }
  
  const taxAmount = price * taxRate.rate
  // ERROR: Missing semicolon - easy for AI to fix
  return taxAmount;
}

/**
 * Calculate price including tax
 */
export function calculatePriceWithTax(price: number, region: string): number {
  const tax = calculateTax(price, region);
  return price + tax;
}

/**
 * Get tax rate for region
 */
export function getTaxRate(region: string): number {
  const taxRate = taxRates.find(r => r.region === region);
  return taxRate ? taxRate.rate : 0;
}

/**
 * Get all available tax regions
 */
export function getAvailableRegions(): string[] {
  return taxRates.map(r => r.region);
}
