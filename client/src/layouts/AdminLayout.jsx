import React from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';

export default function AdminLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
