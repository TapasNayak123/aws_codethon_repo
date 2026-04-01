import { Request, Response, NextFunction } from 'express';
import * as StockAlertService from '../services/stock-alert.service';
import { successResponse } from '../utils/response-formatter';
import { RequestLogger } from '../utils/logger';

/**
 * Helper to get the request-scoped logger
 */
function getLog(req: Request): RequestLogger {
  return (req as any).log;
}

/**
 * Get all products with low stock
 * GET /api/stock-alerts/low-stock
 * Requires authentication
 */
export async function getLowStockProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const log = getLog(req);
  const requestId = (req as any).requestId;

  try {
    log.info('GET_LOW_STOCK_START', { phase: 'controller' });

    const lowStockProducts = await StockAlertService.getLowStockProducts(log);

    log.info('GET_LOW_STOCK_SUCCESS', {
      phase: 'controller',
      count: lowStockProducts.length,
    });

    res.status(200).json(
      successResponse(
        `Found ${lowStockProducts.length} product(s) with low stock`,
        { products: lowStockProducts, count: lowStockProducts.length },
        requestId
      )
    );
  } catch (error) {
    log.error('GET_LOW_STOCK_FAILED', {
      phase: 'controller',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * Get stock status for a specific product
 * GET /api/stock-alerts/:productId
 * Requires authentication
 */
export async function getStockStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const log = getLog(req);
  const requestId = (req as any).requestId;

  try {
    const { productId } = req.params;

    log.info('GET_STOCK_STATUS_START', { phase: 'controller', productId });

    const status = await StockAlertService.getStockStatus(productId, log);

    log.info('GET_STOCK_STATUS_SUCCESS', { phase: 'controller', productId });

    res.status(200).json(
      successResponse('Stock status retrieved successfully', status, requestId)
    );
  } catch (error) {
    log.error('GET_STOCK_STATUS_FAILED', {
      phase: 'controller',
      productId: req.params.productId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}
