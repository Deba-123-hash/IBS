import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createAuditLog } from '../utils/auditLogger.js';
import { parsePaginationQuery, paginatedResponse } from '../utils/pagination.js';

// ====================================================================
// 1. WARDEN DASHBOARD
// ====================================================================
export const getWardenDashboard = async (req, res) => {
  try {
    const [
      hostelStudentsCount,
      rooms,
      pendingTransfersCount,
      pendingComplaintsCount,
      pendingLeavesCount,
      pendingVisitorRequestsCount,
      recentComplaints
    ] = await Promise.all([
      // Total hostel students
      prisma.roomAllocation.count({ where: { isActive: true } }),
      // Rooms
      prisma.room.findMany({ select: { capacity: true, currentOccupancy: true } }),
      // Pending room transfers
      prisma.roomTransfer.count({ where: { status: 'PENDING' } }),
      // Complaints in hostel
      prisma.complaint.count({
        where: {
          status: { in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'] }
        }
      }),
      // Leave requests
      prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      // Visitor requests
      prisma.visitorRequest.count({ where: { status: 'PENDING' } }),
      // Recent hostel complaints
      prisma.complaint.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true } } } },
          category: true
        }
      })
    ]);

    const occupiedRooms = rooms.filter(r => (r.currentOccupancy || 0) > 0).length;
    const availableRooms = rooms.filter(r => (r.capacity || 0) > (r.currentOccupancy || 0)).length;

    return successResponse(res, {
      totalHostelStudents: hostelStudentsCount,
      occupiedRooms,
      availableRooms,
      totalRooms: rooms.length,
      pendingRoomRequests: pendingTransfersCount,
      complaints: pendingComplaintsCount,
      leaveRequests: pendingLeavesCount,
      visitorRequests: pendingVisitorRequestsCount,
      attendanceIssues: 0,
      recentComplaints: recentComplaints.map(c => ({
        id: c.id,
        title: c.title,
        category: c.category?.name || 'General',
        priority: c.priority,
        status: c.status,
        studentName: c.student ? `${c.student.user.firstName} ${c.student.user.lastName}` : 'N/A',
        createdAt: c.createdAt
      }))
    }, 'Warden dashboard telemetry loaded');
  } catch (error) {
    console.error('[Warden Dashboard Error]:', error);
    return errorResponse(res, 'Failed to fetch warden dashboard telemetry', 'WARDEN_DASHBOARD_ERROR', 500);
  }
};

// ====================================================================
// 2. HOSTEL & ROOM MANAGEMENT
// ====================================================================
export const getHostels = async (req, res) => {
  try {
    const hostels = await prisma.hostel.findMany({
      include: {
        blocks: {
          include: {
            rooms: {
              select: { id: true, roomNumber: true, floorNumber: true, capacity: true, currentOccupancy: true }
            }
          }
        },
        warden: {
          include: { user: { select: { firstName: true, lastName: true, email: true, phoneNumber: true } } }
        }
      }
    });

    return successResponse(res, hostels, 'Hostels retrieved');
  } catch (error) {
    console.error('[Warden getHostels Error]:', error);
    return errorResponse(res, 'Failed to fetch hostels', 'HOSTELS_ERROR', 500);
  }
};

export const getHostelById = async (req, res) => {
  try {
    const { id } = req.params;

    const hostel = await prisma.hostel.findUnique({
      where: { id },
      include: {
        blocks: {
          include: {
            rooms: {
              include: {
                allocations: {
                  where: { isActive: true },
                  include: {
                    student: { include: { user: { select: { firstName: true, lastName: true } } } }
                  }
                }
              }
            }
          }
        },
        warden: {
          include: { user: { select: { firstName: true, lastName: true, email: true, phoneNumber: true } } }
        }
      }
    });

    if (!hostel) {
      return errorResponse(res, 'Hostel not found', 'HOSTEL_NOT_FOUND', 404);
    }

    return successResponse(res, hostel, 'Hostel details retrieved');
  } catch (error) {
    console.error('[Warden getHostelById Error]:', error);
    return errorResponse(res, 'Failed to fetch hostel details', 'HOSTEL_FETCH_ERROR', 500);
  }
};

