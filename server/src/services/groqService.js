import Groq from 'groq-sdk';
import { z } from 'zod';

const apiKey = process.env.GROQ_API_KEY;

let groqClient = null;

if (apiKey && apiKey.trim().length > 0) {
  try {
    groqClient = new Groq({ apiKey });
  } catch (err) {
    console.warn('[AI Service] Failed to initialize Groq Client:', err.message);
  }
}

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
const DEFAULT_TEMPERATURE = parseFloat(process.env.GROQ_TEMPERATURE || '0.2');
const DEFAULT_MAX_TOKENS = parseInt(process.env.GROQ_MAX_TOKENS || '1024', 10);

const CAMPUS_OS_SYSTEM_PROMPT = `You are the official Campus Assistant for CAMPUS OS.
Use ONLY the provided context and tools to answer the student's or administrator's inquiry.
If the answer is unknown, politely direct them to the appropriate campus office.
DO NOT fabricate attendance, fees, complaint IDs, or official policies.
Keep your answers highly concise, professional, and directly actionable.
`;
const UNIFIX_SYSTEM_PROMPT = CAMPUS_OS_SYSTEM_PROMPT;
const IBS_SYSTEM_PROMPT = CAMPUS_OS_SYSTEM_PROMPT;

export const isGroqConfigured = () => {
  return groqClient !== null;
};

export const generateCompletion = async (messages, options = {}) => {
  if (!isGroqConfigured()) {
    throw new Error('Groq API is not configured or key is missing.');
  }

  const model = options.model || DEFAULT_MODEL;
  const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;

  // Ensure system prompt is always injected if not provided
  const hasSystem = messages.some((m) => m.role === 'system');
  const payloadMessages = hasSystem ? messages : [{ role: 'system', content: CAMPUS_OS_SYSTEM_PROMPT }, ...messages];

  try {
    const completion = await groqClient.chat.completions.create({
      messages: payloadMessages,
      model,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    });
    
    return {
      success: true,
      content: completion.choices[0]?.message?.content || '',
      usage: completion.usage
    };
  } catch (error) {
    console.error('[Groq Service Error]:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const generateStreamingCompletion = async (messages, res, options = {}) => {
  if (!isGroqConfigured()) {
    throw new Error('Groq API is not configured or key is missing.');
  }

  const model = options.model || DEFAULT_MODEL;
  const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;

  const hasSystem = messages.some((m) => m.role === 'system');
  const payloadMessages = hasSystem ? messages : [{ role: 'system', content: CAMPUS_OS_SYSTEM_PROMPT }, ...messages];

  try {
    const stream = await groqClient.chat.completions.create({
      messages: payloadMessages,
      model,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        // Simple SSE format
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('[Groq Streaming Error]:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

export default {
  isGroqConfigured,
  generateCompletion,
  generateStreamingCompletion,
  CAMPUS_OS_SYSTEM_PROMPT,
  UNIFIX_SYSTEM_PROMPT,
  IBS_SYSTEM_PROMPT
};
