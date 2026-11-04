import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client.js';
import { getUserPermissions, hasPermission, hasAnyPermission } from '../permissions/permissionHelpers.js';

const AuthContext = createContext(null);

export const ROLE_DASHBOARDS = {
  SUPER_ADMIN: '/admin/dashboard',
  ADMIN: '/admin/dashboard',
  ACCOUNTANT: '/accountant/dashboard',
  ACCOUNTS: '/accounts/dashboard',
  SECURITY: '/security/dashboard',
  WARDEN: '/warden/dashboard',
  FACULTY: '/faculty/dashboard',
  STUDENT: '/student/dashboard',
  MAINTENANCE: '/maintenance/dashboard',
  STAFF: '/maintenance/dashboard'
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('campus_auth_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('campus_auth_token', token);
    } else {
      localStorage.removeItem('campus_auth_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('campus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('campus_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Isolate cache: clear previous role's queries
      queryClient.clear();

      const res = await apiClient.post('/auth/login', { email, password });
      const authData = res.data || res;
      const rawUser = authData.user || {};
      const authToken = authData.token || authData.accessToken;

      // Populate resolved permissions
      const enrichedUser = {
        ...rawUser,
        permissions: getUserPermissions(rawUser)
      };

      setToken(authToken);
      setUser(enrichedUser);
      const redirectUrl = ROLE_DASHBOARDS[enrichedUser.role] || '/student/dashboard';
      return { success: true, user: enrichedUser, redirectUrl };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoRole = async (targetRole) => {
    const roleEmails = {
      SUPER_ADMIN: 'superadmin@campus.demo',
      ADMIN: 'admin@campus.demo',
      ACCOUNTANT: 'accountant@campus.demo',
      ACCOUNTS: 'accounts@campus.demo',
      SECURITY: 'security@campus.demo',
      WARDEN: 'warden@campus.demo',
      FACULTY: 'faculty@campus.demo',
      STUDENT: 'student@campus.demo',
      MAINTENANCE: 'maintenance@campus.demo',
      STAFF: 'maintenance@campus.demo'
    };

    const email = roleEmails[targetRole] || 'student@campus.demo';
    return await login(email, 'Password@123');
  };

  const logout = () => {
    // Clear query cache to prevent cross-role data leaks
    queryClient.clear();
    setUser(null);
    setToken(null);
    localStorage.removeItem('campus_auth_token');
    localStorage.removeItem('campus_user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        role: user?.role,
        permissions: getUserPermissions(user),
        hasPermission: (perm) => hasPermission(user, perm),
        hasAnyPermission: (perms) => hasAnyPermission(user, perms),
        loading,
        login,
        loginAsDemoRole,
        logout,
        ROLE_DASHBOARDS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
