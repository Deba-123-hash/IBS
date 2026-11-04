import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Search,
  LayoutDashboard,
  CalendarCheck2,
  CalendarDays,
  Wrench,
  QrCode,
  FileText,
  CreditCard,
  Building2,
  UtensilsCrossed,
  BellRing,
  Bot,
  HelpCircle,
  Activity,
  Users,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  Command,
  X
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const allItems = [
    // Student Actions & Navigation
    { id: 'dash', label: 'Go to Student Dashboard', category: 'Navigation', path: '/student/dashboard', icon: LayoutDashboard, role: 'ALL' },
    { id: 'att', label: 'Check Attendance & Roll Record', category: 'Academics', path: '/student/attendance', icon: CalendarCheck2, role: 'ALL' },
    { id: 'tt', label: 'View Academic Timetable', category: 'Academics', path: '/student/timetable', icon: CalendarDays, role: 'ALL' },
    { id: 'comp', label: 'Hostel Maintenance & Grievances', category: 'Operations', path: '/student/complaints', icon: Wrench, role: 'ALL' },
    { id: 'gp', label: 'Apply Gate Pass (QR Code)', category: 'Passes', path: '/student/gate-passes', icon: QrCode, role: 'ALL' },
    { id: 'cert', label: 'Apply Bonafide / NOC Certificate', category: 'Services', path: '/student/certificates', icon: FileText, role: 'ALL' },
    { id: 'fees', label: 'Check Fee Ledgers & Payments', category: 'Finance', path: '/student/fees', icon: CreditCard, role: 'ALL' },
    { id: 'hostel', label: 'Hostel Living Unit & Assets', category: 'Hostel', path: '/student/hostel', icon: Building2, role: 'ALL' },
    { id: 'mess', label: 'Weekly Mess Menu & Dietary Feedback', category: 'Dining', path: '/student/mess', icon: UtensilsCrossed, role: 'ALL' },
    { id: 'notices', label: 'Official Campus Notices & Circulars', category: 'Communications', path: '/student/notices', icon: BellRing, role: 'ALL' },
    { id: 'ai', label: 'Campus AI Chatbot (Groq)', category: 'AI Intelligence', path: '/student/chatbot', icon: Bot, role: 'ALL' },
    { id: 'help', label: 'No-Phone Help Desk Kiosk', category: 'Terminal', path: '/help-desk', icon: HelpCircle, role: 'ALL' },

    // Staff & Workstation Quick Jump
    { id: 'warden-dash', label: 'Hostel Warden Operations', category: 'Staff Workstation', path: '/warden/dashboard', icon: Building2, role: 'WARDEN' },
    { id: 'maint-dash', label: 'Maintenance Work Orders', category: 'Staff Workstation', path: '/maintenance/dashboard', icon: Wrench, role: 'MAINTENANCE' },
    { id: 'sec-dash', label: 'Security & Gate Entry Control', category: 'Staff Workstation', path: '/security/gate-entry', icon: ShieldCheck, role: 'SECURITY' },
    { id: 'acc-dash', label: 'Cashier & Fee Counter', category: 'Staff Workstation', path: '/accountant/dashboard', icon: CreditCard, role: 'ACCOUNTANT' },
    { id: 'fin-dash', label: 'Finance & Reconciliation', category: 'Staff Workstation', path: '/accounts/dashboard', icon: Activity, role: 'ACCOUNTS' },
    { id: 'fac-dash', label: 'Faculty Academic Portal', category: 'Staff Workstation', path: '/faculty/dashboard', icon: CalendarCheck2, role: 'FACULTY' },

    // Admin & Governance Navigation
    { id: 'admin-dash', label: 'Admin Command Center Overview', category: 'Admin Governance', path: '/admin/dashboard', icon: Activity, role: 'ADMIN' },
    { id: 'admin-users', label: 'Campus User Directory (Students & Staff)', category: 'Admin Governance', path: '/admin/users', icon: Users, role: 'ADMIN' },
    { id: 'admin-requests', label: 'Operations Request Pipeline', category: 'Admin Governance', path: '/admin/requests', icon: Wrench, role: 'ADMIN' },
    { id: 'admin-approvals', label: 'Gate & Leave Approval Queue', category: 'Admin Governance', path: '/admin/approvals', icon: CheckCircle, role: 'ADMIN' },
    { id: 'admin-analytics', label: 'Campus Analytics & SLA Telemetry', category: 'Admin Governance', path: '/admin/analytics', icon: Activity, role: 'ADMIN' },
    { id: 'admin-comm', label: 'Publish Broadcast Circular', category: 'Admin Governance', path: '/admin/communications', icon: BellRing, role: 'ADMIN' }
  ];

  const filteredItems = allItems.filter((item) => {
    const matchesRole = item.role === 'ALL' || item.role === user?.role || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    if (!matchesRole) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside command palette
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        navigate(selected.path);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
      />

      {/* Dialog container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Campus Command Palette"
        className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-10"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 bg-slate-50/50">
          <Search className="h-4 w-4 text-emerald-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to feature (e.g. attendance, gate pass, fees)..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none"
          />
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-2xs">
              ESC
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded p-1 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching campus module found for "<span className="font-semibold">{query}</span>"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="truncate font-semibold">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-slate-400">
                    {isSelected && (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        Jump <ArrowRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2 text-[10px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[9px]">↑</kbd>{' '}
              <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[9px]">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[9px]">↵</kbd> to select
            </span>
          </div>
          <span className="font-medium text-emerald-700">CAMPUS OS Command Engine</span>
        </div>
      </div>
    </div>
  );
}
