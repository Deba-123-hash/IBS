import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createAuditLog } from '../utils/auditLogger.js';
import { parsePaginationQuery, paginatedResponse } from '../utils/pagination.js';

// ====================================================================
// 1. SECURITY DASHBOARD
// ====================================================================
export const getSecurityDashboard = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      todayVisitorsCount,
      currentlyInsideCount,
      todayEntriesCount,
      todayExitsCount,
      pendingVisitorRequests,
      activeEmergencies
    ] = await Promise.all([
      // Visitors checked in today
      prisma.gateLog.count({
        where: {
          personType: 'VISITOR',
          entryTime: { gte: todayStart }
        }
      }),
      // Currently inside campus
      prisma.gateLog.count({
        where: { status: 'INSIDE' }
      }),
      // Today entries
      prisma.gateLog.count({
        where: { entryTime: { gte: todayStart } }
      }),
      // Today exits
      prisma.gateLog.count({
        where: {
          exitTime: { gte: todayStart },
          status: 'EXITED'
        }
      }),
      // Pending visitor approvals
      prisma.visitorRequest.count({
        where: { status: 'PENDING' }
      }),
      // Emergency alerts
      prisma.emergencyIncident.findMany({
        where: { status: { in: ['OPEN', 'INVESTIGATING'] } },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    return successResponse(res, {
      todayVisitors: todayVisitorsCount,
      currentlyInsideCampus: currentlyInsideCount,
      todayGateEntries: todayEntriesCount,
      todayGateExits: todayExitsCount,
      pendingVisitorApprovals: pendingVisitorRequests,
      emergencyAlerts: activeEmergencies.map(e => ({
        id: e.id,
        incidentNumber: e.incidentNumber,
        type: e.type,
        severity: e.severity,
        location: e.location,
        description: e.description,
        status: e.status,
        reportedAt: e.createdAt
      }))
    }, 'Security operational overview retrieved');
  } catch (error) {
    console.error('[Security Dashboard Error]:', error);
    return errorResponse(res, 'Failed to fetch security dashboard telemetry', 'SECURITY_DASHBOARD_ERROR', 500);
  }
};

// ====================================================================
// 2. GATE ENTRY & EXIT (APPEND-ONLY)
// ====================================================================
export const recordGateEntry = async (req, res) => {
  try {
    const { personName, personType = 'VISITOR', studentId, visitorId, vehicleNumber, purpose, remarks } = req.body;
    const securityStaffId = req.user?.staffId || null;

    const entryLog = await prisma.gateLog.create({
      data: {
        personName,
        personType,
        studentId: studentId || null,
        visitorId: visitorId || null,
        vehicleNumber: vehicleNumber || null,
        purpose: purpose || 'Campus Visit',
        securityStaffId,
        status: 'INSIDE',
        remarks,
        entryTime: new Date()
      },
      include: {
        student: { select: { rollNumber: true, user: { select: { firstName: true, lastName: true } } } },
        visitor: true
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'GATE_ENTRY',
      entity: 'GateLog',
      entityId: entryLog.id,
      newData: { personName, personType, vehicleNumber, status: 'INSIDE' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, entryLog, 'Gate entry recorded successfully', 201);
  } catch (error) {
    console.error('[Security recordGateEntry Error]:', error);
    return errorResponse(res, 'Failed to log gate entry', 'GATE_ENTRY_ERROR', 500);
  }
};

export const recordGateExit = async (req, res) => {
  try {
    const { logId, remarks } = req.body;

    const existingLog = await prisma.gateLog.findUnique({ where: { id: logId } });
    if (!existingLog) {
      return errorResponse(res, 'Gate entry record not found', 'GATE_LOG_NOT_FOUND', 404);
    }

    if (existingLog.status === 'EXITED') {
      return errorResponse(res, 'Person has already exited campus', 'ALREADY_EXITED', 400);
    }

    const updatedLog = await prisma.gateLog.update({
      where: { id: logId },
      data: {
        exitTime: new Date(),
        status: 'EXITED',
        remarks: remarks ? `${existingLog.remarks ? existingLog.remarks + ' | ' : ''}${remarks}` : existingLog.remarks
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'GATE_EXIT',
      entity: 'GateLog',
      entityId: logId,
      oldData: { status: existingLog.status },
      newData: { status: 'EXITED', exitTime: updatedLog.exitTime },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, updatedLog, 'Gate exit recorded successfully');
  } catch (error) {
    console.error('[Security recordGateExit Error]:', error);
    return errorResponse(res, 'Failed to log gate exit', 'GATE_EXIT_ERROR', 500);
  }
};

export const getGateLogs = async (req, res) => {
  try {
    const { page, limit, skip, search, sortOrder, status, dateFrom, dateTo } = parsePaginationQuery(req.query, 30);
    const { personType } = req.query;

    const whereClause = {
      ...(status && { status }),
      ...(personType && { personType }),
      ...(dateFrom || dateTo ? {
        entryTime: {
          ...(dateFrom && { gte: dateFrom }),
          ...(dateTo && { lte: dateTo })
        }
      } : {}),
      ...(search && {
        OR: [
          { personName: { contains: search, mode: 'insensitive' } },
          { vehicleNumber: { contains: search, mode: 'insensitive' } },
          { purpose: { contains: search, mode: 'insensitive' } },
          { student: { rollNumber: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    const [logs, total] = await Promise.all([
      prisma.gateLog.findMany({
        where: whereClause,
        include: {
          student: {
            select: { rollNumber: true, user: { select: { firstName: true, lastName: true } } }
          },
          visitor: true
        },
        skip,
        take: limit,
        orderBy: { entryTime: sortOrder }
      }),
      prisma.gateLog.count({ where: whereClause })
    ]);

    return paginatedResponse(res, {
      data: logs,
      total,
      page,
      limit,
      message: 'Gate access audit logs retrieved'
    });
  } catch (error) {
    console.error('[Security getGateLogs Error]:', error);
    return errorResponse(res, 'Failed to retrieve gate access logs', 'GATE_LOGS_ERROR', 500);
  }
};

// ====================================================================
// 3. VISITOR MANAGEMENT
// ====================================================================
export const registerVisitor = async (req, res) => {
  try {
    const { fullName, phoneNumber, idProofType, idProofNumber } = req.body;

    const visitor = await prisma.visitor.create({
      data: {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        idProofType,
        idProofNumber: idProofNumber.trim()
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'VISITOR_REGISTERED',
      entity: 'Visitor',
      entityId: visitor.id,
      newData: { fullName, phoneNumber, idProofType },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, visitor, 'Visitor identity registered successfully', 201);
  } catch (error) {
    console.error('[Security registerVisitor Error]:', error);
    return errorResponse(res, 'Failed to register visitor', 'VISITOR_REGISTER_ERROR', 500);
  }
};

export const getVisitors = async (req, res) => {
  try {
    const { page, limit, skip, search, sortOrder } = parsePaginationQuery(req.query, 20);

    const whereClause = {
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search, mode: 'insensitive' } },
          { idProofNumber: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        where: whereClause,
        include: {
          gateLogs: {
            take: 3,
            orderBy: { entryTime: 'desc' }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder }
      }),
      prisma.visitor.count({ where: whereClause })
    ]);

    return paginatedResponse(res, {
      data: visitors,
      total,
      page,
      limit,
      message: 'Visitor registry retrieved'
    });
  } catch (error) {
    console.error('[Security getVisitors Error]:', error);
    return errorResponse(res, 'Failed to fetch visitor records', 'VISITORS_FETCH_ERROR', 500);
  }
};

export const getVisitorById = async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await prisma.visitor.findUnique({
      where: { id },
      include: {
        gateLogs: {
          orderBy: { entryTime: 'desc' }
        },
        logs: {
          include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } }
        }
      }
    });

    if (!visitor) {
      return errorResponse(res, 'Visitor record not found', 'VISITOR_NOT_FOUND', 404);
    }

    return successResponse(res, visitor, 'Visitor profile retrieved');
  } catch (error) {
    console.error('[Security getVisitorById Error]:', error);
    return errorResponse(res, 'Failed to fetch visitor profile', 'VISITOR_FETCH_ERROR', 500);
  }
};

export const updateVisitorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    // Check if updating VisitorRequest
    const visitorReq = await prisma.visitorRequest.findUnique({ where: { id } });
    if (visitorReq) {
      const updatedReq = await prisma.visitorRequest.update({
        where: { id },
        data: {
          status,
          reviewedById: req.user?.id,
          rejectionReason: status === 'REJECTED' ? remarks : null
        }
      });

      await createAuditLog({
        actorUserId: req.user?.id,
        actorRole: req.user?.role,
        action: status === 'APPROVED' ? 'VISITOR_APPROVED' : 'VISITOR_REJECTED',
        entity: 'VisitorRequest',
        entityId: id,
        newData: { status, remarks },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return successResponse(res, updatedReq, `Visitor request marked as ${status}`);
    }

    // Check if updating GateLog status for visitor
    const gateLog = await prisma.gateLog.findFirst({
      where: { visitorId: id },
      orderBy: { entryTime: 'desc' }
    });

    if (gateLog) {
      const updatedLog = await prisma.gateLog.update({
        where: { id: gateLog.id },
        data: {
          status: status === 'EXITED' ? 'EXITED' : 'INSIDE',
          ...(status === 'EXITED' && { exitTime: new Date() }),
          remarks: remarks || gateLog.remarks
        }
      });

      await createAuditLog({
        actorUserId: req.user?.id,
        actorRole: req.user?.role,
        action: 'VISITOR_STATUS_CHANGED',
        entity: 'GateLog',
        entityId: gateLog.id,
        newData: { status },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return successResponse(res, updatedLog, `Visitor gate status updated to ${status}`);
    }

    return errorResponse(res, 'Visitor activity record not found', 'NOT_FOUND', 404);
  } catch (error) {
    console.error('[Security updateVisitorStatus Error]:', error);
    return errorResponse(res, 'Failed to update visitor status', 'VISITOR_STATUS_ERROR', 500);
  }
};

// ====================================================================
// 4. EMERGENCY INCIDENTS
// ====================================================================
export const createEmergency = async (req, res) => {
  try {
    const { type, severity = 'HIGH', location, description } = req.body;
    const reportedById = req.user?.id || null;

    const incidentNumber = `EMG-${Date.now().toString().slice(-6)}`;

    const incident = await prisma.emergencyIncident.create({
      data: {
        incidentNumber,
        type,
        severity,
        location,
        description,
        reportedById,
        status: 'OPEN'
      },
      include: {
        reportedBy: { select: { firstName: true, lastName: true, role: true } }
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'EMERGENCY_CREATED',
      entity: 'EmergencyIncident',
      entityId: incident.id,
      newData: { incidentNumber, type, severity, location },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, incident, 'Critical emergency incident dispatched', 201);
  } catch (error) {
    console.error('[Security createEmergency Error]:', error);
    return errorResponse(res, 'Failed to broadcast emergency incident', 'EMERGENCY_CREATE_ERROR', 500);
  }
};

export const getEmergencies = async (req, res) => {
  try {
    const { page, limit, skip, sortOrder, status } = parsePaginationQuery(req.query, 20);

    const whereClause = {
      ...(status && { status })
    };

    const [incidents, total] = await Promise.all([
      prisma.emergencyIncident.findMany({
        where: whereClause,
        include: {
          reportedBy: { select: { firstName: true, lastName: true, role: true } },
          resolvedBy: { select: { firstName: true, lastName: true, role: true } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder }
      }),
      prisma.emergencyIncident.count({ where: whereClause })
    ]);

    return paginatedResponse(res, {
      data: incidents,
      total,
      page,
      limit,
      message: 'Emergency incident history retrieved'
    });
  } catch (error) {
    console.error('[Security getEmergencies Error]:', error);
    return errorResponse(res, 'Failed to fetch emergency incidents', 'EMERGENCY_FETCH_ERROR', 500);
  }
};

export const resolveEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    const resolvedById = req.user?.id;

    const existing = await prisma.emergencyIncident.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Emergency incident record not found', 'EMERGENCY_NOT_FOUND', 404);
    }

    const resolved = await prisma.emergencyIncident.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolutionNotes,
        resolvedById,
        resolvedAt: new Date()
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'EMERGENCY_RESOLVED',
      entity: 'EmergencyIncident',
      entityId: id,
      oldData: { status: existing.status },
      newData: { status: 'RESOLVED', resolutionNotes },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, resolved, 'Emergency incident resolved and closed');
  } catch (error) {
    console.error('[Security resolveEmergency Error]:', error);
    return errorResponse(res, 'Failed to resolve emergency incident', 'EMERGENCY_RESOLVE_ERROR', 500);
  }
};

export default {
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
};
