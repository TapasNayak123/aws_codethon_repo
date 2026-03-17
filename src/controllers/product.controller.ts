import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as ProductService from '../services/product.service';
import { successResponse } from '../utils/response-formatter';
import { ValidationError } from '../utils/error.util';
import { logger } from '../utils/logger';

/**
 * Create a new product or multiple products
 * Requires authentication
 */
export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = (req as any).requestId;
  const requestLogger = logger.child(requestId, {
    endpoint: 'POST /api/products',
  });

  try {
    requestLogger.info('Processing product creation');

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Format validation errors for better readability
      const formattedErrors = errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'body',
        message: err.msg,
        value: err.type === 'field' ? err.value : undefined,
      }));
      
      requestLogger.warn('Product validation failed', { errors: formattedErrors });
      
      throw new ValidationError(
        `Product validation failed: ${formattedErrors.map(e => e.message).join(', ')}`
      );
    }

    const body = req.body;

    // Check if body is an array or single object
    const isArray = Array.isArray(body);
    const productsData = isArray ? body : [body];

    requestLogger.debug('Creating products', { count: productsData.length, isArray });

    // Create all products
    const createdProducts = [];
    for (const productData of productsData) {
      const product = await ProductService.createProduct({
        productName: productData.productName,
        price: parseFloat(productData.price),
        availableQuantity: parseInt(productData.availableQuantity, 10),
        description: productData.description,
        imageUrl: productData.imageUrl,
      });
      createdProducts.push(product);
      requestLogger.debug('Product created', { productId: product.productId, productName: product.productName });
    }

    requestLogger.info('Products created successfully', { count: createdProducts.length });

    // Return appropriate response
    if (isArray) {
      res.status(201).json(
        successResponse(
          `${createdProducts.length} product(s) created successfully`,
          { products: createdProducts, count: createdProducts.length },
          requestId
        )
      );
    } else {
      res.status(201).json(
        successResponse('Product created successfully', createdProducts[0], requestId)
      );
    }
  } catch (error) {
    requestLogger.error('Product creation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * Get all products
 */
export async function getAllProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = (req as any).requestId;
  const requestLogger = logger.child(requestId, {
    endpoint: 'GET /api/products',
  });

  try {
    requestLogger.info('Fetching all products');

    const products = await ProductService.getAllProducts();

    requestLogger.info('Products retrieved successfully', { count: products.length });

    res.status(200).json(
      successResponse(
        `Retrieved ${products.length} product(s)`,
        { products, count: products.length },
        requestId
      )
    );
  } catch (error) {
    requestLogger.error('Failed to retrieve products', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * Get product by ID
 */
export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = (req as any).requestId;
  const requestLogger = logger.child(requestId, {
    endpoint: 'GET /api/products/:productId',
  });

  try {
    requestLogger.info('Fetching product by ID');

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      requestLogger.warn('Validation failed', {
        errors: errors.array().map(e => ({ field: e.type === 'field' ? e.path : 'body', message: e.msg })),
      });
      throw new ValidationError(`Validation failed: ${errors.array()[0].msg}`);
    }

    const { productId } = req.params;

    requestLogger.debug('Retrieving product', { productId });

    const product = await ProductService.getProductById(productId);

    requestLogger.info('Product retrieved successfully', { productId: product.productId });

    res.status(200).json(
      successResponse('Product retrieved successfully', product, requestId)
    );
  } catch (error) {
    requestLogger.error('Failed to retrieve product', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}


/**
 * Update a product
 * Requires authentication
 */
export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = (req as any).requestId;
  const requestLogger = logger.child(requestId, {
    endpoint: 'PUT /api/products/:productId',
  });

  try {
    requestLogger.info('Processing product update');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'body',
        message: err.msg,
      }));
      requestLogger.warn('Product update validation failed', { errors: formattedErrors });
      throw new ValidationError(
        `Validation failed: ${formattedErrors.map(e => e.message).join(', ')}`
      );
    }

    const { productId } = req.params;
    const updateData = req.body;

    requestLogger.debug('Updating product', { productId, fields: Object.keys(updateData) });

    const product = await ProductService.updateProduct(productId, updateData);

    requestLogger.info('Product updated successfully', { productId });

    res.status(200).json(
      successResponse('Product updated successfully', product, requestId)
    );
  } catch (error) {
    requestLogger.error('Product update failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * Delete a product
 * Requires authentication
 */
export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = (req as any).requestId;
  const requestLogger = logger.child(requestId, {
    endpoint: 'DELETE /api/products/:productId',
  });

  try {
    requestLogger.info('Processing product deletion');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(`Validation failed: ${errors.array()[0].msg}`);
    }

    const { productId } = req.params;

    requestLogger.debug('Deleting product', { productId });

    const product = await ProductService.deleteProduct(productId);

    requestLogger.info('Product deleted successfully', { productId });

    res.status(200).json(
      successResponse('Product deleted successfully', product, requestId)
    );
  } catch (error) {
    requestLogger.error('Product deletion failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

/**
 * Search products with filtering, sorting, and pagination
 * Requires authentication
 */
export async function searchProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = (req as any).requestId;
  const requestLogger = logger.child(requestId, {
    endpoint: 'GET /api/products/search',
  });

  try {
    requestLogger.info('Processing product search', { query: req.query });

    const searchParams = {
      search: req.query.q as string | undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      sortBy: (req.query.sortBy as 'productName' | 'price' | 'createdAt') || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await ProductService.searchProducts(searchParams);

    requestLogger.info('Product search completed', {
      totalItems: result.pagination.totalItems,
      page: result.pagination.page,
    });

    res.status(200).json(
      successResponse('Products retrieved successfully', result, requestId)
    );
  } catch (error) {
    requestLogger.error('Product search failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}
