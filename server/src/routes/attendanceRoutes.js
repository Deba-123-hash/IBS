import express from 'express';
import { getMyAttendance, markBatchAttendance } from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getMyAttendance);
router.get('/me', authenticate, getMyAttendance);
router.get('/me/summary', authenticate, getMyAttendance);
router.get('/me/subjects', authenticate, getMyAttendance);
router.get('/me/history', authenticate, getMyAttendance);
router.get('/my-attendance', authenticate, getMyAttendance);
router.post('/batch', authenticate, authorize('FACULTY', 'ADMIN', 'SUPER_ADMIN'), markBatchAttendance);

export default router;
