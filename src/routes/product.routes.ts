import { Router } from 'express';
import * as ProductController from '../controllers/product.controller';
import * as ProductValidators from '../validators/product.validators';
import { authenticate } from '../middleware/authenticate.middleware';

const router = Router();

/**
 * POST /api/products
 * Create a new product (requires authentication)
 */
router.post(
  '/',
  authenticate,
  ProductValidators.createProductValidation,
  ProductController.createProduct
);

/**
 * GET /api/products
 * Get all products (requires authentication)
 */
router.get('/', authenticate, ProductController.getAllProducts);

/**
 * GET /api/products/:productId
 * Get product by ID (requires authentication)
 */
router.get(
  '/:productId',
  authenticate,
  ProductValidators.getProductByIdValidation,
  ProductController.getProductById
);

export default router;
