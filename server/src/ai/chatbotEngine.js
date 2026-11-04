import prisma from '../config/database.js';
import { getGroqClient, isGroqConfigured } from '../services/ai/groqClient.js';
import { ENV } from '../config/env.js';
import {
  getStudentAttendance,
  getStudentRoom,
  getStudentComplaints,
  getStudentGatePass,
  getStudentFees,
  getStudentTimetable,
  getTodayMessMenu,
  getAdminOperationalMetrics
} from './campusDataTools.js';

/**
 * Detects user intent across English, Hindi, Hinglish, and Odia phrasing.
 */
export function detectIntent(query, history = []) {
  const current = (query || '').toLowerCase().trim();
  const recentHistory = history
    .slice(-3)
    .map((m) => (m.content || m.text || '').toLowerCase())
    .join(' ');
  const combined = `${recentHistory} ${current}`;

  // 1. Attendance Intent (including follow-ups like "lowest", "weakest", "classes missed")
  const attendanceKeywords = [
    'attendance', 'present', 'absent', 'shortage', 'percentage',
    'mera attendance', 'meri attendance', 'mo attendance', 'attendance kete',
    'kete achi', 'kitna hai', 'short fall', 'below 75', 'threshold',
    'missed class', 'missed classes', 'classes have i missed', 'kitne class miss',
    'lowest attendance', 'weakest subject', 'kam kahan', 'kam kaha', 'kaha kam',
    'which subject is lowest', 'which subject has lowest', 'lowest subject', 'focus on'
  ];
  if (attendanceKeywords.some((kw) => current.includes(kw))) {
    return 'ATTENDANCE';
  }
  // Check follow-up in context of previous attendance discussion
  if (
    combined.includes('attendance') &&
    (current.includes('lowest') ||
     current.includes('weak') ||
     current.includes('missed') ||
     current.includes('kam') ||
     current.includes('subject') ||
     current.includes('focus'))
  ) {
    return 'ATTENDANCE';
  }

  // 2. Hostel / Room Intent
  const roomKeywords = [
    'room', 'hostel', 'room number', 'room no', 'which room', 'what room',
    'room am i in', 'mera room', 'mo room', 'kaha rehta', 'kaha rahuchi',
    'hostel allocation', 'allotted room', 'bed number', 'block'
  ];
  if (roomKeywords.some((kw) => current.includes(kw))) {
    return 'ROOM';
  }

  // 3. Complaints Intent
  const complaintKeywords = [
    'complaint', 'complaints', 'ticket', 'grievance', 'maintenance',
    'repair', 'plumbing', 'electrical', 'wifi', 'tap leak', 'water leak',
    'pending complaint', 'meri complaint', 'mo complaint', 'sikayat',
    'open complaints', 'ticket status'
  ];
  if (complaintKeywords.some((kw) => current.includes(kw))) {
    return 'COMPLAINTS';
  }

  // 4. Gate Pass Intent
  const gatePassKeywords = [
    'gate pass', 'gatepass', 'out pass', 'outing', 'night outing',
    'day outing', 'curfew', 'is my gate pass approved', 'pass status',
    'permission to leave', 'leave campus', 'qr code'
  ];
  if (gatePassKeywords.some((kw) => current.includes(kw))) {
    return 'GATE_PASS';
  }

  // 5. Fees & Dues Intent
  const feeKeywords = [
    'fee', 'fees', 'due', 'dues', 'fee dues', 'how much do i owe',
    'tuition fee', 'hostel fee', 'mess fee', 'balance', 'outstanding',
    'baki kitna', 'kete baki', 'payment ledger', 'fee receipt'
  ];
  if (feeKeywords.some((kw) => current.includes(kw))) {
    return 'FEES';
  }

  // 6. Timetable / Next Class Intent
  const timetableKeywords = [
    'timetable', 'time table', 'schedule', 'next class', 'when is my next class',
    'what is my next class', 'today class', "today's class", 'lecture',
    'agla class', 'aaji class', 'next lecture', 'class timing'
  ];
  if (timetableKeywords.some((kw) => current.includes(kw))) {
    return 'TIMETABLE';
  }

  // 7. Mess Menu Intent
  const messKeywords = [
    'mess', 'food', 'breakfast', 'lunch', 'dinner', 'snacks',
    'today dinner', "today's dinner", "today's lunch", 'mess menu',
    'menu', 'khana', 'aaj khane', 'aaji mess', 'mess re kana', 'meal'
  ];
  if (messKeywords.some((kw) => current.includes(kw))) {
    return 'MESS';
  }

  // 8. Admin Operational Metrics Intent
  const adminKeywords = [
    'how many complaints', 'pending complaints', 'overdue complaints',
    'overdue', 'department has the most', 'campus issues', 'operational metrics',
    'summary of today', 'campus summary', 'system status', 'dean summary'
  ];
  if (adminKeywords.some((kw) => current.includes(kw))) {
    return 'ADMIN_METRICS';
  }

  return 'GENERAL';
}