export const getRooms = async (req, res) => {
  try {
    const { page, limit, skip, search, sortOrder } = parsePaginationQuery(req.query, 30);
    const { blockId, hostelId } = req.query;

    const whereClause = {
      ...(blockId && { blockId }),
      ...(hostelId && { block: { hostelId } }),
      ...(search && { roomNumber: { contains: search, mode: 'insensitive' } })
    };

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where: whereClause,
        include: {
          block: {
            include: { hostel: true }
          },
          allocations: {
            where: { isActive: true },
            include: {
              student: {
                include: { user: { select: { firstName: true, lastName: true } } }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { roomNumber: sortOrder }
      }),
      prisma.room.count({ where: whereClause })
    ]);

    const formatted = rooms.map(r => ({
      id: r.id,
      roomNumber: r.roomNumber,
      floorNumber: r.floorNumber,
      capacity: r.capacity,
      currentOccupancy: r.currentOccupancy,
      vacantBeds: Math.max(0, r.capacity - r.currentOccupancy),
      blockName: r.block?.name || 'N/A',
      hostelName: r.block?.hostel?.name || 'N/A',
      occupants: r.allocations.map(a => ({
        allocationId: a.id,
        studentId: a.studentId,
        studentName: a.student ? `${a.student.user.firstName} ${a.student.user.lastName}` : 'Unknown',
        rollNumber: a.student?.rollNumber || 'N/A'
      }))
    }));

    return paginatedResponse(res, {
      data: formatted,
      total,
      page,
      limit,
      message: 'Hostel rooms retrieved'
    });
  } catch (error) {
    console.error('[Warden getRooms Error]:', error);
    return errorResponse(res, 'Failed to fetch rooms', 'ROOMS_FETCH_ERROR', 500);
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        block: { include: { hostel: true } },
        allocations: {
          where: { isActive: true },
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true, email: true, phoneNumber: true } },
                batch: { include: { program: true } }
              }
            }
          }
        }
      }
    });

    if (!room) {
      return errorResponse(res, 'Room record not found', 'ROOM_NOT_FOUND', 404);
    }

    return successResponse(res, room, 'Room details retrieved');
  } catch (error) {
    console.error('[Warden getRoomById Error]:', error);
    return errorResponse(res, 'Failed to fetch room details', 'ROOM_FETCH_ERROR', 500);
  }
};

// ====================================================================
// 3. ROOM ALLOCATION
// ====================================================================
export const allocateRoom = async (req, res) => {
  try {
    const { studentId, roomId } = req.body;

    const [student, room] = await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        include: { roomAllocation: true }
      }),
      prisma.room.findUnique({
        where: { id: roomId },
        include: { allocations: { where: { isActive: true } } }
      })
    ]);

    if (!student) {
      return errorResponse(res, 'Student record not found', 'STUDENT_NOT_FOUND', 404);
    }
    if (!room) {
      return errorResponse(res, 'Target room not found', 'ROOM_NOT_FOUND', 404);
    }

    if (room.currentOccupancy >= room.capacity) {
      return errorResponse(res, 'Room capacity is full. Cannot allocate bed.', 'ROOM_FULL', 400);
    }

    // If student already has an active allocation, vacate previous room
    if (student.roomAllocation && student.roomAllocation.isActive) {
      await prisma.roomAllocation.update({
        where: { id: student.roomAllocation.id },
        data: { isActive: false, endDate: new Date() }
      });
      await prisma.room.update({
        where: { id: student.roomAllocation.roomId },
        data: { currentOccupancy: { decrement: 1 } }
      });
    }

    const allocation = await prisma.roomAllocation.create({
      data: {
        studentId,
        roomId,
        startDate: new Date(),
        isActive: true
      },
      include: {
        room: { include: { block: { include: { hostel: true } } } },
        student: { include: { user: { select: { firstName: true, lastName: true } } } }
      }
    });

    await prisma.room.update({
      where: { id: roomId },
      data: { currentOccupancy: { increment: 1 } }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'ROOM_ALLOCATED',
      entity: 'RoomAllocation',
      entityId: allocation.id,
      newData: { studentId, roomId, roomNumber: room.roomNumber },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, allocation, 'Room successfully allocated to student', 201);
  } catch (error) {
    console.error('[Warden allocateRoom Error]:', error);
    return errorResponse(res, 'Failed to allocate room', 'ROOM_ALLOCATION_ERROR', 500);
  }
};

