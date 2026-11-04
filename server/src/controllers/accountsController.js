import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createAuditLog } from '../utils/auditLogger.js';
import { parsePaginationQuery, paginatedResponse } from '../utils/pagination.js';

// ====================================================================
// 1. ACCOUNTS DASHBOARD
// ====================================================================
export const getAccountsDashboard = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      incomeAggregate,
      expenseAggregate,
      pendingExpensesCount,
      recentReconciliations,
      recentExpenses,
      recentPayments
    ] = await Promise.all([
      // Income = Verified payments
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
      }),
      // Expenses
      prisma.expense.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true }
      }),
      prisma.expense.count({ where: { status: 'PENDING' } }),
      prisma.reconciliation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.expense.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { firstName: true, lastName: true } } }
      }),
      prisma.payment.findMany({
        where: { status: 'SUCCESS' },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const totalIncome = incomeAggregate._sum?.amount || 0;
    const totalExpenses = expenseAggregate._sum?.amount || 0;
    const currentBalance = totalIncome - totalExpenses;

    return successResponse(res, {
      totalIncome,
      totalExpenses,
      currentBalance,
      pendingExpensesCount,
      recentReconciliations,
      recentExpenses: recentExpenses.map(e => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        category: e.category,
        vendor: e.vendorName || 'N/A',
        status: e.status,
        date: e.expenseDate
      })),
      recentTransactions: recentPayments.map(p => ({
        id: p.id,
        receiptNumber: p.receiptNumber,
        amount: p.amount,
        category: p.feeCategory,
        status: p.status,
        date: p.createdAt
      }))
    }, 'Accounts financial overview retrieved');
  } catch (error) {
    console.error('[Accounts Dashboard Error]:', error);
    return errorResponse(res, 'Failed to fetch accounts dashboard', 'ACCOUNTS_DASHBOARD_ERROR', 500);
  }
};

// ====================================================================
// 2. FINANCIAL OVERVIEW, INCOME, EXPENSES & BALANCE
// ====================================================================
export const getTransactions = async (req, res) => {
  try {
    const { page, limit, skip, search, sortOrder, status } = parsePaginationQuery(req.query, 20);

    const whereClause = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { receiptNumber: { contains: search, mode: 'insensitive' } },
          { transactionRef: { contains: search, mode: 'insensitive' } },
          { student: { rollNumber: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    const [transactions, total] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          student: {
            include: { user: { select: { firstName: true, lastName: true } } }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder }
      }),
      prisma.payment.count({ where: whereClause })
    ]);

    return paginatedResponse(res, {
      data: transactions,
      total,
      page,
      limit,
      message: 'Financial transactions retrieved'
    });
  } catch (error) {
    console.error('[Accounts getTransactions Error]:', error);
    return errorResponse(res, 'Failed to fetch financial transactions', 'TRANSACTIONS_ERROR', 500);
  }
};

export const getIncome = async (req, res) => {
  try {
    const [byCategory, total] = await Promise.all([
      prisma.payment.groupBy({
        by: ['feeCategory'],
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
        _count: { id: true }
      })
    ]);

    return successResponse(res, {
      totalIncome: total._sum?.amount || 0,
      totalTransactions: total._count?.id || 0,
      breakdown: byCategory.map(b => ({
        category: b.feeCategory,
        amount: b._sum.amount,
        count: b._count.id
      }))
    }, 'Income breakdown retrieved');
  } catch (error) {
    console.error('[Accounts getIncome Error]:', error);
    return errorResponse(res, 'Failed to fetch income data', 'INCOME_FETCH_ERROR', 500);
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { page, limit, skip, search, sortOrder, sortBy } = parsePaginationQuery(req.query, 20);
    const { category, status } = req.query;

    const whereClause = {
      ...(category && { category }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { vendorName: { contains: search, mode: 'insensitive' } },
          { invoiceNumber: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where: whereClause,
        include: {
          createdBy: { select: { firstName: true, lastName: true, email: true } },
          approvedBy: { select: { firstName: true, lastName: true } }
        },
        skip,
        take: limit,
        orderBy: { [sortBy === 'name' ? 'createdAt' : sortBy]: sortOrder }
      }),
      prisma.expense.count({ where: whereClause })
    ]);

    return paginatedResponse(res, {
      data: expenses,
      total,
      page,
      limit,
      message: 'Expenses retrieved'
    });
  } catch (error) {
    console.error('[Accounts getExpenses Error]:', error);
    return errorResponse(res, 'Failed to fetch expenses', 'EXPENSES_FETCH_ERROR', 500);
  }
};