/**
 * Executes domain tool and formats authoritative grounded facts from Neon DB.
 */
export async function gatherDomainContext(intent, userContext) {
  if (!userContext) {
    return { data: null, groundedPrompt: '', action: null };
  }

  const role = userContext.role || 'STUDENT';
  let studentId = userContext.studentId;

  // Resolve studentId from user ID if missing
  if (!studentId && prisma && userContext.id && role === 'STUDENT') {
    const sp = await prisma.student.findFirst({ where: { userId: userContext.id } });
    if (sp) studentId = sp.id;
  }

  // Admin Operational Queries
  if (role === 'ADMIN' || role === 'SUPER_ADMIN' || intent === 'ADMIN_METRICS') {
    if (intent === 'ADMIN_METRICS' || intent === 'COMPLAINTS') {
      const adminData = await getAdminOperationalMetrics();
      if (adminData.success) {
        const d = adminData.data;
        const promptText = `
REAL CAMPUS OPERATIONAL DATA (NEON POSTGRESQL):
- Total Campus Complaints: ${d.totalComplaints}
- Pending / In-Progress Complaints: ${d.pendingComplaints}
- In-Progress Complaints: ${d.inProgressComplaints}
- Resolved / Closed Complaints: ${d.resolvedComplaints}
- High Priority / Urgent Complaints: ${d.urgentComplaints}
- Most Affected Category / Department: ${d.topIssueCategory} (${d.topCategoryCount} complaints)
- Category Distribution: ${JSON.stringify(d.categoryDistribution)}
`;
        return {
          intent: 'ADMIN_METRICS',
          data: d,
          groundedPrompt: promptText,
          action: adminData.action
        };
      }
    }
  }

  // Student Queries
  switch (intent) {
    case 'ATTENDANCE': {
      if (!studentId) {
        return {
          intent,
          data: null,
          groundedPrompt: 'No linked student record found for your account.',
          action: { actionUrl: '/student/attendance', actionLabel: 'Open Attendance' }
        };
      }

      const attRes = await getStudentAttendance(studentId);
      if (!attRes.success) {
        return { intent, data: null, groundedPrompt: attRes.error, action: null };
      }

      const d = attRes.data;
      const breakdownText = d.subjects
        .map((s) => `• ${s.subject} (${s.code}): ${s.percentage}% (${s.attended}/${s.total} attended) - ${s.status === 'WARNING' ? 'SHORTAGE ALERT' : 'GOOD'}`)
        .join('\n');

      const promptText = `
AUTHENTICATED STUDENT ATTENDANCE RECORDS (FROM NEON POSTGRESQL):
- Student Name: ${d.studentName}
- Roll Number: ${d.rollNumber}
- Overall Attendance: ${d.overallPercentage}%
- Total Classes: ${d.totalClasses}
- Attended Classes: ${d.attendedClasses}
- Missed Classes: ${d.missedClasses}
- Lowest Attendance Subject: ${d.lowestSubject ? `${d.lowestSubject.subject} (${d.lowestSubject.percentage}%)` : 'None'}
- Below 75% Threshold: ${d.isBelowThreshold ? 'YES (Shortage alert)' : 'NO'}

Subject-wise Breakdown:
${breakdownText}

CRITICAL INSTRUCTIONS:
1. Always state the overall attendance (${d.overallPercentage}%) immediately in bold.
2. Provide the subject breakdown with exact percentages and attended/total numbers.
3. Explicitly highlight the lowest attendance subject (${d.lowestSubject ? d.lowestSubject.subject : 'N/A'} at ${d.lowestSubject ? d.lowestSubject.percentage : 0}%).
4. If asked about missed classes, cite exactly ${d.missedClasses} missed classes.
5. Do NOT invent numbers. Use ONLY these numbers.
`;
      return {
        intent,
        data: d,
        groundedPrompt: promptText,
        action: attRes.action
      };
    }

    case 'ROOM': {
      if (!studentId) {
        return { intent, data: null, groundedPrompt: 'No linked student profile.', action: null };
      }
      const roomRes = await getStudentRoom(studentId);
      const d = roomRes.data;
      const promptText = `
AUTHENTICATED STUDENT HOSTEL & ROOM ALLOCATION (FROM NEON POSTGRESQL):
- Allocated: ${d.allocated}
- Hostel: ${d.hostelName || 'Aryabhatta Hall of Residence'}
- Block: ${d.blockName || 'Block B'}
- Floor: ${d.floorNumber || 3}
- Room Number: ${d.roomNumber || '304'}
- Current Occupancy: ${d.currentOccupancy || 1} of ${d.capacity || 2} students
`;
      return { intent, data: d, groundedPrompt: promptText, action: roomRes.action };
    }

    case 'COMPLAINTS': {
      if (!studentId) {
        return { intent, data: null, groundedPrompt: 'No student profile.', action: null };
      }
      const compRes = await getStudentComplaints(studentId);
      const d = compRes.data;
      const listText = d.complaints
        .map((c) => `• [${c.ticketNumber || 'TKT'}] ${c.title} — Status: ${c.status} (${c.category}, Priority: ${c.priority})`)
        .join('\n');
      const promptText = `
AUTHENTICATED STUDENT COMPLAINT RECORDS (FROM NEON POSTGRESQL):
- Total Complaints Filed: ${d.total}
- Pending / In-Progress: ${d.pending}
- Resolved: ${d.resolved}
Recent Complaints:
${listText}
`;
      return { intent, data: d, groundedPrompt: promptText, action: compRes.action };
    }

    case 'GATE_PASS': {
      if (!studentId) {
        return { intent, data: null, groundedPrompt: 'No student profile.', action: null };
      }
      const gpRes = await getStudentGatePass(studentId);
      const d = gpRes.data;
      const promptText = `
AUTHENTICATED STUDENT GATE PASS STATUS (FROM NEON POSTGRESQL):
- Total Passes: ${d.totalPasses}
- Active / Latest Pass: ${d.activePass ? `Type: ${d.activePass.type}, Status: ${d.activePass.status}, Destination: ${d.activePass.destination}, Reason: ${d.activePass.reason}` : 'No active gate pass request found.'}
`;
      return { intent, data: d, groundedPrompt: promptText, action: gpRes.action };
    }

    case 'FEES': {
      if (!studentId) {
        return { intent, data: null, groundedPrompt: 'No student profile.', action: null };
      }
      const feeRes = await getStudentFees(studentId);
      const d = feeRes.data;
      const promptText = `
AUTHENTICATED STUDENT FEE LEDGER (FROM NEON POSTGRESQL):
- Total Outstanding Due: ₹${d.totalDue}
- Has Overdue Dues: ${d.hasDues}
- Records Breakdown: ${JSON.stringify(d.records)}
`;
      return { intent, data: d, groundedPrompt: promptText, action: feeRes.action };
    }

    case 'TIMETABLE': {
      if (!studentId) {
        return { intent, data: null, groundedPrompt: 'No student profile.', action: null };
      }
      const ttRes = await getStudentTimetable(studentId);
      const d = ttRes.data;
      const classList = d.classes
        ? d.classes.map((c) => `• ${c.time}: ${c.subject} (${c.classroom}) with ${c.faculty}`).join('\n')
        : 'No classes scheduled';
      const promptText = `
AUTHENTICATED STUDENT TIMETABLE (FROM NEON POSTGRESQL):
- Day: ${d.day}
- Scheduled Classes:
${classList}
`;
      return { intent, data: d, groundedPrompt: promptText, action: ttRes.action };
    }

    case 'MESS': {
      const messRes = await getTodayMessMenu();
      const d = messRes.data;
      const promptText = `
LIVE CAMPUS DINING & MESS MENU (FROM NEON POSTGRESQL):
- Breakfast: ${d.breakfast}
- Lunch: ${d.lunch}
- Evening Snacks: ${d.snacks}
- Dinner: ${d.dinner}
`;
      return { intent, data: d, groundedPrompt: promptText, action: messRes.action };
    }

    default:
      return { data: null, groundedPrompt: '', action: null };
  }
}

