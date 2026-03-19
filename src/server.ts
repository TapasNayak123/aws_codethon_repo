import { createApp } from './app';
import { config } from './config/env.config';
import { logger } from './utils/logger';
import { initializeDynamoDB } from './config/dynamodb-init';
import http from 'http';

/**
 * Start HTTP server
 */
async function startServer(): Promise<void> {
  try {
    // Initialize DynamoDB tables (creates if they don't exist)
    await initializeDynamoDB();

    const app = createApp();
    const port = config.port;

    const server = http.createServer(app);

    server.listen(port, () => {
      logger.info('Server started successfully', {
        port,
        environment: config.nodeEnv,
      });

      if (config.nodeEnv !== 'production') {
        console.log(`\n🚀 Server running on port ${port} [${config.nodeEnv}]`);
        console.log(`\n🔗 API Endpoints:`);
        console.log(`   POST http://localhost:${port}/api/auth/register`);
        console.log(`   POST http://localhost:${port}/api/auth/login`);
        console.log(`   POST http://localhost:${port}/api/products`);
        console.log(`   GET  http://localhost:${port}/api/products`);
        console.log(`   GET  http://localhost:${port}/api/products/:productId`);
        console.log(`   GET  http://localhost:${port}/api/health\n`);
      }
    });

    // Graceful shutdown for clean K8s pod termination
    const shutdown = (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      // Force exit after 10s if connections don't close
      setTimeout(() => {
        logger.warn('Forcing shutdown after timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

startServer();
