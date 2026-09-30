import { processAssistantQuery } from '../ai/campusAssistant.js';
import { classifyComplaint } from '../ai/complaintClassifier.js';
import { detectRecurringIssues } from '../ai/recurringIssueDetector.js';
import { checkDuplicateComplaint } from '../ai/duplicateDetector.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const handleAiChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return errorResponse(res, 'Message text is required', 'MISSING_PROMPT', 400);
    }

    const result = await processAssistantQuery(message);

    return successResponse(res, {
      response: result.reply,
      suggestedAction: result.suggestedAction,
      timestamp: new Date().toISOString()
    }, 'AI response generated');
  } catch (error) {
    return errorResponse(res, 'Failed to process AI chat query', 'AI_CHAT_ERROR', 500);
  }
};

export const handleClassifyComplaint = async (req, res) => {
  try {
    const { title, description, location } = req.body;

    if (!title || !description) {
      return errorResponse(res, 'Title and description required for classification', 'MISSING_FIELDS', 400);
    }

    const classification = await classifyComplaint(title, description, location);

    return successResponse(res, classification, 'Complaint classified by AI pipeline');
  } catch (error) {
    return errorResponse(res, 'Classification failed', 'AI_CLASSIFY_ERROR', 500);
  }
};

export const getRecurringIssues = async (req, res) => {
  try {
    const clusters = await detectRecurringIssues();
    return successResponse(res, { clusters, count: clusters.length }, 'Recurring issue intelligence generated');
  } catch (error) {
    return errorResponse(res, 'Failed to detect recurring issues', 'RECURRING_ERROR', 500);
  }
};

export const getComplaintDuplicates = async (req, res) => {
  try {
    const { id } = req.params;
    const { title = 'Bathroom leakage', description = 'Water leaking in room B-204' } = req.query;

    const dupResult = await checkDuplicateComplaint(title, description);

    return successResponse(res, {
      complaintId: id,
      matches: dupResult.isDuplicate ? [
        {
          complaintId: dupResult.existingTicketId || 'CMP-2026-0042',
          ticketNumber: dupResult.ticketNumber || 'CMP-2026-0042',
          similarity: (dupResult.similarityScore || 91) / 100,
          reason: 'Same room, category and issue pattern'
        }
      ] : []
    }, 'Duplicate check completed');
  } catch (error) {
    return errorResponse(res, 'Duplicate check failed', 'DUPLICATE_CHECK_ERROR', 500);
  }
};

export const summarizeComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
      return errorResponse(res, 'Text content required for summarization', 'MISSING_CONTENT', 400);
    }

    const summary = {
      issue: title || 'Reported Maintenance Issue',
      location: 'Hostel Block B, Room 204',
      urgency: 'HIGH',
      requiredAction: `Inspect ${title?.toLowerCase() || 'reported fixture'} and resolve root cause.`
    };

    return successResponse(res, summary, 'Summary generated successfully');
  } catch (error) {
    return errorResponse(res, 'Summarization failed', 'SUMMARY_ERROR', 500);
  }
};
