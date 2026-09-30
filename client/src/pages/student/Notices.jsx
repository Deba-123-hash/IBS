import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { BellRing, Plus, AlertTriangle, Calendar, FileText, Download, X } from 'lucide-react';

export default function Notices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // New notice form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('GENERAL');
  const [isUrgent, setIsUrgent] = useState(false);
  const [targetScope, setTargetScope] = useState('ALL');

  const loadNotices = async () => {
    try {
      const res = await apiClient.get('/notices');
      setNotices(res.data.notices || []);
    } catch (err) {
      console.warn('Notice fetch fallback', err);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/notices', {
        title,
        content,
        type,
        isUrgent,
        targetScope
      });
      setShowBroadcastModal(false);
      setTitle('');
      setContent('');
      await loadNotices();
    } catch (err) {
      alert('Broadcast failed');
    }
  };

  const filtered = filterType === 'ALL'
    ? notices
    : notices.filter(n => n.type === filterType);

  const canBroadcast = user?.role === 'ADMIN' || user?.role === 'FACULTY' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campus Circulars & Notices</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official broadcasts, academic circulars, exam dates, and hostel directives
          </p>
        </div>

        {canBroadcast && (
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Broadcast New Notice</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['ALL', 'EXAMINATION', 'HOSTEL', 'GENERAL', 'ACADEMIC'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filterType === t
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-5 bg-white shadow-xs transition hover:shadow-sm ${
              item.isUrgent ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {item.type}
                </span>
                {item.isUrgent && (
                  <span className="flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-bold">
                    <AlertTriangle className="h-3 w-3" /> URGENT
                  </span>
                )}
                <span className="text-[11px] text-slate-400">
                  Target: {item.targetScope}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {item.title}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mt-2 whitespace-pre-line">
              {item.content}
            </p>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Author: <strong>{item.author}</strong></span>
              {item.attachmentUrl && (
                <a
                  href={item.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Circular Slip</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900">Broadcast Campus Circular</h2>
              <button onClick={() => setShowBroadcastModal(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autumn Semester Mid-Term Examination Dates"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                  >
                    <option value="GENERAL">General Notice</option>
                    <option value="ACADEMIC">Academic Instruction</option>
                    <option value="EXAMINATION">Examination</option>
                    <option value="HOSTEL">Hostel Affairs</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={targetScope}
                    onChange={(e) => setTargetScope(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                  >
                    <option value="ALL">All Students & Staff</option>
                    <option value="HOSTEL_RESIDENTS">Hostel Residents Only</option>
                    <option value="CSE_BATCH">CSE Department</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Content</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the official circular text..."
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgentNotice"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="urgentNotice" className="font-semibold text-slate-800">
                  Mark as High Urgency (Pushes alert notification)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  Publish & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
