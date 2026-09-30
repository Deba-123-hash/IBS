import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logAuditEvent } from '../services/auditService.js';

let memoryLeaves = [
  {
    id: 'LV-2026-008',
    studentId: 'stu_demo_01',
    studentName: 'Aarav Sharma',
    type: 'FAMILY',
    startDate: '2026-10-02',
    endDate: '2026-10-05',
    destination: 'Bhubaneswar, Odisha',
    reason: 'Sister wedding ceremony',
    emergencyContact: '+91 94370 12345',
    status: 'APPROVED',
    createdAt: new Date().toISOString()
  },
  {
    id: 'LV-2026-014',
    studentId: 'stu_demo_01',
    studentName: 'Aarav Sharma',
    type: 'MEDICAL',
    startDate: '2026-10-12',
    endDate: '2026-10-14',
    destination: 'Cuttack Hospital',
    reason: 'Scheduled dental procedure',
    emergencyContact: '+91 98610 54321',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  }
];

export const createLeaveRequest = async (req, res) => {
  try {
    const { startDate, endDate, reason, destination, emergencyContact, type = 'PERSONAL' } = req.body;

    if (!startDate || !endDate || !reason || !destination || !emergencyContact) {
      return errorResponse(res, 'Missing required leave fields', 'MISSING_FIELDS', 400);
    }

    const studentId = req.user?.studentId || 'stu_demo_01';

    if (prisma && prisma.leaveRequest && req.user?.studentId) {
      const newLeave = await prisma.leaveRequest.create({
        data: {
          studentId: req.user.studentId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reason,
          destination,
          emergencyContact,
          status: 'PENDING'
        }
      });

      await logAuditEvent({
        userId: req.user.id,
        action: 'STUDENT_CREATED_LEAVE_REQUEST',
        entity: 'LEAVE_REQUEST',
        entityId: newLeave.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return successResponse(res, newLeave, 'Leave application submitted successfully', 201);
    }

    const newMemLeave = {
      id: `LV-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentId,
      studentName: `${req.user?.firstName || 'Aarav'} ${req.user?.lastName || 'Sharma'}`,
      type,
      startDate,
      endDate,
      destination,
      reason,
      emergencyContact,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    memoryLeaves.unshift(newMemLeave);
    return successResponse(res, newMemLeave, 'Leave application submitted successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create leave request', 'LEAVE_CREATE_ERROR', 500);
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    if (prisma && prisma.leaveRequest && req.user?.studentId) {
      const leaves = await prisma.leaveRequest.findMany({
        where: { studentId: req.user.studentId },
        orderBy: { createdAt: 'desc' }
      });
      return successResponse(res, { leaves, total: leaves.length }, 'Student leave records retrieved');
    }

    return successResponse(res, { leaves: memoryLeaves, total: memoryLeaves.length }, 'Student leave records retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch leave records', 'LEAVE_FETCH_ERROR', 500);
  }
};

export const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;

    if (prisma && prisma.leaveRequest) {
      const leave = await prisma.leaveRequest.findUnique({
        where: { id },
        include: { student: { include: { user: true } } }
      });

      if (leave) {
        // Ownership check
        if (req.user?.role === 'STUDENT' && leave.student?.userId !== req.user.id) {
          return errorResponse(res, 'Access denied', 'FORBIDDEN', 403);
        }
        return successResponse(res, leave, 'Leave record retrieved');
      }
    }

    const mem = memoryLeaves.find(l => l.id === id);
    if (mem) return successResponse(res, mem, 'Leave record retrieved');

    return errorResponse(res, 'Leave record not found', 'NOT_FOUND', 404);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch leave details', 'LEAVE_DETAILS_ERROR', 500);
  }
};

export const cancelLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (prisma && prisma.leaveRequest) {
      const leave = await prisma.leaveRequest.findUnique({
        where: { id },
        include: { student: true }
      });

      if (!leave) return errorResponse(res, 'Leave record not found', 'NOT_FOUND', 404);

      if (req.user?.role === 'STUDENT' && leave.student?.userId !== req.user.id) {
        return errorResponse(res, 'Access denied', 'FORBIDDEN', 403);
      }

      if (leave.status !== 'PENDING') {
        return errorResponse(res, 'Cannot cancel leave after it has been processed', 'INVALID_OPERATION', 400);
      }

      const cancelled = await prisma.leaveRequest.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      await logAuditEvent({
        userId: req.user.id,
        action: 'STUDENT_CANCELLED_LEAVE',
        entity: 'LEAVE_REQUEST',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return successResponse(res, cancelled, 'Leave request cancelled');
    }

    const mem = memoryLeaves.find(l => l.id === id);
    if (mem) {
      mem.status = 'CANCELLED';
      return successResponse(res, mem, 'Leave request cancelled');
    }

    return errorResponse(res, 'Leave record not found', 'NOT_FOUND', 404);
  } catch (error) {
    return errorResponse(res, 'Failed to cancel leave', 'LEAVE_CANCEL_ERROR', 500);
  }
};

export default {
  createLeaveRequest,
  getMyLeaves,
  getLeaveById,
  cancelLeaveRequest
};
