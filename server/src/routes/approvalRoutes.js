import express from 'express';
import {
  getApprovals,
  getRequestById,
  decideApproval
} from '../controllers/requestController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/pending', authenticate, authorize('WARDEN', 'ADMIN', 'SUPER_ADMIN', 'ACCOUNTS'), getApprovals);
router.get('/', authenticate, authorize('WARDEN', 'ADMIN', 'SUPER_ADMIN', 'ACCOUNTS'), getApprovals);
router.get('/:id', authenticate, authorize('WARDEN', 'ADMIN', 'SUPER_ADMIN', 'ACCOUNTS'), getRequestById);
router.post('/:id/approve', authenticate, authorize('WARDEN', 'ADMIN', 'SUPER_ADMIN', 'ACCOUNTS'), (req, res) => {
  req.body.decision = 'APPROVE';
  return decideApproval(req, res);
});
router.post('/:id/reject', authenticate, authorize('WARDEN', 'ADMIN', 'SUPER_ADMIN', 'ACCOUNTS'), (req, res) => {
  req.body.decision = 'REJECT';
  return decideApproval(req, res);
});
router.post('/:id/request-information', authenticate, authorize('WARDEN', 'ADMIN', 'SUPER_ADMIN', 'ACCOUNTS'), (req, res) => {
  req.body.decision = 'REQUEST_INFO';
  return decideApproval(req, res);
});

export default router;
