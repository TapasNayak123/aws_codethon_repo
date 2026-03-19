import { Request, Response, NextFunction } from 'express';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { ValidationError } from '../utils/error.util';
import { logger } from '../utils/logger';

const ajv = new Ajv({ allErrors: true, coerceTypes: false, strict: false });
addFormats(ajv);

/**
 * Format AJV errors into human-readable messages
 */
function formatErrors(errors: any[]): string[] {
  return errors.map((err) => {
    const field = err.instancePath ? err.instancePath.replace(/^\//, '').replace(/\//g, '.') : '';

    switch (err.keyword) {
      case 'required':
        return `Missing required field: ${err.params.missingProperty}`;
      case 'additionalProperties':
        return `Unexpected field: ${err.params.additionalProperty}`;
      case 'type':
        return field
          ? `'${field}' must be of type ${err.params.type}`
          : `Request body must be of type ${err.params.type}`;
      case 'minLength':
        return `'${field}' must be at least ${err.params.limit} characters`;
      case 'maxLength':
        return `'${field}' must not exceed ${err.params.limit} characters`;
      case 'minimum':
        return `'${field}' must be at least ${err.params.limit}`;
      case 'maximum':
        return `'${field}' must not exceed ${err.params.limit}`;
      case 'format':
        return `'${field}' must be a valid ${err.params.format}`;
      case 'pattern':
        return `'${field}' contains invalid characters`;
      case 'enum':
        return `'${field}' must be one of: ${err.params.allowedValues.join(', ')}`;
      case 'minProperties':
        return 'At least one field must be provided';
      case 'minItems':
        return 'Array must contain at least one item';
      case 'maxItems':
        return `Array must not contain more than ${err.params.limit} items`;
      case 'oneOf':
        return 'Request body must be a product object or an array of product objects';
      default:
        return field ? `'${field}': ${err.message}` : err.message || 'Validation error';
    }
  });
}

/**
 * Validate request body against a JSON schema
 */
export function validateBody(schema: object) {
  const validate: ValidateFunction = ajv.compile(schema);

  return (req: Request, _res: Response, next: NextFunction): void => {
    const log = (req as any).log ?? logger.child((req as any).requestId, {
      method: req.method,
      path: req.path,
    });

    const valid = validate(req.body);
    if (!valid && validate.errors) {
      const messages = formatErrors(validate.errors);
      const errorMessage = messages.join('; ');
      log.warn('SCHEMA_BODY_INVALID', {
        phase: 'middleware',
        endpoint: `${req.method} ${req.path}`,
        errorCount: messages.length,
        errors: messages,
      });
      throw new ValidationError(errorMessage);
    }

    log.debug('SCHEMA_BODY_VALID', { phase: 'middleware', endpoint: `${req.method} ${req.path}` });
    next();
  };
}

/**
 * Validate request query parameters against a JSON schema
 */
export function validateQuery(schema: object) {
  const validate: ValidateFunction = ajv.compile(schema);

  return (req: Request, _res: Response, next: NextFunction): void => {
    const log = (req as any).log ?? logger.child((req as any).requestId, {
      method: req.method,
      path: req.path,
    });

    const valid = validate(req.query);
    if (!valid && validate.errors) {
      const messages = formatErrors(validate.errors);
      const errorMessage = messages.join('; ');
      log.warn('SCHEMA_QUERY_INVALID', {
        phase: 'middleware',
        endpoint: `${req.method} ${req.path}`,
        errorCount: messages.length,
        errors: messages,
      });
      throw new ValidationError(errorMessage);
    }

    log.debug('SCHEMA_QUERY_VALID', { phase: 'middleware', endpoint: `${req.method} ${req.path}` });
    next();
  };
}

/**
 * Validate request params (e.g., UUID path params)
 */
export function validateParams(schema: object) {
  const validate: ValidateFunction = ajv.compile(schema);

  return (req: Request, _res: Response, next: NextFunction): void => {
    const log = (req as any).log ?? logger.child((req as any).requestId, {
      method: req.method,
      path: req.path,
    });

    const valid = validate(req.params);
    if (!valid && validate.errors) {
      const messages = formatErrors(validate.errors);
      const errorMessage = messages.join('; ');
      log.warn('SCHEMA_PARAMS_INVALID', {
        phase: 'middleware',
        endpoint: `${req.method} ${req.path}`,
        errorCount: messages.length,
        errors: messages,
      });
      throw new ValidationError(errorMessage);
    }

    log.debug('SCHEMA_PARAMS_VALID', { phase: 'middleware', endpoint: `${req.method} ${req.path}` });
    next();
  };
}

/** Reusable UUID param schema */
export const productIdParamSchema = {
  type: 'object',
  properties: {
    productId: { type: 'string', format: 'uuid' },
  },
  required: ['productId'],
  additionalProperties: false,
};
