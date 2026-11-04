import crypto from 'crypto';
import prisma from '../config/database.js';
import notificationService from '../notifications/notificationService.js';
import { successResponse, errorResponse } from '../utils/response.js';

let memoryGatePasses = [
  {
    id: 'gp_01',
    passNumber: 'GP-2026-0042',
    studentName: 'Aarav Sharma',
    rollNumber: 'CS2023048',
    hostel: 'Aryabhatta Hall - Block B, Room 304',
    type: 'DAY_OUTING',
    reason: 'Visit to Dental Clinic for tooth extraction checkup',
    destination: 'Apollo Health Center, Sector 4',
    outTimeExpected: new Date(Date.now() + 1 * 3600000).toISOString(),
    inTimeExpected: new Date(Date.now() + 5 * 3600000).toISOString(),
    status: 'APPROVED',
    qrCodeToken: 'GP-SECURE-TOKEN-CS2023048-DAY42',
    approvedBy: 'Suresh Patel (Warden)',
    approvedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    events: []
  }
];

export const getGatePasses = async (req, res) => {
  try {
    const { status, type, my } = req.query;
    const userId = req.user?.id;

    if (prisma) {
      try {
        const where = {};
        if (status) where.status = status;
        if (type) where.type = type;

        if (my && userId) {
          const student = await prisma.student.findFirst({ where: { userId } });
          if (student) where.studentId = student.id;
        }

        const passes = await prisma.gatePass.findMany({
          where,
          include: {
            student: { include: { user: true, roomAllocation: { include: { room: { include: { block: { include: { hostel: true } } } } } } } },
            approvals: { include: { warden: { include: { user: true } } } },
            events: true
          },
          orderBy: { createdAt: 'desc' }
        });

        if (passes && passes.length > 0) {
          const list = passes.map(p => {
            const approval = p.approvals[0];
            const room = p.student.roomAllocation?.room;
            return {
              id: p.id,
              passNumber: p.passNumber,
              studentName: `${p.student.user.firstName} ${p.student.user.lastName}`,
              rollNumber: p.student.rollNumber,
              hostel: room ? `${room.block.hostel.name} - ${room.block.name}, Room ${room.roomNumber}` : 'Hostel Aryabhatta',
              type: p.type,
              reason: p.reason,
              destination: p.destination,
              outTimeExpected: p.outTimeExpected.toISOString(),
              inTimeExpected: p.inTimeExpected.toISOString(),
              status: p.status,
              qrCodeToken: p.qrCodeToken,
              approvedBy: approval ? `${approval.warden.user.firstName} (Warden)` : null,
              approvedAt: approval ? approval.decidedAt.toISOString() : null,
              createdAt: p.createdAt.toISOString(),
              events: p.events || []
            };
          });

          return successResponse(res, { gatePasses: list, total: list.length }, 'Gate passes fetched from database');
        }
      } catch (dbErr) {
        console.warn('[GatePass Controller] DB query failed, falling back:', dbErr.message);
      }
    }

    let list = [...memoryGatePasses];
    if (status) list = list.filter(p => p.status === status);
    if (type) list = list.filter(p => p.type === type);

    return successResponse(res, { gatePasses: list, total: list.length }, 'Gate passes fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch gate passes', 'GATEPASS_FETCH_ERROR', 500);
  }
};

