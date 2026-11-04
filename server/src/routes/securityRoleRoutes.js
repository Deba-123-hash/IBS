import express from 'express';
import {
  getSecurityDashboard,
  recordGateEntry,
  recordGateExit,
  getGateLogs,
  registerVisitor,
  getVisitors,
  getVisitorById,
  updateVisitorStatus,
  createEmergency,
  getEmergencies,
  resolveEmergency
} from '../controllers/securityRoleController.js';
import { verifyQrGatePass, getSecurityLogs } from '../controllers/securityController.js';
import { authenticate, requireRole, requirePermission } from '../middleware/auth.js';
import { validate } from '../validators/index.js';
import {
  gateEntryValidator,
  gateExitValidator,
  createVisitorValidator,
  updateVisitorStatusValidator,
  emergencyValidator,
  resolveEmergencyValidator
} from '../validators/roleValidators.js';

const router = express.Router();

router.use(authenticate);

// ==========================================
// Dashboard
// ==========================================
router.get('/dashboard', requireRole('SECURITY', 'ADMIN', 'SUPER_ADMIN'), getSecurityDashboard);

// ==========================================
// Gate Entry & Exit (Append-only)
// ==========================================
router.post('/gate/entry', requirePermission('GATE_ENTRY'), validate(gateEntryValidator), recordGateEntry);
router.post('/gate/exit', requirePermission('GATE_EXIT'), validate(gateExitValidator), recordGateExit);
router.get('/gate/logs', requirePermission('GATE_LOG_READ'), getGateLogs);
router.get('/gate-logs', requirePermission('GATE_LOG_READ'), getGateLogs);

// ==========================================
// Visitor Management
// ==========================================
router.post('/visitors', requirePermission('VISITOR_CREATE'), validate(createVisitorValidator), registerVisitor);
router.get('/visitors', requirePermission('VISITOR_READ_ALL'), getVisitors);
router.get('/visitors/:id', requirePermission('VISITOR_READ_ALL'), getVisitorById);
router.patch('/visitors/:id/status', requirePermission('VISITOR_APPROVE'), validate(updateVisitorStatusValidator), updateVisitorStatus);

// ==========================================
// Emergency Incidents
// ==========================================
router.post('/emergency', requirePermission('EMERGENCY_CREATE'), validate(emergencyValidator), createEmergency);
router.get('/emergency', requirePermission('EMERGENCY_READ'), getEmergencies);
router.get('/emergencies', requirePermission('EMERGENCY_READ'), getEmergencies);
router.patch('/emergency/:id/resolve', requirePermission('EMERGENCY_RESOLVE'), validate(resolveEmergencyValidator), resolveEmergency);

// ==========================================
// Backward Compatibility Endpoints
// ==========================================
router.post('/verify-qr', requirePermission('GATE_ENTRY'), verifyQrGatePass);
router.post('/verify-pass', requirePermission('GATE_ENTRY'), verifyQrGatePass);
router.post('/verify', requirePermission('GATE_ENTRY'), verifyQrGatePass);
router.get('/logs', requirePermission('GATE_LOG_READ'), getSecurityLogs);

export default router;
