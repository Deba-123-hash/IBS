import { processCampusChat } from '../../ai/chatbotEngine.js';

/**
 * Enhanced CAMPUS OS Campus AI Chat Service:
 * User query + conversation history + authenticated user context ->
 * Neon PostgreSQL (Prisma) real-time domain records ->
 * Groq LPU grounded synthesis ->
 * Verified response with contextual action routing.
 *
 * @param {string} message - User query message
 * @param {Array<{role: string, content: string}>} [history=[]] - Optional conversation history
 * @param {Object} [userContext=null] - Authenticated user identity from req.user
 * @returns {Promise<{success: boolean, message?: string, suggestedAction?: string, actionDetails?: Object, error?: string, model?: string}>}
 */
export const sendChatMessage = async (message, history = [], userContext = null) => {
  try {
    const result = await processCampusChat(message, history, userContext);
    return result;
  } catch (err) {
    console.error('[sendChatMessage Error]:', err);
    return {
      success: false,
      error: 'An internal error occurred while processing campus chat.'
    };
  }
};

export default {
  sendChatMessage
};