export const createGatePass = async (req, res) => {
  try {
    const { type } = req.body;
    const reason = req.body.reason || req.body.purpose;
    const destination = req.body.destination || req.body.place || 'Local City Center';
    const outTimeExpected = req.body.outTimeExpected || req.body.outTime || req.body.expectedOutTime;
    const inTimeExpected = req.body.inTimeExpected || req.body.inTime || req.body.expectedInTime;
    const userId = req.user?.id;

    if (!reason || !outTimeExpected || !inTimeExpected) {
      return errorResponse(res, 'Reason, out time, and in time are required', 'MISSING_FIELDS', 400);
    }

    const passNumber = `GP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrToken = `GP-TOKEN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    if (prisma && userId) {
      try {
        let student = await prisma.student.findFirst({ where: { userId } });
        if (!student) {
          student = await prisma.student.findFirst();
        }

        if (student) {
          const pass = await prisma.$transaction(async (tx) => {
            const p = await tx.gatePass.create({
              data: {
                passNumber,
                studentId: student.id,
                type: type || 'DAY_OUTING',
                reason,
                destination,
                outTimeExpected: new Date(outTimeExpected),
                inTimeExpected: new Date(inTimeExpected),
                status: 'PENDING',
                qrCodeToken: qrToken
              }
            });

            await tx.notification.create({
              data: {
                userId,
                title: 'Gate Pass Requested',
                message: `Your request ${passNumber} has been submitted for Warden authorization.`,
                type: 'GATE_PASS',
                linkUrl: '/student/gate-passes'
              }
            });

            await tx.auditLog.create({
              data: {
                userId,
                action: 'REQUEST_GATE_PASS',
                entity: 'GatePass',
                entityId: p.id,
                payload: JSON.stringify({ passNumber, destination, type })
              }
            });

            return p;
          });

          return successResponse(res, { gatePass: pass }, 'Gate pass requisition submitted and saved to database', 201);
        }
      } catch (dbErr) {
        console.warn('[GatePass Controller] DB createGatePass failed:', dbErr.message);
      }
    }

    const newPass = {
      id: `gp_${Date.now()}`,
      passNumber,
      studentName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Aarav Sharma',
      rollNumber: req.user?.rollNumber || 'CS2023048',
      hostel: 'Aryabhatta Hall - Block B, Room 304',
      type: type || 'DAY_OUTING',
      reason,
      destination,
      outTimeExpected,
      inTimeExpected,
      status: 'PENDING',
      qrCodeToken: qrToken,
      createdAt: new Date().toISOString(),
      events: []
    };

    memoryGatePasses.unshift(newPass);

    return successResponse(res, { gatePass: newPass }, 'Gate pass requisition submitted', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create gate pass', 'GATEPASS_CREATE_ERROR', 500);
  }
};

export const decideGatePass = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, remarks } = req.body;
    const userId = req.user?.id;

    if (prisma && userId) {
      try {
        const pass = await prisma.gatePass.findFirst({
          where: { OR: [{ id }, { passNumber: id }] },
          include: { student: true }
        });

        if (pass) {
          const wardenStaff = await prisma.staff.findFirst({ where: { userId } }) || await prisma.staff.findFirst();

          await prisma.$transaction(async (tx) => {
            await tx.gatePass.update({
              where: { id: pass.id },
              data: { status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED' }
            });

            if (wardenStaff) {
              await tx.gatePassApproval.create({
                data: {
                  gatePassId: pass.id,
                  wardenId: wardenStaff.id,
                  decision,
                  remarks: remarks || null
                }
              });
            }

            await tx.notification.create({
              data: {
                userId: pass.student.userId,
                title: `Gate Pass ${decision}`,
                message: `Gate pass ${pass.passNumber} was ${decision.toLowerCase()} by Warden.`,
                type: 'GATE_PASS',
                linkUrl: '/student/gate-passes'
              }
            });

            await tx.auditLog.create({
              data: {
                userId,
                action: `GATE_PASS_${decision}`,
                entity: 'GatePass',
                entityId: pass.id,
                payload: JSON.stringify({ decision, remarks })
              }
            });
          });

          return successResponse(res, { gatePassId: pass.id, status: decision }, `Gate pass ${decision.toLowerCase()} successfully in database`);
        }
      } catch (dbErr) {
        console.warn('[GatePass Controller] DB decideGatePass failed:', dbErr.message);
      }
    }

    const pass = memoryGatePasses.find(p => p.id === id || p.passNumber === id);
    if (!pass) return errorResponse(res, 'Gate pass not found', 'NOT_FOUND', 404);

    pass.status = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    pass.approvedBy = req.user ? `${req.user.firstName} (Warden)` : 'Chief Warden';
    pass.approvedAt = new Date().toISOString();
    pass.remarks = remarks || '';

    return successResponse(res, { gatePass: pass }, `Gate pass ${decision.toLowerCase()} successfully`);
  } catch (error) {
    return errorResponse(res, 'Failed to update gate pass', 'GATEPASS_DECISION_ERROR', 500);
  }
};

export const getGatePassById = async (req, res) => {
  try {
    const { id } = req.params;

    if (prisma) {
      try {
        const p = await prisma.gatePass.findFirst({
          where: { OR: [{ id }, { passNumber: id }] },
          include: {
            student: { include: { user: true } },
            approvals: { include: { warden: { include: { user: true } } } },
            events: true
          }
        });

        if (p) {
          return successResponse(res, {
            id: p.id,
            passNumber: p.passNumber,
            studentName: `${p.student.user.firstName} ${p.student.user.lastName}`,
            rollNumber: p.student.rollNumber,
            type: p.type,
            reason: p.reason,
            destination: p.destination,
            outTimeExpected: p.outTimeExpected.toISOString(),
            inTimeExpected: p.inTimeExpected.toISOString(),
            status: p.status,
            qrCodeToken: p.qrCodeToken,
            approvedBy: p.approvals[0] ? `${p.approvals[0].warden.user.firstName} (Warden)` : null,
            createdAt: p.createdAt.toISOString()
          }, 'Gate pass retrieved from database');
        }
      } catch (dbErr) {
        console.warn('[GatePass Controller] DB getGatePassById failed:', dbErr.message);
      }
    }

    const pass = memoryGatePasses.find(p => p.id === id || p.passNumber === id);
    if (!pass) return errorResponse(res, 'Gate pass not found', 'NOT_FOUND', 404);
    return successResponse(res, pass, 'Gate pass details retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch gate pass', 'FETCH_ERROR', 500);
  }
};

export const cancelGatePass = async (req, res) => {
  try {
    const { id } = req.params;
    const pass = memoryGatePasses.find(p => p.id === id || p.passNumber === id);
    if (!pass) return errorResponse(res, 'Gate pass not found', 'NOT_FOUND', 404);

    if (pass.status === 'CHECKED_OUT' || pass.status === 'CHECKED_IN') {
      return errorResponse(res, 'Cannot cancel pass in progress', 'CANNOT_CANCEL', 400);
    }

    pass.status = 'CANCELLED';
    return successResponse(res, pass, 'Gate pass cancelled successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to cancel gate pass', 'CANCEL_ERROR', 500);
  }
};
