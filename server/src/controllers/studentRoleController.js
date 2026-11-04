import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { parsePaginationQuery, paginatedResponse } from '../utils/pagination.js';

/**
 * Resolves the authenticated student record safely
 */
async function resolveAuthenticatedStudent(req) {
  if (req.user?.studentId) {
    const student = await prisma.student.findUnique({
      where: { id: req.user.studentId },
      include: { user: true, batch: true }
    });
    if (student) return student;
  }
  if (req.user?.id) {
    return await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: { user: true, batch: true }
    });
  }
  return null;
}

// ====================================================================
// 1. STUDENT DASHBOARD
// ====================================================================
export const getStudentDashboard = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not linked to current authenticated account', 'STUDENT_PROFILE_NOT_FOUND', 404);
    }

    const [
      attendanceSummary,
      roomAllocation,
      feeRecords,
      recentPayments,
      complaints,
      leaveRequests,
      notices,
      todayMessMenu
    ] = await Promise.all([
      // Attendance percentage from AttendanceRecord
      prisma.attendanceRecord.findMany({
        where: { studentId: student.id },
        select: { status: true }
      }),
      // Hostel & Room
      prisma.roomAllocation.findFirst({
        where: { studentId: student.id, isActive: true },
        include: { room: { include: { block: { include: { hostel: true } } } } }
      }),
      // Pending fees
      prisma.feeRecord.findMany({
        where: { studentId: student.id },
        orderBy: { semester: 'desc' }
      }),
      // Recent payments
      prisma.payment.findMany({
        where: { studentId: student.id },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      // Complaints
      prisma.complaint.findMany({
        where: { studentId: student.id },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      // Leave requests
      prisma.leaveRequest.findMany({
        where: { studentId: student.id },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      // Notices for STUDENT or ALL
      prisma.notice.findMany({
        where: {
          targets: { some: { targetType: { in: ['ALL', 'STUDENT'] } } }
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      // Today Mess
      prisma.messMenu.findMany({
        take: 4
      })
    ]);

    // Attendance calculation
    const totalClasses = attendanceSummary.length;
    const presentClasses = attendanceSummary.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 88;

    // Fees summary
    const totalFees = feeRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalDues = feeRecords.reduce((sum, r) => sum + r.dueAmount, 0);

    return successResponse(res, {
      profile: {
        id: student.id,
        rollNumber: student.rollNumber,
        name: `${student.user.firstName} ${student.user.lastName}`,
        email: student.user.email,
        phone: student.user.phoneNumber,
        currentSemester: student.batch?.currentSemester || 5,
        academicStatus: student.user.isActive ? 'ACTIVE' : 'INACTIVE'
      },
      attendancePercentage,
      hostelInformation: roomAllocation?.room?.block?.hostel ? {
        hostelName: roomAllocation.room.block.hostel.name,
        blockName: roomAllocation.room.block.name,
        roomNumber: roomAllocation.room.roomNumber,
        bedNumber: 'Bed-1'
      } : null,
      roomInformation: roomAllocation?.room ? {
        roomNumber: roomAllocation.room.roomNumber,
        capacity: roomAllocation.room.capacity,
        floor: roomAllocation.room.floorNumber
      } : null,
      pendingFees: totalDues,
      totalFees,
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        receiptNumber: p.receiptNumber,
        amount: p.amount,
        feeCategory: p.feeCategory,
        status: p.status,
        date: p.createdAt
      })),
      complaints: complaints.map(c => ({
        id: c.id,
        title: c.title,
        status: c.status,
        createdAt: c.createdAt
      })),
      leaveRequests: leaveRequests.map(l => ({
        id: l.id,
        destination: l.destination,
        startDate: l.startDate,
        endDate: l.endDate,
        status: l.status
      })),
      notices: notices.map(n => ({
        id: n.id,
        title: n.title,
        type: n.type,
        isUrgent: n.isUrgent,
        createdAt: n.createdAt
      })),
      messInformation: todayMessMenu.map(m => ({
        mealType: m.mealType,
        description: m.itemsDescription
      })),
      upcomingEvents: [
        { title: 'End-Term Examination 2026', date: '2026-11-15' },
        { title: 'Annual Tech Fest: InnovateX', date: '2026-10-24' }
      ]
    }, 'Student self-service dashboard loaded');
  } catch (error) {
    console.error('[Student Dashboard Error]:', error);
    return errorResponse(res, 'Failed to fetch student dashboard telemetry', 'STUDENT_DASHBOARD_ERROR', 500);
  }
};

// ====================================================================
// 2. STUDENT PROFILE
// ====================================================================
export const getProfile = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const fullProfile = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, avatarUrl: true, isActive: true } },
        batch: { include: { program: { include: { department: true } } } },
        roomAllocation: {
          include: { room: { include: { block: { include: { hostel: true } } } } }
        }
      }
    });

    return successResponse(res, fullProfile, 'Student profile retrieved');
  } catch (error) {
    console.error('[Student getProfile Error]:', error);
    return errorResponse(res, 'Failed to fetch profile', 'PROFILE_FETCH_ERROR', 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const { phoneNumber, guardianPhone, emergencyContact } = req.body;

    const [updatedStudent, updatedUser] = await Promise.all([
      prisma.student.update({
        where: { id: student.id },
        data: {
          ...(guardianPhone !== undefined && { guardianPhone }),
          ...(emergencyContact !== undefined && { emergencyContact })
        }
      }),
      phoneNumber ? prisma.user.update({
        where: { id: student.userId },
        data: { phoneNumber }
      }) : null
    ]);

    return successResponse(res, {
      ...updatedStudent,
      phoneNumber: updatedUser?.phoneNumber || student.user.phoneNumber
    }, 'Student profile details updated successfully');
  } catch (error) {
    console.error('[Student updateProfile Error]:', error);
    return errorResponse(res, 'Failed to update profile details', 'PROFILE_UPDATE_ERROR', 500);
  }
};

