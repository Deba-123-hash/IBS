import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Home, LayoutDashboard, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

function getRoleDashboard(role) {
  switch (role) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return '/admin/dashboard';
    case 'WARDEN':
      return '/warden/dashboard';
    case 'MAINTENANCE':
      return '/maintenance/dashboard';
    case 'SECURITY':
      return '/security/dashboard';
    case 'ACCOUNTANT':
      return '/accountant/dashboard';
    case 'ACCOUNTS':
      return '/accounts/dashboard';
    case 'FACULTY':
      return '/faculty/dashboard';
    default:
      return '/student/dashboard';
  }
}

export default function NotFound() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100/70 text-emerald-700 mb-6 shadow-sm border border-emerald-200">
        <Compass className="h-10 w-10 animate-pulse-subtle" />
      </div>

      <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200/80 mb-3">
        Error 404 • Destination Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
        Lost in Campus Digital Space
      </h1>

      <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
        The campus URL or operational module you navigated to cannot be located. The link may have expired, been relocated, or typed with a typographical error.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs hover-lift focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </button>

        <Link
          to="/"
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs hover-lift focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <Home className="h-4 w-4" />
          <span>Campus Home</span>
        </Link>

        {isAuthenticated ? (
          <Link
            to={getRoleDashboard(user?.role)}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-soft hover-lift focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Open My Dashboard</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-soft hover-lift focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In to Portal</span>
          </Link>
        )}
      </div>
    </div>
  );
}
