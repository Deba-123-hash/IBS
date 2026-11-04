import prisma from '../config/database.js';

/**
 * Retrieves and computes real-time attendance for the authenticated student.
 */
export async function getStudentAttendance(studentId) {
  if (!prisma) {
    return { success: false, error: 'Database connection offline' };
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      rollNumber: true,
      user: { select: { firstName: true, lastName: true } },
      attendanceRecords: {
        include: {
          attendance: {
            include: {
              subject: { select: { id: true, code: true, title: true } }
            }
          }
        }
      }
    }
  });

  if (!student) {
    return { success: false, error: 'Student record not found in directory' };
  }

  const records = student.attendanceRecords || [];
  if (records.length === 0) {
    return {
      success: true,
      data: {
        studentName: `${student.user.firstName} ${student.user.lastName}`,
        rollNumber: student.rollNumber,
        overallPercentage: 0,
        totalClasses: 0,
        attendedClasses: 0,
        missedClasses: 0,
        subjects: [],
        lowestSubject: null,
        isBelowThreshold: true,
        message: 'No attendance records logged for current semester.'
      }
    };
  }

  const subjectMap = {};
  let totalClasses = 0;
  let attendedClasses = 0;

  for (const rec of records) {
    const subTitle = rec.attendance?.subject?.title || 'General Academic';
    const subCode = rec.attendance?.subject?.code || 'GEN';

    if (!subjectMap[subTitle]) {
      subjectMap[subTitle] = {
        subject: subTitle,
        code: subCode,
        total: 0,
        attended: 0,
        absent: 0
      };
    }

    subjectMap[subTitle].total += 1;
    totalClasses += 1;

    if (rec.status === 'PRESENT') {
      subjectMap[subTitle].attended += 1;
      attendedClasses += 1;
    } else {
      subjectMap[subTitle].absent += 1;
    }
  }

  const subjects = Object.values(subjectMap).map((s) => {
    const percentage = s.total > 0 ? Math.round((s.attended / s.total) * 100) : 100;
    return {
      subject: s.subject,
      code: s.code,
      total: s.total,
      attended: s.attended,
      absent: s.absent,
      percentage,
      status: percentage < 75 ? 'WARNING' : 'GOOD'
    };
  });

  // Sort to find lowest attendance subjects
  const sortedSubjects = [...subjects].sort((a, b) => a.percentage - b.percentage);
  const lowestSubject = sortedSubjects.length > 0 ? sortedSubjects[0] : null;

  const overallPercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;
  const missedClasses = totalClasses - attendedClasses;

  return {
    success: true,
    data: {
      studentName: `${student.user.firstName} ${student.user.lastName}`,
      rollNumber: student.rollNumber,
      overallPercentage,
      totalClasses,
      attendedClasses,
      missedClasses,
      subjects,
      lowestSubject,
      isBelowThreshold: overallPercentage < 75
    },
    action: {
      actionUrl: '/student/attendance',
      actionLabel: 'View Detailed Attendance'
    }
  };
}

/**
 * Retrieves the room and hostel allocation for the authenticated student.
 */
export async function getStudentRoom(studentId) {
  if (!prisma) {
    return { success: false, error: 'Database offline' };
  }

  const allocation = await prisma.roomAllocation.findFirst({
    where: { studentId, isActive: true },
    include: {
      room: {
        include: {
          block: {
            include: {
              hostel: true
            }
          }
        }
      }
    }
  });

  if (!allocation || !allocation.room) {
    return {
      success: true,
      data: { allocated: false, message: 'No active hostel room allocated.' }
    };
  }

  const room = allocation.room;
  return {
    success: true,
    data: {
      allocated: true,
      roomNumber: room.roomNumber,
      floorNumber: room.floorNumber,
      blockName: room.block?.name || 'General Block',
      hostelName: room.block?.hostel?.name || 'Campus Hostel',
      capacity: room.capacity,
      currentOccupancy: room.currentOccupancy
    },
    action: {
      actionUrl: '/student/hostels',
      actionLabel: 'View Hostel Details'
    }
  };
}

