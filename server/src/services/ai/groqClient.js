import Groq from 'groq-sdk';
import { ENV } from '../../config/env.js';

// Backend-only Groq client: reads securely from environment variables
const apiKey = process.env.GROQ_API_KEY || ENV.GROQ_API_KEY || '';

export const isGroqConfigured = () => Boolean(apiKey && apiKey.trim().length > 0);

// Safe configuration check
export const getGroqStatus = () => ({
  configured: isGroqConfigured(),
  model: process.env.GROQ_MODEL || ENV.GROQ_MODEL || 'qwen/qwen3.8-27b'
});

// Safe startup log - NEVER logs the secret value
console.log(`[AI Groq Client] GROQ_API_KEY configured: ${isGroqConfigured()}`);

let clientInstance = null;

export const getGroqClient = () => {
  if (!isGroqConfigured()) {
    throw new Error('Groq API key is missing or not configured.');
  }
  if (!clientInstance) {
    clientInstance = new Groq({ apiKey });
  }
  return clientInstance;
};

export default getGroqClient;