export const updateAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const existing = await prisma.roomAllocation.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Room allocation record not found', 'ALLOCATION_NOT_FOUND', 404);
    }

    const updated = await prisma.roomAllocation.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive })
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'ROOM_ALLOCATION_UPDATED',
      entity: 'RoomAllocation',
      entityId: id,
      oldData: { isActive: existing.isActive },
      newData: { isActive: updated.isActive },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, updated, 'Room allocation updated successfully');
  } catch (error) {
    console.error('[Warden updateAllocation Error]:', error);
    return errorResponse(res, 'Failed to update allocation', 'ALLOCATION_UPDATE_ERROR', 500);
  }
};

export const vacateAllocation = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.roomAllocation.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Room allocation record not found', 'ALLOCATION_NOT_FOUND', 404);
    }

    const vacated = await prisma.roomAllocation.update({
      where: { id },
      data: { isActive: false, endDate: new Date() }
    });

    await prisma.room.update({
      where: { id: existing.roomId },
      data: { currentOccupancy: { decrement: 1 } }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'ROOM_DEALLOCATED',
      entity: 'RoomAllocation',
      entityId: id,
      oldData: { isActive: true },
      newData: { isActive: false },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, vacated, 'Student vacated from room successfully');
  } catch (error) {
    console.error('[Warden vacateAllocation Error]:', error);
    return errorResponse(res, 'Failed to vacate room allocation', 'VACATE_ERROR', 500);
  }
};

// ====================================================================
// 4. ROOM TRANSFER
// ====================================================================
export const initiateRoomTransfer = async (req, res) => {
  try {
    const { studentId, toRoomId, reason } = req.body;

    const [student, toRoom] = await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        include: { roomAllocation: true }
      }),
      prisma.room.findUnique({ where: { id: toRoomId } })
    ]);

    if (!student || !student.roomAllocation || !student.roomAllocation.isActive) {
      return errorResponse(res, 'Student does not have an active hostel room allocation to transfer from', 'NO_ACTIVE_ALLOCATION', 400);
    }

    if (!toRoom) {
      return errorResponse(res, 'Destination room not found', 'ROOM_NOT_FOUND', 404);
    }

    const transfer = await prisma.roomTransfer.create({
      data: {
        studentId,
        fromRoomId: student.roomAllocation.roomId,
        toRoomId,
        reason,
        status: 'PENDING'
      },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        fromRoom: true,
        toRoom: true
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'ROOM_TRANSFER_INITIATED',
      entity: 'RoomTransfer',
      entityId: transfer.id,
      newData: { studentId, fromRoomId: student.roomAllocation.roomId, toRoomId, reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, transfer, 'Room transfer request registered', 201);
  } catch (error) {
    console.error('[Warden initiateRoomTransfer Error]:', error);
    return errorResponse(res, 'Failed to initiate room transfer', 'TRANSFER_INITIATE_ERROR', 500);
  }
};

export const getRoomTransfers = async (req, res) => {
  try {
    const { page, limit, skip, sortOrder, status } = parsePaginationQuery(req.query, 20);

    const whereClause = {
      ...(status && { status })
    };

    const [transfers, total] = await Promise.all([
      prisma.roomTransfer.findMany({
        where: whereClause,
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true } } } },
          fromRoom: { include: { block: true } },
          toRoom: { include: { block: true } },
          reviewedBy: { select: { firstName: true, lastName: true } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder }
      }),
      prisma.roomTransfer.count({ where: whereClause })
    ]);

    return paginatedResponse(res, {
      data: transfers,
      total,
      page,
      limit,
      message: 'Room transfer requests retrieved'
    });
  } catch (error) {
    console.error('[Warden getRoomTransfers Error]:', error);
    return errorResponse(res, 'Failed to fetch transfer requests', 'TRANSFER_FETCH_ERROR', 500);
  }
};

