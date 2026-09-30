import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client.js';
import { Bot, Send, Sparkles, User, ArrowRight, CornerDownLeft } from 'lucide-react';

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      role: 'assistant',
      text: 'Hello Aarav! I am your 24/7 Campus AI Operations Assistant. Ask me anything about institutional certificates, hostel curfew, mess timings, fee deadlines, or reporting facility repairs.',
      suggestedAction: null
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    'How do I apply for a Bonafide Certificate?',
    'What is today\'s mess lunch & dinner timing?',
    'How do I get a night outing gate pass?',
    'Where do I report a broken bathroom pipe?',
    'What happens if my attendance is below 75%?'
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/chat', { message: textToSend });
      const aiReply = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: res.data.response,
        suggestedAction: res.data.suggestedAction
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          role: 'assistant',
          text: 'I encountered an error connecting to campus intelligence. Please make sure the backend server is running.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campus AI Assistant</h1>
            <p className="text-xs text-slate-500">24/7 Context-Aware Conversational Assistant for Campus Operations</p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-blue-400 hover:bg-blue-50 transition shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-blue-600 text-white shadow-xs'
                }`}
              >
                {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {m.suggestedAction && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                    <Link
                      to={m.suggestedAction}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700 transition"
                    >
                      <span>Open Form / Section</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-xs text-slate-500 rounded-tl-none flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>Consulting campus knowledge base...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about gate passes, certificates, mess timings, attendance..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs hover:bg-blue-700 disabled:opacity-40 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
