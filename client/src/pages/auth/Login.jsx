import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck, ArrowRight, AlertCircle, Sparkles, Building2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('student@campus.demo');
  const [password, setPassword] = useState('Password@123');
  const [errorMessage, setErrorMessage] = useState('');
  const { login, loginAsDemoRole, loading } = useAuth();
  const navigate = useNavigate();

  const getRedirectPathForRole = (role) => {
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
      setErrorMessage(res.error || 'Authentication failed');
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
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Left Hero Panel */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white flex flex-col justify-between hidden md:flex">
          <div>
            <div className="flex items-center gap-2.5 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur border border-white/20 font-bold text-xl">
                C
              </div>
              <span className="font-bold text-xl tracking-tight">Campus Life, Debugged</span>
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight mb-4">
              Attendance, Mess, Hostel, Repeat.
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              The unified operations OS replacing paper registers, WhatsApp spam, and office queues with real-time digital accountability.
            </p>

            <div className="space-y-3 text-xs text-blue-100/90">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-300"></span>
                <span>Sub-second dynamic QR gate pass verification</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-300"></span>
                <span>AI-powered smart complaint classification</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-300"></span>
                <span>Help-desk workflow for students without phones</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/15 text-xs text-blue-200">
            Fretbox Hackathon Prototype Edition • 2026
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-500 mt-1">Sign in with your institutional credentials</p>
          </div>

          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional Email / Roll Number</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                placeholder="student@campus.demo"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1-Click Demo Evaluation Roles
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('STUDENT')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-left hover:bg-blue-50 hover:border-blue-200 transition"
              >
                <div className="font-semibold text-[11px] text-slate-800">Student</div>
                <div className="text-[9px] text-slate-500">Aarav</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-left hover:bg-blue-50 hover:border-blue-200 transition"
              >
                <div className="font-semibold text-[11px] text-slate-800">Admin</div>
                <div className="text-[9px] text-slate-500">Command Ctr</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('WARDEN')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-left hover:bg-blue-50 hover:border-blue-200 transition"
              >
                <div className="font-semibold text-[11px] text-slate-800">Warden</div>
                <div className="text-[9px] text-slate-500">Approvals</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('MAINTENANCE')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-left hover:bg-blue-50 hover:border-blue-200 transition"
              >
                <div className="font-semibold text-[11px] text-slate-800">Maint.</div>
                <div className="text-[9px] text-slate-500">Technician</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('SECURITY')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-left hover:bg-blue-50 hover:border-blue-200 transition"
              >
                <div className="font-semibold text-[11px] text-slate-800">Security</div>
                <div className="text-[9px] text-slate-500">Gate QR</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('ACCOUNTS')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-left hover:bg-blue-50 hover:border-blue-200 transition"
              >
                <div className="font-semibold text-[11px] text-slate-800">Accounts</div>
                <div className="text-[9px] text-slate-500">Ledgers</div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
