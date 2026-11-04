import express from 'express';
import { getMyTimetable } from '../controllers/timetableController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getMyTimetable);
router.get('/me', authenticate, getMyTimetable);
router.get('/my-schedule', authenticate, getMyTimetable);

export default router;