/**
 * Retrieves complaints filed by the student.
 */
export async function getStudentComplaints(studentId) {
  if (!prisma) {
    return { success: false, error: 'Database offline' };
  }

  const complaints = await prisma.complaint.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      category: { select: { name: true } }
    }
  });

  const total = complaints.length;
  const pending = complaints.filter((c) =>
    ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'].includes(c.status)
  ).length;
  const resolved = complaints.filter((c) =>
    ['RESOLVED', 'CLOSED'].includes(c.status)
  ).length;

  return {
    success: true,
    data: {
      total,
      pending,
      resolved,
      complaints: complaints.map((c) => ({
        ticketNumber: c.ticketNumber,
        title: c.title,
        status: c.status,
        priority: c.priority,
        category: c.category?.name || 'General'
      }))
    },
    action: {
      actionUrl: '/student/complaints',
      actionLabel: 'View My Complaints'
    }
  };
}

/**
 * Retrieves recent gate passes for the student.
 */
export async function getStudentGatePass(studentId) {
  if (!prisma) {
    return { success: false, error: 'Database offline' };
  }

  const passes = await prisma.gatePass.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const activePass = passes.find((p) =>
    ['PENDING', 'APPROVED', 'CHECKED_OUT'].includes(p.status)
  ) || passes[0] || null;

  return {
    success: true,
    data: {
      totalPasses: passes.length,
      activePass: activePass
        ? {
            passNumber: activePass.passNumber,
            type: activePass.type,
            reason: activePass.reason,
            destination: activePass.destination,
            status: activePass.status,
            outTimeExpected: activePass.outTimeExpected,
            inTimeExpected: activePass.inTimeExpected
          }
        : null,
      recentPasses: passes.map((p) => ({
        passNumber: p.passNumber,
        type: p.type,
        status: p.status,
        destination: p.destination
      }))
    },
    action: {
      actionUrl: '/student/gate-passes',
      actionLabel: 'View Gate Passes'
    }
  };
}

/**
 * Retrieves student fee ledger and dues.
 */
export async function getStudentFees(studentId) {
  if (!prisma) {
    return { success: false, error: 'Database offline' };
  }

  const fees = await prisma.feeRecord.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' }
  });

  if (fees.length === 0) {
    return {
      success: true,
      data: {
        totalDue: 0,
        hasDues: false,
        records: [],
        message: 'All semester fees cleared. Zero dues outstanding.'
      },
      action: {
        actionUrl: '/student/fees',
        actionLabel: 'Open Fee Ledgers'
      }
    };
  }

  const totalDue = fees.reduce((sum, f) => sum + (f.dueAmount || 0), 0);
  const totalAmount = fees.reduce((sum, f) => sum + (f.totalAmount || 0), 0);

  return {
    success: true,
    data: {
      totalAmount,
      totalDue,
      hasDues: totalDue > 0,
      records: fees.map((f) => ({
        academicYear: f.academicYear,
        semester: f.semester,
        totalAmount: f.totalAmount,
        dueAmount: f.dueAmount,
        status: f.status,
        dueDate: f.dueDate
      }))
    },
    action: {
      actionUrl: '/student/fees',
      actionLabel: 'Open Fee Ledgers'
    }
  };
}

/**
 * Retrieves timetable and today's next class for the student.
 */
