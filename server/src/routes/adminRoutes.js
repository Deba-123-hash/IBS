import express from 'express';
import {
  getAdminDashboard,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  getStudents,
  getStudentById,
  updateStudent,
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  publishNotice,
  getAuditLogs
} from '../controllers/adminController.js';
import { getOverview } from '../controllers/analyticsController.js';
import { authenticate, requireRole, requirePermission } from '../middleware/auth.js';
import { validate } from '../validators/index.js';
import {
  createUserValidator,
  updateUserValidator,
  updateUserStatusValidator,
  updateUserRoleValidator,
  updateStudentValidator,
  createNoticeValidator,
  updateNoticeValidator
} from '../validators/roleValidators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ==========================================
// Dashboard & Analytics
// ==========================================
router.get('/dashboard', requireRole('ADMIN', 'SUPER_ADMIN'), getAdminDashboard);
// Backward compatibility with previous frontend endpoints
router.get('/overview', requireRole('ADMIN', 'SUPER_ADMIN'), getOverview);
router.get('/dashboard-stats', requireRole('ADMIN', 'SUPER_ADMIN'), getOverview);

// ==========================================
// User Management
// ==========================================
router.get('/users', requirePermission('USER_READ_ALL'), getUsers);
router.get('/users/:id', requirePermission('USER_READ_ALL'), getUserById);
router.post('/users', requirePermission('USER_CREATE'), validate(createUserValidator), createUser);
router.patch('/users/:id', requirePermission('USER_UPDATE'), validate(updateUserValidator), updateUser);
router.delete('/users/:id', requirePermission('USER_DEACTIVATE'), deleteUser);
router.patch('/users/:id/status', requirePermission('USER_DEACTIVATE'), validate(updateUserStatusValidator), updateUserStatus);
router.patch('/users/:id/role', requireRole('SUPER_ADMIN'), validate(updateUserRoleValidator), updateUserRole);

// ==========================================
// Student Management
// ==========================================
router.get('/students', requirePermission('STUDENT_READ_ALL'), getStudents);
router.get('/students/:id', requirePermission('STUDENT_READ_ALL'), getStudentById);
router.patch('/students/:id', requirePermission('STUDENT_UPDATE'), validate(updateStudentValidator), updateStudent);

// ==========================================
// Notice Management
// ==========================================
router.get('/notices', requirePermission('NOTICE_READ'), getNotices);
router.post('/notices', requirePermission('NOTICE_CREATE'), validate(createNoticeValidator), createNotice);
router.patch('/notices/:id', requirePermission('NOTICE_UPDATE'), validate(updateNoticeValidator), updateNotice);
router.delete('/notices/:id', requirePermission('NOTICE_DELETE'), deleteNotice);
router.post('/notices/:id/publish', requirePermission('NOTICE_CREATE'), publishNotice);

// ==========================================
// Immutable Audit Logs (SUPER_ADMIN & ADMIN only)
// ==========================================
router.get('/audit-logs', requirePermission('AUDIT_READ'), getAuditLogs);

export default router;
