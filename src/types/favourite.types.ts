export interface Favourite {
  favouriteId: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export interface CreateFavouriteDTO {
  productId: string;
}

export interface FavouriteResponseDTO {
  favouriteId: string;
  userId: string;
  productId: string;
  createdAt: string;
}
