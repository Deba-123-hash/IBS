import prisma from '../config/database.js';

export const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "getStudentAttendance",
      description: "Retrieves the real-time attendance percentage and record for the currently authenticated student.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getStudentComplaints",
      description: "Retrieves the recent maintenance and hostel complaints filed by the currently authenticated student.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getTodayTimetable",
      description: "Retrieves the class timetable for the currently authenticated student for today.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  }
];

/**
 * Maps the tool name requested by the LLM to the actual database executor function.
 */
export async function executeAiTool(toolName, toolArgs, userContext) {
  if (!userContext || !userContext.id) {
    return JSON.stringify({ error: "User context missing. Authentication required for tools." });
  }

  // Find the student ID from the userContext
  let studentId = userContext.studentId;
  if (!studentId && prisma) {
    const studentProfile = await prisma.student.findUnique({
      where: { userId: userContext.id }
    });
    if (studentProfile) studentId = studentProfile.id;
  }

  if (!studentId) {
    return JSON.stringify({ error: "No student profile found for the current user. This tool is for students only." });
  }

  try {
    switch (toolName) {
      case 'getStudentAttendance':
        return await executeGetStudentAttendance(studentId);
      case 'getStudentComplaints':
        return await executeGetStudentComplaints(studentId);
      case 'getTodayTimetable':
        return await executeGetTodayTimetable(studentId);
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (err) {
    console.error(`[AI Tool Error] - ${toolName}:`, err);
    return JSON.stringify({ error: "A database error occurred while running the tool." });
  }
}

async function executeGetStudentAttendance(studentId) {
  if (!prisma) return JSON.stringify({ error: "Database offline." });
  
  const records = await prisma.attendanceRecord.findMany({
    where: { studentId },
    include: {
      attendance: {
        include: { subject: true }
      }
    }
  });

  if (!records.length) return JSON.stringify({ message: "No attendance records found." });

  const summary = {};
  let totalClasses = 0;
  let attendedClasses = 0;

  records.forEach(r => {
    const sub = r.attendance.subject.title;
    if (!summary[sub]) summary[sub] = { total: 0, attended: 0 };
    summary[sub].total++;
    totalClasses++;
    if (r.status === 'PRESENT') {
      summary[sub].attended++;
      attendedClasses++;
    }
  });

  Object.keys(summary).forEach(key => {
    summary[key].percentage = Math.round((summary[key].attended / summary[key].total) * 100);
  });

  const overall = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

  return JSON.stringify({
    overallPercentage: overall,
    totalClasses,
    attendedClasses,
    subjectBreakdown: summary
  });
}

async function executeGetStudentComplaints(studentId) {
  if (!prisma) return JSON.stringify({ error: "Database offline." });
  
  const complaints = await prisma.complaint.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      ticketNumber: true,
      title: true,
      status: true,
      priority: true,
      category: { select: { name: true } },
      createdAt: true
    }
  });

  if (!complaints.length) return JSON.stringify({ message: "No complaints found." });
  return JSON.stringify(complaints);
}

async function executeGetTodayTimetable(studentId) {
  if (!prisma) return JSON.stringify({ error: "Database offline." });
  
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { batchId: true }
  });

  if (!student) return JSON.stringify({ error: "Student not found." });

  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const todayStr = days[new Date().getDay()];

  const timetable = await prisma.timetable.findMany({
    where: {
      batchId: student.batchId,
      dayOfWeek: todayStr
    },
    orderBy: { startTime: 'asc' },
    include: {
      subject: { select: { title: true, code: true } },
      faculty: { select: { user: { select: { firstName: true, lastName: true } } } },
      room: { select: { number: true, block: { select: { name: true } } } }
    }
  });

  if (!timetable.length) return JSON.stringify({ message: "No classes scheduled for today." });

  return JSON.stringify(timetable.map(t => ({
    time: `${t.startTime} - ${t.endTime}`,
    subject: t.subject.title,
    type: t.type,
    room: `${t.room?.block?.name} ${t.room?.number}`,
    faculty: `${t.faculty?.user?.firstName} ${t.faculty?.user?.lastName}`
  })));
}
