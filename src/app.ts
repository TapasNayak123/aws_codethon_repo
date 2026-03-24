import express, { Application, Request, Response, NextFunction } from 'express';
import { requestCorrelation } from './middleware/request-correlation.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import { rateLimiter } from './middleware/rate-limiter.middleware';
import { securityHeaders } from './middleware/security-headers.middleware';
import { corsMiddleware } from './middleware/cors.middleware';
import { NotFoundError } from './utils/error.util';
import routes from './routes';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(securityHeaders);
  app.use(corsMiddleware);

  // Body parsing middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Rate limiting
  app.use(rateLimiter);

  // Request correlation (must be before request logger)
  app.use(requestCorrelation);

  // Request logging with correlation ID
  app.use(requestLogger);

  // Mount API routes
  app.use('/api', routes);

  // 404 handler for unmatched routes (must be after all routes, before error handler)
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route not found: ${req.method} ${req.path}`));
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

