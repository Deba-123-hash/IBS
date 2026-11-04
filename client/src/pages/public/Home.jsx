import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  QrCode,
  Wrench,
  ShieldCheck,
  Sparkles,
  Building2,
  UtensilsCrossed,
  CalendarCheck2,
  Bot,
  Activity,
  CheckCircle2,
  Layers,
  Cpu,
  GraduationCap,
  Users,
  Clock,
  Compass,
  FileCheck2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import BRAND from '../../config/brand.js';
import Campus3DScene from '../../components/3d/Campus3DScene.jsx';

export default function Home() {
  const { loginAsDemoRole } = useAuth();
  const [selectedZone, setSelectedZone] = useState(null);

  return (
    <div className="space-y-20 py-8 md:py-16">
      {/* 1. Hero Section with 3D Operations Twin Integration */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>CAMPUS OS • Smart Campus & Hostel Management System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
            Intelligent, Fast, Unified <br />
            <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Campus Operations
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {BRAND.description} Eliminates fragmented paper registers, manual office queues, and communication delays with real-time digital governance.
          </p>

          {/* Primary Call to Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/login"
              id="home-login-btn"
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-soft"
            >
              <span>Launch CAMPUS OS</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              id="home-demo-btn"
              onClick={() => loginAsDemoRole('STUDENT')}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 shadow-xs hover:bg-slate-50 hover:border-emerald-300"
            >
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>1-Click Student Demo</span>
            </button>

            <button
              onClick={() => loginAsDemoRole('ADMIN')}
              className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-bold text-emerald-900 hover:bg-emerald-100/80 transition hover-lift"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Admin Command Center</span>
            </button>
          </div>
        </div>

        {/* 2. Interactive 3D Digital Twin Visualization */}
        <div className="pt-4">
          <Campus3DScene onSelectZone={setSelectedZone} />
        </div>
      </section>

      {/* 3. Verified Operations Metrics Banner */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs">
          <div className="space-y-1">
            <span className="text-3xl font-black text-slate-900">88%</span>
            <span className="text-xs font-semibold text-slate-500 block">Avg Attendance Rate</span>
            <span className="text-[10px] text-emerald-600 font-bold">Biometric Tracked</span>
          </div>
          <div className="space-y-1 border-l border-slate-100 pl-4">
            <span className="text-3xl font-black text-slate-900">&lt; 3.8h</span>
            <span className="text-xs font-semibold text-slate-500 block">Mean Ticket Resolution</span>
            <span className="text-[10px] text-emerald-600 font-bold">AI SLA Automated</span>
          </div>
          <div className="space-y-1 border-l border-slate-100 pl-4">
            <span className="text-3xl font-black text-slate-900">100%</span>
            <span className="text-xs font-semibold text-slate-500 block">Cryptographic QR Pass</span>
            <span className="text-[10px] text-emerald-600 font-bold">Turnstile Clearance</span>
          </div>
          <div className="space-y-1 border-l border-slate-100 pl-4">
            <span className="text-3xl font-black text-slate-900">8 Roles</span>
            <span className="text-xs font-semibold text-slate-500 block">Unified Governance</span>
            <span className="text-[10px] text-emerald-600 font-bold">Full RBAC Enforced</span>
          </div>
        </div>
      </section>

      {/* 4. Core Feature Pillars */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for High-Stakes Operations
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-2.5 hover-lift transition">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-2xs">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Biometric Attendance & Timetables</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time biometric roll synchronization, semester threshold telemetry, safe miss simulations, and live room shift notifications.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-2.5 hover-lift transition">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-2xs">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Cryptographic QR Gate Passes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Digital hostel outing requests, warden authorization workflows, and barcode verification at security turnstiles.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-2.5 hover-lift transition">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-2xs">
              <Wrench className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">AI-Classified Grievances & SLA</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Multi-step maintenance reporting with Groq LPU trade classification, priority triage, and technician mobile assignment.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-2.5 hover-lift transition">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-2xs">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Hostel Mess Menu & Dietary Feedback</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Weekly rotational meals with calorie breakdowns and interactive 5-star ratings across taste, freshness, hygiene, and portions.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-2.5 hover-lift transition">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 shadow-2xs">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">CAMPUS OS AI Assistant (Groq LPU)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sub-second conversational intelligence grounded on live Neon PostgreSQL records, answering queries on curfews, fees, and next classes.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-2.5 hover-lift transition">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-2xs">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Executive Command Center</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Institutional governance with real-time KPI counters, SLA breach alerts, recurring complaint clustering, and audit trails.
            </p>
          </div>
        </div>
      </section>

      {/* 5. End-to-End Workflow Flowchart */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 p-8 md:p-10 text-slate-900 shadow-xs space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Operational Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How Requests Flow Across Stakeholders
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              From student mobile submission to multi-tier approval and final on-site resolution.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
              <span className="text-emerald-600 font-mono font-bold text-xs">Step 01</span>
              <h4 className="font-bold text-sm text-slate-900">Student Request</h4>
              <p className="text-xs text-slate-600">
                Lodge grievance, apply for gate pass, or request academic document in seconds.
              </p>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
              <span className="text-emerald-600 font-mono font-bold text-xs">Step 02</span>
              <h4 className="font-bold text-sm text-slate-900">AI Classification & Triage</h4>
              <p className="text-xs text-slate-600">
                Groq LPU classifies trade, assigns priority, and maps directly to SLA policy.
              </p>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
              <span className="text-emerald-600 font-mono font-bold text-xs">Step 03</span>
              <h4 className="font-bold text-sm text-slate-900">Staff Workstation Action</h4>
              <p className="text-xs text-slate-600">
                Warden approves gate pass; technician claims ticket; security scans QR token.
              </p>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
              <span className="text-emerald-600 font-mono font-bold text-xs">Step 04</span>
              <h4 className="font-bold text-sm text-slate-900">Verified Resolution & Audit</h4>
              <p className="text-xs text-slate-600">
                Instant notification dispatched; immutable audit log recorded on PostgreSQL.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
