import express from 'express';
import {
  getAccountsDashboard,
  getTransactions,
  getIncome,
  getExpenses,
  getBalance,
  createExpense,
  updateExpense,
  getReports,
  getMonthlyReports,
  getYearlyReports,
  createReconciliation,
  getReconciliationHistory
} from '../controllers/accountsController.js';
import { authenticate, requireRole, requirePermission } from '../middleware/auth.js';
import { validate } from '../validators/index.js';
import {
  createExpenseValidator,
  updateExpenseValidator,
  createReconciliationValidator
} from '../validators/roleValidators.js';

const router = express.Router();

router.use(authenticate);

// ==========================================
// Dashboard
// ==========================================
router.get('/dashboard', requireRole('ACCOUNTS', 'ACCOUNTANT', 'SUPER_ADMIN'), getAccountsDashboard);
router.get('/overview', requireRole('ACCOUNTS', 'ACCOUNTANT', 'SUPER_ADMIN'), getAccountsDashboard);

// ==========================================
// Financial Overview & Balances
// ==========================================
router.get('/transactions', requirePermission('PAYMENT_READ_ALL'), getTransactions);
router.get('/payments', requirePermission('PAYMENT_READ_ALL'), getTransactions);
router.get('/income', requirePermission('FINANCIAL_REPORT_READ'), getIncome);
router.get('/balance', requirePermission('FINANCIAL_REPORT_READ'), getBalance);

// ==========================================
// Expense Management
// ==========================================
router.get('/expenses', requirePermission('EXPENSE_READ_ALL'), getExpenses);
router.post('/expenses', requirePermission('EXPENSE_CREATE'), validate(createExpenseValidator), createExpense);
router.patch('/expenses/:id', requirePermission('EXPENSE_UPDATE'), validate(updateExpenseValidator), updateExpense);

// ==========================================
// Financial Reports
// ==========================================
router.get('/reports', requirePermission('FINANCIAL_REPORT_READ'), getReports);
router.get('/reports/monthly', requirePermission('FINANCIAL_REPORT_READ'), getMonthlyReports);
router.get('/reports/yearly', requirePermission('FINANCIAL_REPORT_READ'), getYearlyReports);

// ==========================================
// Reconciliation
// ==========================================
router.post('/reconciliation', requirePermission('RECONCILIATION_CREATE'), validate(createReconciliationValidator), createReconciliation);
router.get('/reconciliation', requirePermission('RECONCILIATION_READ'), getReconciliationHistory);
router.get('/reconciliations', requirePermission('RECONCILIATION_READ'), getReconciliationHistory);

export default router;
