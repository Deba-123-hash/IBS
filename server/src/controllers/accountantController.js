import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createAuditLog } from '../utils/auditLogger.js';
import { parsePaginationQuery, paginatedResponse } from '../utils/pagination.js';

// ====================================================================
// 1. ACCOUNTANT DASHBOARD
// ====================================================================
export const getAccountantDashboard = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    const [
      totalSuccessPayments,
      todayPayments,
      monthlyPayments,
      pendingPaymentsCount,
      overdueFeesCount,
      studentsWithDuesCount,
      recentPayments,
      allFeeTotals
    ] = await Promise.all([
      // Total collected
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
      }),
      // Today's collection
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESS',
          createdAt: { gte: todayStart }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      // Monthly collection
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESS',
          createdAt: { gte: firstDayOfMonth }
        },
        _sum: { amount: true }
      }),
      // Pending payments count
      prisma.payment.count({ where: { status: 'PENDING' } }),
      // Overdue fees count
      prisma.feeRecord.count({ where: { status: 'OVERDUE' } }),
      // Students with dues
      prisma.feeRecord.groupBy({
        by: ['studentId'],
        where: { dueAmount: { gt: 0 } }
      }),
      // Recent transactions
      prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: { user: { select: { firstName: true, lastName: true, email: true } } }
          }
        }
      }),
      // Fee totals across database
      prisma.feeRecord.aggregate({
        _sum: { totalAmount: true, dueAmount: true }
      })
    ]);

    const totalCollected = totalSuccessPayments._sum?.amount || 0;
    const todayCollection = todayPayments._sum?.amount || 0;
    const monthlyCollection = monthlyPayments._sum?.amount || 0;
    const outstandingFees = allFeeTotals._sum?.dueAmount || 0;

    const formattedRecentTransactions = recentPayments.map(p => ({
      id: p.id,
      receiptNumber: p.receiptNumber,
      transactionRef: p.transactionRef,
      studentName: p.student ? `${p.student.user.firstName} ${p.student.user.lastName}` : 'N/A',
      rollNumber: p.student?.rollNumber || 'N/A',
      amount: p.amount,
      feeCategory: p.feeCategory,
      paymentMode: p.paymentMode,
      status: p.status,
      date: p.createdAt
    }));

    return successResponse(res, {
      totalCollected,
      todayCollection,
      todayTransactionsCount: todayPayments._count?.id || 0,
      monthlyCollection,
      pendingFeesCount: pendingPaymentsCount,
      overdueFeesCount,
      totalStudentsWithDues: studentsWithDuesCount.length,
      outstandingFees,
      recentTransactions: formattedRecentTransactions,
      paymentStatistics: {
        totalCollected,
        monthlyCollection,
        pendingVerification: pendingPaymentsCount,
        overdueCount: overdueFeesCount
      }
    }, 'Accountant dashboard data retrieved');
  } catch (error) {
    console.error('[Accountant Dashboard Error]:', error);
    return errorResponse(res, 'Failed to fetch accountant dashboard telemetry', 'ACCOUNTANT_DASHBOARD_ERROR', 500);
  }
};

