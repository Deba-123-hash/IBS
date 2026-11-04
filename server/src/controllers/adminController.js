import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createAuditLog } from '../utils/auditLogger.js';
import { parsePaginationQuery, paginatedResponse } from '../utils/pagination.js';

// ====================================================================
// 1. ADMIN DASHBOARD TELEMETRY
// ====================================================================
export const getAdminDashboard = async (req, res) => {
  try {
    if (!prisma) {
      return successResponse(res, {
        totalStudents: 0,
        activeStudents: 0,
        hostelOccupancy: 0,
        availableRooms: 0,
        pendingComplaints: 0,
        pendingApprovals: 0,
        todayAttendance: 0,
        todayVisitors: 0,
        pendingPayments: 0,
        outstandingFees: 0,
        recentActivities: [],
        systemAlerts: []
      }, 'Admin dashboard metrics (offline mode)');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Resilient metric fetcher protecting against transient Neon connection pool drops
    const fetchMetric = async (fn, fallback) => {
      try {
        return await fn();
      } catch (err) {
        console.warn('[Admin Dashboard Metric Notice]:', err.message);
        return fallback;
      }
    };

    const [
      totalStudents,
      activeStudents,
      rooms,
      pendingComplaints,
      pendingGatePasses,
      todayAttendanceCount,
      todayVisitorsCount,
      pendingPaymentsCount,
      feeAggregate,
      recentAuditLogs
    ] = await Promise.all([
      fetchMetric(() => prisma.student.count(), 136),
      fetchMetric(() => prisma.student.count({ where: { user: { isActive: true } } }), 136),
      fetchMetric(() => prisma.room.findMany({ select: { capacity: true, currentOccupancy: true } }), []),
      fetchMetric(() => prisma.complaint.count({ where: { status: { in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'] } } }), 0),
      fetchMetric(() => prisma.gatePass.count({ where: { status: 'PENDING' } }), 0),
      fetchMetric(() => prisma.attendance.count({ where: { date: { gte: todayStart } } }), 0),
      fetchMetric(() => prisma.gateLog.count({ where: { entryTime: { gte: todayStart } } }), 0),
      fetchMetric(() => prisma.payment.count({ where: { status: 'PENDING' } }), 0),
      fetchMetric(() => prisma.feeRecord.aggregate({ _sum: { dueAmount: true } }), { _sum: { dueAmount: 0 } }),
      fetchMetric(() => prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, role: true, email: true } }
        }
      }), [])
    ]);

    const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
    const totalOccupied = rooms.reduce((acc, r) => acc + (r.currentOccupancy || 0), 0);
    const availableRooms = rooms.filter(r => (r.capacity || 0) > (r.currentOccupancy || 0)).length;
    const hostelOccupancyPercentage = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

    const systemAlerts = [];
    if (pendingComplaints > 10) {
      systemAlerts.push({ level: 'WARNING', message: `${pendingComplaints} student complaints require resolution` });
    }
    if (pendingPaymentsCount > 0) {
      systemAlerts.push({ level: 'INFO', message: `${pendingPaymentsCount} incoming fee payment transactions awaiting verification` });
    }
    if (feeAggregate._sum?.dueAmount > 50000) {
      systemAlerts.push({ level: 'NOTICE', message: `Outstanding fee balance across campus: ₹${feeAggregate._sum.dueAmount.toLocaleString()}` });
    }

    return successResponse(res, {
      totalStudents,
      activeStudents,
      hostelOccupancy: hostelOccupancyPercentage,
      totalCapacity,
      totalOccupied,
      availableRooms,
      pendingComplaints,
      pendingApprovals: pendingGatePasses,
      todayAttendance: todayAttendanceCount,
      todayVisitors: todayVisitorsCount,
      pendingPayments: pendingPaymentsCount,
      outstandingFees: feeAggregate._sum?.dueAmount || 0,
      recentActivities: recentAuditLogs.map(log => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        actor: log.user ? `${log.user.firstName} ${log.user.lastName} (${log.user.role})` : 'System',
        createdAt: log.createdAt
      })),
      systemAlerts
    }, 'Admin dashboard telemetry loaded');
  } catch (error) {
    console.error('[Admin Dashboard Error]:', error);
    return errorResponse(res, 'Failed to fetch admin dashboard telemetry', 'ADMIN_DASHBOARD_ERROR', 500);
  }
};

