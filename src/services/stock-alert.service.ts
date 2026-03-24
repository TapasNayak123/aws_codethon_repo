import { RequestLogger } from '../utils/logger';
import * as ProductModel from '../models/product.model';
import { Product } from '../types/product.types';

/**
 * Configuration for low stock threshold
 */
const LOW_STOCK_THRESHOLD = 10;

/**
 * Check if product is low on stock
 */
export function isLowStock(product: Product): boolean {
  return product.availableQuantity <= LOW_STOCK_THRESHOLD;
}

/**
 * Get all products with low stock
 */
export async function getLowStockProducts(log: RequestLogger): Promise<Product[]> {
  log.info('GET_LOW_STOCK_START', { phase: 'service', threshold: LOW_STOCK_THRESHOLD });

  const allProducts = await ProductModel.findAll();
  const lowStockProducts = allProducts.filter(isLowStock);

  log.info('GET_LOW_STOCK_SUCCESS', {
    phase: 'service',
    totalProducts: allProducts.length,
    lowStockCount: lowStockProducts.length,
  });

  return lowStockProducts;
}

/**
 * Get stock status for a specific product
 */
export async function getStockStatus(
  productId: string,
  log: RequestLogger
): Promise<{ productId: string; availableQuantity: number; isLowStock: boolean; threshold: number }> {
  log.info('GET_STOCK_STATUS_START', { phase: 'service', productId });

  const product = await ProductModel.findById(productId);

  if (!product) {
    log.warn('GET_STOCK_STATUS_NOT_FOUND', { phase: 'service', productId });
    throw new Error('Product not found');
  }

  const status = {
    productId: product.productId,
    availableQuantity: product.availableQuantity,
    isLowStock: isLowStock(product),
    threshold: LOW_STOCK_THRESHOLD,
  };

  log.info('GET_STOCK_STATUS_SUCCESS', { phase: 'service', productId, status });

  return status;
}