// ====================================================================
// 2. FEE MANAGEMENT
// ====================================================================
export const getFees = async (req, res) => {
  try {
    const { page, limit, skip, search, sortOrder, sortBy } = parsePaginationQuery(req.query, 20);
    const { status, academicYear, semester } = req.query;

    const whereClause = {
      ...(status && { status }),
      ...(academicYear && { academicYear }),
      ...(semester && { semester: Number(semester) }),
      ...(search && {
        OR: [
          { student: { rollNumber: { contains: search, mode: 'insensitive' } } },
          { student: { user: { firstName: { contains: search, mode: 'insensitive' } } } },
          { student: { user: { lastName: { contains: search, mode: 'insensitive' } } } }
        ]
      })
    };

    const [fees, total] = await Promise.all([
      prisma.feeRecord.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
              batch: { include: { program: true } }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { [sortBy === 'name' ? 'createdAt' : sortBy]: sortOrder }
      }),
      prisma.feeRecord.count({ where: whereClause })
    ]);

    const formatted = fees.map(f => ({
      id: f.id,
      studentId: f.studentId,
      rollNumber: f.student.rollNumber,
      studentName: `${f.student.user.firstName} ${f.student.user.lastName}`,
      academicYear: f.academicYear,
      semester: f.semester,
      tuitionAmount: f.tuitionAmount,
      hostelAmount: f.hostelAmount,
      messAmount: f.messAmount,
      otherAmount: f.otherAmount,
      totalAmount: f.totalAmount,
      dueAmount: f.dueAmount,
      status: f.status,
      dueDate: f.dueDate,
      createdAt: f.createdAt
    }));

    return paginatedResponse(res, {
      data: formatted,
      total,
      page,
      limit,
      message: 'Fee records retrieved'
    });
  } catch (error) {
    console.error('[Accountant getFees Error]:', error);
    return errorResponse(res, 'Failed to fetch fee records', 'FEES_FETCH_ERROR', 500);
  }
};

export const createFee = async (req, res) => {
  try {
    const { studentId, academicYear, semester, feeCategory = 'TUITION_FEE', amount, dueDate } = req.body;

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return errorResponse(res, 'Student record not found', 'STUDENT_NOT_FOUND', 404);
    }

    // Check if fee record already exists for this semester
    const existing = await prisma.feeRecord.findUnique({
      where: {
        studentId_academicYear_semester: {
          studentId,
          academicYear,
          semester: Number(semester)
        }
      }
    });

    let record;
    if (existing) {
      // Add category amount
      const updateData = {
        totalAmount: existing.totalAmount + amount,
        dueAmount: existing.dueAmount + amount,
        status: 'UNPAID'
      };
      if (feeCategory === 'HOSTEL_FEE') updateData.hostelAmount = existing.hostelAmount + amount;
      else if (feeCategory === 'MESS_FEE') updateData.messAmount = existing.messAmount + amount;
      else if (feeCategory === 'TUITION_FEE') updateData.tuitionAmount = existing.tuitionAmount + amount;
      else updateData.otherAmount = existing.otherAmount + amount;

      record = await prisma.feeRecord.update({
        where: { id: existing.id },
        data: updateData
      });
    } else {
      const tuition = feeCategory === 'TUITION_FEE' ? amount : 0;
      const hostel = feeCategory === 'HOSTEL_FEE' ? amount : 0;
      const mess = feeCategory === 'MESS_FEE' ? amount : 0;
      const other = !['TUITION_FEE', 'HOSTEL_FEE', 'MESS_FEE'].includes(feeCategory) ? amount : 0;

      record = await prisma.feeRecord.create({
        data: {
          studentId,
          academicYear,
          semester: Number(semester),
          tuitionAmount: tuition,
          hostelAmount: hostel,
          messAmount: mess,
          otherAmount: other,
          totalAmount: amount,
          dueAmount: amount,
          status: 'UNPAID',
          dueDate: new Date(dueDate)
        }
      });
    }

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'FEE_CREATED',
      entity: 'FeeRecord',
      entityId: record.id,
      newData: { studentId, academicYear, semester, amount, feeCategory },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, record, 'Fee record created successfully', 201);
  } catch (error) {
    console.error('[Accountant createFee Error]:', error);
    return errorResponse(res, 'Failed to create fee record', 'FEE_CREATE_ERROR', 500);
  }
};

export const getFeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await prisma.feeRecord.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phoneNumber: true } },
            batch: { include: { program: true } }
          }
        },
        directPayments: true,
        payments: true
      }
    });

    if (!fee) {
      return errorResponse(res, 'Fee record not found', 'FEE_NOT_FOUND', 404);
    }

    return successResponse(res, fee, 'Fee record details retrieved');
  } catch (error) {
    console.error('[Accountant getFeeById Error]:', error);
    return errorResponse(res, 'Failed to fetch fee record details', 'FEE_FETCH_ERROR', 500);
  }
};

