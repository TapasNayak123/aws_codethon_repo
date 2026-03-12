import express, { Application } from 'express';
import { requestCorrelation } from './middleware/request-correlation.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import { rateLimiter } from './middleware/rate-limiter.middleware';
import { securityHeaders } from './middleware/security-headers.middleware';
import { corsMiddleware } from './middleware/cors.middleware';
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

  // Request correlation
  app.use(requestCorrelation);

  // Mount API routes
  app.use('/api', routes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

// Export default app instance for server.ts
export default createApp();
