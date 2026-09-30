import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Bell, User, LogOut, ShieldCheck, RefreshCw, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ onMenuToggle }) {
  const { user, logout, loginAsDemoRole } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const demoRoles = [
    { role: 'STUDENT', label: 'Aarav (Student)', desc: 'Dashboard, Complaints, Gate Pass, Mess' },
    { role: 'ADMIN', label: 'Dean Verma (Admin)', desc: 'Executive Analytics & Governance' },
    { role: 'WARDEN', label: 'Suresh (Warden)', desc: 'Hostel Rooms & Gate Approvals' },
    { role: 'MAINTENANCE', label: 'Ramesh (Technician)', desc: 'Work Queue & Ticket Resolution' },
    { role: 'SECURITY', label: 'Devendra (Security)', desc: 'QR Scanner & Gate Verification' },
    { role: 'ACCOUNTS', label: 'Meena (Accounts)', desc: 'Fee Ledgers & Financial Queries' }
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-sm">
            C
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base leading-tight tracking-tight block">
              Campus Life, Debugged
            </span>
            <span className="text-[11px] font-medium text-blue-600 hidden sm:block">
              Campus Operations OS
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Demo Role Switcher Badge */}
        <div className="relative">
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden xs:inline">Role:</span>
            <span className="font-bold">{user?.role || 'DEMO'}</span>
            <RefreshCw className="h-3 w-3 text-blue-500 ml-0.5" />
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">Switch Demo Role</p>
                <p className="text-[11px] text-slate-500">1-click test any stakeholder perspective</p>
              </div>
              <div className="space-y-1">
                {demoRoles.map((item) => (
                  <button
                    key={item.role}
                    onClick={async () => {
                      setShowDemoMenu(false);
                      await loginAsDemoRole(item.role);
                    }}
                    className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition flex flex-col ${
                      user?.role === item.role
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon Link */}
        <Link
          to="/student/notifications"
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
        </Link>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300">
              {user?.firstName?.[0] || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <Link
                to="/student/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <User className="h-4 w-4 text-slate-500" />
                <span>My Profile</span>
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
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