export const approveRoomTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const reviewedById = req.user?.id;

    const transfer = await prisma.roomTransfer.findUnique({
      where: { id },
      include: {
        toRoom: true,
        student: { include: { roomAllocation: true } }
      }
    });

    if (!transfer) {
      return errorResponse(res, 'Transfer request not found', 'TRANSFER_NOT_FOUND', 404);
    }

    if (transfer.status !== 'PENDING') {
      return errorResponse(res, `Cannot approve transfer in status '${transfer.status}'`, 'INVALID_STATUS', 400);
    }

    if (transfer.toRoom.currentOccupancy >= transfer.toRoom.capacity) {
      return errorResponse(res, 'Target room capacity is full. Transfer cannot be completed.', 'ROOM_FULL', 400);
    }

    await prisma.$transaction([
      prisma.roomTransfer.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedById,
          remarks
        }
      }),
      prisma.roomAllocation.updateMany({
        where: { studentId: transfer.studentId, isActive: true },
        data: { isActive: false, endDate: new Date() }
      }),
      prisma.room.update({
        where: { id: transfer.fromRoomId },
        data: { currentOccupancy: { decrement: 1 } }
      }),
      prisma.roomAllocation.create({
        data: {
          studentId: transfer.studentId,
          roomId: transfer.toRoomId,
          startDate: new Date(),
          isActive: true
        }
      }),
      prisma.room.update({
        where: { id: transfer.toRoomId },
        data: { currentOccupancy: { increment: 1 } }
      })
    ]);

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'ROOM_TRANSFERRED',
      entity: 'RoomTransfer',
      entityId: id,
      oldData: { status: 'PENDING', fromRoomId: transfer.fromRoomId },
      newData: { status: 'APPROVED', toRoomId: transfer.toRoomId, remarks },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, { id, status: 'APPROVED' }, 'Room transfer approved and student relocated successfully');
  } catch (error) {
    console.error('[Warden approveRoomTransfer Error]:', error);
    return errorResponse(res, 'Failed to approve room transfer', 'TRANSFER_APPROVE_ERROR', 500);
  }
};

export const rejectRoomTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const reviewedById = req.user?.id;

    const transfer = await prisma.roomTransfer.findUnique({ where: { id } });
    if (!transfer) {
      return errorResponse(res, 'Transfer request not found', 'TRANSFER_NOT_FOUND', 404);
    }

    const updated = await prisma.roomTransfer.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedById,
        remarks: remarks || 'Transfer request declined by warden'
      }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'ROOM_TRANSFER_REJECTED',
      entity: 'RoomTransfer',
      entityId: id,
      oldData: { status: transfer.status },
      newData: { status: 'REJECTED', remarks },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, updated, 'Room transfer request rejected');
  } catch (error) {
    console.error('[Warden rejectRoomTransfer Error]:', error);
    return errorResponse(res, 'Failed to reject room transfer', 'TRANSFER_REJECT_ERROR', 500);
  }
};

// ====================================================================
// 5. LEAVE REQUEST MANAGEMENT
// ====================================================================
export const getLeaveRequests = async (req, res) => {
  try {
    const { page, limit, skip, sortOrder, status } = parsePaginationQuery(req.query, 20);

    const whereClause = {
      ...(status && { status })
    };

    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, phoneNumber: true, email: true } },
              roomAllocation: { include: { room: true } }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder }
      }),
      prisma.leaveRequest.count({ where: whereClause })
    ]);

    const formatted = requests.map(r => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.student ? `${r.student.user.firstName} ${r.student.user.lastName}` : 'N/A',
      rollNumber: r.student?.rollNumber || 'N/A',
      room: r.student?.roomAllocation?.room?.roomNumber || 'N/A',
      startDate: r.startDate,
      endDate: r.endDate,
      reason: r.reason,
      destination: r.destination,
      emergencyContact: r.emergencyContact,
      status: r.status,
      createdAt: r.createdAt
    }));

    return paginatedResponse(res, {
      data: formatted,
      total,
      page,
      limit,
      message: 'Student leave requests retrieved'
    });
  } catch (error) {
    console.error('[Warden getLeaveRequests Error]:', error);
    return errorResponse(res, 'Failed to retrieve leave requests', 'LEAVES_FETCH_ERROR', 500);
  }
};

