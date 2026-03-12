import { Request, Response, NextFunction } from 'express';
import { getHealthStatus } from '../services/health.service';

/**
 * Health check endpoint
 * Returns application health status
 */
export async function healthCheck(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const healthStatus = getHealthStatus();

    res.status(200).json(healthStatus);
  } catch (error) {
    next(error);
  }
}
