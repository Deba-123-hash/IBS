import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import CampusWebGLHero from '../../components/common/CampusWebGLHero.jsx';
import {
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Building2,
  Lock,
  Mail,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('student@campus.demo');
  const [password, setPassword] = useState('Password@123');
  const [errorMessage, setErrorMessage] = useState('');
  const { login, loginAsDemoRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect') || searchParams.get('returnUrl');

  const getRedirectPathForRole = (role) => {
    // If a safe internal redirect destination was passed, use it (Open-redirect safe)
    const fromPath = location.state?.from?.pathname || redirectParam;
    if (fromPath && fromPath.startsWith('/') && !fromPath.startsWith('//') && !fromPath.includes(':')) {
      return fromPath;
    }

    switch (role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return '/admin/dashboard';
      case 'WARDEN':
        return '/warden/dashboard';
      case 'MAINTENANCE':
        return '/maintenance/dashboard';
      case 'SECURITY':
        return '/security/gate-verification';
      case 'ACCOUNTANT':
        return '/accountant/dashboard';
      case 'ACCOUNTS':
        return '/accounts/dashboard';
      case 'FACULTY':
        return '/faculty/dashboard';
      default:
        return '/student/dashboard';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const res = await login(email, password);
    if (res.success) {
      navigate(getRedirectPathForRole(res.user.role));
    } else {
      setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickDemo = async (role) => {
    setErrorMessage('');
    const res = await loginAsDemoRole(role);
    if (res.success) {
      navigate(getRedirectPathForRole(role));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-12 bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
        
        {/* Left Hero Panel with 3D Three.js WebGL Interactive Lattice */}
        <div className="md:col-span-6 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-slate-50 border-r border-slate-200/90 p-8 md:p-10 text-slate-900 flex flex-col justify-between relative overflow-hidden hidden md:flex">
          
          {/* Three.js 3D WebGL Canvas Layer */}
          <CampusWebGLHero />

          {/* Foreground Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xl shadow-xs font-mono">
                COS
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight block text-slate-900">CAMPUS OS</span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Smart Campus & Hostel Management System
                </span>
              </div>
            </div>

            <div className="space-y-4 max-w-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                <Cpu className="h-3.5 w-3.5 text-emerald-600" />
                Enterprise Edition 2026
              </span>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900">
                Intelligent, fast, unified operations.
              </h1>

              <p className="text-slate-600 text-xs leading-relaxed">
                Replacing paper registers, fragmented communication, and office queues with a real-time digital operating system for modern campus stakeholders.
              </p>
            </div>

            {/* Architecture Highlights */}
            <div className="mt-8 space-y-2.5 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Cryptographic QR gate passes with turnstile verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Groq LPU AI-assisted maintenance & automated SLA routing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Unified governance console across 8 operational roles</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Production Grade Platform</span>
            <span className="font-mono text-emerald-700 font-bold">CAMPUS OS • 2026</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-6 p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2 md:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm font-mono">
                COS
              </div>
              <span className="font-bold text-slate-900 text-sm">CAMPUS OS</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Access</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in with your campus identity or use the 1-click evaluation accounts
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institutional Email / Roll Number / Username
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="student@campus.demo or 2301105001"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 text-xs sm:text-sm font-bold shadow-soft disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating with CAMPUS OS...' : 'Sign In to CAMPUS OS'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* 1-Click Evaluation Stakeholder Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  1-Click Role Demonstrator
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Live Demo</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('STUDENT')}
                className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-2 text-left hover:bg-emerald-50 hover:border-emerald-300 transition hover-lift group"
              >
                <div className="font-bold text-[11px] text-slate-800 group-hover:text-emerald-950">Student</div>
                <div className="text-[9px] text-slate-500 truncate">Aarav (Roll 001)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-2 text-left hover:bg-emerald-50 hover:border-emerald-300 transition hover-lift group"
              >
                <div className="font-bold text-[11px] text-slate-800 group-hover:text-emerald-950">Campus Dean</div>
                <div className="text-[9px] text-slate-500 truncate">Governance Ctr</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('WARDEN')}
                className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-2 text-left hover:bg-emerald-50 hover:border-emerald-300 transition hover-lift group"
              >
                <div className="font-bold text-[11px] text-slate-800 group-hover:text-emerald-950">Hostel Warden</div>
                <div className="text-[9px] text-slate-500 truncate">Suresh Patel</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('MAINTENANCE')}
                className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-2 text-left hover:bg-emerald-50 hover:border-emerald-300 transition hover-lift group"
              >
                <div className="font-bold text-[11px] text-slate-800 group-hover:text-emerald-950">Technician</div>
                <div className="text-[9px] text-slate-500 truncate">Ramesh (Plumber)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('SECURITY')}
                className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-2 text-left hover:bg-emerald-50 hover:border-emerald-300 transition hover-lift group"
              >
                <div className="font-bold text-[11px] text-slate-800 group-hover:text-emerald-950">Security Gate</div>
                <div className="text-[9px] text-slate-500 truncate">QR Scanner</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('ACCOUNTS')}
                className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-2 text-left hover:bg-emerald-50 hover:border-emerald-300 transition hover-lift group"
              >
                <div className="font-bold text-[11px] text-slate-800 group-hover:text-emerald-950">Accounts</div>
                <div className="text-[9px] text-slate-500 truncate">Meena (Finance)</div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
