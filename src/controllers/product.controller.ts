import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as ProductService from '../services/product.service';
import { successResponse } from '../utils/response-formatter';
import { ValidationError } from '../utils/error.util';

/**
 * Create a new product or multiple products
 * Requires authentication
 */
export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Format validation errors for better readability
      const formattedErrors = errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'body',
        message: err.msg,
        value: err.type === 'field' ? err.value : undefined,
      }));
      
      throw new ValidationError(
        `Product validation failed: ${formattedErrors.map(e => e.message).join(', ')}`
      );
    }

    const body = req.body;

    // Check if body is an array or single object
    const isArray = Array.isArray(body);
    const productsData = isArray ? body : [body];

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
    }

    // Get request ID
    const requestId = (req as any).requestId;

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
  try {
    const products = await ProductService.getAllProducts();

    const requestId = (req as any).requestId;

    res.status(200).json(
      successResponse(
        `Retrieved ${products.length} product(s)`,
        { products, count: products.length },
        requestId
      )
    );
  } catch (error) {
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
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(`Validation failed: ${errors.array()[0].msg}`);
    }

    const { productId } = req.params;

    const product = await ProductService.getProductById(productId);

    const requestId = (req as any).requestId;

    res.status(200).json(
      successResponse('Product retrieved successfully', product, requestId)
    );
  } catch (error) {
    next(error);
  }
}
