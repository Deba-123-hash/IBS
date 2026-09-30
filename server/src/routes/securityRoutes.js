import express from 'express';
import { verifyQrGatePass, getSecurityLogs } from '../controllers/securityController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/verify-qr', authenticate, authorize('SECURITY', 'ADMIN', 'SUPER_ADMIN'), verifyQrGatePass);
router.post('/verify-pass', authenticate, authorize('SECURITY', 'ADMIN', 'SUPER_ADMIN'), verifyQrGatePass);
router.post('/verify', authenticate, authorize('SECURITY', 'ADMIN', 'SUPER_ADMIN'), verifyQrGatePass);
router.get('/logs', authenticate, authorize('SECURITY', 'ADMIN', 'SUPER_ADMIN'), getSecurityLogs);

export default router;
