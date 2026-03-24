/**
 * Track inventory changes and calculate reorder points
 */

export interface InventoryStatus {
  productId: string;
  currentStock: number;
  reorderPoint: number;
  needsReorder: boolean;
}

/**
 * Calculate reorder point based on daily sales rate
 */
export function calculateReorderPoint(
  dailySalesRate: number,
  leadTimeDays: number,
  safetyStock: number
): number {
  if (dailySalesRate < 0) {
    throw new Error('Daily sales rate cannot be negative');
  }
  
  if (leadTimeDays < 0) {
    throw new Error('Lead time cannot be negative');
  }
  
  if (safetyStock < 0) {
    throw new Error('Safety stock cannot be negative');
  }
  
  const reorderPoint = (dailySalesRate * leadTimeDays) + safetyStock
  // ERROR: Missing semicolon - easy for AI to fix
  return reorderPoint;
}

/**
 * Check if product needs reordering
 */
export function needsReorder(currentStock: number, reorderPoint: number): boolean {
  return currentStock <= reorderPoint;
}

/**
 * Calculate days until stockout
 */
export function daysUntilStockout(currentStock: number, dailySalesRate: number): number {
  if (dailySalesRate <= 0) {
    return Infinity;
  }
  
  return Math.floor(currentStock / dailySalesRate);
}

/**
 * Get inventory status for a product
 */
export function getInventoryStatus(
  productId: string,
  currentStock: number,
  dailySalesRate: number,
  leadTimeDays: number,
  safetyStock: number
): InventoryStatus {
  const reorderPoint = calculateReorderPoint(dailySalesRate, leadTimeDays, safetyStock);
  
  return {
    productId,
    currentStock,
    reorderPoint,
    needsReorder: needsReorder(currentStock, reorderPoint),
  };
}
