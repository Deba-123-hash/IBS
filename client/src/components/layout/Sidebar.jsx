import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePermissions } from '../../hooks/usePermissions.js';
import { PERMISSIONS } from '../../permissions/permissions.js';
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
  UserCheck,
  Receipt,
  FileSpreadsheet,
  AlertTriangle,
  LogIn,
  LogOut,
  FolderLock,
  PieChart,
  DollarSign,
  Scale,
  Eye,
  Sliders,
  Settings,
  Layers,
  GraduationCap
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const role = user?.role || 'STUDENT';

  // Master definition of navigation items per role with required permissions
  const roleNavMap = {
    STUDENT: [
      { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: PERMISSIONS.STUDENT_READ_OWN },
      { to: '/student/profile', icon: Users, label: 'My Profile', permission: PERMISSIONS.STUDENT_READ_OWN },
      { to: '/student/attendance', icon: CalendarCheck2, label: 'Attendance', permission: PERMISSIONS.ATTENDANCE_READ_OWN },
      { to: '/student/hostel', icon: Building2, label: 'Hostel & Room', permission: PERMISSIONS.HOSTEL_READ_OWN },
      { to: '/student/leave', icon: CalendarDays, label: 'Leave Requests', permission: PERMISSIONS.LEAVE_READ_OWN },
      { to: '/student/complaints', icon: Wrench, label: 'Complaints', permission: PERMISSIONS.COMPLAINT_READ_OWN },
      { to: '/student/fees', icon: CreditCard, label: 'Fees & Dues', permission: PERMISSIONS.FEES_READ_OWN },
      { to: '/student/payments', icon: Receipt, label: 'My Payments', permission: PERMISSIONS.PAYMENT_READ_OWN },
      { to: '/student/visitors', icon: UserCheck, label: 'Visitor Requests', permission: PERMISSIONS.VISITOR_READ_OWN },
      { to: '/student/notices', icon: BellRing, label: 'Campus Notices', permission: PERMISSIONS.NOTICE_READ },
      { to: '/student/chatbot', icon: Bot, label: 'AI Assistant', highlight: true }
    ],

    ACCOUNTANT: [
      { to: '/accountant/dashboard', icon: LayoutDashboard, label: 'Cashier Dashboard', permission: PERMISSIONS.FEES_READ_ALL },
      { to: '/accountant/fees', icon: CreditCard, label: 'Fee Management', permission: PERMISSIONS.FEES_READ_ALL },
      { to: '/accountant/payments', icon: Receipt, label: 'Payment Operations', permission: PERMISSIONS.PAYMENT_READ_ALL },
      { to: '/admin/students', icon: Users, label: 'Student Billing', permission: PERMISSIONS.STUDENT_READ_ALL },
      { to: '/admin/notices', icon: BellRing, label: 'Broadcast Notices', permission: PERMISSIONS.NOTICE_READ }
    ],

    ACCOUNTS: [
      { to: '/accounts/dashboard', icon: LayoutDashboard, label: 'Finance Dashboard', permission: PERMISSIONS.FINANCIAL_REPORT_READ },
      { to: '/accounts/overview', icon: PieChart, label: 'Income & Revenue', permission: PERMISSIONS.FINANCIAL_REPORT_READ },
      { to: '/accounts/expenses', icon: DollarSign, label: 'Campus Expenses', permission: PERMISSIONS.EXPENSE_READ_ALL },
      { to: '/accounts/reconciliation', icon: Scale, label: 'Reconciliation', permission: PERMISSIONS.RECONCILIATION_READ },
      { to: '/accountant/payments', icon: Receipt, label: 'All Transactions', permission: PERMISSIONS.PAYMENT_READ_ALL },
      { to: '/admin/notices', icon: BellRing, label: 'Notices', permission: PERMISSIONS.NOTICE_READ }
    ],

    SECURITY: [
      { to: '/security/dashboard', icon: ShieldCheck, label: 'Security Command', permission: PERMISSIONS.GATE_LOG_READ },
      { to: '/security/gate-entry', icon: LogIn, label: 'Gate Entry & Exit', permission: PERMISSIONS.GATE_ENTRY },
      { to: '/security/visitors', icon: UserCheck, label: 'Visitor Registry', permission: PERMISSIONS.VISITOR_READ_ALL },
      { to: '/security/gate-logs', icon: FileText, label: 'Gate Log History', permission: PERMISSIONS.GATE_LOG_READ },
      { to: '/security/emergency', icon: AlertTriangle, label: 'Emergency Alerts', permission: PERMISSIONS.EMERGENCY_READ },
      { to: '/student/gate-passes', icon: QrCode, label: 'QR Scanner', permission: PERMISSIONS.GATE_ENTRY }
    ],

    MAINTENANCE: [
      { to: '/maintenance/dashboard', icon: LayoutDashboard, label: 'Work Orders', permission: PERMISSIONS.COMPLAINT_READ_ALL },
      { to: '/maintenance/tickets', icon: Wrench, label: 'Maintenance Tickets', permission: PERMISSIONS.COMPLAINT_READ_ALL },
      { to: '/maintenance/complaints', icon: AlertTriangle, label: 'Hostel Issues', permission: PERMISSIONS.COMPLAINT_READ_ALL },
      { to: '/maintenance/assets', icon: Building2, label: 'Campus Assets', permission: PERMISSIONS.HOSTEL_READ_ALL },
      { to: '/student/notices', icon: BellRing, label: 'Campus Notices', permission: PERMISSIONS.NOTICE_READ }
    ],

    WARDEN: [
      { to: '/warden/dashboard', icon: LayoutDashboard, label: 'Hostel Dashboard', permission: PERMISSIONS.HOSTEL_MANAGE },
      { to: '/warden/hostels', icon: Building2, label: 'Hostels & Rooms', permission: PERMISSIONS.HOSTEL_READ_ALL },
      { to: '/warden/allocations', icon: Layers, label: 'Room Allocations', permission: PERMISSIONS.ROOM_ASSIGN },
      { to: '/warden/transfers', icon: Sliders, label: 'Room Transfers', permission: PERMISSIONS.ROOM_TRANSFER_APPROVE },
      { to: '/warden/leave-requests', icon: CalendarDays, label: 'Leave Approvals', permission: PERMISSIONS.LEAVE_APPROVE },
      { to: '/warden/complaints', icon: Wrench, label: 'Hostel Grievances', permission: PERMISSIONS.COMPLAINT_READ_ALL },
      { to: '/warden/visitors', icon: UserCheck, label: 'Hostel Visitors', permission: PERMISSIONS.VISITOR_READ_ALL },
      { to: '/student/notices', icon: BellRing, label: 'Notices', permission: PERMISSIONS.NOTICE_READ }
    ],

    FACULTY: [
      { to: '/faculty/dashboard', icon: LayoutDashboard, label: 'Faculty Dashboard', permission: PERMISSIONS.ATTENDANCE_READ_ASSIGNED },
      { to: '/faculty/attendance', icon: CalendarCheck2, label: 'Session Attendance', permission: PERMISSIONS.ATTENDANCE_CREATE },
      { to: '/admin/students', icon: GraduationCap, label: 'Assigned Students', permission: PERMISSIONS.STUDENT_READ_ALL },
      { to: '/student/notices', icon: BellRing, label: 'Academic Notices', permission: PERMISSIONS.NOTICE_READ }
    ],

    ADMIN: [
      { to: '/admin/dashboard', icon: Activity, label: 'Campus Operations', permission: PERMISSIONS.USER_READ_ALL },
      { to: '/admin/users', icon: Users, label: 'User Directory', permission: PERMISSIONS.USER_READ_ALL },
      { to: '/admin/students', icon: GraduationCap, label: 'Student Directory', permission: PERMISSIONS.STUDENT_READ_ALL },
      { to: '/warden/hostels', icon: Building2, label: 'Hostel Configuration', permission: PERMISSIONS.HOSTEL_READ_ALL },
      { to: '/admin/notices', icon: BellRing, label: 'Broadcast Notices', permission: PERMISSIONS.NOTICE_CREATE },
      { to: '/admin/audit-logs', icon: FolderLock, label: 'System Audit Logs', permission: PERMISSIONS.AUDIT_READ },
      { to: '/student/chatbot', icon: Bot, label: 'Campus AI', highlight: true }
    ],

    SUPER_ADMIN: [
      { to: '/admin/dashboard', icon: Activity, label: 'System Governance', permission: PERMISSIONS.USER_READ_ALL },
      { to: '/admin/users', icon: Users, label: 'Global Accounts', permission: PERMISSIONS.USER_READ_ALL },
      { to: '/admin/roles-permissions', icon: Sliders, label: 'RBAC Permissions Matrix', permission: PERMISSIONS.ROLE_MANAGE },
      { to: '/accounts/overview', icon: PieChart, label: 'Financial Control', permission: PERMISSIONS.FINANCIAL_REPORT_READ },
      { to: '/warden/hostels', icon: Building2, label: 'Hostel System', permission: PERMISSIONS.HOSTEL_READ_ALL },
      { to: '/security/dashboard', icon: ShieldCheck, label: 'Security Command', permission: PERMISSIONS.GATE_LOG_READ },
      { to: '/admin/audit-logs', icon: FolderLock, label: 'System Audit Logs', permission: PERMISSIONS.AUDIT_READ },
      { to: '/admin/notices', icon: BellRing, label: 'Broadcast Notices', permission: PERMISSIONS.NOTICE_CREATE },
      { to: '/student/chatbot', icon: Bot, label: 'Campus AI', highlight: true }
    ]
  };

  const rawLinks = roleNavMap[role] || roleNavMap.STUDENT;

  // Filter links dynamically by granular permission
  const authorizedLinks = rawLinks.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center px-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {role.replace('_', ' ')}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3.5 space-y-1">
          {authorizedLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-950 font-semibold shadow-2xs'
                      : item.highlight
                      ? 'text-emerald-700 bg-emerald-50/40 hover:bg-emerald-50/80'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald-600" />
                    )}
                    <Icon className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`} />
                    <span className="truncate">{item.label}</span>
                    {item.highlight && (
                      <span className="ml-auto rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shadow-2xs">
                        AI
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-xs shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Account Active</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xs font-bold text-slate-800 truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'Authenticated'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