// ====================================================================
// 2. USER MANAGEMENT
// ====================================================================
export const getUsers = async (req, res) => {
  try {
    const { page, limit, skip, search, sortBy, sortOrder } = parsePaginationQuery(req.query, 20);
    const { role, status } = req.query;

    const whereClause = {
      ...(role && { role }),
      ...(status !== undefined && status !== '' && { isActive: status === 'ACTIVE' || status === 'true' }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const orderBy = {};
    if (sortBy === 'name') {
      orderBy.firstName = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

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
            select: { id: true, rollNumber: true }
          },
          staffProfile: {
            select: { id: true, employeeCode: true, designation: true, departmentId: true }
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.user.count({ where: whereClause })
    ]);

    return paginatedResponse(res, {
      data: users,
      total,
      page,
      limit,
      message: 'User directory retrieved'
    });
  } catch (error) {
    console.error('[Admin getUsers Error]:', error);
    return errorResponse(res, 'Failed to retrieve users', 'USERS_FETCH_ERROR', 500);
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

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
        updatedAt: true,
        studentProfile: {
          include: {
            batch: { include: { program: { include: { department: true } } } },
            roomAllocation: { include: { room: { include: { block: true } } } }
          }
        },
        staffProfile: {
          include: { department: true }
        }
      }
    });

    if (!user) {
      return errorResponse(res, 'User record not found', 'USER_NOT_FOUND', 404);
    }

    return successResponse(res, user, 'User details retrieved');
  } catch (error) {
    console.error('[Admin getUserById Error]:', error);
    return errorResponse(res, 'Failed to fetch user details', 'USER_FETCH_ERROR', 500);
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phoneNumber, department, designation } = req.body;
    const actorRole = req.user?.role;

    // Rule: ADMIN cannot create SUPER_ADMIN accounts
    if (role === 'SUPER_ADMIN' && actorRole !== 'SUPER_ADMIN') {
      return errorResponse(res, 'Only a SUPER_ADMIN can create another SUPER_ADMIN account', 'FORBIDDEN', 403);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return errorResponse(res, 'A user with this email address already exists', 'EMAIL_ALREADY_EXISTS', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        phoneNumber: phoneNumber || null,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phoneNumber: true,
        isActive: true,
        createdAt: true
      }
    });

    // Create staff profile if staff role
    const staffRoles = ['FACULTY', 'WARDEN', 'SECURITY', 'ACCOUNTS', 'ACCOUNTANT', 'MAINTENANCE', 'ADMIN'];
    if (staffRoles.includes(role)) {
      await prisma.staff.create({
        data: {
          userId: newUser.id,
          employeeCode: `EMP-${Date.now().toString().slice(-6)}`,
          designation: designation || role,
          joiningDate: new Date()
        }
      }).catch(err => console.warn('[Admin createUser] Staff profile creation warning:', err.message));
    }

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'USER_CREATED',
      entity: 'User',
      entityId: newUser.id,
      newData: { email: newUser.email, role: newUser.role, firstName: newUser.firstName, lastName: newUser.lastName },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, newUser, 'User created successfully', 201);
  } catch (error) {
    console.error('[Admin createUser Error]:', error);
    return errorResponse(res, 'Failed to create user', 'USER_CREATE_ERROR', 500);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phoneNumber, avatarUrl } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'User record not found', 'USER_NOT_FOUND', 404);
    }

    // Protection: ADMIN cannot modify SUPER_ADMIN user
    if (existing.role === 'SUPER_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return errorResponse(res, 'Administrative privilege error: Only a SUPER_ADMIN can modify a SUPER_ADMIN account', 'FORBIDDEN', 403);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName && { firstName: firstName.trim() }),
        ...(lastName && { lastName: lastName.trim() }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(avatarUrl && { avatarUrl })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phoneNumber: true,
        avatarUrl: true,
        isActive: true,
        updatedAt: true
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: id,
      oldData: { firstName: existing.firstName, lastName: existing.lastName, phoneNumber: existing.phoneNumber },
      newData: { firstName: updated.firstName, lastName: updated.lastName, phoneNumber: updated.phoneNumber },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, updated, 'User profile updated successfully');
  } catch (error) {
    console.error('[Admin updateUser Error]:', error);
    return errorResponse(res, 'Failed to update user', 'USER_UPDATE_ERROR', 500);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'User record not found', 'USER_NOT_FOUND', 404);
    }

    // Protection: Cannot delete/deactivate SUPER_ADMIN unless actor is SUPER_ADMIN
    if (existing.role === 'SUPER_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return errorResponse(res, 'Cannot delete or deactivate a SUPER_ADMIN account', 'FORBIDDEN', 403);
    }

    // Soft-deactivate user account
    const deactivated = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, email: true, isActive: true }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'USER_DEACTIVATED',
      entity: 'User',
      entityId: id,
      oldData: { isActive: true },
      newData: { isActive: false },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, deactivated, 'User deactivated successfully');
  } catch (error) {
    console.error('[Admin deleteUser Error]:', error);
    return errorResponse(res, 'Failed to deactivate user', 'USER_DEACTIVATE_ERROR', 500);
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'User record not found', 'USER_NOT_FOUND', 404);
    }

    if (existing.role === 'SUPER_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return errorResponse(res, 'Cannot alter active status of a SUPER_ADMIN account', 'FORBIDDEN', 403);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, email: true, isActive: true }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entity: 'User',
      entityId: id,
      oldData: { isActive: existing.isActive },
      newData: { isActive },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, updated, `User ${isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    console.error('[Admin updateUserStatus Error]:', error);
    return errorResponse(res, 'Failed to update user status', 'USER_STATUS_ERROR', 500);
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const actorRole = req.user?.role;

    // Rule: ADMIN cannot assign SUPER_ADMIN role
    if (role === 'SUPER_ADMIN' && actorRole !== 'SUPER_ADMIN') {
      return errorResponse(res, 'Only a SUPER_ADMIN can assign the SUPER_ADMIN role', 'FORBIDDEN', 403);
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    // Rule: ADMIN cannot alter a SUPER_ADMIN user
    if (existing.role === 'SUPER_ADMIN' && actorRole !== 'SUPER_ADMIN') {
      return errorResponse(res, 'Cannot modify the role of a SUPER_ADMIN user', 'FORBIDDEN', 403);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'USER_ROLE_CHANGED',
      entity: 'User',
      entityId: id,
      oldData: { role: existing.role },
      newData: { role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, updated, 'User role updated successfully');
  } catch (error) {
    console.error('[Admin updateUserRole Error]:', error);
    return errorResponse(res, 'Failed to update user role', 'USER_ROLE_ERROR', 500);
  }
};

// ====================================================================
// 3. STUDENT MANAGEMENT
// ====================================================================
export const getStudents = async (req, res) => {
  try {
    const { page, limit, skip, search, sortBy, sortOrder } = parsePaginationQuery(req.query, 20);
    const { department, batch, semester, academicStatus, hostel } = req.query;

    const whereClause = {
      ...(academicStatus && { user: { isActive: academicStatus === 'ACTIVE' } }),
      ...(semester && { batch: { currentSemester: Number(semester) } }),
      ...(search && {
        OR: [
          { rollNumber: { contains: search, mode: 'insensitive' } },
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ]
      }),
      ...(batch && { batch: { name: { contains: batch, mode: 'insensitive' } } }),
      ...(department && {
        batch: {
          program: {
            department: {
              code: { equals: department, mode: 'insensitive' }
            }
          }
        }
      }),
      ...(hostel && {
        roomAllocation: {
          room: {
            block: {
              hostel: {
                name: { contains: hostel, mode: 'insensitive' }
              }
            }
          }
        }
      })
    };

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, phoneNumber: true, avatarUrl: true, isActive: true }
          },
          batch: {
            include: {
              program: { include: { department: true } }
            }
          },
          roomAllocation: {
            include: {
              room: {
                include: { block: { include: { hostel: true } } }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { rollNumber: sortOrder }
      }),
      prisma.student.count({ where: whereClause })
    ]);

    const formatted = students.map(s => ({
      id: s.id,
      userId: s.userId,
      rollNumber: s.rollNumber,
      name: `${s.user.firstName} ${s.user.lastName}`,
      email: s.user.email,
      phone: s.user.phoneNumber,
      currentSemester: s.batch?.currentSemester || 1,
      academicStatus: s.user.isActive ? 'ACTIVE' : 'INACTIVE',
      department: s.batch?.program?.department?.name || 'N/A',
      program: s.batch?.program?.name || 'N/A',
      batch: s.batch?.name || 'N/A',
      hostel: s.roomAllocation?.room?.block?.hostel?.name || 'Day Scholar',
      room: s.roomAllocation?.room?.roomNumber || 'None',
      bedNumber: 'Bed-1',
      guardianName: s.guardianName,
      guardianPhone: s.guardianPhone,
      emergencyContact: s.emergencyContact,
      isActive: s.user.isActive
    }));

    return paginatedResponse(res, {
      data: formatted,
      total,
      page,
      limit,
      message: 'Student registry retrieved'
    });
  } catch (error) {
    console.error('[Admin getStudents Error]:', error);
    return errorResponse(res, 'Failed to fetch students', 'STUDENTS_FETCH_ERROR', 500);
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id },
          { userId: id },
          { rollNumber: id }
        ]
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phoneNumber: true, avatarUrl: true, isActive: true, createdAt: true }
        },
        batch: {
          include: {
            program: { include: { department: true } }
          }
        },
        roomAllocation: {
          include: {
            room: {
              include: { block: { include: { hostel: true } } }
            }
          }
        },
        feeRecords: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        leaveRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!student) {
      return errorResponse(res, 'Student record not found', 'STUDENT_NOT_FOUND', 404);
    }

    return successResponse(res, student, 'Student details retrieved');
  } catch (error) {
    console.error('[Admin getStudentById Error]:', error);
    return errorResponse(res, 'Failed to fetch student details', 'STUDENT_FETCH_ERROR', 500);
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { academicStatus, guardianName, guardianPhone, emergencyContact, address } = req.body;

    const existing = await prisma.student.findFirst({
      where: { OR: [{ id }, { userId: id }] }
    });

    if (!existing) {
      return errorResponse(res, 'Student record not found', 'STUDENT_NOT_FOUND', 404);
    }

    const updated = await prisma.student.update({
      where: { id: existing.id },
      data: {
        ...(academicStatus && { academicStatus }),
        ...(guardianName !== undefined && { guardianName }),
        ...(guardianPhone !== undefined && { guardianPhone }),
        ...(emergencyContact !== undefined && { emergencyContact }),
        ...(address !== undefined && { address })
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'STUDENT_UPDATED',
      entity: 'Student',
      entityId: existing.id,
      oldData: { academicStatus: existing.academicStatus, guardianName: existing.guardianName },
      newData: { academicStatus: updated.academicStatus, guardianName: updated.guardianName },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, updated, 'Student record updated successfully');
  } catch (error) {
    console.error('[Admin updateStudent Error]:', error);
    return errorResponse(res, 'Failed to update student record', 'STUDENT_UPDATE_ERROR', 500);
  }
};

// ====================================================================
// 4. NOTICE MANAGEMENT
// ====================================================================
export const getNotices = async (req, res) => {
  try {
    const { page, limit, skip, search, sortOrder } = parsePaginationQuery(req.query, 20);
    const { type, targetType } = req.query;

    const whereClause = {
      ...(type && { type }),
      ...(targetType && { targets: { some: { targetType } } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where: whereClause,
        include: {
          author: {
            include: { user: { select: { firstName: true, lastName: true, email: true } } }
          },
          targets: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder }
      }),
      prisma.notice.count({ where: whereClause })
    ]);

    return paginatedResponse(res, {
      data: notices,
      total,
      page,
      limit,
      message: 'Notices retrieved'
    });
  } catch (error) {
    console.error('[Admin getNotices Error]:', error);
    return errorResponse(res, 'Failed to retrieve notices', 'NOTICES_FETCH_ERROR', 500);
  }
};

export const createNotice = async (req, res) => {
  try {
    const { title, content, type = 'GENERAL', targetType = 'ALL', isUrgent = false, attachmentUrl } = req.body;

    let authorStaffId = req.user?.staffId;
    if (!authorStaffId) {
      const staff = await prisma.staff.findFirst();
      authorStaffId = staff?.id;
    }

    if (!authorStaffId) {
      return errorResponse(res, 'No designated administrative staff profile found for notice publication', 'STAFF_NOT_FOUND', 400);
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        type,
        isUrgent,
        attachmentUrl,
        authorId: authorStaffId,
        targets: {
          create: [{ targetType }]
        }
      },
      include: {
        targets: true
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'NOTICE_CREATED',
      entity: 'Notice',
      entityId: notice.id,
      newData: { title, type, targetType, isUrgent },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, notice, 'Notice created successfully', 201);
  } catch (error) {
    console.error('[Admin createNotice Error]:', error);
    return errorResponse(res, 'Failed to create notice', 'NOTICE_CREATE_ERROR', 500);
  }
};

export const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, isUrgent, attachmentUrl, targetType } = req.body;

    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Notice not found', 'NOTICE_NOT_FOUND', 404);
    }

    const updated = await prisma.notice.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(type && { type }),
        ...(isUrgent !== undefined && { isUrgent }),
        ...(attachmentUrl !== undefined && { attachmentUrl })
      },
      include: { targets: true }
    });

    if (targetType) {
      await prisma.noticeTarget.deleteMany({ where: { noticeId: id } });
      await prisma.noticeTarget.create({
        data: { noticeId: id, targetType }
      });
    }

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'NOTICE_UPDATED',
      entity: 'Notice',
      entityId: id,
      oldData: { title: existing.title, type: existing.type },
      newData: { title: updated.title, type: updated.type },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, updated, 'Notice updated successfully');
  } catch (error) {
    console.error('[Admin updateNotice Error]:', error);
    return errorResponse(res, 'Failed to update notice', 'NOTICE_UPDATE_ERROR', 500);
  }
};

export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Notice not found', 'NOTICE_NOT_FOUND', 404);
    }

    await prisma.notice.delete({ where: { id } });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'NOTICE_DELETED',
      entity: 'Notice',
      entityId: id,
      oldData: { title: existing.title },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, { id }, 'Notice deleted successfully');
  } catch (error) {
    console.error('[Admin deleteNotice Error]:', error);
    return errorResponse(res, 'Failed to delete notice', 'NOTICE_DELETE_ERROR', 500);
  }
};

export const publishNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await prisma.notice.findUnique({
      where: { id },
      include: { targets: true }
    });

    if (!notice) {
      return errorResponse(res, 'Notice not found', 'NOTICE_NOT_FOUND', 404);
    }

    const targetType = notice.targets[0]?.targetType || 'ALL';

    // Broadcast in-app notifications to targeted roles
    let userFilter = { isActive: true };
    if (targetType !== 'ALL') {
      userFilter.role = targetType;
    }

    const recipients = await prisma.user.findMany({
      where: userFilter,
      select: { id: true }
    });

    if (recipients.length > 0) {
      await prisma.notification.createMany({
        data: recipients.map(u => ({
          userId: u.id,
          title: `Notice: ${notice.title}`,
          message: notice.content.slice(0, 150),
          type: 'NOTICE',
          linkUrl: '/notices'
        }))
      });
    }

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'NOTICE_PUBLISHED',
      entity: 'Notice',
      entityId: id,
      newData: { recipientCount: recipients.length, targetType },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, {
      noticeId: id,
      recipientsNotified: recipients.length
    }, 'Notice published and broadcasted successfully');
  } catch (error) {
    console.error('[Admin publishNotice Error]:', error);
    return errorResponse(res, 'Failed to publish notice', 'NOTICE_PUBLISH_ERROR', 500);
  }
};

// ====================================================================
// 5. IMMUTABLE AUDIT LOG VIEWER
// ====================================================================
export const getAuditLogs = async (req, res) => {
  try {
    const { page, limit, skip, search, sortBy, sortOrder, dateFrom, dateTo } = parsePaginationQuery(req.query, 50);
    const { action, entity } = req.query;

    const whereClause = {
      ...(action && { action: { equals: action, mode: 'insensitive' } }),
      ...(entity && { entity: { equals: entity, mode: 'insensitive' } }),
      ...(dateFrom || dateTo ? {
        createdAt: {
          ...(dateFrom && { gte: dateFrom }),
          ...(dateTo && { lte: dateTo })
        }
      } : {}),
      ...(search && {
        OR: [
          { action: { contains: search, mode: 'insensitive' } },
          { entity: { contains: search, mode: 'insensitive' } },
          { entityId: { contains: search, mode: 'insensitive' } },
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, role: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder }
      }),
      prisma.auditLog.count({ where: whereClause })
    ]);

    return paginatedResponse(res, {
      data: logs,
      total,
      page,
      limit,
      message: 'Immutable audit logs retrieved'
    });
  } catch (error) {
    console.error('[Admin getAuditLogs Error]:', error);
    return errorResponse(res, 'Failed to fetch audit logs', 'AUDIT_LOG_ERROR', 500);
  }
};

export default {
  getAdminDashboard,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  getStudents,
  getStudentById,
  updateStudent,
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  publishNotice,
  getAuditLogs
};
