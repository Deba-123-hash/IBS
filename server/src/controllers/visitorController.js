import { successResponse, errorResponse } from '../utils/response.js';
import prisma from '../config/database.js';

let memoryVisitors = [
  {
    id: 'vis_01',
    requestNumber: 'VIS-2026-0012',
    fullName: 'Suresh Sharma (Parent)',
    phoneNumber: '+91 94370 12345',
    idProofType: 'AADHAAR',
    idProofNumber: 'XXXX-XXXX-9812',
    studentName: 'Aarav Sharma',
    rollNumber: 'CS2023048',
    purpose: 'Deliver academic textbooks and medicines',
    vehicleNumber: 'OD-02-BA-1982',
    expectedDate: '2026-09-30',
    checkInTime: '2026-09-30T10:30:00Z',
    checkOutTime: null,
    status: 'CHECKED_IN'
  }
];

export const getVisitors = async (req, res) => {
  try {
    const { status, search } = req.query;

    if (prisma) {
      try {
        const logs = await prisma.visitorLog.findMany({
          include: {
            visitor: true,
            student: { include: { user: true } }
          },
          orderBy: { checkInTime: 'desc' }
        });

        if (logs && logs.length > 0) {
          let list = logs.map(l => ({
            id: l.id,
            requestNumber: `VIS-2026-${l.id.slice(-4).toUpperCase()}`,
            fullName: l.visitor.fullName,
            phoneNumber: l.visitor.phoneNumber,
            idProofType: l.visitor.idProofType,
            idProofNumber: l.visitor.idProofNumber,
            studentName: `${l.student.user.firstName} ${l.student.user.lastName}`,
            rollNumber: l.student.rollNumber,
            purpose: l.purpose,
            vehicleNumber: l.vehicleNumber,
            expectedDate: l.checkInTime.toISOString().split('T')[0],
            checkInTime: l.checkInTime.toISOString(),
            checkOutTime: l.checkOutTime ? l.checkOutTime.toISOString() : null,
            status: l.checkOutTime ? 'CHECKED_OUT' : 'CHECKED_IN'
          }));

          if (status && status !== 'ALL') {
            list = list.filter(v => v.status === status);
          }
          if (search) {
            const q = search.toLowerCase();
            list = list.filter(v =>
              v.fullName.toLowerCase().includes(q) ||
              v.studentName.toLowerCase().includes(q) ||
              v.rollNumber.toLowerCase().includes(q)
            );
          }

          return successResponse(res, { visitors: list, total: list.length }, 'Visitor logs retrieved from database');
        }
      } catch (dbErr) {
        console.warn('[Visitor Controller] DB query failed, falling back:', dbErr.message);
      }
    }

    let list = [...memoryVisitors];
    if (status && status !== 'ALL') {
      list = list.filter(v => v.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.fullName.toLowerCase().includes(q) ||
        v.studentName.toLowerCase().includes(q) ||
        v.rollNumber.toLowerCase().includes(q)
      );
    }

    return successResponse(res, { visitors: list, total: list.length }, 'Visitor logs retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch visitors', 'VISITOR_FETCH_ERROR', 500);
  }
};

export const checkInVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    if (prisma) {
      try {
        const updated = await prisma.visitorLog.update({
          where: { id },
          data: { checkInTime: new Date() },
          include: { visitor: true }
        });
        return successResponse(res, { visitor: updated }, 'Visitor verified and checked-in in database');
      } catch (e) {}
    }

    const visitor = memoryVisitors.find(v => v.id === id);
    if (!visitor) return errorResponse(res, 'Visitor record not found', 'NOT_FOUND', 404);

    visitor.status = 'CHECKED_IN';
    visitor.checkInTime = new Date().toISOString();
    return successResponse(res, { visitor }, 'Visitor verified and checked-in at main campus gate');
  } catch (error) {
    return errorResponse(res, 'Failed to check-in visitor', 'CHECKIN_ERROR', 500);
  }
};

