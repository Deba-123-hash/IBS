import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageLoader from '../components/loading/PageLoader.jsx';

// Layouts
import PublicLayout from '../layouts/PublicLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import StudentLayout from '../layouts/StudentLayout.jsx';
import StaffLayout from '../layouts/StaffLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';

// Route Guards
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';

// Public & Common Pages (Code-Split on Demand)
const Home = lazy(() => import('../pages/public/Home.jsx'));
const About = lazy(() => import('../pages/public/About.jsx'));
const Help = lazy(() => import('../pages/public/Help.jsx'));
const Forbidden = lazy(() => import('../pages/common/Forbidden.jsx'));
const NotFound = lazy(() => import('../pages/common/NotFound.jsx'));
const UniversalProfile = lazy(() => import('../pages/common/Profile.jsx'));

// Auth Pages (Code-Split on Demand)
const Login = lazy(() => import('../pages/auth/Login.jsx'));

// Student Operations Pages (Code-Split on Demand)
const Dashboard = lazy(() => import('../pages/student/Dashboard.jsx'));
const Attendance = lazy(() => import('../pages/student/Attendance.jsx'));
const Timetable = lazy(() => import('../pages/student/Timetable.jsx'));
const Requests = lazy(() => import('../pages/student/Requests.jsx'));
const Leave = lazy(() => import('../pages/student/Leave.jsx'));
const Visitors = lazy(() => import('../pages/student/Visitors.jsx'));
const Complaints = lazy(() => import('../pages/student/Complaints.jsx'));
const GatePasses = lazy(() => import('../pages/student/GatePasses.jsx'));
const Certificates = lazy(() => import('../pages/student/Certificates.jsx'));
const Fees = lazy(() => import('../pages/student/Fees.jsx'));
const Hostel = lazy(() => import('../pages/student/Hostel.jsx'));
const Mess = lazy(() => import('../pages/student/Mess.jsx'));
const Notices = lazy(() => import('../pages/student/Notices.jsx'));
const Chatbot = lazy(() => import('../pages/student/Chatbot.jsx'));
const StudentProfile = lazy(() => import('../pages/student/Profile.jsx'));

// Operational Workstation Pages (Code-Split on Demand)
const WardenDashboard = lazy(() => import('../pages/warden/WardenDashboard.jsx'));
const MaintenanceDashboard = lazy(() => import('../pages/maintenance/MaintenanceDashboard.jsx'));
const SecurityDashboard = lazy(() => import('../pages/security/SecurityDashboard.jsx'));
const GateVerification = lazy(() => import('../pages/security/GateVerification.jsx'));
const StaffDashboard = lazy(() => import('../pages/staff/StaffDashboard.jsx'));
const AccountantDashboard = lazy(() => import('../pages/accountant/AccountantDashboard.jsx'));
const AccountsDashboard = lazy(() => import('../pages/accounts/AccountsDashboard.jsx'));

// Administrative Command Center Pages (Code-Split on Demand)
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard.jsx'));
const AdminUsers = lazy(() => import('../pages/admin/Users.jsx'));
const AdminRequests = lazy(() => import('../pages/admin/Requests.jsx'));
const AdminCommunications = lazy(() => import('../pages/admin/Communications.jsx'));
const AdminApprovals = lazy(() => import('../pages/admin/Approvals.jsx'));
const AdminAnalytics = lazy(() => import('../pages/admin/Analytics.jsx'));

