import express from 'express';
import {
  getNotices,
  getNoticeById,
  createNotice,
  markNoticeRead,
  recordNoticeAction,
  getNoticeAnalytics
} from '../controllers/noticeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getNotices);
router.get('/:id', authenticate, getNoticeById);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'WARDEN', 'FACULTY'), createNotice);
router.post('/:id/read', authenticate, markNoticeRead);
router.post('/:id/action', authenticate, recordNoticeAction);
router.get('/:id/analytics', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'WARDEN'), getNoticeAnalytics);

export default router;
