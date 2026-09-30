import aiService from './aiService.js';

const CAMPUS_KNOWLEDGE_BASE = [
  {
    topic: 'Bonafide Certificate',
    keywords: ['bonafide', 'certificate', 'study certificate', 'apply bonafide'],
    answer: 'To apply for a Bonafide Certificate, navigate to Certificates in the sidebar, click "New Request", select "Bonafide Certificate", and enter your stated purpose (e.g. passport, scholarship, bus pass). Requests are approved digitally within 24-48 hours once all semester dues are clear.',
    actionUrl: '/student/certificates'
  },
  {
    topic: 'Gate Pass',
    keywords: ['gate pass', 'out pass', 'outing', 'leave campus', 'curfew'],
    answer: 'Hostel gate passes must be submitted digitally under "Gate Passes". For Day Outing, submit 2 hours in advance. For Night Outing, request at least 24 hours prior. Once your Hostel Warden approves, a secure QR code will be generated on your screen for security guard verification at the gate.',
    actionUrl: '/student/gate-passes'
  },
  {
    topic: 'Hostel Complaints',
    keywords: ['complaint', 'maintenance', 'plumbing', 'fan', 'wifi', 'broken', 'leak', 'light'],
    answer: 'To report broken room fixtures, electrical faults, or plumbing leaks, go to "Complaints" -> "Report Issue". Upload an optional photo and describe the problem. The system will automatically classify and assign your ticket to the maintenance technician with an SLA deadline.',
    actionUrl: '/student/complaints'
  },
  {
    topic: 'Mess Timings & Menu',
    keywords: ['mess', 'food', 'breakfast', 'lunch', 'dinner', 'menu', 'meal'],
    answer: 'Campus Dining Timings:\n- Breakfast: 07:30 AM - 09:15 AM\n- Lunch: 12:30 PM - 02:15 PM\n- Evening Snacks: 05:00 PM - 06:15 PM\n- Dinner: 07:45 PM - 09:45 PM\nYou can view today\'s active menu and rate your meal quality directly in the "Mess" section.',
    actionUrl: '/student/mess'
  },
  {
    topic: 'Attendance Rules',
    keywords: ['attendance', 'percentage', '75', 'shortage', 'medical leave'],
    answer: 'Institutional regulation mandates a minimum of 75% attendance in each registered subject to be eligible for end-semester examinations. If your attendance dips below 75%, an automated warning will appear on your dashboard. Academic leave must be endorsed by your faculty advisor.',
    actionUrl: '/student/attendance'
  },
  {
    topic: 'Library Timings',
    keywords: ['library', 'books', 'reading room', 'borrow'],
    answer: 'Central Library Operating Hours:\n- Monday to Saturday: 08:00 AM - 10:00 PM\n- Sundays & Holidays: 09:00 AM - 05:00 PM\n- 24/7 Digital Repository access is available on the campus network.',
    actionUrl: '/student/dashboard'
  }
];

export const processAssistantQuery = async (query) => {
  const lowerQuery = (query || '').toLowerCase().trim();

  // Try matching against knowledge base
  let bestMatch = null;
  let maxScore = 0;

  for (const item of CAMPUS_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (lowerQuery.includes(kw)) score += 2;
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  // If external AI key is available, pass context to LLM
  if (aiService.apiKey) {
    const contextSnippet = CAMPUS_KNOWLEDGE_BASE.map(k => `${k.topic}: ${k.answer}`).join('\n\n');
    const systemInstruction = `You are the friendly, helpful AI Campus Assistant for "Campus Life, Debugged". Answer accurately using the context. Keep answers concise, actionable, and formatted in clean markdown.`;
    const prompt = `Context:\n${contextSnippet}\n\nStudent Query: "${query}"\nProvide a clear, helpful response.`;
    
    const llmAnswer = await aiService.generateTextCompletion(prompt, systemInstruction);
    if (llmAnswer) {
      return {
        reply: llmAnswer,
        suggestedAction: bestMatch ? bestMatch.actionUrl : null
      };
    }
  }

  // Knowledge base fallback response
  if (bestMatch && maxScore > 0) {
    return {
      reply: bestMatch.answer,
      suggestedAction: bestMatch.actionUrl
    };
  }

  return {
    reply: `Hello! I am your 24/7 Campus AI Assistant. You can ask me how to apply for a Bonafide Certificate, check mess timings, request a gate pass, report hostel repair issues, or check attendance regulations. How can I help you today?`,
    suggestedAction: '/student/dashboard'
  };
};
