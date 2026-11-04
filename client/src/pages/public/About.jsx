import React from 'react';
import { ShieldCheck, Database, Cpu, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import BRAND from '../../config/brand.js';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">About {BRAND.name}</h1>
        <p className="text-xs text-slate-500 mt-1">Unified Campus Operations Platform (Enterprise Edition)</p>
      </div>

      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-4 text-xs leading-relaxed text-slate-600">
        <h2 className="text-base font-bold text-slate-900">Why Modern Campus Operations Need A Unified OS</h2>
        <p>
          On modern college campuses, students face severe friction: paper complaint notebooks left on warden desks, missing lecture notices on physical boards, and hours walking between accounts, wardens, and security gates to obtain ink stamp authorizations.
        </p>
        <p>
          <strong>{BRAND.name}</strong> solves this by centralizing all campus operations into an event-driven system with sub-second gate validation, transparent grievance SLAs, automated AI trade dispatch, and verified audit logs.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-xs">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Database className="h-4 w-4 text-emerald-600" />
            <span>Neon Serverless PostgreSQL</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Powered by Prisma ORM and hosted on Neon serverless PostgreSQL with connection pooling and high concurrency.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Cpu className="h-4 w-4 text-emerald-600" />
            <span>Groq LPU Grounded AI</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Ultra-fast inference answering natural language queries grounded on live PostgreSQL domain records.
          </p>
        </div>
      </div>
    </div>
  );
}