export const checkOutVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    if (prisma) {
      try {
        const updated = await prisma.visitorLog.update({
          where: { id },
          data: { checkOutTime: new Date() },
          include: { visitor: true }
        });
        return successResponse(res, { visitor: updated }, 'Visitor marked departed in database');
      } catch (e) {}
    }

    const visitor = memoryVisitors.find(v => v.id === id);
    if (!visitor) return errorResponse(res, 'Visitor record not found', 'NOT_FOUND', 404);

    visitor.status = 'CHECKED_OUT';
    visitor.checkOutTime = new Date().toISOString();
    return successResponse(res, { visitor }, 'Visitor marked departed; pass closed');
  } catch (error) {
    return errorResponse(res, 'Failed to check-out visitor', 'CHECKOUT_ERROR', 500);
  }
};

export const requestVisitorPass = async (req, res) => {
  try {
    const fullName = req.body.fullName || req.body.visitorName;
    const phoneNumber = req.body.phoneNumber || req.body.phone || '+91 94370 00000';
    const purpose = req.body.purpose || 'Campus Visit';
    const { idProofType, idProofNumber, vehicleNumber, expectedDate } = req.body;
    const userId = req.user?.id;

    if (!fullName || !phoneNumber || !purpose) {
      return errorResponse(res, 'Full name, phone and purpose are required', 'MISSING_FIELDS', 400);
    }

    if (prisma && userId) {
      try {
        const student = await prisma.student.findFirst({ where: { userId } });
        if (student) {
          let visitor = await prisma.visitor.findFirst({ where: { phoneNumber } });
          if (!visitor) {
            visitor = await prisma.visitor.create({
              data: {
                fullName,
                phoneNumber,
                idProofType: idProofType || 'AADHAAR',
                idProofNumber: idProofNumber || 'N/A'
              }
            });
          }

          const log = await prisma.visitorLog.create({
            data: {
              visitorId: visitor.id,
              studentId: student.id,
              purpose,
              vehicleNumber: vehicleNumber || null,
              checkInTime: new Date()
            },
            include: { visitor: true }
          });

          return successResponse(res, { visitor: log }, 'Visitor entry created in database', 201);
        }
      } catch (dbErr) {
        console.warn('[Visitor Controller] DB requestVisitorPass failed:', dbErr.message);
      }
    }

    const newPass = {
      id: `vis_${Date.now()}`,
      requestNumber: `VIS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName,
      phoneNumber,
      idProofType: idProofType || 'AADHAAR',
      idProofNumber: idProofNumber || 'XXXX-XXXX-0000',
      studentName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Aarav Sharma',
      rollNumber: req.user?.rollNumber || 'CS2023048',
      purpose,
      vehicleNumber: vehicleNumber || 'N/A',
      expectedDate: expectedDate || new Date().toISOString().split('T')[0],
      checkInTime: null,
      checkOutTime: null,
      status: 'APPROVED'
    };

    memoryVisitors.unshift(newPass);
    return successResponse(res, { visitor: newPass }, 'Visitor pass requested and approved', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to submit visitor pass request', 'PASS_CREATE_ERROR', 500);
  }
};

export const registerVisitor = requestVisitorPass;

export const getVisitorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (prisma) {
      try {
        const log = await prisma.visitorLog.findFirst({
          where: { id },
          include: { visitor: true, student: { include: { user: true } } }
        });
        if (log) {
          return successResponse(res, {
            id: log.id,
            fullName: log.visitor.fullName,
            phoneNumber: log.visitor.phoneNumber,
            studentName: `${log.student.user.firstName} ${log.student.user.lastName}`,
            rollNumber: log.student.rollNumber,
            purpose: log.purpose,
            checkInTime: log.checkInTime,
            checkOutTime: log.checkOutTime,
            status: log.checkOutTime ? 'CHECKED_OUT' : 'CHECKED_IN'
          }, 'Visitor log retrieved from database');
        }
      } catch (e) {}
    }

    const v = memoryVisitors.find(item => item.id === id || item.requestNumber === id);
    if (!v) return errorResponse(res, 'Visitor not found', 'NOT_FOUND', 404);
    return successResponse(res, v, 'Visitor details retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch visitor', 'FETCH_ERROR', 500);
  }
};

export const cancelVisitorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const v = memoryVisitors.find(item => item.id === id || item.requestNumber === id);
    if (!v) return errorResponse(res, 'Visitor request not found', 'NOT_FOUND', 404);
    v.status = 'CANCELLED';
    return successResponse(res, v, 'Visitor request cancelled');
  } catch (error) {
    return errorResponse(res, 'Failed to cancel visitor request', 'CANCEL_ERROR', 500);
  }
};