// Help Desk Terminal (Code-Split on Demand)
const HelpDesk = lazy(() => import('../pages/helpDesk/HelpDesk.jsx'));

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader text="Loading interface..." />}>
      <Routes>
        {/* 1. Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/helpdesk" element={<Help />} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="/unauthorized" element={<Forbidden />} />
          <Route path="/404" element={<NotFound />} />
        </Route>

        {/* 2. Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/loginsvg" element={<Login />} />
        </Route>

        {/* 3. Protected Student Operations */}
        <Route element={<ProtectedRoute />}>
          <Route element={<StudentLayout />}>
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/dashboard" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/attendance" element={<Attendance />} />
            <Route path="/student/timetable" element={<Timetable />} />
            <Route path="/student/requests" element={<Requests />} />
            <Route path="/student/leave" element={<Leave />} />
            <Route path="/student/visitors" element={<Visitors />} />
            <Route path="/student/complaints" element={<Complaints />} />
            <Route path="/student/complaints/*" element={<Complaints />} />
            <Route path="/student/complaint" element={<Navigate to="/student/complaints" replace />} />
            <Route path="/student/complaint/*" element={<Navigate to="/student/complaints" replace />} />
            <Route path="/student/gate-passes" element={<GatePasses />} />
            <Route path="/student/gate-passes/*" element={<GatePasses />} />
            <Route path="/student/gate-pass" element={<Navigate to="/student/gate-passes" replace />} />
            <Route path="/student/gate-pass/*" element={<Navigate to="/student/gate-passes" replace />} />
            <Route path="/student/certificates" element={<Certificates />} />
            <Route path="/student/certificates/*" element={<Certificates />} />
            <Route path="/student/certificate" element={<Navigate to="/student/certificates" replace />} />
            <Route path="/student/fees" element={<Fees />} />
            <Route path="/student/payments" element={<Fees />} />
            <Route path="/student/payment" element={<Navigate to="/student/fees" replace />} />
            <Route path="/student/hostel" element={<Hostel />} />
            <Route path="/student/mess" element={<Mess />} />
            <Route path="/student/notices" element={<Notices />} />
            <Route path="/student/chatbot" element={<Chatbot />} />
            <Route path="/student/ai-assistant" element={<Navigate to="/student/chatbot" replace />} />
            <Route path="/student/ai" element={<Navigate to="/student/chatbot" replace />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/ai" element={<Navigate to="/chatbot" replace />} />
            <Route path="/ai-assistant" element={<Navigate to="/chatbot" replace />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/notifications" element={<Notices />} />
            <Route path="/student/helpdesk" element={<HelpDesk />} />
            <Route path="/profile" element={<UniversalProfile />} />
            <Route path="/help-desk" element={<HelpDesk />} />
          </Route>
        </Route>

        {/* 4. Warden Operations Portal */}
        <Route element={<RoleRoute allowedRoles={['WARDEN', 'ADMIN', 'SUPER_ADMIN']} />}>
          <Route element={<StaffLayout />}>
            <Route path="/warden" element={<Navigate to="/warden/dashboard" replace />} />
            <Route path="/warden/dashboard" element={<WardenDashboard />} />
            <Route path="/warden/complaints" element={<WardenDashboard />} />
            <Route path="/warden/hostel" element={<WardenDashboard />} />
            <Route path="/warden/hostels" element={<WardenDashboard />} />
            <Route path="/warden/rooms" element={<WardenDashboard />} />
            <Route path="/warden/allocations" element={<WardenDashboard />} />
            <Route path="/warden/transfers" element={<WardenDashboard />} />
            <Route path="/warden/requests" element={<WardenDashboard />} />
            <Route path="/warden/leave-requests" element={<WardenDashboard />} />
            <Route path="/warden/gate-passes" element={<WardenDashboard />} />
            <Route path="/warden/visitors" element={<WardenDashboard />} />
            <Route path="/warden/mess" element={<WardenDashboard />} />
            <Route path="/warden/*" element={<WardenDashboard />} />
          </Route>
        </Route>

        {/* 5. Maintenance Operations Portal */}
        <Route element={<RoleRoute allowedRoles={['MAINTENANCE', 'ADMIN', 'SUPER_ADMIN']} />}>
          <Route element={<StaffLayout />}>
            <Route path="/maintenance" element={<Navigate to="/maintenance/dashboard" replace />} />
            <Route path="/maintenance/dashboard" element={<MaintenanceDashboard />} />
            <Route path="/maintenance/tickets" element={<MaintenanceDashboard />} />
            <Route path="/maintenance/tickets/*" element={<MaintenanceDashboard />} />
            <Route path="/maintenance/tasks" element={<MaintenanceDashboard />} />
            <Route path="/maintenance/complaints" element={<MaintenanceDashboard />} />
            <Route path="/maintenance/assets" element={<MaintenanceDashboard />} />
            <Route path="/maintenance/*" element={<MaintenanceDashboard />} />
          </Route>
        </Route>

        {/* 6. Security Operations Portal */}
        <Route element={<RoleRoute allowedRoles={['SECURITY', 'ADMIN', 'SUPER_ADMIN']} />}>
          <Route element={<StaffLayout />}>
            <Route path="/security" element={<Navigate to="/security/dashboard" replace />} />
            <Route path="/security/dashboard" element={<SecurityDashboard />} />
            <Route path="/security/visitors" element={<SecurityDashboard />} />
            <Route path="/security/gate-entry" element={<GateVerification />} />
            <Route path="/security/gate-verification" element={<GateVerification />} />
            <Route path="/security/gate-pass" element={<GateVerification />} />
            <Route path="/security/gate-logs" element={<SecurityDashboard />} />
            <Route path="/security/logs" element={<SecurityDashboard />} />
            <Route path="/security/emergency" element={<SecurityDashboard />} />
            <Route path="/security/*" element={<SecurityDashboard />} />
          </Route>
        </Route>

        {/* 7. Accountant & Accounts Operations Portal */}
        <Route element={<RoleRoute allowedRoles={['ACCOUNTANT', 'ACCOUNTS', 'ADMIN', 'SUPER_ADMIN']} />}>
          <Route element={<StaffLayout />}>
            <Route path="/accountant" element={<Navigate to="/accountant/dashboard" replace />} />
            <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
            <Route path="/accountant/fees" element={<AccountantDashboard />} />
            <Route path="/accountant/payments" element={<AccountantDashboard />} />
            <Route path="/accountant/*" element={<AccountantDashboard />} />

            <Route path="/accounts" element={<Navigate to="/accounts/dashboard" replace />} />
            <Route path="/accounts/dashboard" element={<AccountsDashboard />} />
            <Route path="/accounts/overview" element={<AccountsDashboard />} />
            <Route path="/accounts/fees" element={<AccountsDashboard />} />
            <Route path="/accounts/payments" element={<AccountsDashboard />} />
            <Route path="/accounts/queries" element={<AccountsDashboard />} />
            <Route path="/accounts/expenses" element={<AccountsDashboard />} />
            <Route path="/accounts/reconciliation" element={<AccountsDashboard />} />
            <Route path="/accounts/*" element={<AccountsDashboard />} />
          </Route>
        </Route>

        {/* 8. Faculty & Generic Staff Portal */}
        <Route element={<RoleRoute allowedRoles={['FACULTY', 'STAFF', 'ADMIN', 'SUPER_ADMIN']} />}>
          <Route element={<StaffLayout />}>
            <Route path="/faculty" element={<Navigate to="/faculty/dashboard" replace />} />
            <Route path="/faculty/dashboard" element={<StaffDashboard />} />
            <Route path="/faculty/attendance" element={<StaffDashboard />} />
            <Route path="/faculty/students" element={<StaffDashboard />} />
            <Route path="/faculty/notices" element={<StaffDashboard />} />
            <Route path="/faculty/*" element={<StaffDashboard />} />
            <Route path="/staff/*" element={<StaffDashboard />} />
          </Route>
        </Route>

        {/* 9. Administrative Command Center */}
        <Route element={<RoleRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/students" element={<AdminUsers />} />
            <Route path="/admin/requests" element={<AdminRequests />} />
            <Route path="/admin/complaints" element={<AdminRequests />} />
            <Route path="/admin/hostel" element={<AdminRequests />} />
            <Route path="/admin/visitors" element={<AdminRequests />} />
            <Route path="/admin/communications" element={<AdminCommunications />} />
            <Route path="/admin/notices" element={<AdminCommunications />} />
            <Route path="/admin/approvals" element={<AdminApprovals />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/analytics/*" element={<AdminAnalytics />} />
            <Route path="/admin/fees" element={<AdminAnalytics />} />
            <Route path="/admin/attendance" element={<AdminAnalytics />} />
            <Route path="/admin/mess" element={<AdminAnalytics />} />
            <Route path="/admin/audit-logs" element={<AdminDashboard />} />
            <Route path="/admin/roles-permissions" element={<AdminDashboard />} />
            <Route path="/admin/certificates" element={<AdminRequests />} />
            <Route path="/admin/settings" element={<AdminDashboard />} />
            <Route path="/admin/chatbot" element={<Chatbot />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* 10. Fallback Catch-all -> Dedicated 404 Not Found Page */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
