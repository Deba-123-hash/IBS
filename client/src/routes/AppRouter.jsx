import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import StudentLayout from '../layouts/StudentLayout.jsx';
import StaffLayout from '../layouts/StaffLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';

// Route Guards
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';

// Public & Common Pages
import Home from '../pages/public/Home.jsx';
import About from '../pages/public/About.jsx';
import Help from '../pages/public/Help.jsx';
import Forbidden from '../pages/common/Forbidden.jsx';
import UniversalProfile from '../pages/common/Profile.jsx';

// Auth Pages
import Login from '../pages/auth/Login.jsx';

// Student Operations Pages
import Dashboard from '../pages/student/Dashboard.jsx';
import Attendance from '../pages/student/Attendance.jsx';
import Timetable from '../pages/student/Timetable.jsx';
import Requests from '../pages/student/Requests.jsx';
import Leave from '../pages/student/Leave.jsx';
import Visitors from '../pages/student/Visitors.jsx';
import Complaints from '../pages/student/Complaints.jsx';
import GatePasses from '../pages/student/GatePasses.jsx';
import Certificates from '../pages/student/Certificates.jsx';
import Fees from '../pages/student/Fees.jsx';
import Hostel from '../pages/student/Hostel.jsx';
import Mess from '../pages/student/Mess.jsx';
import Notices from '../pages/student/Notices.jsx';
import AiAssistant from '../pages/student/AiAssistant.jsx';
import StudentProfile from '../pages/student/Profile.jsx';

// Operational Workstation Pages
import WardenDashboard from '../pages/warden/WardenDashboard.jsx';
import MaintenanceDashboard from '../pages/maintenance/MaintenanceDashboard.jsx';
import SecurityDashboard from '../pages/security/SecurityDashboard.jsx';
import GateVerification from '../pages/security/GateVerification.jsx';
import StaffDashboard from '../pages/staff/StaffDashboard.jsx';

// Administrative Command Center Pages
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import AdminUsers from '../pages/admin/Users.jsx';
import AdminRequests from '../pages/admin/Requests.jsx';
import AdminCommunications from '../pages/admin/Communications.jsx';
import AdminApprovals from '../pages/admin/Approvals.jsx';
import AdminAnalytics from '../pages/admin/Analytics.jsx';

// Help Desk Terminal
import HelpDesk from '../pages/helpDesk/HelpDesk.jsx';

export default function AppRouter() {
  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/403" element={<Forbidden />} />
      </Route>

      {/* 2. Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* 3. Protected Student Operations */}
      <Route element={<ProtectedRoute />}>
        <Route element={<StudentLayout />}>
          <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/student/dashboard" element={<Dashboard />} />
          <Route path="/student/attendance" element={<Attendance />} />
          <Route path="/student/timetable" element={<Timetable />} />
          <Route path="/student/requests" element={<Requests />} />
          <Route path="/student/leave" element={<Leave />} />
          <Route path="/student/visitors" element={<Visitors />} />
          <Route path="/student/complaints" element={<Complaints />} />
          <Route path="/student/complaints/*" element={<Complaints />} />
          <Route path="/student/gate-passes" element={<GatePasses />} />
          <Route path="/student/gate-passes/*" element={<GatePasses />} />
          <Route path="/student/certificates" element={<Certificates />} />
          <Route path="/student/certificates/*" element={<Certificates />} />
          <Route path="/student/fees" element={<Fees />} />
          <Route path="/student/hostel" element={<Hostel />} />
          <Route path="/student/mess" element={<Mess />} />
          <Route path="/student/notices" element={<Notices />} />
          <Route path="/student/ai-assistant" element={<AiAssistant />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/notifications" element={<Notices />} />
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
          <Route path="/security/gate-verification" element={<GateVerification />} />
          <Route path="/security/*" element={<SecurityDashboard />} />
        </Route>
      </Route>

      {/* 7. Faculty & Generic Staff Portal */}
      <Route element={<RoleRoute allowedRoles={['FACULTY', 'ACCOUNTS', 'STAFF', 'ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<StaffLayout />}>
          <Route path="/faculty/*" element={<StaffDashboard />} />
          <Route path="/accounts/*" element={<StaffDashboard />} />
          <Route path="/staff/*" element={<StaffDashboard />} />
        </Route>
      </Route>

      {/* 8. Administrative Command Center */}
      <Route element={<RoleRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/complaints" element={<AdminRequests />} />
          <Route path="/admin/communications" element={<AdminCommunications />} />
          <Route path="/admin/notices" element={<AdminCommunications />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/analytics/*" element={<AdminAnalytics />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* 9. Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
