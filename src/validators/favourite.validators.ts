import { body, param } from 'express-validator';

/**
 * Validation rules for adding a favourite
 */
export const addFavouriteValidation = [
  body('productId')
    .trim()
    .notEmpty()
    .withMessage('Product ID is required')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
];

/**
 * Validation rules for removing a favourite
 */
export const removeFavouriteValidation = [
  param('favouriteId')
    .trim()
    .notEmpty()
    .withMessage('Favourite ID is required')
    .isUUID()
    .withMessage('Favourite ID must be a valid UUID'),
];
