import cors from 'cors';
import { config } from '../config/env.config';

/**
 * CORS middleware configuration
 * Production: restricted to configured origins
 * Development: allows all origins
 */
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

export const corsMiddleware = cors({
  origin: config.nodeEnv === 'production' && allowedOrigins.length > 0
    ? allowedOrigins
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
});
