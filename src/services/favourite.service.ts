import * as FavouriteModel from '../models/favourite.model';
import * as ProductModel from '../models/product.model';
import { FavouriteResponseDTO } from '../types/favourite.types';
import { ConflictError, NotFoundError } from '../utils/error.util';

/**
 * Add a product to user's favourites
 */
export async function addFavourite(userId: string, productId: string): Promise<FavouriteResponseDTO> {
  // Verify product exists
  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Check if already favourited
  const alreadyExists = await FavouriteModel.exists(userId, productId);
  if (alreadyExists) {
    throw new ConflictError('Product is already in your favourites');
  }

  const favourite = await FavouriteModel.create(userId, productId);

  return {
    favouriteId: favourite.favouriteId,
    userId: favourite.userId,
    productId: favourite.productId,
    createdAt: favourite.createdAt,
  };
}

/**
 * Get all favourites for a user
 */
export async function getUserFavourites(userId: string): Promise<FavouriteResponseDTO[]> {
  const favourites = await FavouriteModel.findByUserId(userId);

  return favourites.map((fav) => ({
    favouriteId: fav.favouriteId,
    userId: fav.userId,
    productId: fav.productId,
    createdAt: fav.createdAt,
  }));
}

/**
 * Remove a product from user's favourites
 */
export async function removeFavourite(userId: string, favouriteId: string): Promise<void> {
  // Verify the favourite belongs to this user
  const favourites = await FavouriteModel.findByUserId(userId);
  const favourite = favourites.find((f) => f.favouriteId === favouriteId);

  if (!favourite) {
    throw new NotFoundError('Favourite not found');
  }

  await FavouriteModel.remove(favouriteId);
}
