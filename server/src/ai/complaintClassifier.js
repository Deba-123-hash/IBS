import aiService from './aiService.js';

export const classifyComplaint = async (title, description, location = '') => {
  const systemPrompt = `
You are an expert Campus Maintenance & Facilities AI Classifier.
Analyze the student complaint and return a valid JSON object matching this schema:
{
  "category": "PLUMBING" | "ELECTRICAL" | "INTERNET" | "CLEANING" | "FURNITURE" | "WATER" | "SECURITY" | "OTHER",
  "department": "MAINTENANCE" | "IT_SUPPORT" | "HOUSEKEEPING" | "ESTATE_OFFICE" | "WARDEN_OFFICE",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "issueType": string,
  "confidence": number (between 0.0 and 1.0),
  "suggestedTrade": string
}
`;

  const userPrompt = `
Complaint Title: ${title}
Complaint Description: ${description}
Location: ${location || 'Campus / Hostel'}
`;

  // 1. Try LLM Provider
  const aiResult = await aiService.generateJsonCompletion(userPrompt, systemPrompt);

  if (aiResult && aiResult.category && aiResult.priority) {
    return aiResult;
  }

  // 2. Deterministic Rule-Based Fallback Engine
  const combined = `${title} ${description}`.toLowerCase();

  let category = 'OTHER';
  let department = 'MAINTENANCE';
  let priority = 'MEDIUM';
  let issueType = 'GENERAL_REPAIR';
  let suggestedTrade = 'GENERAL';

  if (combined.includes('leak') || combined.includes('pipe') || combined.includes('tap') || combined.includes('drain') || combined.includes('flush') || combined.includes('shower')) {
    category = 'PLUMBING';
    department = 'MAINTENANCE';
    suggestedTrade = 'PLUMBING';
    issueType = 'WATER_LEAKAGE';
    priority = combined.includes('burst') || combined.includes('flood') ? 'URGENT' : 'HIGH';
  } else if (combined.includes('fan') || combined.includes('light') || combined.includes('switch') || combined.includes('spark') || combined.includes('wire') || combined.includes('shock') || combined.includes('power')) {
    category = 'ELECTRICAL';
    department = 'MAINTENANCE';
    suggestedTrade = 'ELECTRICAL';
    issueType = 'ELECTRICAL_FAULT';
    priority = combined.includes('smoke') || combined.includes('spark') || combined.includes('shock') ? 'URGENT' : 'HIGH';
  } else if (combined.includes('wifi') || combined.includes('internet') || combined.includes('lan') || combined.includes('router') || combined.includes('network')) {
    category = 'INTERNET';
    department = 'IT_SUPPORT';
    suggestedTrade = 'NETWORK_ENGINEER';
    issueType = 'CONNECTIVITY_DROP';
    priority = 'MEDIUM';
  } else if (combined.includes('clean') || combined.includes('dust') || combined.includes('garbage') || combined.includes('trash') || combined.includes('cockroach') || combined.includes('pest')) {
    category = 'CLEANING';
    department = 'HOUSEKEEPING';
    suggestedTrade = 'JANITORIAL';
    issueType = 'SANITATION_CLEANLINESS';
    priority = 'LOW';
  } else if (combined.includes('bed') || combined.includes('chair') || combined.includes('table') || combined.includes('door') || combined.includes('window') || combined.includes('lock')) {
    category = 'FURNITURE';
    department = 'MAINTENANCE';
    suggestedTrade = 'CARPENTRY';
    issueType = 'FURNITURE_DAMAGE';
    priority = combined.includes('lock') ? 'HIGH' : 'LOW';
  }

  return {
    category,
    department,
    priority,
    issueType,
    confidence: 0.88,
    suggestedTrade
  };
};