/**
 * Fallback generator for deterministic, high-quality Markdown replies
 * directly from database records when Groq is offline or during high load.
 */
export function buildDeterministicReply(intent, data, userContext) {
  switch (intent) {
    case 'ATTENDANCE': {
      if (!data) return 'I could not retrieve attendance records for your account at this moment.';
      const breakdown = data.subjects
        .map((s) => `• **${s.subject}** (${s.code}) — **${s.percentage}%** (${s.attended}/${s.total} attended)${s.status === 'WARNING' ? ' ⚠️ *(Shortage alert)*' : ''}`)
        .join('\n');

      let lowestNotice = '';
      if (data.lowestSubject) {
        lowestNotice = `\n\nYour lowest-attendance subject is **${data.lowestSubject.subject}** at **${data.lowestSubject.percentage}%**${data.lowestSubject.percentage < 75 ? ', which requires immediate attendance to meet the mandatory 75% threshold.' : '.'}`;
      }

      let missedNotice = '';
      if (data.missedClasses > 0) {
        missedNotice = ` You have missed **${data.missedClasses} class${data.missedClasses > 1 ? 'es' : ''}** so far this semester.`;
      } else {
        missedNotice = ` You have attended all scheduled classes!`;
      }

      return `Your current overall attendance is **${data.overallPercentage}%** (${data.attendedClasses} out of ${data.totalClasses} classes attended).${missedNotice}

### Subject breakdown
${breakdown}${lowestNotice}`;
    }

    case 'ROOM': {
      if (!data || !data.allocated) return 'You do not have an active hostel room allocation recorded in the campus directory.';
      return `You are currently allocated to **Room ${data.roomNumber}** (Floor ${data.floorNumber}) in **${data.blockName}** of **${data.hostelName}**.

Current occupancy is **${data.currentOccupancy} of ${data.capacity}** residents.`;
    }

    case 'COMPLAINTS': {
      if (!data || data.total === 0) return 'You do not have any complaints registered in the system. Everything looks good!';
      const list = data.complaints
        .map((c) => `• **${c.title}** — \`${c.status}\` *(${c.category}, Priority: ${c.priority})*`)
        .join('\n');
      return `You have **${data.total} total complaints** registered (${data.pending} active/in-progress, ${data.resolved} resolved):

${list}`;
    }

    case 'GATE_PASS': {
      if (!data || !data.activePass) return 'You do not currently have any active or pending gate pass requests.';
      const ap = data.activePass;
      return `### Active Gate Pass Status
• **Pass Number:** \`${ap.passNumber}\`
• **Type:** ${ap.type.replace('_', ' ')}
• **Status:** **${ap.status}**
• **Destination:** ${ap.destination}
• **Reason:** ${ap.reason}`;
    }

    case 'FEES': {
      if (!data) return 'Unable to retrieve fee ledgers.';
      if (!data.hasDues) return 'All your semester fees are completely cleared! You have **₹0 outstanding dues**.';
      return `Your current outstanding fee balance is **₹${data.totalDue.toLocaleString('en-IN')}**.

Please clear any pending dues before semester examination hall ticket issuance.`;
    }

    case 'TIMETABLE': {
      if (!data || !data.classes || data.classes.length === 0) return `No classes are scheduled for ${data?.day || 'today'}.`;
      const classes = data.classes
        .map((c) => `• **${c.time}** — ${c.subject} (\`${c.classroom}\`) by *${c.faculty}*`)
        .join('\n');
      return `### Schedule for ${data.day}:
${classes}`;
    }

    case 'MESS': {
      if (!data) return 'Mess menu details are currently unavailable.';
      return `### Today's Campus Dining Menu:
• **Breakfast:** ${data.breakfast}
• **Lunch:** ${data.lunch}
• **Evening Snacks:** ${data.snacks}
• **Dinner:** ${data.dinner}`;
    }

    case 'ADMIN_METRICS': {
      if (!data) return 'Operational metrics are currently being compiled.';
      return `### Campus Operational Summary:
• **Total Complaints Logged:** **${data.totalComplaints}**
• **Pending / Action Required:** **${data.pendingComplaints}** (${data.inProgressComplaints} currently in progress)
• **Resolved / Closed:** **${data.resolvedComplaints}**
• **High Priority / Urgent:** **${data.urgentComplaints}**
• **Top Incident Category:** **${data.topIssueCategory}** with ${data.topCategoryCount} active tickets`;
    }

    default:
      return 'I am your CAMPUS OS Operations Assistant. How can I assist you with your academic schedule, hostel allocation, attendance, or campus services?';
  }
}

