import { executeAiTool } from './tools.js';

const INTENT_MATRIX = [
  {
    intent: 'LIVE_DATA_ATTENDANCE',
    keywords: ['attendance', 'present', 'absent', 'shortage', 'percentage'],
    tool: 'getStudentAttendance'
  },
  {
    intent: 'LIVE_DATA_TIMETABLE',
    keywords: ['timetable', 'schedule', 'class', 'lecture', 'next class', 'period'],
    tool: 'getTodayTimetable'
  },
  {
    intent: 'LIVE_DATA_COMPLAINTS',
    keywords: ['complaint', 'maintenance', 'issue', 'ticket', 'repair', 'plumbing', 'electrical', 'status of my complaint'],
    tool: 'getStudentComplaints'
  }
];

/**
 * Super fast regex-based intent router to avoid unnecessary LLM roundtrips for tool selection.
 */
export async function routeIntentAndGatherContext(userMessage, userContext) {
  if (!userMessage || typeof userMessage !== 'string') return null;
  
  const lowerMsg = userMessage.toLowerCase();
  let matchedTool = null;
  let matchedIntent = null;

  for (const route of INTENT_MATRIX) {
    if (route.keywords.some(kw => lowerMsg.includes(kw))) {
      matchedTool = route.tool;
      matchedIntent = route.intent;
      break;
    }
  }

  if (matchedTool) {
    console.log(`[Intent Router] Matched Intent: ${matchedIntent}. Executing Tool: ${matchedTool}`);
    const toolResult = await executeAiTool(matchedTool, {}, userContext);
    
    return `
[SYSTEM TOOL EXECUTION RESULT]
Intent Detected: ${matchedIntent}
Database Tool Executed: ${matchedTool}
Live Data Retrieved: 
${toolResult}

Use this live data to answer the user's query accurately. Do not invent any numbers.
`;
  }

  return null;
}
