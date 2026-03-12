/**
 * Product type definitions
 */

export interface Product {
  productId: string;
  productName: string;
  price: number;
  availableQuantity: number;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  productName: string;
  price: number;
  availableQuantity: number;
  description: string;
  imageUrl: string;
}

export interface ProductResponseDTO {
  productId: string;
  productName: string;
  price: number;
  availableQuantity: number;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}