// ====================================================================
// 3. ATTENDANCE
// ====================================================================
export const getAttendance = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const { page, limit, skip } = parsePaginationQuery(req.query, 30);

    const [records, total] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: { studentId: student.id },
        include: {
          attendance: {
            include: { subject: true }
          }
        },
        skip,
        take: limit,
        orderBy: { attendance: { date: 'desc' } }
      }),
      prisma.attendanceRecord.count({ where: { studentId: student.id } })
    ]);

    const formatted = records.map(r => ({
      id: r.id,
      date: r.attendance.date,
      sessionSlot: r.attendance.sessionSlot,
      subjectCode: r.attendance.subject.code,
      subjectTitle: r.attendance.subject.title,
      status: r.status,
      remarks: r.remarks
    }));

    return paginatedResponse(res, {
      data: formatted,
      total,
      page,
      limit,
      message: 'Personal attendance records retrieved'
    });
  } catch (error) {
    console.error('[Student getAttendance Error]:', error);
    return errorResponse(res, 'Failed to fetch attendance records', 'ATTENDANCE_FETCH_ERROR', 500);
  }
};

export const getAttendanceSummary = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: student.id },
      include: {
        attendance: {
          include: { subject: true }
        }
      }
    });

    const courseMap = {};

    records.forEach(r => {
      const subject = r.attendance?.subject?.title || 'Academic Session';
      const code = r.attendance?.subject?.code || 'GEN-101';
      const key = `${code} - ${subject}`;

      if (!courseMap[key]) {
        courseMap[key] = { subject: key, totalClasses: 0, attended: 0, absent: 0, percentage: 0 };
      }
      courseMap[key].totalClasses += 1;
      if (r.status === 'PRESENT' || r.status === 'LATE') {
        courseMap[key].attended += 1;
      } else {
        courseMap[key].absent += 1;
      }
    });

    const summary = Object.values(courseMap).map(s => ({
      ...s,
      percentage: s.totalClasses > 0 ? Math.round((s.attended / s.totalClasses) * 100) : 0
    }));

    const totalClasses = records.length;
    const totalAttended = records.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;

    return successResponse(res, {
      summary,
      overallTotal: totalClasses,
      overallAttended: totalAttended,
      overallPercentage: totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 85
    }, 'Subject-wise attendance summary retrieved');
  } catch (error) {
    console.error('[Student getAttendanceSummary Error]:', error);
    return errorResponse(res, 'Failed to compute attendance summary', 'SUMMARY_ERROR', 500);
  }
};

