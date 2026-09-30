import React from 'react';
import { ShieldCheck, Database, Cpu, Layers } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">About Campus Life, Debugged</h1>
        <p className="text-xs text-slate-500 mt-1">High-Availability Campus Operations Operating System (Campus OS)</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-xs leading-relaxed text-slate-600">
        <h2 className="text-base font-bold text-slate-900">The Tuesday Dilemma: Why Campus Operations Break</h2>
        <p>
          On modern college campuses, students face severe friction: paper complaint notebooks left at warden desks, missing lecture notices covered on physical notice boards, and hours spent walking between accounts, warden, and security gates to obtain physical stamp authorizations.
        </p>
        <p>
          <strong>Campus Life, Debugged</strong> solves this by centralizing all campus operations into an event-driven system with sub-second gate validation, transparent grievance SLAs, automated AI trade dispatch, and verified audit logs.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-xs">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
            <Database className="h-4 w-4 text-blue-600" />
            <span>Neon Serverless PostgreSQL</span>
          </div>
          <p className="text-slate-500">
            Powered by Prisma ORM and hosted externally on Neon serverless PostgreSQL with connection pooling.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
            <Cpu className="h-4 w-4 text-blue-600" />
            <span>AI Subsystem Abstraction</span>
          </div>
          <p className="text-slate-500">
            Supports Google Gemini 1.5 Flash and OpenAI endpoints with deterministic fallback heuristic rules.
          </p>
        </div>
      </div>
    </div>
  );
}
