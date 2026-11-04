import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  CalendarCheck2,
  CalendarDays,
  QrCode,
  Wrench,
  UtensilsCrossed,
  ArrowRight,
  Clock,
  Sparkles,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  FileText,
  CreditCard,
  UserCheck,
  Building2,
  ChevronRight,
  ShieldCheck,
  BellRing,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

import { useGsapCounter } from '../../hooks/useGsapCounter.js';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiClient.get('/students/dashboard-summary');
        setSummary(res.data?.data || res.data || res);
      } catch (err) {
        console.warn('Dashboard fetch fallback', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const animAttendance = useGsapCounter(Math.round(summary?.attendance?.percentage || 85), 1.2, !loading);
  const animClasses = useGsapCounter(4, 1.0, !loading);
  const animComplaints = useGsapCounter(summary?.openComplaintsCount ?? 1, 1.0, !loading);

  const kpis = [
    {
      id: 'att',
      title: 'Attendance',
      value: `${animAttendance}%`,
      subtitle: `${summary?.attendance?.attended || 108}/${summary?.attendance?.totalClasses || 128} classes attended`,
      status: (summary?.attendance?.percentage || 84.5) >= 75 ? 'GOOD' : 'WARNING',
      statusText: (summary?.attendance?.percentage || 84.5) >= 75 ? 'Above 75%' : 'Shortage Risk',
      icon: CalendarCheck2,
      iconBg: 'bg-emerald-50 text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      path: '/student/attendance'
    },
    {
      id: 'classes',
      title: "Today's Schedule",
      value: '4 Classes',
      subtitle: '2 Completed • 2 Remaining',
      status: 'ON_TRACK',
      statusText: 'In Session',
      icon: CalendarDays,
      iconBg: 'bg-teal-50 text-teal-600',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
      path: '/student/timetable'
    },
    {
      id: 'comp',
      title: 'Open Complaints',
      value: `${summary?.openComplaintsCount ?? 1} Active`,
      subtitle: summary?.latestComplaint?.title || 'Bathroom pipe (Technician on site)',
      status: 'IN_PROGRESS',
      statusText: 'Assigned',
      icon: Wrench,
      iconBg: 'bg-amber-50 text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      path: '/student/complaints'
    },
    {
      id: 'passes',
      title: 'Active Gate Pass',
      value: summary?.activeGatePass?.status || 'APPROVED',
      subtitle: 'Valid until 9:00 PM today',
      status: 'ACTIVE',
      statusText: 'QR Ready',
      icon: QrCode,
      iconBg: 'bg-blue-50 text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      path: '/student/gate-passes'
    },
    {
      id: 'fees',
      title: 'Fee Dues',
      value: `₹${summary?.feeStatus?.dueAmount ?? 0}`,
      subtitle: 'Semester dues cleared',
      status: 'PAID',
      statusText: '100% Cleared',
      icon: CreditCard,
      iconBg: 'bg-emerald-50 text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      path: '/student/fees'
    }
  ];

  const quickActions = [
    {
      title: 'Apply Gate Pass',
      desc: 'Instant QR gate exit request',
      icon: QrCode,
      path: '/student/gate-passes',
      highlight: true
    },
    {
      title: 'Report Grievance',
      desc: 'Hostel plumbing, electrical, Wi-Fi',
      icon: Wrench,
      path: '/student/complaints'
    },
    {
      title: 'Request Certificate',
      desc: 'Bonafide, NOC & clear marksheet',
      icon: FileText,
      path: '/student/certificates'
    },
    {
      title: 'Apply Leave',
      desc: 'Academic & medical leave slips',
      icon: UserCheck,
      path: '/student/leave'
    },
    {
      title: 'Campus Dining Menu',
      desc: 'Today lunch/dinner & meal rating',
      icon: UtensilsCrossed,
      path: '/student/mess'
    },
    {
      title: 'Campus Chatbot',
      desc: 'Curfew, mess, gate pass & rules',
      icon: Sparkles,
      path: '/student/chatbot',
      isAi: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Student Campus Command Center Header */}
      <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white p-6 md:p-8 text-slate-900 shadow-xs relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 h-48 w-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-800 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                Semester 5 • Autumn 2026 Active
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-700 shadow-2xs">
                Roll: {user?.rollNumber || '2301105001'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {greeting}, {user?.firstName || 'Aarav'}!
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 font-medium">
              <span>Department: <strong className="text-slate-900">Computer Science & Engineering</strong></span>
              <span>•</span>
              <span>Batch: <strong className="text-slate-900">2023-2027</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                <strong className="text-slate-900">Hostel Block B, Room 304</strong>
              </span>
            </div>
          </div>

          {/* Quick Notification & Perspective Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/student/notices"
              className="flex items-center gap-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover-lift"
            >
              <BellRing className="h-4 w-4 text-emerald-600" />
              <span>3 Campus Notices</span>
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            </Link>

            <Link
              to="/student/chatbot"
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover-lift"
            >
              <Sparkles className="h-4 w-4 text-emerald-100" />
              <span>Campus AI Chatbot</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Interactive KPI Row (Click to navigate, hover lift) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Real-Time Campus Telemetry
          </h2>
          <span className="text-[11px] text-slate-400">Click any card to inspect full records</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.id}
                onClick={() => navigate(kpi.path)}
                className="group relative cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover-lift transition-all hover:border-emerald-300 hover:shadow-soft"
              >
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-medium truncate text-slate-600 group-hover:text-slate-900 transition">
                    {kpi.title}
                  </span>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${kpi.iconBg} transition-transform group-hover:scale-110 shadow-2xs`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition">
                    {kpi.value}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${kpi.badgeBg}`}>
                    {kpi.statusText}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-1.5 truncate">
                  {kpi.subtitle}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 transition">
                  <span>View Details</span>
                  <ArrowRight className="h-3 w-3 -translate-x-1 group-hover:translate-x-0 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Operational Grid: Active Gate Pass + Schedule + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Active QR Gate Pass Card */}
        <div className="rounded-3xl border border-emerald-200/70 bg-gradient-to-b from-emerald-50/50 via-white to-white p-6 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Active Gate Pass
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                DAY OUTING
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 mb-4">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Destination</span>
                <span className="font-semibold text-slate-900">Apollo Health Clinic, Patia</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Exit Window</span>
                <span className="font-semibold text-slate-900">5:00 PM - 9:00 PM Today</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Warden Approval</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
            </div>

            {/* Cryptographic QR Token Card */}
            <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-slate-200 shadow-inner group cursor-pointer"
                 onClick={() => navigate('/student/gate-passes')}>
              <div className="p-2.5 border-2 border-slate-900 rounded-xl bg-white shadow-2xs group-hover:scale-105 transition">
                <svg className="w-28 h-28 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M10 10h30v30h-30z M15 15v20h20v-20z M20 20h10v10h-10z M60 10h30v30h-30z M65 15v20h20v-20z M70 20h10v10h-10z M10 60h30v30h-30z M15 65v20h20v-20z M20 70h10v10h-10z M50 15h5v5h-5z M50 25h5v15h-5z M60 50h15v5h-15z M80 50h10v15h-10z M50 65h10v5h-10z M65 65h15v10h-15z M50 80h10v10h-10z M70 85h20v5h-20z" />
                </svg>
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-2">
                GP-2026-CS2023048-DAY42
              </span>
              <span className="text-[9px] text-emerald-700 font-semibold mt-0.5">
                ● Turnstile Auto-Scanner Ready
              </span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Security Gate 1 & 2</span>
            <Link
              to="/student/gate-passes"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>Full Pass Details</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Schedule & Live Class Indicator */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Academic Timetable
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">Today's Class Schedule</h2>
              </div>
              <Link
                to="/student/timetable"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <span>Weekly Timetable</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Time-sensitive indicator */}
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 p-2.5 text-xs text-emerald-900">
              <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Next class in 24 minutes:</strong> Computer Networks & Security (CS-402) in LH-204 with Dr. Priya Nair
              </span>
            </div>

            <div className="space-y-3">
              {/* Current Class */}
              <div className="flex items-start gap-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 transition">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs">
                  NOW
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded shadow-2xs border border-emerald-200">
                      CS-403
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800">
                      10:00 AM - 11:00 AM
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 truncate">
                    Design & Analysis of Algorithms
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      Lecture Hall 201
                    </span>
                    <span>Faculty: Dr. A. K. Das</span>
                  </div>
                </div>
              </div>

              {/* Next Class */}
              <div className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700 font-bold text-xs">
                  NEXT
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      CS-402
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      11:15 AM - 12:15 PM
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 mt-1 truncate">
                    Computer Networks & Security
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      Lecture Hall 204
                    </span>
                    <span>Faculty: Dr. Priya Nair</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              All lectures conducting on schedule today
            </span>
            <span className="text-slate-400 text-[11px]">CAMPUS OS Academic Calendar</span>
          </div>
        </div>

      </div>

      {/* 4. Quick Action Cards (Section 6: Large but compact action cards) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Rapid Campus Workflows
          </h2>
          <span className="text-[11px] text-slate-400">1-click launch student workflows</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(action.path)}
                className={`group cursor-pointer rounded-2xl border p-4 shadow-2xs hover-lift transition-all ${
                  action.isAi
                    ? 'border-teal-300 bg-gradient-to-b from-teal-50/60 to-white hover:border-teal-400'
                    : 'border-slate-200/80 bg-white hover:border-emerald-300'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 transition-transform group-hover:scale-110 ${
                  action.isAi
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  {action.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {action.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Mess Menu Preview & Campus Notice */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Mess Dining Preview */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Today's Dining Menu</h3>
                <p className="text-[11px] text-slate-500">Hostel Central Mess • Dietary Logistics</p>
              </div>
            </div>
            <Link
              to="/student/mess"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
            >
              Rate Meal ★
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
              <div className="flex items-center justify-between text-slate-700 font-bold mb-1">
                <span>Lunch (12:30 - 2:15 PM)</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded font-semibold">Active</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px] mt-1">
                Paneer Butter Masala, Dal Tadka, Jeera Rice, Phulka Roti, Cucumber Salad, Gulab Jamun.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
              <div className="flex items-center justify-between text-slate-700 font-bold mb-1">
                <span>Dinner (7:45 - 9:45 PM)</span>
                <span className="text-[10px] text-slate-400 font-normal">Upcoming</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px] mt-1">
                Mix Veg Korma, Yellow Dal, Steamed Basmati Rice, Chapati, Fresh Cut Fruits.
              </p>
            </div>
          </div>
        </div>

        {/* Latest Circular */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Latest Campus Circular</h3>
                <p className="text-[11px] text-slate-500">Controller of Examinations • CAMPUS OS</p>
              </div>
            </div>
            <Link
              to="/student/notices"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
            >
              All Circulars
            </Link>
          </div>

          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Mid-Semester Examination Schedule - Autumn 2026</span>
            </div>
            <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
              The official timetable for 3rd, 5th, and 7th semester mid-term exams is now released. Students must carry their physical CAMPUS OS ID Card and valid Admit Card.
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Published Today, 08:30 AM</span>
              <span className="font-semibold text-amber-800">Mandatory Compliance</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
