import { CreateProductDTO, UpdateProductDTO, ProductResponseDTO, ProductSearchParams, PaginatedProductsResponse } from '../types/product.types';
import * as ProductModel from '../models/product.model';
import { ValidationError, NotFoundError } from '../utils/error.util';

/**
 * Create a new product
 */
export async function createProduct(
  productData: CreateProductDTO
): Promise<ProductResponseDTO> {
  if (productData.price <= 0) {
    throw new ValidationError('Price must be greater than 0');
  }

  if (productData.availableQuantity < 0) {
    throw new ValidationError('Available quantity cannot be negative');
  }

  const product = await ProductModel.create(productData);

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
export async function getAllProducts(): Promise<ProductResponseDTO[]> {
  const products = await ProductModel.findAll();

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
export async function getProductById(productId: string): Promise<ProductResponseDTO> {
  const product = await ProductModel.findById(productId);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

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
export async function updateProduct(productId: string, updateData: UpdateProductDTO): Promise<ProductResponseDTO> {
  // Verify product exists
  const existing = await ProductModel.findById(productId);
  if (!existing) {
    throw new NotFoundError('Product not found');
  }

  if (updateData.price !== undefined && updateData.price <= 0) {
    throw new ValidationError('Price must be greater than 0');
  }

  if (updateData.availableQuantity !== undefined && updateData.availableQuantity < 0) {
    throw new ValidationError('Available quantity cannot be negative');
  }

  const updated = await ProductModel.update(productId, updateData);
  if (!updated) {
    throw new NotFoundError('Product not found');
  }

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
export async function deleteProduct(productId: string): Promise<ProductResponseDTO> {
  const deleted = await ProductModel.remove(productId);
  if (!deleted) {
    throw new NotFoundError('Product not found');
  }

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
export async function searchProducts(params: ProductSearchParams): Promise<PaginatedProductsResponse> {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';

  // Get all products (DynamoDB scan — for demo; production would use GSIs)
  let products = await ProductModel.findAll();

  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.productName.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
    );
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