export const updateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, dueAmount, dueDate, status } = req.body;

    const existing = await prisma.feeRecord.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Fee record not found', 'FEE_NOT_FOUND', 404);
    }

    const updated = await prisma.feeRecord.update({
      where: { id },
      data: {
        ...(amount !== undefined && { totalAmount: amount }),
        ...(dueAmount !== undefined && { dueAmount }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(status && { status })
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'FEE_UPDATED',
      entity: 'FeeRecord',
      entityId: id,
      oldData: { totalAmount: existing.totalAmount, dueAmount: existing.dueAmount, status: existing.status },
      newData: { totalAmount: updated.totalAmount, dueAmount: updated.dueAmount, status: updated.status },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, updated, 'Fee record updated successfully');
  } catch (error) {
    console.error('[Accountant updateFee Error]:', error);
    return errorResponse(res, 'Failed to update fee record', 'FEE_UPDATE_ERROR', 500);
  }
};

// ====================================================================
// 3. STUDENT FEE RECORDS & DUES
// ====================================================================
export const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await prisma.student.findFirst({
      where: { OR: [{ id: studentId }, { userId: studentId }] },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        feeRecords: {
          orderBy: { semester: 'desc' },
          include: { directPayments: true }
        }
      }
    });

    if (!student) {
      return errorResponse(res, 'Student record not found', 'STUDENT_NOT_FOUND', 404);
    }

    return successResponse(res, {
      student: {
        id: student.id,
        rollNumber: student.rollNumber,
        name: `${student.user.firstName} ${student.user.lastName}`,
        email: student.user.email
      },
      feeRecords: student.feeRecords
    }, 'Student fees retrieved');
  } catch (error) {
    console.error('[Accountant getStudentFees Error]:', error);
    return errorResponse(res, 'Failed to fetch student fees', 'STUDENT_FEES_ERROR', 500);
  }
};

export const getStudentDues = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await prisma.student.findFirst({
      where: { OR: [{ id: studentId }, { userId: studentId }] },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        feeRecords: {
          where: { dueAmount: { gt: 0 } },
          orderBy: { dueDate: 'asc' }
        }
      }
    });

    if (!student) {
      return errorResponse(res, 'Student record not found', 'STUDENT_NOT_FOUND', 404);
    }

    const totalDues = student.feeRecords.reduce((sum, r) => sum + r.dueAmount, 0);

    return successResponse(res, {
      studentId: student.id,
      rollNumber: student.rollNumber,
      name: `${student.user.firstName} ${student.user.lastName}`,
      totalDues,
      hasOutstandingDues: totalDues > 0,
      breakdown: student.feeRecords.map(r => ({
        feeRecordId: r.id,
        academicYear: r.academicYear,
        semester: r.semester,
        totalAmount: r.totalAmount,
        dueAmount: r.dueAmount,
        status: r.status,
        dueDate: r.dueDate
      }))
    }, 'Student dues calculation retrieved');
  } catch (error) {
    console.error('[Accountant getStudentDues Error]:', error);
    return errorResponse(res, 'Failed to calculate student dues', 'STUDENT_DUES_ERROR', 500);
  }
};

