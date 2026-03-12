import cors from 'cors';

/**
 * CORS middleware configuration
 * Allows cross-origin requests from all origins (development-friendly)
 * Can be restricted per environment in production
 */
export const corsMiddleware = cors({
  origin: '*', // Allow all origins (can be restricted to specific domains)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
});
