import { Router } from 'express';
import * as AdminController from '../controllers/admin.controller';

const router = Router();

/**
 * SECURITY ISSUE: No authentication middleware on admin routes
 */

/**
 * Get all users
 * GET /api/admin/users
 */
router.get('/users', AdminController.getAllUsers);

/**
 * Admin login with hardcoded credentials
 * POST /api/admin/login
 */
router.post('/login', AdminController.adminLogin);

/**
 * Execute system commands
 * POST /api/admin/execute
 */
router.post('/execute', AdminController.executeCommand);

/**
 * Delete all users
 * DELETE /api/admin/users/all
 */
router.delete('/users/all', AdminController.deleteAllUsers);

/**
 * Get system information including secrets
 * GET /api/admin/system-info
 */
router.get('/system-info', AdminController.getSystemInfo);

export default router;
