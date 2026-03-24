import { Request, Response, NextFunction } from 'express';
import * as ProductService from '../services/product.service';
import { successResponse } from '../utils/response-formatter';
import { RequestLogger } from '../utils/logger';

/**
 * Helper to get the request-scoped logger (attached by request-logger middleware)
 */
function getLog(req: Request): RequestLogger {
  return (req as any).log;
}

/**
 * Create a new product or multiple products
 * Requires authentication
 */
export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const log = getLog(req);
  const requestId = (req as any).requestId;

  try {
    const isArray = Array.isArray(req.body);
    const productsData = isArray ? req.body : [req.body];

    log.info('CREATE_PRODUCT_START', { phase: 'controller', count: productsData.length, isBatch: isArray });

    const createdProducts = [];
    for (const productData of productsData) {
      const product = await ProductService.createProduct({
        productName: productData.productName,
        category: productData.category,
        price: productData.price,
        availableQuantity: productData.availableQuantity,
        description: productData.description,
        imageUrl: productData.imageUrl,
      }, log);
      createdProducts.push(product);
    }

    log.info('CREATE_PRODUCT_SUCCESS', { phase: 'controller', count: createdProducts.length });

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
    log.error('CREATE_PRODUCT_FAILED', {
      phase: 'controller',
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
  const log = getLog(req);
  const requestId = (req as any).requestId;

  try {
    log.info('GET_ALL_PRODUCTS_START', { phase: 'controller' });

    const products = await ProductService.getAllProducts(log);

    log.info('GET_ALL_PRODUCTS_SUCCESS', { phase: 'controller', count: products.length });

    res.status(200).json(
      successResponse(
        `Retrieved ${products.length} product(s)`,
        { products, count: products.length },
        requestId
      )
    );
  } catch (error) {
    log.error('GET_ALL_PRODUCTS_FAILED', {
      phase: 'controller',
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
  const log = getLog(req);
  const requestId = (req as any).requestId;

  try {
    const { productId } = req.params;

    log.info('GET_PRODUCT_START', { phase: 'controller', productId });

    const product = await ProductService.getProductById(productId, log);

    log.info('GET_PRODUCT_SUCCESS', { phase: 'controller', productId });

    res.status(200).json(
      successResponse('Product retrieved successfully', product, requestId)
    );
  } catch (error) {
    log.error('GET_PRODUCT_FAILED', {
      phase: 'controller',
      productId: req.params.productId,
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
  const log = getLog(req);
  const requestId = (req as any).requestId;

  try {
    const { productId } = req.params;

    log.info('UPDATE_PRODUCT_START', {
      phase: 'controller',
      productId,
      fields: Object.keys(req.body),
    });

    const product = await ProductService.updateProduct(productId, req.body, log);

    log.info('UPDATE_PRODUCT_SUCCESS', { phase: 'controller', productId });

    res.status(200).json(
      successResponse('Product updated successfully', product, requestId)
    );
  } catch (error) {
    log.error('UPDATE_PRODUCT_FAILED', {
      phase: 'controller',
      productId: req.params.productId,
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
  const log = getLog(req);
  const requestId = (req as any).requestId;

  try {
    const { productId } = req.params;

    log.info('DELETE_PRODUCT_START', { phase: 'controller', productId });

    const product = await ProductService.deleteProduct(productId, log);

    log.info('DELETE_PRODUCT_SUCCESS', { phase: 'controller', productId });

    res.status(200).json(
      successResponse('Product deleted successfully', product, requestId)
    );
  } catch (error) {
    log.error('DELETE_PRODUCT_FAILED', {
      phase: 'controller',
      productId: req.params.productId,
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
  const log = getLog(req);
  const requestId = (req as any).requestId;

  try {
    const searchParams = {
      search: req.query.q as string | undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      sortBy: (req.query.sortBy as 'productName' | 'price' | 'createdAt') || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    log.info('SEARCH_PRODUCTS_START', { phase: 'controller', searchParams });

    const result = await ProductService.searchProducts(searchParams, log);

    log.info('SEARCH_PRODUCTS_SUCCESS', {
      phase: 'controller',
      totalItems: result.pagination.totalItems,
      page: result.pagination.page,
    });

    res.status(200).json(
      successResponse('Products retrieved successfully', result, requestId)
    );
  } catch (error) {
    log.error('SEARCH_PRODUCTS_FAILED', {
      phase: 'controller',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}