export const getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phoneNumber: true } },
            roomAllocation: { include: { room: true } }
          }
        }
      }
    });

    if (!leave) {
      return errorResponse(res, 'Leave request not found', 'LEAVE_NOT_FOUND', 404);
    }

    return successResponse(res, leave, 'Leave request details retrieved');
  } catch (error) {
    console.error('[Warden getLeaveRequestById Error]:', error);
    return errorResponse(res, 'Failed to fetch leave request details', 'LEAVE_FETCH_ERROR', 500);
  }
};

export const approveLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const existing = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { student: { include: { user: true } } }
    });

    if (!existing) {
      return errorResponse(res, 'Leave request not found', 'LEAVE_NOT_FOUND', 404);
    }

    const approved = await prisma.leaveRequest.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    await prisma.notification.create({
      data: {
        userId: existing.student.userId,
        title: 'Hostel Leave Approved',
        message: `Your leave request for ${existing.destination} has been approved by the Warden.`,
        type: 'LEAVE',
        linkUrl: '/student/leave'
      }
    }).catch(() => {});

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'LEAVE_APPROVED',
      entity: 'LeaveRequest',
      entityId: id,
      oldData: { status: existing.status },
      newData: { status: 'APPROVED', remarks },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, approved, 'Hostel leave approved successfully');
  } catch (error) {
    console.error('[Warden approveLeaveRequest Error]:', error);
    return errorResponse(res, 'Failed to approve leave request', 'LEAVE_APPROVE_ERROR', 500);
  }
};

export const rejectLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const existing = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { student: { include: { user: true } } }
    });

    if (!existing) {
      return errorResponse(res, 'Leave request not found', 'LEAVE_NOT_FOUND', 404);
    }

    const rejected = await prisma.leaveRequest.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    await prisma.notification.create({
      data: {
        userId: existing.student.userId,
        title: 'Hostel Leave Rejected',
        message: `Your leave request for ${existing.destination} was rejected. Reason: ${remarks || 'Administrative decision'}`,
        type: 'LEAVE',
        linkUrl: '/student/leave'
      }
    }).catch(() => {});

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'LEAVE_REJECTED',
      entity: 'LeaveRequest',
      entityId: id,
      oldData: { status: existing.status },
      newData: { status: 'REJECTED', remarks },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, rejected, 'Hostel leave request rejected');
  } catch (error) {
    console.error('[Warden rejectLeaveRequest Error]:', error);
    return errorResponse(res, 'Failed to reject leave request', 'LEAVE_REJECT_ERROR', 500);
  }
};

// ====================================================================
// 6. HOSTEL COMPLAINTS
// ====================================================================
export const getHostelComplaints = async (req, res) => {
  try {
    const { page, limit, skip, sortOrder, status, category } = parsePaginationQuery(req.query, 20);

    const whereClause = {
      ...(category && { category: { code: category } }),
      ...(status && { status })
    };

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where: whereClause,
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true, phoneNumber: true } } } },
          category: true,
          assignment: { include: { staff: { include: { user: { select: { firstName: true, lastName: true } } } } } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder }
      }),
      prisma.complaint.count({ where: whereClause })
    ]);

    return paginatedResponse(res, {
      data: complaints,
      total,
      page,
      limit,
      message: 'Hostel complaints retrieved'
    });
  } catch (error) {
    console.error('[Warden getHostelComplaints Error]:', error);
    return errorResponse(res, 'Failed to fetch hostel complaints', 'COMPLAINTS_FETCH_ERROR', 500);
  }
};

