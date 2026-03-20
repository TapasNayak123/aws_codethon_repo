import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
import { config } from './env.config';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message, ...meta }) =>
      `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`
  )
);

// Base transports (always include console)
const transports: winston.transport[] = [
  new winston.transports.Console({
    stderrLevels: ['error'],
  }),
];

// Add CloudWatch transport in production
if (config.nodeEnv === 'production' && process.env.AWS_REGION) {
  try {
    const cloudWatchConfig = {
      logGroupName: process.env.CLOUDWATCH_LOG_GROUP || '/aws/eks/auth-api',
      logStreamName: `${process.env.CLOUDWATCH_LOG_STREAM || 'application'}-${new Date().toISOString().split('T')[0]}`,
      awsRegion: process.env.AWS_REGION,
      jsonMessage: true,
      // Reduce batching delays for faster log delivery
      uploadRate: 500,        // Upload every 500ms (default: 2000ms)
      messageFormatter: (logObject: any) => {
        // Format log message for CloudWatch
        return JSON.stringify({
          timestamp: logObject.timestamp,
          level: logObject.level,
          message: logObject.message,
          ...logObject.meta,
        });
      },
      // Add error handling for CloudWatch failures
      errorHandler: (error: Error) => {
        console.error('CloudWatch logging error:', error.message);
        // Don't crash the application if CloudWatch fails
      },
    };

    const cloudWatchTransport = new WinstonCloudWatch(cloudWatchConfig);
    
    // Handle CloudWatch transport errors gracefully
    cloudWatchTransport.on('error', (error: Error) => {
      console.error('CloudWatch transport error:', error.message);
    });

    transports.push(cloudWatchTransport);
    console.log('✅ CloudWatch logging enabled');
  } catch (error) {
    console.error('Failed to initialize CloudWatch transport:', error);
    console.log('⚠️  Continuing with console logging only');
    // Application continues with console logging
  }
}

/**
 * Winston logger instance configured for the application
 * 
 * Log Levels (in order of priority):
 * - error: Error events that might still allow the application to continue
 * - warn: Warning messages for potentially harmful situations
 * - info: Informational messages highlighting application progress
 * - http: HTTP request logging (if enabled)
 * - debug: Detailed information for debugging purposes
 * 
 * Environment-specific behavior:
 * - Development: Colorized console output with readable timestamps
 * - Production: JSON format with CloudWatch integration (if configured)
 */
export const logger = winston.createLogger({
  level: config.logging.level,
  format: config.nodeEnv === 'production' ? logFormat : devFormat,
  transports,
  exitOnError: false,
});

/**
 * Check if a specific log level is enabled
 * Useful for avoiding expensive log message construction when not needed
 * 
 * @param level - The log level to check ('error', 'warn', 'info', 'debug')
 * @returns true if the level is enabled, false otherwise
 * 
 * @example
 * if (isLogLevelEnabled('debug')) {
 *   logger.debug('Expensive debug info', computeExpensiveData());
 * }
 */
export function isLogLevelEnabled(level: string): boolean {
  return logger.isLevelEnabled(level);
}