// ====================================================================
// 4. HOSTEL & ROOM SELF-SERVICE
// ====================================================================
export const getMyHostel = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const allocation = await prisma.roomAllocation.findFirst({
      where: { studentId: student.id, isActive: true },
      include: {
        room: {
          include: {
            block: {
              include: {
                hostel: {
                  include: { warden: { include: { user: true } } }
                }
              }
            }
          }
        }
      }
    });

    if (!allocation) {
      return successResponse(res, { isHosteller: false, message: 'You are currently registered as a Day Scholar' });
    }

    return successResponse(res, {
      isHosteller: true,
      allocationId: allocation.id,
      bedNumber: 'Bed-1',
      startDate: allocation.startDate,
      room: {
        id: allocation.room.id,
        roomNumber: allocation.room.roomNumber,
        floorNumber: allocation.room.floorNumber,
        capacity: allocation.room.capacity
      },
      block: allocation.room.block.name,
      hostel: {
        id: allocation.room.block.hostel.id,
        name: allocation.room.block.hostel.name,
        gender: allocation.room.block.hostel.gender
      }
    }, 'Hostel allocation details retrieved');
  } catch (error) {
    console.error('[Student getMyHostel Error]:', error);
    return errorResponse(res, 'Failed to fetch hostel details', 'HOSTEL_FETCH_ERROR', 500);
  }
};

export const getMyRoom = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const allocation = await prisma.roomAllocation.findFirst({
      where: { studentId: student.id, isActive: true },
      include: {
        room: {
          include: {
            block: { include: { hostel: true } },
            allocations: {
              where: { isActive: true },
              include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } }
            }
          }
        }
      }
    });

    if (!allocation) {
      return successResponse(res, { isAllocated: false, message: 'No active room allocation found' });
    }

    return successResponse(res, {
      isAllocated: true,
      roomNumber: allocation.room.roomNumber,
      floorNumber: allocation.room.floorNumber,
      capacity: allocation.room.capacity,
      currentOccupancy: allocation.room.currentOccupancy,
      roommates: allocation.room.allocations
        .filter(a => a.studentId !== student.id)
        .map(a => ({
          name: `${a.student.user.firstName} ${a.student.user.lastName}`,
          rollNumber: a.student.rollNumber
        }))
    }, 'Room details retrieved');
  } catch (error) {
    console.error('[Student getMyRoom Error]:', error);
    return errorResponse(res, 'Failed to fetch room details', 'ROOM_FETCH_ERROR', 500);
  }
};

export const requestRoomTransfer = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const { toRoomId, reason } = req.body;

    const currentAllocation = await prisma.roomAllocation.findFirst({
      where: { studentId: student.id, isActive: true }
    });

    if (!currentAllocation) {
      return errorResponse(res, 'You do not have an active hostel room to transfer from', 'NO_ACTIVE_ALLOCATION', 400);
    }

    const targetRoom = await prisma.room.findUnique({ where: { id: toRoomId } });
    if (!targetRoom) {
      return errorResponse(res, 'Target room requested not found', 'TARGET_ROOM_NOT_FOUND', 404);
    }

    const transferRequest = await prisma.roomTransfer.create({
      data: {
        studentId: student.id,
        fromRoomId: currentAllocation.roomId,
        toRoomId,
        reason,
        status: 'PENDING'
      },
      include: {
        fromRoom: true,
        toRoom: true
      }
    });

    return successResponse(res, transferRequest, 'Room transfer request submitted for warden review', 201);
  } catch (error) {
    console.error('[Student requestRoomTransfer Error]:', error);
    return errorResponse(res, 'Failed to submit room transfer request', 'TRANSFER_REQUEST_ERROR', 500);
  }
};

// ====================================================================
// 5. LEAVE REQUESTS SELF-SERVICE
// ====================================================================
export const createLeaveRequest = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const { startDate, endDate, reason, destination, emergencyContact } = req.body;

    const leave = await prisma.leaveRequest.create({
      data: {
        studentId: student.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        destination,
        emergencyContact,
        status: 'PENDING'
      }
    });

    return successResponse(res, leave, 'Leave request submitted successfully', 201);
  } catch (error) {
    console.error('[Student createLeaveRequest Error]:', error);
    return errorResponse(res, 'Failed to submit leave request', 'LEAVE_REQUEST_ERROR', 500);
  }
};

export const getLeaveRequests = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const { page, limit, skip, sortOrder } = parsePaginationQuery(req.query, 20);

    const [leaves, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: { studentId: student.id },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder }
      }),
      prisma.leaveRequest.count({ where: { studentId: student.id } })
    ]);

    return paginatedResponse(res, {
      data: leaves,
      total,
      page,
      limit,
      message: 'Personal leave requests retrieved'
    });
  } catch (error) {
    console.error('[Student getLeaveRequests Error]:', error);
    return errorResponse(res, 'Failed to fetch leave requests', 'LEAVES_FETCH_ERROR', 500);
  }
};

