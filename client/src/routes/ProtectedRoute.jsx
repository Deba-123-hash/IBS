import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/layout/AppShell.jsx';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-3 w-3 rounded-full bg-blue-600 animate-ping"></span>
          <span>Verifying Campus Credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role) && role !== 'SUPER_ADMIN') {
    // If user is trying to access an unauthorized screen, redirect to their home
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'SECURITY') return <Navigate to="/security/gate-verification" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Outlet />;
}