// ====================================================================
// 4. PAYMENT MANAGEMENT & SEPARATION OF DUTIES
// ====================================================================
export const getPayments = async (req, res) => {
  try {
    const { page, limit, skip, search, sortOrder, status } = parsePaginationQuery(req.query, 20);

    const whereClause = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { receiptNumber: { contains: search, mode: 'insensitive' } },
          { transactionRef: { contains: search, mode: 'insensitive' } },
          { student: { rollNumber: { contains: search, mode: 'insensitive' } } },
          { student: { user: { firstName: { contains: search, mode: 'insensitive' } } } },
          { student: { user: { lastName: { contains: search, mode: 'insensitive' } } } }
        ]
      })
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          student: {
            include: { user: { select: { firstName: true, lastName: true, email: true } } }
          },
          verifiedBy: {
            select: { firstName: true, lastName: true, role: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder }
      }),
      prisma.payment.count({ where: whereClause })
    ]);

    const formatted = payments.map(p => ({
      id: p.id,
      receiptNumber: p.receiptNumber,
      transactionRef: p.transactionRef,
      studentId: p.studentId,
      studentName: p.student ? `${p.student.user.firstName} ${p.student.user.lastName}` : 'N/A',
      rollNumber: p.student?.rollNumber || 'N/A',
      amount: p.amount,
      feeCategory: p.feeCategory,
      paymentMode: p.paymentMode,
      status: p.status,
      verifiedBy: p.verifiedBy ? `${p.verifiedBy.firstName} ${p.verifiedBy.lastName}` : null,
      verifiedAt: p.verifiedAt,
      rejectedReason: p.rejectedReason,
      createdAt: p.createdAt
    }));

    return paginatedResponse(res, {
      data: formatted,
      total,
      page,
      limit,
      message: 'Payments retrieved'
    });
  } catch (error) {
    console.error('[Accountant getPayments Error]:', error);
    return errorResponse(res, 'Failed to fetch payments', 'PAYMENTS_FETCH_ERROR', 500);
  }
};

export const createPayment = async (req, res) => {
  try {
    const { studentId, feeRecordId, amount, feeCategory = 'TUITION_FEE', paymentMode = 'CASH', transactionRef, remarks } = req.body;

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return errorResponse(res, 'Student record not found', 'STUDENT_NOT_FOUND', 404);
    }

    const receiptNumber = `RCP-${Date.now().toString().slice(-8)}`;
    const txRef = transactionRef || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newPayment = await prisma.payment.create({
      data: {
        receiptNumber,
        transactionRef: txRef,
        studentId,
        feeRecordId: feeRecordId || null,
        amount,
        feeCategory,
        paymentMode,
        status: 'PENDING',
        remarks
      },
      include: {
        student: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } }
        }
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'PAYMENT_CREATED',
      entity: 'Payment',
      entityId: newPayment.id,
      newData: { receiptNumber, amount, feeCategory, studentId, status: 'PENDING' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, newPayment, 'Payment recorded successfully (awaiting verification)', 201);
  } catch (error) {
    console.error('[Accountant createPayment Error]:', error);
    return errorResponse(res, 'Failed to record payment', 'PAYMENT_CREATE_ERROR', 500);
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phoneNumber: true } },
            batch: { include: { program: true } }
          }
        },
        feeRecord: true,
        verifiedBy: {
          select: { firstName: true, lastName: true, role: true }
        }
      }
    });

    if (!payment) {
      return errorResponse(res, 'Payment record not found', 'PAYMENT_NOT_FOUND', 404);
    }

    return successResponse(res, payment, 'Payment details retrieved');
  } catch (error) {
    console.error('[Accountant getPaymentById Error]:', error);
    return errorResponse(res, 'Failed to fetch payment details', 'PAYMENT_FETCH_ERROR', 500);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const actorId = req.user?.id;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { feeRecord: true }
    });

    if (!payment) {
      return errorResponse(res, 'Payment transaction not found', 'PAYMENT_NOT_FOUND', 404);
    }

    if (payment.status === 'SUCCESS') {
      return errorResponse(res, 'This payment transaction has already been verified', 'ALREADY_VERIFIED', 400);
    }

    // Separation of Duties Rule: A user cannot verify a payment they created themselves
    // If verifiedById/createdById is set to the same actor
    if (payment.verifiedById === actorId) {
      return errorResponse(res, 'Separation of Duties Violation: You cannot self-verify a payment', 'SELF_APPROVAL_FORBIDDEN', 403);
    }

    const verifiedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'SUCCESS',
        verifiedById: actorId,
        verifiedAt: new Date()
      }
    });

    // Update associated FeeRecord if present
    if (payment.feeRecordId && payment.feeRecord) {
      const remainingDue = Math.max(0, payment.feeRecord.dueAmount - payment.amount);
      const newStatus = remainingDue === 0 ? 'PAID' : 'PARTIALLY_PAID';

      await prisma.feeRecord.update({
        where: { id: payment.feeRecordId },
        data: {
          dueAmount: remainingDue,
          status: newStatus
        }
      });
    }

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'PAYMENT_VERIFIED',
      entity: 'Payment',
      entityId: id,
      oldData: { status: payment.status },
      newData: { status: 'SUCCESS', verifiedById: actorId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, verifiedPayment, 'Payment transaction verified and credited successfully');
  } catch (error) {
    console.error('[Accountant verifyPayment Error]:', error);
    return errorResponse(res, 'Failed to verify payment', 'PAYMENT_VERIFY_ERROR', 500);
  }
};

