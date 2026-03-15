import { Router } from 'express';
import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import productRoutes from './product.routes';
import logsRoutes from './logs.routes';
import favouriteRoutes from './favourite.routes';

const router = Router();

/**
 * Mount route modules
 */
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/products', productRoutes);
router.use('/logs', logsRoutes);
router.use('/favourites', favouriteRoutes);

export default router;
