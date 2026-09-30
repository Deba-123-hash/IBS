import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  CalendarCheck2,
  CalendarDays,
  Wrench,
  QrCode,
  FileText,
  CreditCard,
  Building2,
  UtensilsCrossed,
  BellRing,
  Bot,
  HelpCircle,
  Users,
  ShieldCheck,
  Activity,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/attendance', icon: CalendarCheck2, label: 'Attendance' },
    { to: '/student/timetable', icon: CalendarDays, label: 'Timetable' },
    { to: '/student/complaints', icon: Wrench, label: 'Hostel Complaints' },
    { to: '/student/gate-passes', icon: QrCode, label: 'Gate Passes (QR)' },
    { to: '/student/certificates', icon: FileText, label: 'Certificates' },
    { to: '/student/fees', icon: CreditCard, label: 'Fees & Dues' },
    { to: '/student/hostel', icon: Building2, label: 'Hostel Room' },
    { to: '/student/mess', icon: UtensilsCrossed, label: 'Mess & Menu' },
    { to: '/student/notices', icon: BellRing, label: 'Campus Notices' },
    { to: '/student/ai-assistant', icon: Bot, label: 'Campus AI Assistant', highlight: true },
    { to: '/help-desk', icon: HelpCircle, label: 'No-Phone Help Desk' }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: Activity, label: 'Command Center' },
    { to: '/admin/users', icon: Users, label: 'User Directory' },
    { to: '/student/complaints', icon: Wrench, label: 'All Complaints' },
    { to: '/student/gate-passes', icon: QrCode, label: 'Gate Approvals' },
    { to: '/student/notices', icon: BellRing, label: 'Broadcast Notices' },
    { to: '/help-desk', icon: HelpCircle, label: 'Help Desk Terminal' }
  ];

  const wardenLinks = [
    { to: '/student/hostel', icon: Building2, label: 'Hostel Room Grid' },
    { to: '/student/gate-passes', icon: UserCheck, label: 'Gate Pass Approvals' },
    { to: '/student/complaints', icon: Wrench, label: 'Hostel Grievances' },
    { to: '/student/mess', icon: UtensilsCrossed, label: 'Mess Feedback' }
  ];

  const maintenanceLinks = [
    { to: '/student/complaints', icon: Wrench, label: 'Maintenance Queue' }
  ];

  const securityLinks = [
    { to: '/security/gate-verification', icon: QrCode, label: 'Gate QR Scanner' },
    { to: '/student/gate-passes', icon: UserCheck, label: 'Active Gate Passes' }
  ];

  const accountsLinks = [
    { to: '/student/fees', icon: CreditCard, label: 'Fee Ledgers' },
    { to: '/student/certificates', icon: FileText, label: 'Certificate Clearances' }
  ];

  let links = studentLinks;
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') links = adminLinks;
  else if (role === 'WARDEN') links = wardenLinks;
  else if (role === 'MAINTENANCE') links = maintenanceLinks;
  else if (role === 'SECURITY') links = securityLinks;
  else if (role === 'ACCOUNTS') links = accountsLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {role} PORTAL
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                      : item.highlight
                      ? 'text-blue-600 bg-blue-50/50 hover:bg-blue-50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span>Campus Network</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="font-semibold text-slate-800 truncate">Fretbox Campus OS v1.0</p>
            <p className="text-[10px] text-slate-400">All systems operational</p>
          </div>
        </div>
      </aside>
    </>
  );
}
