import express from 'express';
import { getOverview } from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/overview', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getOverview);

export default router;