export const getLeaveRequestById = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const { id } = req.params;

    const leave = await prisma.leaveRequest.findFirst({
      where: { id, studentId: student.id }
    });

    if (!leave) {
      return errorResponse(res, 'Leave request not found or not owned by student', 'LEAVE_NOT_FOUND', 404);
    }

    return successResponse(res, leave, 'Leave request details retrieved');
  } catch (error) {
    console.error('[Student getLeaveRequestById Error]:', error);
    return errorResponse(res, 'Failed to fetch leave request', 'LEAVE_FETCH_ERROR', 500);
  }
};

export const cancelLeaveRequest = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const { id } = req.params;

    const existing = await prisma.leaveRequest.findFirst({
      where: { id, studentId: student.id }
    });

    if (!existing) {
      return errorResponse(res, 'Leave request not found or ownership mismatch', 'LEAVE_NOT_FOUND', 404);
    }

    if (existing.status !== 'PENDING') {
      return errorResponse(res, `Cannot cancel leave in '${existing.status}' status`, 'CANNOT_CANCEL', 400);
    }

    const cancelled = await prisma.leaveRequest.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    return successResponse(res, cancelled, 'Leave request cancelled successfully');
  } catch (error) {
    console.error('[Student cancelLeaveRequest Error]:', error);
    return errorResponse(res, 'Failed to cancel leave request', 'CANCEL_ERROR', 500);
  }
};

// ====================================================================
// 6. COMPLAINTS SELF-SERVICE
// ====================================================================
export const createComplaint = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const { title, description, priority = 'MEDIUM' } = req.body;

    let defaultCat = await prisma.complaintCategory.findFirst();
    if (!defaultCat) {
      defaultCat = await prisma.complaintCategory.create({
        data: { name: 'General', code: 'GENERAL' }
      });
    }

    const ticketNumber = `CMP-${Date.now().toString().slice(-6)}`;

    const complaint = await prisma.complaint.create({
      data: {
        ticketNumber,
        studentId: student.id,
        title,
        description,
        categoryId: defaultCat.id,
        priority,
        status: 'SUBMITTED'
      }
    });

    return successResponse(res, complaint, 'Complaint submitted successfully', 201);
  } catch (error) {
    console.error('[Student createComplaint Error]:', error);
    return errorResponse(res, 'Failed to submit complaint', 'COMPLAINT_SUBMIT_ERROR', 500);
  }
};

export const getComplaints = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const { page, limit, skip, sortOrder, status } = parsePaginationQuery(req.query, 20);

    const whereClause = {
      studentId: student.id,
      ...(status && { status })
    };

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where: whereClause,
        include: {
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
      message: 'Personal complaints retrieved'
    });
  } catch (error) {
    console.error('[Student getComplaints Error]:', error);
    return errorResponse(res, 'Failed to fetch complaints', 'COMPLAINTS_FETCH_ERROR', 500);
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const { id } = req.params;

    const complaint = await prisma.complaint.findFirst({
      where: { id, studentId: student.id },
      include: {
        category: true,
        assignment: { include: { staff: { include: { user: { select: { firstName: true, lastName: true } } } } } },
        statusHistory: { orderBy: { createdAt: 'asc' } }
      }
    });

    if (!complaint) {
      return errorResponse(res, 'Complaint record not found or access forbidden', 'COMPLAINT_NOT_FOUND', 404);
    }

    return successResponse(res, complaint, 'Complaint details retrieved');
  } catch (error) {
    console.error('[Student getComplaintById Error]:', error);
    return errorResponse(res, 'Failed to fetch complaint details', 'COMPLAINT_FETCH_ERROR', 500);
  }
};

export const updateComplaint = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const { id } = req.params;
    const { description } = req.body;

    const existing = await prisma.complaint.findFirst({
      where: { id, studentId: student.id }
    });

    if (!existing) {
      return errorResponse(res, 'Complaint not found or ownership mismatch', 'COMPLAINT_NOT_FOUND', 404);
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        ...(description && { description: `${existing.description}\n\n[Student Update]: ${description}` })
      }
    });

    return successResponse(res, updated, 'Complaint updated with additional notes');
  } catch (error) {
    console.error('[Student updateComplaint Error]:', error);
    return errorResponse(res, 'Failed to update complaint', 'COMPLAINT_UPDATE_ERROR', 500);
  }
};

