import { CreateProductDTO, ProductResponseDTO } from '../types/product.types';
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
