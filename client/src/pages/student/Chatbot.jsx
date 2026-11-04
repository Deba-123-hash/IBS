import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ArrowRight,
  RotateCcw,
  Zap,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Compass
} from 'lucide-react';

/**
 * Lightweight helper to format LLM markdown text into clean React components
 */
function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Split into paragraphs/lines
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Headers: ### or ##
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-bold text-slate-900 mt-2 text-[13px]">
              {trimmed.replace('### ', '')}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-bold text-slate-900 mt-2.5 text-sm">
              {trimmed.replace('## ', '')}
            </h3>
          );
        }

        // Bullet points: - or *
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-emerald-500 font-bold">•</span>
              <span className="flex-1">{formatInline(itemText)}</span>
            </div>
          );
        }

        // Numbered lists: 1. 2.
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="font-semibold text-emerald-600 min-w-[16px]">{numMatch[1]}.</span>
              <span className="flex-1">{formatInline(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={idx}>{formatInline(line)}</p>;
      })}
    </div>
  );
}

/**
 * Inline formatter for **bold** and `code`
 */
function formatInline(text) {
  if (!text) return '';
  const parts = [];
  let remaining = text;
  let keyIdx = 0;

  // Simple token regex for bold and inline code
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/;

  while (remaining) {
    const match = remaining.match(regex);
    if (!match) {
      parts.push(remaining);
      break;
    }

    const before = remaining.substring(0, match.index);
    if (before) parts.push(before);

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={keyIdx++} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={keyIdx++} className="px-1 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-emerald-800 border border-slate-200">
          {token.slice(1, -1)}
        </code>
      );
    }

    remaining = remaining.substring(match.index + token.length);
  }

  return parts;
}

export default function Chatbot() {
  const { user } = useAuth();
  const userName = user?.firstName || 'User';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const initialGreeting = {
    id: 'msg_welcome',
    role: 'assistant',
    content: isAdmin
      ? `Hello ${userName}! I am your **Campus Operations AI Assistant**, grounded directly in live Neon PostgreSQL database records and powered by Groq LPU inference.

I have real-time visibility into:
- **Campus Complaints & Escalations** (Pending, in-progress, resolved, and urgent SLAs)
- **Facility & Infrastructure Health** (Plumbing, electrical, Wi-Fi, HVAC incident metrics)
- **Hostel Allocation & Occupancy Status**
- **Mess & Dining Menus**
- **Academic Attendance Compliance Overview**

How can I assist you with campus administrative operations today?`
      : `Hello ${userName}! I am your **Campus AI Chatbot**, powered by high-speed Groq LPU inference.

I am connected directly to your institutional records in **CAMPUS OS**:
- **Academic Attendance** (Real-time percentage, subject breakdown, and shortage alerts)
- **Hostel & Room Allocation** (Hostel name, block, and room number)
- **Gate Passes & Outings** (Application, live approval status, and QR checks)
- **Hostel Maintenance & Grievances** (Plumbing, electrical, Wi-Fi ticket tracking)
- **Fee Ledgers & Financial Clearance**
- **Dining Timings & Daily Mess Menu**

How can I assist you with your campus life today?`,
    suggestedAction: null,
    actionDetails: null
  };

  const [messages, setMessages] = useState([initialGreeting]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Checking records...');
  const messagesEndRef = useRef(null);

  const suggestedPrompts = isAdmin
    ? [
        'How many complaints are pending?',
        'How many complaints are overdue?',
        'Which department has the most complaints?',
        'Give me a summary of today\'s campus issues',
        'What is today\'s mess menu?'
      ]
    : [
        'What is my attendance?',
        'Which subject has my lowest attendance?',
        'What is my room number?',
        'Do I have any complaints?',
        'What is today\'s mess menu?'
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryOverride) => {
    const textToSend = (queryOverride || input).trim();
    if (!textToSend || loading) return;

    const lowerQuery = textToSend.toLowerCase();
    if (lowerQuery.includes('attendance') || lowerQuery.includes('lowest') || lowerQuery.includes('missed') || lowerQuery.includes('percentage')) {
      setLoadingStatus('Analyzing your attendance...');
      setTimeout(() => {
        setLoadingStatus('Checking your academic records...');
      }, 450);
    } else if (lowerQuery.includes('room') || lowerQuery.includes('hostel')) {
      setLoadingStatus('Checking your room & hostel records...');
    } else if (lowerQuery.includes('complaint')) {
      setLoadingStatus('Querying active campus maintenance tickets...');
    } else if (lowerQuery.includes('mess') || lowerQuery.includes('food') || lowerQuery.includes('dinner')) {
      setLoadingStatus('Retrieving live mess menu schedule...');
    } else {
      setLoadingStatus('Consulting CAMPUS OS knowledge base...');
    }

    const userMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      // Send conversation history to Groq Chatbot backend
      const payloadMessages = newHistory.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const res = await apiClient.post('/ai/chat', {
        messages: payloadMessages
      });

      const responseData = res?.data || res || {};
      const aiReply = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: responseData.response || responseData.message || 'Response received.',
        suggestedAction: responseData.suggestedAction,
        actionDetails: responseData.actionDetails,
        model: responseData.model || 'qwen/qwen3.8-27b'
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error('[Chatbot Error]:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          role: 'assistant',
          content: 'I encountered a temporary connection issue. Please ensure the backend server is running and try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([initialGreeting]);
    setInput('');
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* 1. Header Bar with Groq Inference Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-soft">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Campus AI Chatbot</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Groq LPU Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Domain-tuned assistant for campus policies, curfews, mess, and ticketing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
            qwen/qwen3.8-27b
          </span>
          <button
            onClick={handleResetChat}
            title="Reset Conversation"
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Suggested Quick Prompt Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mr-1">
          <Sparkles className="h-3 w-3 text-amber-500" />
          Suggestions:
        </span>
        {suggestedPrompts.map((promptText, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(promptText)}
            disabled={loading}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/60 hover:text-emerald-900 transition shadow-2xs disabled:opacity-50"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* 3. Main Chat Conversation Container */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-soft flex flex-col h-[560px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gradient-to-b from-slate-50/60 to-white">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-xs ${
                    isUser
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  ) : (
                    <MarkdownRenderer content={m.content} />
                  )}

                  {/* Contextual Action Deep Link Card */}
                  {m.actionDetails && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                        <Compass className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Recommended Next Step:</span>
                      </div>
                      <Link
                        to={m.actionDetails.actionUrl}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-2xs transition"
                      >
                        <span>{m.actionDetails.actionLabel}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}

                  {/* Model Tag */}
                  {!isUser && m.model && (
                    <div className="mt-2 text-[10px] text-slate-400 font-mono text-right">
                      {m.model}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Progressive Real-time Thinking Indicator */}
          {loading && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-white border border-emerald-100 p-3 text-xs text-slate-700 rounded-tl-none flex items-center gap-2.5 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="font-semibold text-emerald-800">{loadingStatus}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 4. Input Form */}
        <div className="p-3 sm:p-4 border-t border-slate-200/80 bg-white">
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
              placeholder="Ask about gate passes, curfews, mess menu, bonafide certificates, attendance..."
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-soft hover:bg-emerald-700 disabled:opacity-40 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-slate-400">
            <span>Press Enter to send</span>
            <span className="flex items-center gap-1 font-mono">
              <Zap className="h-3 w-3 text-amber-500" /> Powered by Groq LPUs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