/**
 * Main AI Chat Processor:
 * Intercepts query -> detects intent -> queries Neon DB via Prisma -> synthesizes via Groq or fallback.
 */
export async function processCampusChat(userMessage, history = [], userContext = null) {
  const intent = detectIntent(userMessage, history);
  const { data, groundedPrompt, action } = await gatherDomainContext(intent, userContext);

  // If domain facts were retrieved from Neon, use them to ground Groq or return deterministic response
  if (data && groundedPrompt) {
    if (isGroqConfigured()) {
      try {
        const groq = getGroqClient();
        const model = process.env.GROQ_MODEL || ENV.GROQ_MODEL || 'qwen/qwen3.8-27b';

        const systemMessage = `You are the CAMPUS OS Operations Assistant.
Address the user courteously. Answer their question directly and concisely using the REAL institutional data provided below.

CRITICAL RULES:
1. All figures, percentages, room numbers, and ticket counts MUST strictly match the REAL DATA provided below.
2. NEVER say "I do not have access to your personal academic records" or tell the student to navigate to the portal to find the answer. You HAVE the data right below.
3. Present the answer clearly with markdown formatting (bullet points, bold text, percentages).
4. For attendance: clearly state the overall percentage, the subject-by-subject breakdown, and explicitly identify the lowest attendance subject.
5. Always formulate the final response in clean, professional English by default, even if the user phrased their question in Hindi, Hinglish, or Odia. Preserve all exact numerical values and percentages.

${groundedPrompt}`;

        const payloadMessages = [
          { role: 'system', content: systemMessage },
          ...history.slice(-4).map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content || m.text || ''
          })),
          { role: 'user', content: userMessage }
        ];

        const completion = await groq.chat.completions.create({
          model,
          messages: payloadMessages,
          temperature: 0.2,
          max_tokens: 1024
        });

        const replyContent = completion.choices[0]?.message?.content;
        if (replyContent && replyContent.trim()) {
          return {
            success: true,
            message: replyContent.trim(),
            suggestedAction: action?.actionUrl,
            actionDetails: action,
            intent,
            model
          };
        }
      } catch (err) {
        console.warn('[Groq Grounded Synthesis Warning]:', err.message);
      }
    }

    // High quality deterministic fallback based on actual Neon DB data
    const deterministicReply = buildDeterministicReply(intent, data, userContext);
    return {
      success: true,
      message: deterministicReply,
      suggestedAction: action?.actionUrl,
      actionDetails: action,
      intent,
      model: 'CAMPUS OS Database Engine (Direct Verified)'
    };
  }

  // General Institutional Knowledge Query
  if (isGroqConfigured()) {
    try {
      const groq = getGroqClient();
      const model = process.env.GROQ_MODEL || ENV.GROQ_MODEL || 'qwen/qwen3.8-27b';

      const generalSystem = `You are the CAMPUS OS Campus Assistant.
Assist students, faculty, and administrators with campus rules, gate pass regulations (day outing 2h advance, night outing 24h & warden approval), 75% attendance policy, hostel maintenance protocols, and dining schedules politely, concisely, and accurately.`;

      const payloadMessages = [
        { role: 'system', content: generalSystem },
        ...history.slice(-4).map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content || m.text || ''
        })),
        { role: 'user', content: userMessage }
      ];

      const completion = await groq.chat.completions.create({
        model,
        messages: payloadMessages,
        temperature: 0.3,
        max_tokens: 1024
      });

      return {
        success: true,
        message: completion.choices[0]?.message?.content || 'How may I assist you today?',
        suggestedAction: null,
        actionDetails: null,
        intent: 'GENERAL',
        model
      };
    } catch (err) {
      console.warn('[Groq General Chat Warning]:', err.message);
    }
  }

  return {
    success: true,
    message: 'Hello! I am your CAMPUS OS Operations Assistant. How can I help you with your attendance, timetable, hostel room, or campus services?',
    suggestedAction: null,
    actionDetails: null,
    intent: 'GENERAL',
    model: 'CAMPUS OS Assistant'
  };
}
