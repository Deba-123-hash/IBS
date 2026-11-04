import aiService from './aiService.js';

/**
 * Institutional Campus Knowledge Base & Action Routing Mapping
 */
export const CAMPUS_KNOWLEDGE_BASE = [
  {
    topic: 'Gate Pass & Curfew',
    keywords: ['gate pass', 'out pass', 'outing', 'night outing', 'day outing', 'curfew', 'leave campus', 'permission', 'qr'],
    answer: 'Campus Gate Pass Policies:\n- **Day Outing:** Submit request at least 2 hours in advance. Valid until 9:00 PM.\n- **Night Outing / Overnight:** Request at least 24 hours prior. Requires digital sign-off from your Hostel Warden.\n- **Verification:** Once approved, an encrypted QR code is displayed on your screen. The security guard at the campus gate scans this QR code for instant check-out/check-in logging.\n- **Curfew:** Strict hostel lock at 10:00 PM for all residents.',
    actionUrl: '/student/gate-passes',
    actionLabel: 'Apply for Gate Pass'
  },
  {
    topic: 'Hostel Maintenance & Complaints',
    keywords: ['complaint', 'maintenance', 'plumbing', 'tap', 'leak', 'flush', 'fan', 'light', 'switch', 'electricity', 'wifi', 'internet', 'lan', 'furniture', 'bed', 'chair', 'cleaning', 'garbage', 'pest'],
    answer: 'Hostel Grievance & Maintenance Protocol:\n- Submit a maintenance ticket under **Complaints -> Report Issue**.\n- Our system automatically categorizes your ticket (Plumbing, Electrical, Wi-Fi, Janitorial, Furniture) and assigns an SLA to the maintenance crew.\n- **SLA Hierarchy:** Emergency plumbing/electrical leaks are addressed within 4 hours; general repairs within 24 hours.',
    actionUrl: '/student/complaints',
    actionLabel: 'Report Maintenance Issue'
  },
  {
    topic: 'Bonafide & Institutional Certificates',
    keywords: ['bonafide', 'certificate', 'noc', 'study certificate', 'custodian', 'recommendation'],
    answer: 'Institutional Certificates:\n- Apply under **Certificates -> New Request**.\n- Choose between Bonafide Certificate, Study Certificate, or NOC (No Objection Certificate).\n- State your purpose (e.g., passport application, bank loan, education scholarship, transport pass).\n- Requests are signed digitally and dispatched within 24-48 hours provided all semester fee dues are cleared.',
    actionUrl: '/student/certificates',
    actionLabel: 'Request Certificate'
  },
  {
    topic: 'Dining & Mess Operations',
    keywords: ['mess', 'food', 'breakfast', 'lunch', 'dinner', 'snacks', 'menu', 'diet', 'meal', 'catering'],
    answer: 'Campus Mess Schedule:\n- **Breakfast:** 07:30 AM - 09:15 AM\n- **Lunch:** 12:30 PM - 02:15 PM\n- **Evening Refreshments:** 05:00 PM - 06:15 PM\n- **Dinner:** 07:45 PM - 09:45 PM\n\nYou can inspect today\'s live dining menu and submit daily food quality ratings directly in the Mess portal.',
    actionUrl: '/student/mess',
    actionLabel: 'View Today\'s Mess Menu'
  },
  {
    topic: 'Attendance Regulations',
    keywords: ['attendance', 'percentage', '75%', 'shortage', 'short fall', 'medical leave', 'condonation', 'exam eligibility'],
    answer: 'Academic Attendance Rules:\n- A minimum of **75% aggregate attendance** is mandatory in every course to qualify for semester examinations.\n- Automated notifications trigger when your attendance dips between 75% and 80%.\n- Medical leaves must be submitted within 3 working days with institutional medical officer endorsement.',
    actionUrl: '/student/attendance',
    actionLabel: 'Check Attendance Record'
  },
  {
    topic: 'Fee Ledgers & Financial Clearance',
    keywords: ['fee', 'dues', 'tuition', 'hostel fee', 'receipt', 'payment', 'challan', 'ledger'],
    answer: 'Student Financial Services:\n- View outstanding semester dues, tuition fees, and hostel charges under **Fees & Dues**.\n- Digital receipts are generated instantaneously upon payment confirmation.\n- Exam admit cards and Bonafide certificates require zero-dues clearance.',
    actionUrl: '/student/fees',
    actionLabel: 'Open Fee Ledgers'
  },
  {
    topic: 'Academic Timetable & Schedule',
    keywords: ['timetable', 'schedule', 'class', 'lecture', 'lab', 'period', 'slot', 'classroom'],
    answer: 'Class & Lab Timetable:\n- Access your personalized weekly lecture schedule, room allocations, and faculty contacts under **Timetable**.',
    actionUrl: '/student/timetable',
    actionLabel: 'View Timetable'
  },
  {
    topic: 'No-Phone Help Desk Kiosk',
    keywords: ['help desk', 'kiosk', 'emergency', 'lost phone', 'offline', 'terminal'],
    answer: 'Emergency & Help Desk Kiosk:\n- For students without smartphone access or experiencing device issues, walk up to any campus Help Desk Kiosk to file instant gate passes or emergency requests via roll number validation.',
    actionUrl: '/help-desk',
    actionLabel: 'Access Help Desk'
  }
];