export const getBalance = async (req, res) => {
  try {
    const [income, expense] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true }
      })
    ]);

    const totalIncome = income._sum?.amount || 0;
    const totalExpenses = expense._sum?.amount || 0;
    const netBalance = totalIncome - totalExpenses;

    return successResponse(res, {
      totalIncome,
      totalExpenses,
      netBalance,
      currency: 'INR',
      status: netBalance >= 0 ? 'SURPLUS' : 'DEFICIT'
    }, 'Campus financial balance calculated');
  } catch (error) {
    console.error('[Accounts getBalance Error]:', error);
    return errorResponse(res, 'Failed to calculate balance', 'BALANCE_ERROR', 500);
  }
};

// ====================================================================
// 3. EXPENSE MANAGEMENT
// ====================================================================
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, description, invoiceNumber, vendorName, expenseDate } = req.body;
    const createdById = req.user?.id;

    const newExpense = await prisma.expense.create({
      data: {
        title,
        amount,
        category,
        description,
        invoiceNumber,
        vendorName,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        createdById,
        status: 'APPROVED'
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'EXPENSE_CREATED',
      entity: 'Expense',
      entityId: newExpense.id,
      newData: { title, amount, category, vendorName },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, newExpense, 'Expense recorded successfully', 201);
  } catch (error) {
    console.error('[Accounts createExpense Error]:', error);
    return errorResponse(res, 'Failed to record expense', 'EXPENSE_CREATE_ERROR', 500);
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, description, invoiceNumber, vendorName, status } = req.body;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Expense record not found', 'EXPENSE_NOT_FOUND', 404);
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(amount !== undefined && { amount }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(invoiceNumber !== undefined && { invoiceNumber }),
        ...(vendorName !== undefined && { vendorName }),
        ...(status && { status })
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'EXPENSE_UPDATED',
      entity: 'Expense',
      entityId: id,
      oldData: { amount: existing.amount, status: existing.status },
      newData: { amount: updated.amount, status: updated.status },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, updated, 'Expense updated successfully');
  } catch (error) {
    console.error('[Accounts updateExpense Error]:', error);
    return errorResponse(res, 'Failed to update expense', 'EXPENSE_UPDATE_ERROR', 500);
  }
};

// ====================================================================
// 4. FINANCIAL REPORTS (MONTHLY & YEARLY)
// ====================================================================
export const getReports = async (req, res) => {
  try {
    const [income, expenses, fees] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.expense.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.feeRecord.aggregate({
        _sum: { totalAmount: true, dueAmount: true }
      })
    ]);

    const totalIncome = income._sum?.amount || 0;
    const totalExpenses = expenses._sum?.amount || 0;

    return successResponse(res, {
      totalIncome,
      totalExpenses,
      netReserve: totalIncome - totalExpenses,
      totalInvoicedFees: fees._sum?.totalAmount || 0,
      totalOutstandingDues: fees._sum?.dueAmount || 0,
      collectionEfficiency: fees._sum?.totalAmount > 0
        ? Math.round(((fees._sum.totalAmount - fees._sum.dueAmount) / fees._sum.totalAmount) * 100)
        : 100
    }, 'Financial audit report generated');
  } catch (error) {
    console.error('[Accounts getReports Error]:', error);
    return errorResponse(res, 'Failed to generate financial reports', 'REPORTS_ERROR', 500);
  }
};

export const getMonthlyReports = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
      income: 0,
      expenses: 0,
      net: 0
    }));

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const [payments, expenses] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: 'SUCCESS',
          createdAt: { gte: startDate, lte: endDate }
        },
        select: { amount: true, createdAt: true }
      }),
      prisma.expense.findMany({
        where: {
          status: 'APPROVED',
          expenseDate: { gte: startDate, lte: endDate }
        },
        select: { amount: true, expenseDate: true }
      })
    ]);

    payments.forEach(p => {
      const m = new Date(p.createdAt).getMonth();
      months[m].income += p.amount;
    });

    expenses.forEach(e => {
      const m = new Date(e.expenseDate).getMonth();
      months[m].expenses += e.amount;
    });

    months.forEach(m => {
      m.net = m.income - m.expenses;
    });

    return successResponse(res, {
      year,
      monthlyBreakdown: months,
      annualIncome: months.reduce((sum, m) => sum + m.income, 0),
      annualExpenses: months.reduce((sum, m) => sum + m.expenses, 0)
    }, `Monthly financial report for ${year} generated`);
  } catch (error) {
    console.error('[Accounts getMonthlyReports Error]:', error);
    return errorResponse(res, 'Failed to generate monthly reports', 'MONTHLY_REPORTS_ERROR', 500);
  }
};