export const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const actorId = req.user?.id;

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      return errorResponse(res, 'Payment record not found', 'PAYMENT_NOT_FOUND', 404);
    }

    if (payment.status === 'SUCCESS') {
      return errorResponse(res, 'A verified payment cannot be rejected directly. Issue a refund workflow instead.', 'CANNOT_REJECT_VERIFIED', 400);
    }

    const rejected = await prisma.payment.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedReason: reason,
        verifiedById: actorId,
        verifiedAt: new Date()
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'PAYMENT_REJECTED',
      entity: 'Payment',
      entityId: id,
      oldData: { status: payment.status },
      newData: { status: 'REJECTED', rejectedReason: reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, rejected, 'Payment rejected successfully');
  } catch (error) {
    console.error('[Accountant rejectPayment Error]:', error);
    return errorResponse(res, 'Failed to reject payment', 'PAYMENT_REJECT_ERROR', 500);
  }
};

// ====================================================================
// 5. RECEIPT GENERATION
// ====================================================================
export const getPaymentReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phoneNumber: true } },
            batch: { include: { program: true } }
          }
        },
        feeRecord: true,
        verifiedBy: {
          select: { firstName: true, lastName: true, role: true }
        }
      }
    });

    if (!payment) {
      return errorResponse(res, 'Payment transaction record not found', 'PAYMENT_NOT_FOUND', 404);
    }

    // Receipt Structure per prompt specification:
    // student name, student ID, transaction ID, amount, fee type, payment method, date, status
    const receipt = {
      receiptNumber: payment.receiptNumber,
      transactionId: payment.transactionRef,
      studentName: payment.student ? `${payment.student.user.firstName} ${payment.student.user.lastName}` : 'N/A',
      studentId: payment.student?.rollNumber || payment.studentId,
      amount: payment.amount,
      feeType: payment.feeCategory,
      paymentMethod: payment.paymentMode,
      date: payment.createdAt,
      status: payment.status,
      remarks: payment.remarks || 'Standard Fee Payment Receipt',
      verifiedBy: payment.verifiedBy ? `${payment.verifiedBy.firstName} ${payment.verifiedBy.lastName}` : 'Pending Verification',
      verifiedAt: payment.verifiedAt,
      institution: {
        name: 'CAMPUS OS Operations Gateway',
        affiliation: 'Biju Patnaik University of Technology',
        gstNumber: '21AAACN2026B1ZP'
      }
    };

    return successResponse(res, receipt, 'Official payment receipt generated');
  } catch (error) {
    console.error('[Accountant getPaymentReceipt Error]:', error);
    return errorResponse(res, 'Failed to generate payment receipt', 'RECEIPT_ERROR', 500);
  }
};

export default {
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
};
