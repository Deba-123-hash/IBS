import express from 'express';
import {
  getRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  assignRequest,
  cancelRequest,
  addRequestComment,
  getApprovals,
  decideApproval,
  getWorkQueue
} from '../controllers/requestController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Universal Request Endpoints
router.get('/', authenticate, getRequests);
router.post('/', authenticate, createRequest);
router.get('/pending-approvals', authenticate, authorize('WARDEN', 'ADMIN', 'SUPER_ADMIN', 'ACCOUNTS'), getApprovals);
router.get('/work-queue', authenticate, getWorkQueue);
router.get('/:id', authenticate, getRequestById);
router.patch('/:id/status', authenticate, updateRequestStatus);
router.patch('/:id/assign', authenticate, authorize('WARDEN', 'ADMIN', 'SUPER_ADMIN', 'MAINTENANCE'), assignRequest);
router.patch('/:id/cancel', authenticate, cancelRequest);
router.post('/:id/comments', authenticate, addRequestComment);
router.post('/:id/decision', authenticate, authorize('WARDEN', 'ADMIN', 'SUPER_ADMIN', 'ACCOUNTS'), decideApproval);

export default router;
