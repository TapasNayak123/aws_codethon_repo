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

export interface UpdateProductDTO {
  productName?: string;
  price?: number;
  availableQuantity?: number;
  description?: string;
  imageUrl?: string;
}

export interface ProductSearchParams {
  search?: string;
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
  price: number;
  availableQuantity: number;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}
