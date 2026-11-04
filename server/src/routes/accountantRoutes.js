import express from 'express';
import {
  getAccountantDashboard,
  getFees,
  createFee,
  getFeeById,
  updateFee,
  getStudentFees,
  getStudentDues,
  getPayments,
  createPayment,
  getPaymentById,
  verifyPayment,
  rejectPayment,
  getPaymentReceipt
} from '../controllers/accountantController.js';
import { authenticate, requireRole, requirePermission } from '../middleware/auth.js';
import { validate } from '../validators/index.js';
import {
  createFeeValidator,
  updateFeeValidator,
  createPaymentValidator,
  rejectPaymentValidator
} from '../validators/roleValidators.js';

const router = express.Router();

router.use(authenticate);

// ==========================================
// Dashboard
// ==========================================
router.get('/dashboard', requireRole('ACCOUNTANT', 'ACCOUNTS', 'SUPER_ADMIN'), getAccountantDashboard);

// ==========================================
// Fee Management
// ==========================================
router.get('/fees', requirePermission('FEES_READ_ALL'), getFees);
router.post('/fees', requirePermission('FEES_CREATE'), validate(createFeeValidator), createFee);
router.get('/fees/:id', requirePermission('FEES_READ_ALL'), getFeeById);
router.patch('/fees/:id', requirePermission('FEES_UPDATE'), validate(updateFeeValidator), updateFee);

// ==========================================
// Student Fee Records
// ==========================================
router.get('/students/:studentId/fees', requirePermission('FEES_READ_ALL'), getStudentFees);
router.get('/students/:studentId/dues', requirePermission('FEES_READ_ALL'), getStudentDues);

// ==========================================
// Payment Management
// ==========================================
router.get('/payments', requirePermission('PAYMENT_READ_ALL'), getPayments);
router.post('/payments', requirePermission('PAYMENT_CREATE'), validate(createPaymentValidator), createPayment);
router.get('/payments/:id', requirePermission('PAYMENT_READ_ALL'), getPaymentById);
router.post('/payments/:id/verify', requirePermission('PAYMENT_VERIFY'), verifyPayment);
router.post('/payments/:id/reject', requirePermission('PAYMENT_REJECT'), validate(rejectPaymentValidator), rejectPayment);

// ==========================================
// Receipt Generation
// ==========================================
router.get('/payments/:id/receipt', requirePermission('PAYMENT_READ_ALL'), getPaymentReceipt);

export default router;
