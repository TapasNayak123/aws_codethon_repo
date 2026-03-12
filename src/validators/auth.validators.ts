import { body, ValidationChain } from 'express-validator';
import { isValidEmail, isGmailAddress } from '../utils/email-validator';
import { validatePassword } from '../utils/password-validator';
import { isValidDate, isMinimumAge, isFutureDate } from '../utils/date-validator';

/**
 * Validation rules for user registration
 */
export const registrationValidation: ValidationChain[] = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),

  body('dateOfBirth')
    .trim()
    .notEmpty()
    .withMessage('Date of birth is required')
    .custom((value) => {
      if (!isValidDate(value)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
      }
      if (isFutureDate(value)) {
        throw new Error('Date of birth cannot be in the future');
      }
      if (!isMinimumAge(value, 18)) {
        throw new Error('You must be at least 18 years old to register');
      }
      return true;
    }),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom((value) => {
      if (!isValidEmail(value)) {
        throw new Error('Invalid email format');
      }
      if (!isGmailAddress(value)) {
        throw new Error('Only Gmail addresses are currently supported');
      }
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .custom((value) => {
      const result = validatePassword(value);
      if (!result.isValid) {
        throw new Error(result.errors.join(', '));
      }
      return true;
    }),
];

/**
 * Validation rules for user login
 */
export const loginValidation: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom((value) => {
      if (!isValidEmail(value)) {
        throw new Error('Invalid email format');
      }
      return true;
    }),

  body('password').notEmpty().withMessage('Password is required'),
];
