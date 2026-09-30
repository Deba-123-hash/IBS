import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logAuditEvent } from '../services/auditService.js';

let memoryUsers = [
  { id: 'usr_1', email: 'student@campus.demo', firstName: 'Aarav', lastName: 'Sharma', role: 'STUDENT', rollNumber: 'CS2023048', department: 'Computer Science', status: 'ACTIVE' },
  { id: 'usr_2', email: 'admin@campus.demo', firstName: 'Rajesh', lastName: 'Verma', role: 'ADMIN', designation: 'Campus Dean', department: 'Academic Affairs', status: 'ACTIVE' },
  { id: 'usr_3', email: 'warden@campus.demo', firstName: 'Suresh', lastName: 'Patel', role: 'WARDEN', designation: 'Chief Warden', department: 'Hostel Affairs', status: 'ACTIVE' },
  { id: 'usr_4', email: 'faculty@campus.demo', firstName: 'Dr. Priya', lastName: 'Nair', role: 'FACULTY', designation: 'Associate Professor', department: 'Computer Science', status: 'ACTIVE' },
  { id: 'usr_5', email: 'maintenance@campus.demo', firstName: 'Ramesh', lastName: 'Kumar', role: 'MAINTENANCE', designation: 'Plumbing Specialist', department: 'Estate & Works', status: 'ACTIVE' },
  { id: 'usr_6', email: 'security@campus.demo', firstName: 'Devendra', lastName: 'Singh', role: 'SECURITY', designation: 'Head Security', department: 'Campus Security', status: 'ACTIVE' },
  { id: 'usr_7', email: 'accounts@campus.demo', firstName: 'Meena', lastName: 'Iyer', role: 'ACCOUNTS', designation: 'Senior Accountant', department: 'Finance Section', status: 'ACTIVE' }
];

let memoryAuditLogs = [
  { id: 'aud_01', action: 'LOGIN_SUCCESS', entity: 'User', entityId: 'usr_1', actor: 'Aarav Sharma (STUDENT)', ip: '192.168.1.104', timestamp: '2026-09-29T10:14:00Z' },
  { id: 'aud_02', action: 'GATEPASS_APPROVED', entity: 'GatePass', entityId: 'GP-2026-0042', actor: 'Suresh Patel (WARDEN)', ip: '10.0.4.12', timestamp: '2026-09-29T10:45:00Z' },
  { id: 'aud_03', action: 'COMPLAINT_ASSIGNED', entity: 'Complaint', entityId: 'CMP-2026-0042', actor: 'AI Smart Router', ip: '127.0.0.1', timestamp: '2026-09-29T09:16:00Z' },
  { id: 'aud_04', action: 'CERTIFICATE_ISSUED', entity: 'Certificate', entityId: 'CRT-2026-0012', actor: 'Rajesh Verma (ADMIN)', ip: '10.0.1.5', timestamp: '2026-09-28T16:00:00Z' }
];

export const getUsers = async (req, res) => {
  try {
    const { role, search, status, page = 1, limit = 20 } = req.query;

    if (prisma && prisma.user) {
      try {
        const whereClause = {
          ...(role && { role }),
          ...(status !== undefined && { isActive: status === 'ACTIVE' }),
          ...(search && {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          })
        };

        const [users, total] = await Promise.all([
          prisma.user.findMany({
            where: whereClause,
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              phoneNumber: true,
              avatarUrl: true,
              isActive: true,
              createdAt: true,
              studentProfile: {
                select: { rollNumber: true, batch: { select: { name: true } } }
              },
              staffProfile: {
                select: { employeeCode: true, designation: true }
              }
            },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
          }),
          prisma.user.count({ where: whereClause })
        ]);

        return successResponse(res, {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }, 'User registry retrieved');
      } catch (dbErr) {
        console.warn('[Admin DB getUsers fallback]:', dbErr.message);
      }
    }

    return successResponse(res, { users: memoryUsers, total: memoryUsers.length }, 'User registry retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch users', 'USERS_FETCH_ERROR', 500);
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (prisma && prisma.user) {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phoneNumber: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          studentProfile: {
            include: {
              batch: { include: { program: { include: { department: true } } } },
              roomAllocation: { include: { room: true } }
            }
          },
          staffProfile: {
            include: { department: true }
          }
        }
      });

      if (user) {
        return successResponse(res, user, 'User details retrieved');
      }
    }

    const mem = memoryUsers.find(u => u.id === id);
    if (mem) return successResponse(res, mem, 'User details retrieved');

    return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch user', 'USER_FETCH_ERROR', 500);
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return errorResponse(res, 'isActive boolean flag is required', 'INVALID_STATUS', 400);
    }

    if (prisma && prisma.user) {
      const updated = await prisma.user.update({
        where: { id },
        data: { isActive },
        select: { id: true, email: true, isActive: true }
      });

      await logAuditEvent({
        userId: req.user?.id,
        action: isActive ? 'ADMIN_ENABLED_USER' : 'ADMIN_DISABLED_USER',
        entity: 'USER',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return successResponse(res, updated, `User ${isActive ? 'activated' : 'deactivated'} successfully`);
    }

    const mem = memoryUsers.find(u => u.id === id);
    if (mem) {
      mem.status = isActive ? 'ACTIVE' : 'INACTIVE';
      return successResponse(res, mem, 'User status updated');
    }

    return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
  } catch (error) {
    return errorResponse(res, 'Failed to update user status', 'USER_STATUS_ERROR', 500);
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['STUDENT', 'FACULTY', 'WARDEN', 'MAINTENANCE', 'SECURITY', 'ACCOUNTS', 'ADMIN', 'SUPER_ADMIN'];
    if (!role || !allowedRoles.includes(role)) {
      return errorResponse(res, `Role must be one of: [${allowedRoles.join(', ')}]`, 'INVALID_ROLE', 400);
    }

    if (prisma && prisma.user) {
      const updated = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, email: true, role: true }
      });

      await logAuditEvent({
        userId: req.user?.id,
        action: 'ADMIN_CHANGED_USER_ROLE',
        entity: 'USER',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        payload: { newRole: role }
      });

      return successResponse(res, updated, 'User role updated successfully');
    }

    const mem = memoryUsers.find(u => u.id === id);
    if (mem) {
      mem.role = role;
      return successResponse(res, mem, 'User role updated');
    }

    return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
  } catch (error) {
    return errorResponse(res, 'Failed to update user role', 'USER_ROLE_ERROR', 500);
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, entity } = req.query;

    if (prisma && prisma.auditLog) {
      try {
        const whereClause = {
          ...(action && { action }),
          ...(entity && { entity })
        };

        const [logs, total] = await Promise.all([
          prisma.auditLog.findMany({
            where: whereClause,
            include: {
              user: {
                select: { id: true, email: true, firstName: true, lastName: true, role: true }
              }
            },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
          }),
          prisma.auditLog.count({ where: whereClause })
        ]);

        return successResponse(res, {
          logs,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }, 'Security audit logs retrieved');
      } catch (dbErr) {
        console.warn('[Admin DB getAuditLogs fallback]:', dbErr.message);
      }
    }

    return successResponse(res, { logs: memoryAuditLogs, total: memoryAuditLogs.length }, 'Security audit logs retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch audit logs', 'AUDIT_LOG_ERROR', 500);
  }
};

export default {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  getAuditLogs
};
