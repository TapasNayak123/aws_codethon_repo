import { Router } from 'express';
import * as ProductController from '../controllers/product.controller';
import * as ProductValidators from '../validators/product.validators';
import { authenticate } from '../middleware/authenticate.middleware';

const router = Router();

/**
 * GET /api/products/search
 * Search products with filtering, sorting, and pagination (requires authentication)
 * Must be defined BEFORE /:productId to avoid route conflicts
 */
router.get('/search', authenticate, ProductController.searchProducts);

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

/**
 * PUT /api/products/:productId
 * Update a product (requires authentication)
 */
router.put(
  '/:productId',
  authenticate,
  ProductValidators.updateProductValidation,
  ProductController.updateProduct
);

/**
 * DELETE /api/products/:productId
 * Delete a product (requires authentication)
 */
router.delete(
  '/:productId',
  authenticate,
  ProductValidators.deleteProductValidation,
  ProductController.deleteProduct
);

export default router;
