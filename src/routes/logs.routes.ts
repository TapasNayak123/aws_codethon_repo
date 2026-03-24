import { Router } from 'express';
import * as LogsController from '../controllers/logs.controller';
import { authenticate } from '../middleware/authenticate.middleware';

const router = Router();

/**
 * GET /api/logs
 * Get recent request logs (requires authentication)
 * Query params: limit, method, status, path, since
 */
router.get('/', authenticate, LogsController.getRequestLogs);

/**
 * GET /api/logs/stats
 * Get request statistics dashboard (requires authentication)
 */
router.get('/stats', authenticate, LogsController.getRequestStats);

/**
 * DELETE /api/logs
 * Clear all request logs (requires authentication)
 */
router.delete('/', authenticate, LogsController.clearRequestLogs);

export default router;