export async function getStudentTimetable(studentId) {
  if (!prisma) {
    return { success: false, error: 'Database offline' };
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { batchId: true }
  });

  if (!student || !student.batchId) {
    return { success: false, error: 'No academic batch linked to student' };
  }

  // dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const currentDay = new Date().getDay();
  // If weekend (0 or 6), default to Monday (1)
  const lookupDay = currentDay === 0 || currentDay === 6 ? 1 : currentDay;

  const timetableEntries = await prisma.timetable.findMany({
    where: {
      batchId: student.batchId,
      dayOfWeek: lookupDay
    },
    orderBy: { startTime: 'asc' },
    include: {
      subject: { select: { title: true, code: true } },
      faculty: {
        select: {
          designation: true,
          user: { select: { firstName: true, lastName: true } }
        }
      }
    }
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[lookupDay];

  return {
    success: true,
    data: {
      day: dayName,
      isToday: lookupDay === currentDay,
      classesCount: timetableEntries.length,
      classes: timetableEntries.map((t) => ({
        time: `${t.startTime} - ${t.endTime}`,
        startTime: t.startTime,
        endTime: t.endTime,
        subject: t.subject?.title || 'Academic Lecture',
        code: t.subject?.code || '',
        classroom: t.classroom || 'Lecture Hall',
        faculty: t.faculty?.user ? `${t.faculty.user.firstName} ${t.faculty.user.lastName}` : 'Faculty'
      }))
    },
    action: {
      actionUrl: '/student/timetable',
      actionLabel: 'View Full Timetable'
    }
  };
}

/**
 * Retrieves today's mess menu.
 */
export async function getTodayMessMenu() {
  if (!prisma) {
    return { success: false, error: 'Database offline' };
  }

  const meals = await prisma.messMenu.findMany({
    orderBy: { date: 'desc' },
    take: 8
  });

  const grouped = {};
  for (const m of meals) {
    if (!grouped[m.mealType]) {
      grouped[m.mealType] = m.itemsDescription;
    }
  }

  return {
    success: true,
    data: {
      breakfast: grouped.BREAKFAST || 'Idli, Sambhar, Chutney, Tea & Milk',
      lunch: grouped.LUNCH || 'Steamed Rice, Dal Fry, Seasonal Mixed Curry, Salad, Curd',
      snacks: grouped.SNACKS || 'Tea / Coffee with Samosa & Biscuits',
      dinner: grouped.DINNER || 'Roti, Paneer Butter Masala / Chicken Curry, Dal Makhani, Gulab Jamun'
    },
    action: {
      actionUrl: '/student/mess',
      actionLabel: "View Today's Mess Menu"
    }
  };
}

/**
 * Retrieves operational complaints metrics for Admin role.
 */
export async function getAdminOperationalMetrics() {
  if (!prisma) {
    return { success: false, error: 'Database offline' };
  }

  const totalComplaints = await prisma.complaint.count();
  const pendingComplaints = await prisma.complaint.count({
    where: { status: { in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'] } }
  });
  const inProgressComplaints = await prisma.complaint.count({
    where: { status: 'IN_PROGRESS' }
  });
  const resolvedComplaints = await prisma.complaint.count({
    where: { status: { in: ['RESOLVED', 'CLOSED'] } }
  });
  const urgentComplaints = await prisma.complaint.count({
    where: { priority: { in: ['HIGH', 'URGENT'] }, status: { notIn: ['RESOLVED', 'CLOSED'] } }
  });

  // Category breakdown
  const complaints = await prisma.complaint.findMany({
    select: {
      category: { select: { name: true } },
      status: true
    }
  });

  const categoryMap = {};
  for (const c of complaints) {
    const cat = c.category?.name || 'General';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  }

  let topCategory = 'Plumbing';
  let maxCount = 0;
  for (const [k, v] of Object.entries(categoryMap)) {
    if (v > maxCount) {
      maxCount = v;
      topCategory = k;
    }
  }

  return {
    success: true,
    data: {
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      urgentComplaints,
      topIssueCategory: topCategory,
      topCategoryCount: maxCount,
      categoryDistribution: categoryMap
    },
    action: {
      actionUrl: '/admin/dashboard',
      actionLabel: 'Open Admin Dashboard'
    }
  };
}
