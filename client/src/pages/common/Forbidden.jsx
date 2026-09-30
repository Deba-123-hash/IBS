import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Forbidden() {
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-6 shadow-sm">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-200 mb-2">
        Error 403 • Access Denied
      </span>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Restricted Campus Area
      </h1>

      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        Your active role (<span className="font-semibold text-slate-800">{user?.role || 'ANONYMOUS'}</span>) does not possess the institutional clearance required to access this portal or resource.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </button>

        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition"
        >
          <Home className="h-4 w-4" />
          <span>Return to Safety</span>
        </Link>
      </div>
    </div>
  );
}
