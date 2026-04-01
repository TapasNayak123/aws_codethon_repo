import { Router } from 'express';
import * as StockAlertController from '../controllers/stock-alert.controller';
import { authenticate } from '../middleware/authenticate.middleware';
import { validateParams, productIdParamSchema } from '../middleware/schema-validator.middleware';

const router = Router();

/**
 * GET /api/stock-alerts/low-stock
 * Get all products with low stock (requires authentication)
 */
router.get('/low-stock', authenticate, StockAlertController.getLowStockProducts);

/**
 * GET /api/stock-alerts/:productId
 * Get stock status for a specific product (requires authentication)
 */
router.get(
  '/:productId',
  authenticate,
  validateParams(productIdParamSchema),
  StockAlertController.getStockStatus
);

export default router;
