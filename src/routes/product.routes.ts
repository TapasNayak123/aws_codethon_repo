import { Router } from 'express';
import * as ProductController from '../controllers/product.controller';
import { validateBody, validateQuery, validateParams, productIdParamSchema } from '../middleware/schema-validator.middleware';
import { createProductSchema, updateProductSchema, searchProductsSchema } from '../schemas/product.schemas';
import { authenticate } from '../middleware/authenticate.middleware';

const router = Router();

/**
 * GET /api/products/search
 * Search products with filtering, sorting, and pagination (requires authentication)
 * Must be defined BEFORE /:productId to avoid route conflicts
 */
router.get('/search', authenticate, validateQuery(searchProductsSchema), ProductController.searchProducts);

/**
 * POST /api/products
 * Create a new product (requires authentication)
 */
router.post(
  '/',
  authenticate,
  validateBody(createProductSchema),
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
  validateParams(productIdParamSchema),
  ProductController.getProductById
);

/**
 * PUT /api/products/:productId
 * Update a product (requires authentication)
 */
router.put(
  '/:productId',
  authenticate,
  validateParams(productIdParamSchema),
  validateBody(updateProductSchema),
  ProductController.updateProduct
);

/**
 * DELETE /api/products/:productId
 * Delete a product (requires authentication)
 */
router.delete(
  '/:productId',
  authenticate,
  validateParams(productIdParamSchema),
  ProductController.deleteProduct
);

export default router;
