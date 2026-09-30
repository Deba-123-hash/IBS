import express from 'express';
import {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  getAuditLogs
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/users', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getUsers);
router.get('/users/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getUserById);
router.patch('/users/:id/status', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updateUserStatus);
router.patch('/users/:id/role', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updateUserRole);
router.get('/audit-logs', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getAuditLogs);

export default router;
