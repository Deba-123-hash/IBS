import express from 'express';
import { getDashboardSummary, getStudentProfile } from '../controllers/studentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/me/dashboard', authenticate, getDashboardSummary);
router.get('/dashboard-summary', authenticate, getDashboardSummary);
router.get('/profile', authenticate, getStudentProfile);

export default router;