/**
 * Builds the fine-tuned system prompt incorporating deep campus domain knowledge
 * and active student context.
 */
function buildSystemPrompt(userContext = null) {
  let contextSnippet = '';
  if (userContext) {
    contextSnippet = `
ACTIVE USER CONTEXT:
- Name: ${userContext.firstName || 'Student'} ${userContext.lastName || ''}
- Role: ${userContext.role || 'STUDENT'}
- Roll Number: ${userContext.rollNumber || '2301105001'}
- Room / Block: ${userContext.room || 'Hostel Block B, Room 304'}
- Department: ${userContext.department || 'Computer Science & Engineering'}
`;
  }

  const knowledgeSnippet = CAMPUS_KNOWLEDGE_BASE.map(
    (k) => `[Topic: ${k.topic}]
Content: ${k.answer}
Suggested Route: ${k.actionUrl} (${k.actionLabel})`
  ).join('\n\n');

  return `You are the Senior AI Campus Operations Assistant for CAMPUS OS.
You are a highly capable, articulate, and empathetic institutional AI agent operating on Groq LPUs.

YOUR MISSION:
1. Provide instant, accurate, friendly, and actionable guidance on all campus operations.
2. Formulate responses in clean, readable Markdown (bullet points, bold highlights, concise steps).
3. If the user asks about an actionable operation (e.g., Gate Pass, Complaints/Repairs, Certificates, Mess, Attendance, Fees), provide clear step-by-step instructions.

INSTITUTIONAL RULES & DOMAIN KNOWLEDGE:
${knowledgeSnippet}
${contextSnippet}

BEHAVIOR GUIDELINES:
- Address the student politely, incorporating their name and room context when appropriate.
- Keep answers concise, clear, and professional.
- Do not invent non-existent campus policies. Stick to institutional regulations.
`;
}

/**
 * Extracts action routing link based on user query and knowledge base
 */
function detectSuggestedAction(query) {
  const lower = (query || '').toLowerCase();
  for (const item of CAMPUS_KNOWLEDGE_BASE) {
    for (const kw of item.keywords) {
      if (lower.includes(kw)) {
        return {
          actionUrl: item.actionUrl,
          actionLabel: item.actionLabel
        };
      }
    }
  }
  return null;
}

/**
 * Processes incoming chat query with multi-turn conversation and Groq LLM
 * @param {string|Array} input - Either a string message or array of messages
 * @param {Object} userContext - Current authenticated user profile
 * @returns {Promise<Object>} Chatbot response payload
 */
export async function processChatbotQuery(input, userContext = null) {
  // Format input messages
  let conversationHistory = [];
  let latestQuery = '';

  if (Array.isArray(input)) {
    conversationHistory = input.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text || m.content || ''
    }));
    const lastUserMsg = [...conversationHistory].reverse().find((m) => m.role === 'user');
    latestQuery = lastUserMsg?.content || '';
  } else {
    latestQuery = typeof input === 'string' ? input : input?.message || '';
    conversationHistory = [{ role: 'user', content: latestQuery }];
  }

  const systemPrompt = buildSystemPrompt(userContext);
  const detectedAction = detectSuggestedAction(latestQuery);

  // Assemble full message sequence for Groq
  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory
  ];

  // Call Groq AI service
  const aiResponse = await aiService.generateChatCompletion(groqMessages, {
    temperature: 0.6,
    max_tokens: 1024
  });

  if (aiResponse) {
    return {
      response: aiResponse,
      suggestedAction: detectedAction?.actionUrl || null,
      actionDetails: detectedAction || null,
      model: aiService.model,
      timestamp: new Date().toISOString()
    };
  }

  // Graceful heuristic fallback if Groq inference is temporarily offline
  const fallbackMatch = CAMPUS_KNOWLEDGE_BASE.find((item) =>
    item.keywords.some((kw) => latestQuery.toLowerCase().includes(kw))
  );

  if (fallbackMatch) {
    return {
      response: fallbackMatch.answer,
      suggestedAction: fallbackMatch.actionUrl,
      actionDetails: {
        actionUrl: fallbackMatch.actionUrl,
        actionLabel: fallbackMatch.actionLabel
      },
      model: 'heuristic-campus-engine',
      timestamp: new Date().toISOString()
    };
  }

  return {
    response: `Hello! I am your 24/7 Campus AI Chatbot. I can assist you with:\n- **Gate Passes & Outings** (Day and night outing approval)\n- **Hostel Maintenance** (Plumbing, electricity, Wi-Fi repairs)\n- **Certificates** (Bonafide, NOC, and Custodian letters)\n- **Dining & Mess** (Timings, daily menu, and meal feedback)\n- **Attendance & Exams** (75% regulations and leave requests)\n- **Fees & Clearance** (Ledgers, receipts, and dues)\n\nHow may I help you today?`,
    suggestedAction: '/student/dashboard',
    actionDetails: { actionUrl: '/student/dashboard', actionLabel: 'Go to Dashboard' },
    model: 'heuristic-campus-engine',
    timestamp: new Date().toISOString()
  };
}

export default {
  processChatbotQuery,
  CAMPUS_KNOWLEDGE_BASE
};
