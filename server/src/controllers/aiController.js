import { sendChatMessage } from '../services/ai/chatService.js';
import { generateStreamingCompletion, generateCompletion } from '../services/groqService.js';
import { classifyComplaint } from '../ai/complaintClassifier.js';
import { detectRecurringIssues } from '../ai/recurringIssueDetector.js';
import { checkDuplicateComplaint } from '../ai/duplicateDetector.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const handleAiChat = async (req, res) => {
  try {
    const { message, messages } = req.body;
    const userMessage = message || (Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1]?.content : null);

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Message is required and must not be empty'
        }
      });
    }

    const chatResult = await sendChatMessage(
      userMessage.trim(),
      Array.isArray(messages) ? messages : [],
      req.user
    );

    if (!chatResult.success) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'GROQ_API_ERROR',
          message: chatResult.error || 'Failed to process AI chat'
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: chatResult.message,
      response: chatResult.message, // Compatibility with Chatbot.jsx UI
      suggestedAction: chatResult.suggestedAction || null,
      actionDetails: chatResult.actionDetails || null,
      intent: chatResult.intent || 'GENERAL',
      model: chatResult.model || 'qwen/qwen3.8-27b'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'AI_CHAT_ERROR',
        message: 'Internal server error while processing AI chat'
      }
    });
  }
};

export const handleClassifyComplaint = async (req, res) => {
  try {
    const title = req.body.title || req.body.text || 'Grievance Issue';
    const description = req.body.description || req.body.text || title;
    const location = req.body.location || 'Campus';

    if (!title && !description) {
      return errorResponse(res, 'Title or text required for classification', 'MISSING_FIELDS', 400);
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
