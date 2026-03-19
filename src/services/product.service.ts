import { CreateProductDTO, UpdateProductDTO, ProductResponseDTO, ProductSearchParams, PaginatedProductsResponse } from '../types/product.types';
import * as ProductModel from '../models/product.model';
import { ValidationError, NotFoundError } from '../utils/error.util';
import { RequestLogger } from '../utils/logger';

/**
 * Create a new product
 */
export async function createProduct(
  productData: CreateProductDTO,
  log: RequestLogger
): Promise<ProductResponseDTO> {
  log.info('PRODUCT_CREATE_VALIDATING', { phase: 'service', productName: productData.productName });

  if (productData.price <= 0) {
    log.warn('PRODUCT_CREATE_INVALID_PRICE', { phase: 'service', price: productData.price });
    throw new ValidationError('Price must be greater than 0');
  }

  if (productData.availableQuantity < 0) {
    log.warn('PRODUCT_CREATE_INVALID_QUANTITY', { phase: 'service', quantity: productData.availableQuantity });
    throw new ValidationError('Available quantity cannot be negative');
  }

  log.info('PRODUCT_CREATE_PERSISTING', { phase: 'service', productName: productData.productName });
  const product = await ProductModel.create(productData);

  log.info('PRODUCT_CREATE_SUCCESS', { phase: 'service', productId: product.productId });

  return {
    productId: product.productId,
    productName: product.productName,
    price: product.price,
    availableQuantity: product.availableQuantity,
    description: product.description,
    imageUrl: product.imageUrl,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * Get all products
 */
export async function getAllProducts(log: RequestLogger): Promise<ProductResponseDTO[]> {
  log.info('PRODUCT_LIST_FETCHING', { phase: 'service' });

  const products = await ProductModel.findAll();

  log.info('PRODUCT_LIST_SUCCESS', { phase: 'service', count: products.length });

  return products.map((product) => ({
    productId: product.productId,
    productName: product.productName,
    price: product.price,
    availableQuantity: product.availableQuantity,
    description: product.description,
    imageUrl: product.imageUrl,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }));
}

/**
 * Get product by ID
 */
export async function getProductById(productId: string, log: RequestLogger): Promise<ProductResponseDTO> {
  log.info('PRODUCT_FETCH_BY_ID', { phase: 'service', productId });

  const product = await ProductModel.findById(productId);

  if (!product) {
    log.warn('PRODUCT_NOT_FOUND', { phase: 'service', productId });
    throw new NotFoundError('Product not found');
  }

  log.info('PRODUCT_FETCH_SUCCESS', { phase: 'service', productId });

  return {
    productId: product.productId,
    productName: product.productName,
    price: product.price,
    availableQuantity: product.availableQuantity,
    description: product.description,
    imageUrl: product.imageUrl,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * Update a product
 */
export async function updateProduct(
  productId: string,
  updateData: UpdateProductDTO,
  log: RequestLogger
): Promise<ProductResponseDTO> {
  log.info('PRODUCT_UPDATE_START', { phase: 'service', productId, fields: Object.keys(updateData) });

  const existing = await ProductModel.findById(productId);
  if (!existing) {
    log.warn('PRODUCT_UPDATE_NOT_FOUND', { phase: 'service', productId });
    throw new NotFoundError('Product not found');
  }

  if (updateData.price !== undefined && updateData.price <= 0) {
    log.warn('PRODUCT_UPDATE_INVALID_PRICE', { phase: 'service', productId, price: updateData.price });
    throw new ValidationError('Price must be greater than 0');
  }

  if (updateData.availableQuantity !== undefined && updateData.availableQuantity < 0) {
    log.warn('PRODUCT_UPDATE_INVALID_QUANTITY', { phase: 'service', productId, quantity: updateData.availableQuantity });
    throw new ValidationError('Available quantity cannot be negative');
  }

  log.info('PRODUCT_UPDATE_PERSISTING', { phase: 'service', productId });
  const updated = await ProductModel.update(productId, updateData);
  if (!updated) {
    log.error('PRODUCT_UPDATE_FAILED', { phase: 'service', productId });
    throw new NotFoundError('Product not found');
  }

  log.info('PRODUCT_UPDATE_SUCCESS', { phase: 'service', productId });

  return {
    productId: updated.productId,
    productName: updated.productName,
    price: updated.price,
    availableQuantity: updated.availableQuantity,
    description: updated.description,
    imageUrl: updated.imageUrl,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string, log: RequestLogger): Promise<ProductResponseDTO> {
  log.info('PRODUCT_DELETE_START', { phase: 'service', productId });

  const deleted = await ProductModel.remove(productId);
  if (!deleted) {
    log.warn('PRODUCT_DELETE_NOT_FOUND', { phase: 'service', productId });
    throw new NotFoundError('Product not found');
  }

  log.info('PRODUCT_DELETE_SUCCESS', { phase: 'service', productId });

  return {
    productId: deleted.productId,
    productName: deleted.productName,
    price: deleted.price,
    availableQuantity: deleted.availableQuantity,
    description: deleted.description,
    imageUrl: deleted.imageUrl,
    createdAt: deleted.createdAt,
    updatedAt: deleted.updatedAt,
  };
}

/**
 * Search products with filtering, sorting, and pagination
 */
export async function searchProducts(
  params: ProductSearchParams,
  log: RequestLogger
): Promise<PaginatedProductsResponse> {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';

  log.info('PRODUCT_SEARCH_START', {
    phase: 'service',
    search: params.search,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  // Get all products (DynamoDB scan — for demo; production would use GSIs)
  let products = await ProductModel.findAll();
  log.debug('PRODUCT_SEARCH_SCAN_COMPLETE', { phase: 'service', totalScanned: products.length });

  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.productName.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
    );
    log.debug('PRODUCT_SEARCH_FILTERED', { phase: 'service', afterTextFilter: products.length });
  }

  // Apply price filters
  if (params.minPrice !== undefined) {
    products = products.filter((p) => p.price >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    products = products.filter((p) => p.price <= params.maxPrice!);
  }

  // Sort
  products.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (typeof aVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
    }
    return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const paginatedProducts = products.slice(startIndex, startIndex + limit);

  log.info('PRODUCT_SEARCH_SUCCESS', {
    phase: 'service',
    totalMatched: totalItems,
    returned: paginatedProducts.length,
    page,
    totalPages,
  });

  return {
    products: paginatedProducts.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      price: p.price,
      availableQuantity: p.availableQuantity,
      description: p.description,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
