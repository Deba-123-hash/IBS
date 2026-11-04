import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Bell,
  User,
  LogOut,
  ShieldCheck,
  RefreshCw,
  Menu,
  Search,
  Command,
  Sparkles,
  Bot
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo.jsx';

export default function Navbar({ onMenuToggle, onOpenCommandPalette }) {
  const { user, logout, loginAsDemoRole } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const demoMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (demoMenuRef.current && !demoMenuRef.current.contains(e.target)) {
        setShowDemoMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowDemoMenu(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const demoRoles = [
    { role: 'STUDENT', label: 'Aarav Sharma (Student)', desc: 'Dashboard, Complaints, Gate Pass, Mess' },
    { role: 'WARDEN', label: 'Suresh Patel (Warden)', desc: 'Hostel Rooms, Leaves & Grievances' },
    { role: 'ADMIN', label: 'Dean Verma (Admin)', desc: 'Executive Analytics & User Directory' },
    { role: 'SUPER_ADMIN', label: 'Vice Chancellor (Super Admin)', desc: 'Global Governance & System Audit' },
    { role: 'MAINTENANCE', label: 'Ramesh Kumar (Technician)', desc: 'Work Queue & Maintenance Tasks' },
    { role: 'SECURITY', label: 'Devendra Singh (Security)', desc: 'QR Scanner & Gate Verification' },
    { role: 'ACCOUNTS', label: 'Meena Mohapatra (Accounts)', desc: 'Fee Ledgers & Financial Oversight' },
    { role: 'FACULTY', label: 'Prof. Rajesh Mishra (Faculty)', desc: 'Class Attendance & Academic Notices' }
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 md:px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <BrandLogo size="md" showTagline={true} />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command Palette Trigger Button */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          title="Search features & jump (Ctrl+K)"
          aria-label="Open Command Palette (Quick Jump)"
        >
          <Search className="h-3.5 w-3.5 text-emerald-600" />
          <span className="hidden md:inline text-slate-600 font-medium">Quick Jump</span>
          <span className="flex items-center gap-0.5 rounded bg-white border border-slate-200 px-1.5 py-0.2 text-[10px] font-mono text-slate-500">
            <Command className="h-2.5 w-2.5" /> K
          </span>
        </button>

        {/* 1-Click Campus AI Chatbot Quick Trigger */}
        <Link
          to={user?.role === 'ADMIN' ? '/admin/chatbot' : '/student/chatbot'}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-emerald-800 transition shadow-2xs group focus:outline-none focus:ring-2 focus:ring-emerald-500"
          title="Campus AI Chatbot (Groq LPU Active)"
          aria-label="Open Campus AI Chatbot"
        >
          <Bot className="h-4 w-4 text-emerald-600" />
          <span className="hidden xs:inline">AI Chatbot</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        </Link>

        {/* Quick Demo Role Switcher Badge */}
        <div className="relative" ref={demoMenuRef}>
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            aria-expanded={showDemoMenu}
            aria-haspopup="menu"
            aria-label="Switch Perspective / User Role"
            className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/90 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden xs:inline text-emerald-700">Role:</span>
            <span className="font-bold text-emerald-900">{user?.role || 'STUDENT'}</span>
            <RefreshCw className="h-3 w-3 text-emerald-600 ml-0.5" />
          </button>

          {showDemoMenu && (
            <div
              role="menu"
              aria-orientation="vertical"
              className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-lift z-50"
            >
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Switch Demo Perspective
                </p>
                <p className="text-[11px] text-slate-500">1-click test any stakeholder role live</p>
              </div>
              <div className="space-y-1">
                {demoRoles.map((item) => (
                  <button
                    key={item.role}
                    role="menuitem"
                    onClick={async () => {
                      setShowDemoMenu(false);
                      const res = await loginAsDemoRole(item.role);
                      if (res.success && res.redirectUrl) {
                        navigate(res.redirectUrl);
                      }
                      toast.success(`Switched perspective to ${item.label}`, 'Role Updated');
                    }}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs transition flex flex-col focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      user?.role === item.role
                        ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon Link */}
        <Link
          to="/student/notices"
          className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Campus Notices"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
        </Link>

        {/* User Avatar & Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-expanded={showUserMenu}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="User Account Menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-100 to-teal-100 text-emerald-800 font-bold text-xs border border-emerald-200 shadow-2xs">
              {user?.firstName?.[0] || 'A'}
            </div>
          </button>

          {showUserMenu && (
            <div
              role="menu"
              aria-orientation="vertical"
              className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lift z-50"
            >
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'student.demo@campus.edu'}</p>
                <span className="inline-block mt-1 text-[9px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  {user?.role || 'STUDENT'}
                </span>
              </div>
              <Link
                to={user?.role === 'STUDENT' ? '/student/profile' : '/profile'}
                role="menuitem"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <User className="h-4 w-4 text-slate-500" />
                <span>My Profile</span>
              </Link>
              <button
                role="menuitem"
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-600 hover:bg-red-50 text-left transition focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