export const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;
    const assignedById = req.user?.id;

    const [complaint, staff] = await Promise.all([
      prisma.complaint.findUnique({ where: { id } }),
      prisma.staff.findUnique({ where: { id: staffId } })
    ]);

    if (!complaint) {
      return errorResponse(res, 'Complaint record not found', 'COMPLAINT_NOT_FOUND', 404);
    }
    if (!staff) {
      return errorResponse(res, 'Designated staff profile not found', 'STAFF_NOT_FOUND', 404);
    }

    const assignment = await prisma.complaintAssignment.upsert({
      where: { complaintId: id },
      update: {
        staffId,
        assignedById,
        assignedAt: new Date()
      },
      create: {
        complaintId: id,
        staffId,
        assignedById
      }
    });

    await prisma.complaint.update({
      where: { id },
      data: { status: 'ASSIGNED' }
    });

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'COMPLAINT_ASSIGNED',
      entity: 'Complaint',
      entityId: id,
      newData: { staffId, status: 'ASSIGNED' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, assignment, 'Complaint assigned to maintenance personnel');
  } catch (error) {
    console.error('[Warden assignComplaint Error]:', error);
    return errorResponse(res, 'Failed to assign complaint', 'ASSIGN_ERROR', 500);
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const changedById = req.user?.id;

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Complaint record not found', 'COMPLAINT_NOT_FOUND', 404);
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status,
        ...(status === 'RESOLVED' && { resolvedAt: new Date() })
      }
    });

    await prisma.complaintStatusHistory.create({
      data: {
        complaintId: id,
        fromStatus: existing.status,
        toStatus: status,
        changedById,
        comment
      }
    }).catch(() => {});

    await createAuditLog({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action: 'COMPLAINT_STATUS_CHANGED',
      entity: 'Complaint',
      entityId: id,
      oldData: { status: existing.status },
      newData: { status, comment },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return successResponse(res, updated, `Complaint status updated to ${status}`);
  } catch (error) {
    console.error('[Warden updateComplaintStatus Error]:', error);
    return errorResponse(res, 'Failed to update complaint status', 'STATUS_UPDATE_ERROR', 500);
  }
};

// ====================================================================
// 6. RESIDENT & HOSTEL STUDENTS DIRECTORY
// ====================================================================
export const getHostelStudents = async (req, res) => {
  try {
    const allocations = await prisma.roomAllocation.findMany({
      where: { isActive: true },
      include: {
        room: {
          include: {
            block: {
              include: { hostel: true }
            }
          }
        },
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true
              }
            },
            batch: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    const studentList = allocations.map(a => ({
      id: a.student?.id || a.id,
      allocationId: a.id,
      name: a.student?.user ? `${a.student.user.firstName} ${a.student.user.lastName}` : 'N/A',
      email: a.student?.user?.email || 'N/A',
      rollNumber: a.student?.rollNumber || 'N/A',
      phoneNumber: a.student?.user?.phoneNumber || 'N/A',
      department: a.student?.batch?.name || 'Computer Science',
      roomNumber: a.room?.roomNumber || 'N/A',
      floorNumber: a.room?.floorNumber || 1,
      hostelName: a.room?.block?.hostel?.name || 'Main Hostel',
      allocatedAt: a.startDate
    }));

    return successResponse(res, studentList, 'Hostel resident students retrieved');
  } catch (error) {
    console.error('[Warden getHostelStudents Error]:', error);
    return errorResponse(res, 'Failed to fetch hostel students', 'HOSTEL_STUDENTS_ERROR', 500);
  }
};

export default {
  getWardenDashboard,
  getHostels,
  getHostelById,
  getRooms,
  getRoomById,
  allocateRoom,
  updateAllocation,
  vacateAllocation,
  initiateRoomTransfer,
  getRoomTransfers,
  approveRoomTransfer,
  rejectRoomTransfer,
  getLeaveRequests,
  getLeaveRequestById,
  approveLeaveRequest,
  rejectLeaveRequest,
  getHostelComplaints,
  assignComplaint,
  updateComplaintStatus,
  getHostelStudents
};
