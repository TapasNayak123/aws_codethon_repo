/**
 * Format price with currency symbol
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  if (price < 0) {
    throw new Error('Price cannot be negative');
  }
  
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };
  
  const symbol = currencySymbols[currency] || '$';
  return `${symbol}${price.toFixed(2)}`
  // ERROR: Missing semicolon - easy for AI to fix
}

/**
 * Parse price string to number
 */
export function parsePrice(priceString: string): number {
  const cleaned = priceString.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    throw new Error('Invalid price format');
  }
  
  return parsed;
}

/**
 * Compare two prices
 */
export function comparePrices(price1: number, price2: number): number {
  return price1 - price2;
}
