import express from 'express';
import {
  createLeaveRequest,
  getMyLeaves,
  getLeaveById,
  cancelLeaveRequest
} from '../controllers/leaveController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createLeaveRequest);
router.get('/', authenticate, getMyLeaves);
router.get('/me', authenticate, getMyLeaves);
router.get('/:id', authenticate, getLeaveById);
router.patch('/:id/cancel', authenticate, cancelLeaveRequest);

export default router;
