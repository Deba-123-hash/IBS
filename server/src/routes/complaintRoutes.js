import express from 'express';
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  cancelComplaint,
  addComment
} from '../controllers/complaintController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getComplaints);
router.get('/me', authenticate, getComplaints);
router.get('/:id', authenticate, getComplaintById);
router.post('/', authenticate, createComplaint);
router.patch('/:id/status', authenticate, updateComplaintStatus);
router.patch('/:id/cancel', authenticate, cancelComplaint);
router.post('/:id/comments', authenticate, addComment);

export default router;
