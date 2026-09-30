import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, QrCode, Wrench, ShieldCheck, Sparkles, Building2, UtensilsCrossed, CalendarCheck2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { t } from '../../i18n/index.js';

export default function Home() {
  const { loginAsDemoRole } = useAuth();

  return (
    <div className="space-y-16 py-8 md:py-16">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center px-4 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Fretbox Campus OS • Phase 1 Architecture Foundation</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
          CAMPUS LIFE, <span className="text-blue-600">DEBUGGED</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl font-medium text-slate-600 max-w-2xl mx-auto leading-snug">
          Attendance, Mess, Hostel, Repeat: <br className="hidden sm:inline" />
          <span className="text-slate-900 font-bold">Campus Life, Debugged.</span>
        </p>

        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          One platform for everyday campus operations. Replaces fragmented registers, WhatsApp spam, manual complaint diaries, and office queues.
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/login"
            id="home-login-btn"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition"
          >
            <span>Login</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            id="home-demo-btn"
            onClick={() => loginAsDemoRole('STUDENT')}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-xs hover:bg-slate-50 hover:border-slate-400 transition"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Explore Demo</span>
          </button>

          <button
            onClick={() => loginAsDemoRole('ADMIN')}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Command Center</span>
          </button>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Attendance & Timetables</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time roll records, 75% examination eligibility warning threshold, and live schedule relocations.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Dynamic QR Gate Passes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Paperless student outings, warden digital approvals, and 2-second camera QR validation at security gates.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Wrench className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">AI-Triaged Grievances</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Zero lost complaint diaries. Automatic trade routing (plumbing, electrical, wi-fi) with SLA accountability.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Dining & Mess Feedback</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Live breakfast, lunch, and dinner menus with quantitative ratings on hygiene, portion, and food taste.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Sparkles className="h-5 w-5 text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Campus AI Assistant</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              24/7 conversational guidance for bonafide certificates, examination dates, library timings, and circulars.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No-Phone Help Desk</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Digital equity for students without smartphones via verified staff proxy terminal and printed barcode slips.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
