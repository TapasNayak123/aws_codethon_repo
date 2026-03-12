import { createApp } from './app';
import { config } from './config/env.config';
import { logger } from './utils/logger';
import { initializeDynamoDB } from './config/dynamodb-init';

/**
 * Start HTTP server
 */
async function startServer(): Promise<void> {
  try {
    // Initialize DynamoDB tables (creates if they don't exist)
    await initializeDynamoDB();

    const app = createApp();
    const port = config.port;

    app.listen(port, () => {
      logger.info('Server started successfully', {
        port,
        environment: config.nodeEnv,
      });
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`\n🔗 API Endpoints:`);
      console.log(`\n   Authentication:`);
      console.log(`   POST http://localhost:${port}/api/auth/register`);
      console.log(`   POST http://localhost:${port}/api/auth/login`);
      console.log(`\n   Products (requires JWT token):`);
      console.log(`   POST http://localhost:${port}/api/products`);
      console.log(`   GET  http://localhost:${port}/api/products`);
      console.log(`   GET  http://localhost:${port}/api/products/:productId`);
      console.log(`\n   Health Check:`);
      console.log(`   GET  http://localhost:${port}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
