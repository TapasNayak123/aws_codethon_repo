import { Request, Response, NextFunction } from 'express';
import * as RequestLogService from '../services/request-log.service';
import { successResponse } from '../utils/response-formatter';

/**
 * Get recent request logs with optional filtering
 * GET /api/logs
 */
export async function getRequestLogs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const logs = RequestLogService.getLogs({
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      method: req.query.method as string | undefined,
      status: req.query.status as 'success' | 'error' | undefined,
      path: req.query.path as string | undefined,
      since: req.query.since as string | undefined,
    });

    const requestId = (req as any).requestId;

    res.status(200).json(
      successResponse(`Retrieved ${logs.length} log entries`, { logs, count: logs.length }, requestId)
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get request statistics dashboard
 * GET /api/logs/stats
 */
export async function getRequestStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = RequestLogService.getStats();
    const requestId = (req as any).requestId;

    res.status(200).json(
      successResponse('Request statistics retrieved', stats, requestId)
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Clear all request logs
 * DELETE /api/logs
 */
export async function clearRequestLogs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    RequestLogService.clearLogs();
    const requestId = (req as any).requestId;

    res.status(200).json(
      successResponse('All request logs cleared', null, requestId)
    );
  } catch (error) {
    next(error);
  }
}
