import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env.js';

class AIService {
  constructor() {
    this.provider = ENV.AI_PROVIDER || 'gemini';
    this.apiKey = ENV.AI_API_KEY || '';
    this.geminiClient = null;

    if (this.apiKey && this.provider === 'gemini') {
      try {
        this.geminiClient = new GoogleGenerativeAI(this.apiKey);
      } catch (err) {
        console.warn('[AI Service] Gemini client init warning:', err.message);
      }
    }
  }

  async generateJsonCompletion(prompt, systemInstruction = '') {
    if (!this.apiKey) {
      console.warn('[AI Service] No AI_API_KEY supplied. Falling back to built-in heuristic engine.');
      return null;
    }

    try {
      if (this.provider === 'gemini' && this.geminiClient) {
        const model = this.geminiClient.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
          systemInstruction
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(text);
      }

      // OpenAI or compatible endpoint fallback
      if (this.provider === 'openai') {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo-0125',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemInstruction || 'Return valid JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        );

        const content = response.data.choices[0].message.content;
        return JSON.parse(content);
      }
    } catch (err) {
      console.error('[AI Service Error]:', err.message);
      return null; // Triggers caller fallback
    }

    return null;
  }

  async generateTextCompletion(prompt, systemInstruction = '') {
    if (!this.apiKey) {
      return null;
    }

    try {
      if (this.provider === 'gemini' && this.geminiClient) {
        const model = this.geminiClient.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction
        });
        const result = await model.generateContent(prompt);
        return result.response.text();
      }
    } catch (err) {
      console.error('[AI Service Text Error]:', err.message);
      return null;
    }

    return null;
  }
}

export default new AIService();
