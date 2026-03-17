import { body, param, ValidationChain } from 'express-validator';

/**
 * Enhanced validation rules for creating product(s)
 * Accepts both single object and array of objects
 * Provides comprehensive schema validation with detailed error messages
 */
export const createProductValidation: ValidationChain[] = [
  // Step 1: Validate request body structure
  body()
    .custom((value, { req: _req }) => {
      if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
        throw new Error('Request body cannot be empty');
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          throw new Error('Product array cannot be empty. Provide at least one product.');
        }
        if (value.length > 100) {
          throw new Error('Cannot create more than 100 products at once');
        }
        value.forEach((item, index) => {
          if (typeof item !== 'object' || item === null) {
            throw new Error(`Item at index ${index} must be an object`);
          }
        });
        return true;
      } else if (typeof value === 'object' && value !== null) {
        return true;
      }
      
      throw new Error('Request body must be a product object or an array of product objects');
    }),

  // Step 2: Validate productName for array items
  body('*.productName')
    .if(body().isArray())
    .trim()
    .notEmpty()
    .withMessage('Product name is required for all products')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-&',.()]+$/)
    .withMessage('Product name contains invalid characters'),

  // Step 3: Validate price for array items
  body('*.price')
    .if(body().isArray())
    .notEmpty()
    .withMessage('Price is required for all products')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Price must be between $0.01 and $999,999.99')
    .custom((value) => {
      // Ensure max 2 decimal places
      if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
        throw new Error('Price must have at most 2 decimal places');
      }
      return true;
    }),

  // Step 4: Validate availableQuantity for array items
  body('*.availableQuantity')
    .if(body().isArray())
    .notEmpty()
    .withMessage('Available quantity is required for all products')
    .isInt({ min: 0, max: 1000000 })
    .withMessage('Available quantity must be between 0 and 1,000,000'),

  // Step 5: Validate description for array items
  body('*.description')
    .if(body().isArray())
    .trim()
    .notEmpty()
    .withMessage('Description is required for all products')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  // Step 6: Validate imageUrl for array items
  body('*.imageUrl')
    .if(body().isArray())
    .trim()
    .notEmpty()
    .withMessage('Image URL is required for all products')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Image URL must be a valid HTTP/HTTPS URL')
    .isLength({ max: 2048 })
    .withMessage('Image URL must not exceed 2048 characters'),

  // Step 7: Validate productName for single object
  body('productName')
    .if(body().isObject())
    .if((_value, { req }) => !Array.isArray(req.body))
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-&',.()]+$/)
    .withMessage('Product name contains invalid characters'),

  // Step 8: Validate price for single object
  body('price')
    .if(body().isObject())
    .if((_value, { req }) => !Array.isArray(req.body))
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Price must be between $0.01 and $999,999.99')
    .custom((value) => {
      if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
        throw new Error('Price must have at most 2 decimal places');
      }
      return true;
    }),

  // Step 9: Validate availableQuantity for single object
  body('availableQuantity')
    .if(body().isObject())
    .if((_value, { req }) => !Array.isArray(req.body))
    .notEmpty()
    .withMessage('Available quantity is required')
    .isInt({ min: 0, max: 1000000 })
    .withMessage('Available quantity must be between 0 and 1,000,000'),

  // Step 10: Validate description for single object
  body('description')
    .if(body().isObject())
    .if((_value, { req }) => !Array.isArray(req.body))
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  // Step 11: Validate imageUrl for single object
  body('imageUrl')
    .if(body().isObject())
    .if((_value, { req }) => !Array.isArray(req.body))
    .trim()
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Image URL must be a valid HTTP/HTTPS URL')
    .isLength({ max: 2048 })
    .withMessage('Image URL must not exceed 2048 characters'),

  // Step 12: Check for unexpected fields
  body()
    .custom((value) => {
      const allowedFields = ['productName', 'price', 'availableQuantity', 'description', 'imageUrl'];
      
      const validateFields = (obj: any) => {
        const extraFields = Object.keys(obj).filter(key => !allowedFields.includes(key));
        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}. Allowed fields are: ${allowedFields.join(', ')}`);
        }
      };

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          try {
            validateFields(item);
          } catch (error) {
            throw new Error(`Product at index ${index}: ${error.message}`);
          }
        });
      } else {
        validateFields(value);
      }
      
      return true;
    }),
];

/**
 * Validation rules for getting product by ID
 */
export const getProductByIdValidation = [
  param('productId')
    .trim()
    .notEmpty()
    .withMessage('Product ID is required')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
];


/**
 * Validation rules for updating a product
 */
export const updateProductValidation: ValidationChain[] = [
  param('productId')
    .trim()
    .notEmpty()
    .withMessage('Product ID is required')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),

  body('productName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-&',.()]+$/)
    .withMessage('Product name contains invalid characters'),

  body('price')
    .optional()
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Price must be between $0.01 and $999,999.99'),

  body('availableQuantity')
    .optional()
    .isInt({ min: 0, max: 1000000 })
    .withMessage('Available quantity must be between 0 and 1,000,000'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  body('imageUrl')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Image URL must be a valid HTTP/HTTPS URL'),

  body()
    .custom((value) => {
      const allowedFields = ['productName', 'price', 'availableQuantity', 'description', 'imageUrl'];
      const extraFields = Object.keys(value).filter(key => !allowedFields.includes(key));
      if (extraFields.length > 0) {
        throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
      }
      if (Object.keys(value).length === 0) {
        throw new Error('At least one field must be provided for update');
      }
      return true;
    }),
];

/**
 * Validation rules for deleting a product
 */
export const deleteProductValidation = [
  param('productId')
    .trim()
    .notEmpty()
    .withMessage('Product ID is required')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
];
