import winston from 'winston';
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

export const logger = winston.createLogger({
  level: config.logging.level,
  format: config.nodeEnv === 'production' ? logFormat : devFormat,
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
  exitOnError: false,
});