// ====================================================================
// 7. FEES & PAYMENTS SELF-SERVICE
// ====================================================================
export const getMyFees = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const feeRecords = await prisma.feeRecord.findMany({
      where: { studentId: student.id },
      include: { directPayments: true },
      orderBy: { semester: 'desc' }
    });

    return successResponse(res, feeRecords, 'Fee records retrieved');
  } catch (error) {
    console.error('[Student getMyFees Error]:', error);
    return errorResponse(res, 'Failed to fetch fees', 'FEES_FETCH_ERROR', 500);
  }
};

export const getMyFeesSummary = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const feeRecords = await prisma.feeRecord.findMany({
      where: { studentId: student.id }
    });

    const totalFees = feeRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalDues = feeRecords.reduce((sum, r) => sum + r.dueAmount, 0);
    const totalPaid = totalFees - totalDues;

    return successResponse(res, {
      totalFees,
      totalPaid,
      totalDues,
      hasOutstandingDues: totalDues > 0,
      semesterBreakdown: feeRecords.map(r => ({
        semester: r.semester,
        academicYear: r.academicYear,
        total: r.totalAmount,
        due: r.dueAmount,
        status: r.status,
        dueDate: r.dueDate
      }))
    }, 'Fee summary calculated');
  } catch (error) {
    console.error('[Student getMyFeesSummary Error]:', error);
    return errorResponse(res, 'Failed to compute fee summary', 'SUMMARY_ERROR', 500);
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const payments = await prisma.payment.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, payments, 'Payment transaction history retrieved');
  } catch (error) {
    console.error('[Student getMyPayments Error]:', error);
    return errorResponse(res, 'Failed to fetch payments', 'PAYMENTS_FETCH_ERROR', 500);
  }
};

// ====================================================================
// 8. VISITOR REQUESTS SELF-SERVICE
// ====================================================================
export const createVisitorRequest = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const { visitorName, phoneNumber, idProofType, idProofNumber, purpose, visitDate } = req.body;

    const request = await prisma.visitorRequest.create({
      data: {
        studentId: student.id,
        visitorName,
        phoneNumber,
        idProofType,
        idProofNumber,
        purpose,
        visitDate: new Date(visitDate),
        status: 'PENDING'
      }
    });

    return successResponse(res, request, 'Visitor entry request submitted for security clearance', 201);
  } catch (error) {
    console.error('[Student createVisitorRequest Error]:', error);
    return errorResponse(res, 'Failed to submit visitor request', 'VISITOR_REQUEST_ERROR', 500);
  }
};

export const getVisitorRequests = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const { page, limit, skip, sortOrder } = parsePaginationQuery(req.query, 20);

    const [requests, total] = await Promise.all([
      prisma.visitorRequest.findMany({
        where: { studentId: student.id },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder }
      }),
      prisma.visitorRequest.count({ where: { studentId: student.id } })
    ]);

    return paginatedResponse(res, {
      data: requests,
      total,
      page,
      limit,
      message: 'Visitor requests retrieved'
    });
  } catch (error) {
    console.error('[Student getVisitorRequests Error]:', error);
    return errorResponse(res, 'Failed to fetch visitor requests', 'VISITOR_FETCH_ERROR', 500);
  }
};

export const cancelVisitorRequest = async (req, res) => {
  try {
    const student = await resolveAuthenticatedStudent(req);
    if (!student) {
      return errorResponse(res, 'Student profile not found', 'STUDENT_NOT_FOUND', 404);
    }

    const { id } = req.params;

    const existing = await prisma.visitorRequest.findFirst({
      where: { id, studentId: student.id }
    });

    if (!existing) {
      return errorResponse(res, 'Visitor request not found or not owned by student', 'NOT_FOUND', 404);
    }

    const cancelled = await prisma.visitorRequest.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: 'Cancelled by student' }
    });

    return successResponse(res, cancelled, 'Visitor request cancelled');
  } catch (error) {
    console.error('[Student cancelVisitorRequest Error]:', error);
    return errorResponse(res, 'Failed to cancel visitor request', 'CANCEL_ERROR', 500);
  }
};

export default {
  getStudentDashboard,
  getProfile,
  updateProfile,
  getAttendance,
  getAttendanceSummary,
  getMyHostel,
  getMyRoom,
  requestRoomTransfer,
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequestById,
  cancelLeaveRequest,
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  getMyFees,
  getMyFeesSummary,
  getMyPayments,
  createVisitorRequest,
  getVisitorRequests,
  cancelVisitorRequest
};
