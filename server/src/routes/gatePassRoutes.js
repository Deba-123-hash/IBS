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

export default router;
