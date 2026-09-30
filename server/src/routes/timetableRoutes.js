import express from 'express';
import { getMyTimetable } from '../controllers/timetableController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-schedule', authenticate, getMyTimetable);

export default router;
