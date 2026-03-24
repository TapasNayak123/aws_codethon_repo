/**
 * Product type definitions
 */

export type ProductCategory = 'Electronics' | 'Clothing' | 'Food' | 'Books' | 'Home' | 'Sports' | 'Other';

export interface Product {
  productId: string;
  productName: string;
  category: ProductCategory;
  price: number;
  availableQuantity: number;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  productName: string;
  category: ProductCategory;
  price: number;
  availableQuantity: number;
  description: string;
  imageUrl: string;
}

export interface UpdateProductDTO {
  productName?: string;
  category?: ProductCategory;
  price?: number;
  availableQuantity?: number;
  description?: string;
  imageUrl?: string;
}

export interface ProductSearchParams {
  search?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: 'productName' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProductsResponse {
  products: ProductResponseDTO[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ProductResponseDTO {
  productId: string;
  productName: string;
  category: ProductCategory;
  price: number;
  availableQuantity: number;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}
