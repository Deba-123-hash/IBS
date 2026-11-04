import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  BellRing,
  Plus,
  AlertTriangle,
  Calendar,
  FileText,
  Download,
  X,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notices() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [readIds, setReadIds] = useState(new Set());
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // New notice form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('ACADEMIC');
  const [isUrgent, setIsUrgent] = useState(false);
  const [targetScope, setTargetScope] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);

  const defaultNotices = [
    {
      id: 'not_1',
      title: 'Mid-Semester Examination Schedule - Autumn 2026',
      content: 'The official schedule for 3rd, 5th, and 7th semester mid-term exams is now published. Examination halls open at 09:30 AM. Identity cards and admit slips are strictly mandatory.',
      type: 'ACADEMIC',
      isUrgent: true,
      actionRequired: true,
      actionLabel: 'View Exam Timetable',
      actionPath: '/student/timetable',
      createdAt: '2026-10-01T03:00:00Z',
      postedBy: 'Controller of Examinations'
    },
    {
      id: 'not_2',
      title: 'Hostel Block B Pressure Water Manifold Maintenance',
      content: 'Plumbing contractor is replacing the western water riser pipe between 11:00 AM and 02:00 PM today. Water supply will be temporarily routed through overhead buffer tanks.',
      type: 'HOSTEL',
      isUrgent: false,
      actionRequired: false,
      actionLabel: 'Track Grievance',
      actionPath: '/student/complaints',
      createdAt: '2026-09-30T14:30:00Z',
      postedBy: 'Hostel Maintenance Office'
    },
    {
      id: 'not_3',
      title: 'Diwali Semester Break Gate Pass & Leave Advisory',
      content: 'Students planning home vacation during the upcoming Diwali holidays must submit their leave applications and gate passes on CAMPUS OS before October 15th for advance Warden approval.',
      type: 'ADMINISTRATIVE',
      isUrgent: false,
      actionRequired: true,
      actionLabel: 'Apply Leave Request',
      actionPath: '/student/leave',
      createdAt: '2026-09-29T10:15:00Z',
      postedBy: 'Dean of Student Welfare'
    },
    {
      id: 'not_4',
      title: 'ACM Student Chapter Hackathon 2026 Registration Open',
      content: 'Registrations are open for the BPUT Inter-College Hackathon 2026. Teams of 2 to 4 students can register their projects across AI, Web3, and Smart Campus Operations.',
      type: 'EVENT',
      isUrgent: false,
      actionRequired: false,
      createdAt: '2026-09-28T09:00:00Z',
      postedBy: 'CSE Department Coordinator'
    }
  ];

  const loadNotices = async () => {
    try {
      const res = await apiClient.get('/notices');
      const list = res.data?.data?.notices || res.data?.notices || res.notices || (Array.isArray(res.data) ? res.data : []);
      if (list.length > 0) {
        setNotices(list);
      } else {
        setNotices(defaultNotices);
      }
    } catch (err) {
      console.warn('Notice fetch fallback', err);
      setNotices(defaultNotices);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handleMarkAsRead = (id) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const handleMarkAllRead = () => {
    const allIds = notices.map((n) => n.id);
    setReadIds(new Set(allIds));
    toast.success('All campus circulars marked as read', 'Notifications Cleared');
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
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
      toast.success('Official circular published across campus channels', 'Broadcast Active');
    } catch (err) {
      toast.error('Failed to broadcast notice', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNotices = notices.filter((n) => {
    if (filterType === 'UNREAD') return !readIds.has(n.id);
    if (filterType === 'ACTION_REQUIRED') return n.actionRequired;
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  const canBroadcast = user?.role === 'ADMIN' || user?.role === 'FACULTY' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Campus Communications
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Campus Circulars & Notifications
          </h1>
          <p className="text-xs text-slate-500">
            Real-time administrative notices, academic schedules, and hostel advisories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition"
          >
            Mark All as Read
          </button>

          {canBroadcast && (
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-soft transition hover-lift"
            >
              <Plus className="h-4 w-4" />
              <span>Broadcast Notice</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { key: 'ALL', label: 'All Notices' },
          { key: 'UNREAD', label: 'Unread' },
          { key: 'ACTION_REQUIRED', label: 'Action Required' },
          { key: 'ACADEMIC', label: 'Academics' },
          { key: 'HOSTEL', label: 'Hostel' }
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterType(f.key)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
              filterType === f.key
                ? 'bg-emerald-600 text-white shadow-soft'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notices Stream */}
      <div className="space-y-3.5">
        {filteredNotices.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">You're caught up!</h3>
            <p>No unread notifications or action items found in this filter.</p>
          </div>
        ) : (
          filteredNotices.map((n) => {
            const isRead = readIds.has(n.id);
            const isUrgent = n.isUrgent;

            return (
              <div
                key={n.id}
                onClick={() => handleMarkAsRead(n.id)}
                className={`group rounded-3xl border p-5 transition-all hover-lift ${
                  !isRead
                    ? 'border-emerald-200/90 bg-emerald-50/20 shadow-xs'
                    : 'border-slate-200/80 bg-white shadow-2xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      isUrgent
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isUrgent ? <AlertTriangle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {!isRead && (
                          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        )}
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {n.type}
                        </span>
                        {isUrgent && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-full">
                            URGENT ADVISORY
                          </span>
                        )}
                        {n.actionRequired && (
                          <span className="text-[10px] font-bold text-red-800 bg-red-100/70 border border-red-200 px-2 py-0.5 rounded-full">
                            ACTION REQUIRED
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        {n.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {n.content}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-2">
                        <span>Issued by <strong>{n.postedBy || 'Campus Administration'}</strong></span>
                        <span>•</span>
                        <span>Published 1 day ago</span>
                      </div>
                    </div>
                  </div>

                  {n.actionPath && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(n.id);
                        navigate(n.actionPath);
                      }}
                      className="shrink-0 flex items-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-2xs hover-lift"
                    >
                      <span>{n.actionLabel || 'View Record'}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Broadcast Modal for Admin / Faculty */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowBroadcastModal(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
          />

          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl z-10 animate-slide-down space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Broadcast Campus Circular</h3>
                <p className="text-xs text-slate-500">Official dispatch across student & hostel portals</p>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Circular Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for Autumn Mid-Term Exams..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category Scope</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="ACADEMIC">Academic</option>
                    <option value="HOSTEL">Hostel & Living</option>
                    <option value="EXAMINATION">Examinations</option>
                    <option value="EVENT">Cultural / Tech Event</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Audience</label>
                  <select
                    value={targetScope}
                    onChange={(e) => setTargetScope(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="ALL">Entire Campus</option>
                    <option value="BTECH_CSE">B.Tech CSE Students</option>
                    <option value="HOSTEL_B">Hostel Block B Residents</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Body Content</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detail instructions, dates, timings, venues, and administrative authority..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgentNotice"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-600"
                />
                <label htmlFor="urgentNotice" className="text-xs font-semibold text-slate-700">
                  Mark as High Priority / Urgent Alert
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold transition shadow-soft hover-lift"
                >
                  {submitting ? 'Broadcasting...' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
