import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campus_user');
    return saved ? JSON.parse(saved) : null;
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
      const res = await apiClient.post('/auth/login', { email, password });
      const authData = res.data;
      setToken(authData.token);
      setUser(authData.user);
      return { success: true, user: authData.user };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoRole = async (targetRole) => {
    const roleEmails = {
      STUDENT: 'student@campus.demo',
      ADMIN: 'admin@campus.demo',
      SUPER_ADMIN: 'superadmin@campus.demo',
      WARDEN: 'warden@campus.demo',
      FACULTY: 'faculty@campus.demo',
      MAINTENANCE: 'maintenance@campus.demo',
      SECURITY: 'security@campus.demo',
      ACCOUNTS: 'accounts@campus.demo'
    };

    const email = roleEmails[targetRole] || 'student@campus.demo';
    return await login(email, 'Password@123');
  };

  const logout = () => {
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
        loading,
        login,
        loginAsDemoRole,
        logout
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
