import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  CalendarCheck2,
  QrCode,
  Wrench,
  UtensilsCrossed,
  ArrowRight,
  Clock,
  Sparkles,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiClient.get('/students/dashboard-summary');
        setSummary(res.data);
      } catch (err) {
        console.warn('Dashboard fetch fallback', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Academic Semester 2026-27 Active
          </span>
          <h1 className="text-2xl font-bold tracking-tight">
            Good day, {user?.firstName || 'Aarav'}!
          </h1>
          <p className="text-xs text-blue-100 mt-1">
            Roll No: {user?.rollNumber || 'CS2023048'} • Hostel Block B, Room 304
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/student/gate-passes"
            className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-sm hover:bg-blue-50 transition"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Apply Gate Pass</span>
          </Link>
          <Link
            to="/student/complaints"
            className="flex items-center gap-1.5 rounded-xl bg-blue-700/60 border border-white/20 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Report Grievance</span>
          </Link>
          <Link
            to="/student/ai-assistant"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-900/60 border border-white/20 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-900 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Ask Campus AI</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Attendance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Overall Attendance</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CalendarCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {summary?.attendance?.percentage || 84.5}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Above 75%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">108 of 128 sessions attended</p>
        </div>

        {/* Active Gate Pass */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Gate Pass Status</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <QrCode className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 truncate">APPROVED</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">QR Code ready for gate exit</p>
        </div>

        {/* Complaints */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Open Grievances</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">1 Ticket</span>
            <span className="text-[11px] font-medium text-amber-600">In Progress</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Bathroom pipe (Technician on site)</p>
        </div>

        {/* Fees */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Fee Balance</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">₹0 Dues</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Semester fee 100% cleared</p>
        </div>
      </div>

      {/* Row 2: Live Gate Pass QR Widget & Today's Schedule */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Active QR Gate Pass Preview Card */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50/70 to-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Active Approved Gate Pass
                </span>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md">
                DAY OUTING
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-1">
              <span className="font-semibold text-slate-900">Destination:</span> Apollo Health Center
            </p>
            <p className="text-xs text-slate-600 mb-4">
              <span className="font-semibold text-slate-900">Window:</span> 5:00 PM - 9:00 PM Today
            </p>

            {/* QR Visualization Box */}
            <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-slate-200 shadow-inner">
              <div className="p-2 border-2 border-slate-900 rounded-lg">
                {/* SVG Simulated high contrast QR Code */}
                <svg className="w-28 h-28" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M10 10h30v30h-30z M15 15v20h20v-20z M20 20h10v10h-10z M60 10h30v30h-30z M65 15v20h20v-20z M70 20h10v10h-10z M10 60h30v30h-30z M15 65v20h20v-20z M20 70h10v10h-10z M50 15h5v5h-5z M50 25h5v15h-5z M60 50h15v5h-15z M80 50h10v15h-10z M50 65h10v5h-10z M65 65h15v10h-15z M50 80h10v10h-10z M70 85h20v5h-20z" />
                </svg>
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-2">
                GP-TOKEN-CS2023048-DAY42
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Security gate scan ready</span>
            <Link
              to="/student/gate-passes"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View Full Pass</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Schedule & Up Next Class */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Today's Class Schedule</h2>
                <p className="text-xs text-slate-500">Tuesday • B.Tech CSE Semester 5</p>
              </div>
              <Link
                to="/student/timetable"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                  NOW
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      CS-403: Design & Analysis of Algorithms
                    </h3>
                    <span className="text-[11px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded shadow-xs">
                      10:00 - 11:00 AM
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> Lecture Hall 201</span>
                    <span>Faculty: Dr. A. K. Das</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-700 font-semibold text-xs">
                  NEXT
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      CS-404: Operating Systems & System Ops
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      11:15 AM - 12:15 PM
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> Lecture Hall 201</span>
                    <span>Faculty: Dr. Rajesh Rao</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              All classes on schedule today
            </span>
          </div>
        </div>

      </div>

      {/* Row 3: Today's Mess Menu & Campus Notices */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Mess Menu Widget */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Today's Dining Menu</h2>
            </div>
            <Link to="/student/mess" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              Rate Food
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="font-semibold text-slate-900">Lunch (12:30 - 2:15 PM)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Paneer Butter Masala, Dal Tadka, Jeera Rice, Phulka Roti, Cucumber Salad, Gulab Jamun.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="font-semibold text-slate-900">Dinner (7:45 - 9:45 PM)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Mix Veg Korma, Rajma Dal, Steamed Basmati Rice, Chapati, Fresh Cut Fruits.
              </p>
            </div>
          </div>
        </div>

        {/* Notices Widget */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Latest Campus Circular</h2>
            </div>
            <Link to="/student/notices" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              View All (3)
            </Link>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs mb-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Mid-Semester Examination Schedule - Autumn 2026</span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2">
              The official schedule for 3rd, 5th, and 7th semester mid-term exams is now published. Examination halls will open at 09:30 AM. Identity cards and admit slips are mandatory.
            </p>
            <div className="mt-2 text-[11px] text-slate-400">
              Posted Today, 08:30 AM by Controller of Examinations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