export const getYearlyReports = async (req, res) => {
  try {
    const [payments, expenses] = await Promise.all([
      prisma.payment.findMany({
        where: { status: 'SUCCESS' },
        select: { amount: true, createdAt: true }
      }),
      prisma.expense.findMany({
        where: { status: 'APPROVED' },
        select: { amount: true, expenseDate: true }
      })
    ]);

    const yearlyMap = {};

    payments.forEach(p => {
      const yr = new Date(p.createdAt).getFullYear();
      if (!yearlyMap[yr]) yearlyMap[yr] = { year: yr, income: 0, expenses: 0, net: 0 };
      yearlyMap[yr].income += p.amount;
    });

    expenses.forEach(e => {
      const yr = new Date(e.expenseDate).getFullYear();
      if (!yearlyMap[yr]) yearlyMap[yr] = { year: yr, income: 0, expenses: 0, net: 0 };
      yearlyMap[yr].expenses += e.amount;
    });

    const yearlyReports = Object.values(yearlyMap)
      .map(y => ({ ...y, net: y.income - y.expenses }))
      .sort((a, b) => b.year - a.year);

    return successResponse(res, {
      yearlyReports
    }, 'Multi-year financial trend report generated');
  } catch (error) {
    console.error('[Accounts getYearlyReports Error]:', error);
    return errorResponse(res, 'Failed to generate yearly reports', 'YEARLY_REPORTS_ERROR', 500);
  }
};

// ====================================================================
// 5. TRANSACTION RECONCILIATION
// ====================================================================
export const createReconciliation = async (req, res) => {
  try {
    const { periodStart, periodEnd, actualBalance, notes } = req.body;
    const performedById = req.user?.id;

    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    // Sum income and expenses for the specified period
    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESS',
          createdAt: { gte: start, lte: end }
        },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: {
          status: 'APPROVED',
          expenseDate: { gte: start, lte: end }
        },
        _sum: { amount: true }
      })
    ]);

    const totalIncome = incomeAgg._sum?.amount || 0;
    const totalExpenses = expenseAgg._sum?.amount || 0;
    const systemBalance = totalIncome - totalExpenses;
    const discrepancy = actualBalance - systemBalance;
    const status = Math.abs(discrepancy) < 0.01 ? 'RECONCILED' : 'DISCREPANCY';

    const reconciliation = await prisma.reconciliation.create({
      data: {
        periodStart: start,
        periodEnd: end,
        totalIncome,
        totalExpenses,
        systemBalance,
        actualBalance,
        discrepancy,
        status,
        notes,
        performedById
      },
      include: {
        performedBy: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'RECONCILIATION_COMPLETED',
      entity: 'Reconciliation',
      entityId: reconciliation.id,
      newData: { systemBalance, actualBalance, discrepancy, status },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, reconciliation, 'Reconciliation audit completed successfully', 201);
  } catch (error) {
    console.error('[Accounts createReconciliation Error]:', error);
    return errorResponse(res, 'Failed to complete reconciliation', 'RECONCILIATION_ERROR', 500);
  }
};

export const getReconciliationHistory = async (req, res) => {
  try {
    const { page, limit, skip, sortOrder } = parsePaginationQuery(req.query, 20);

    const [records, total] = await Promise.all([
      prisma.reconciliation.findMany({
        include: {
          performedBy: { select: { firstName: true, lastName: true, email: true } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder }
      }),
      prisma.reconciliation.count()
    ]);

    return paginatedResponse(res, {
      data: records,
      total,
      page,
      limit,
      message: 'Reconciliation log retrieved'
    });
  } catch (error) {
    console.error('[Accounts getReconciliationHistory Error]:', error);
    return errorResponse(res, 'Failed to fetch reconciliation history', 'RECONCILIATION_FETCH_ERROR', 500);
  }
};

export default {
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
};
