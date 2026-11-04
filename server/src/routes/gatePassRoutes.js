import express from 'express';
import {
  getGatePasses,
  getGatePassById,
  createGatePass,
  decideGatePass,
  cancelGatePass
} from '../controllers/gatePassController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getGatePasses);
router.get('/me', authenticate, getGatePasses);
router.get('/:id', authenticate, getGatePassById);
router.post('/', authenticate, createGatePass);
router.patch('/:id/cancel', authenticate, cancelGatePass);
router.patch('/:id/decision', authenticate, authorize('WARDEN', 'ADMIN', 'SUPER_ADMIN'), decideGatePass);
router.post('/:id/decision', authenticate, authorize('WARDEN', 'ADMIN', 'SUPER_ADMIN'), decideGatePass);
router.post('/:id/approve', authenticate, authorize('WARDEN', 'ADMIN', 'SUPER_ADMIN'), (req, res) => {
  req.body.decision = req.body.decision || 'APPROVED';
  return decideGatePass(req, res);
});
router.post('/:id/reject', authenticate, authorize('WARDEN', 'ADMIN', 'SUPER_ADMIN'), (req, res) => {
  req.body.decision = req.body.decision || 'REJECTED';
  return decideGatePass(req, res);
});

export default router;
