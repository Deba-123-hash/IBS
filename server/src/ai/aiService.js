import axios from 'axios';
import https from 'https';
import { ENV } from '../config/env.js';

class AIService {
  constructor() {
    this.provider = ENV.AI_PROVIDER || 'groq';
    this.apiKey = ENV.GROQ_API_KEY || ENV.AI_API_KEY || '';
    this.model = ENV.GROQ_MODEL || 'qwen/qwen3.8-27b';
    this.endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    
    // Resilient HTTPS agent to handle Windows/corporate proxy CA inspection
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
  }

  /**
   * Primary Groq chat completion endpoint
   * @param {Array<{role: string, content: string}>} messages - Array of chat messages
   * @param {Object} options - Configuration overrides (temperature, max_tokens, model)
   * @returns {Promise<string|null>} The generated text response
   */
  async generateChatCompletion(messages, options = {}) {
    if (!this.apiKey) {
      console.warn('[AI Service] No GROQ_API_KEY supplied.');
      return null;
    }

    const targetModel = options.model || this.model;
    const temperature = options.temperature !== undefined ? options.temperature : 0.7;
    const maxTokens = options.max_tokens || 1024;

    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: targetModel,
          messages,
          temperature,
          max_tokens: maxTokens
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          httpsAgent: this.httpsAgent,
          timeout: 20000
        }
      );

      const choice = response.data?.choices?.[0];
      if (!choice) return null;

      const message = choice.message;
      let content = message?.content;

      // Handle reasoning models like openai/gpt-oss-120b
      if (!content && message?.reasoning) {
        content = message.reasoning;
      }

      return content ? content.trim() : null;
    } catch (err) {
      const errorDetail = err.response?.data?.error?.message || err.message;
      console.error(`[AI Service Groq Chat Error - ${targetModel}]:`, errorDetail);

      // If the primary model failed and wasn't openai/gpt-oss-120b, try fallback
      if (targetModel !== 'openai/gpt-oss-120b' && !options._isRetry) {
        console.info('[AI Service] Retrying with fallback model openai/gpt-oss-120b...');
        return this.generateChatCompletion(messages, {
          ...options,
          model: 'openai/gpt-oss-120b',
          _isRetry: true
        });
      }

      return null;
    }
  }

  /**
   * Generates a structured JSON response using Groq JSON mode
   * @param {string} prompt - User or task prompt
   * @param {string} systemInstruction - System instruction guiding the JSON schema
   * @returns {Promise<Object|null>} Parsed JSON object
   */
  async generateJsonCompletion(prompt, systemInstruction = '') {
    if (!this.apiKey) {
      console.warn('[AI Service] No GROQ_API_KEY supplied. Falling back to rule-based engine.');
      return null;
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({
        role: 'system',
        content: `${systemInstruction}\nIMPORTANT: You MUST respond ONLY with valid JSON. Do not add markdown or extra conversational text.`
      });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 1024
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          httpsAgent: this.httpsAgent,
          timeout: 15000
        }
      );

      const rawContent = response.data?.choices?.[0]?.message?.content;
      if (!rawContent) return null;

      // Sanitize potential markdown fence around JSON if returned
      const cleanJson = rawContent
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      return JSON.parse(cleanJson);
    } catch (err) {
      const errorDetail = err.response?.data?.error?.message || err.message;
      console.error('[AI Service Groq JSON Error]:', errorDetail);
      return null;
    }
  }

  /**
   * Single prompt text completion helper
   */
  async generateTextCompletion(prompt, systemInstruction = '') {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });
    return this.generateChatCompletion(messages);
  }
}

export default new AIService();
