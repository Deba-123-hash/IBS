import React from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';

export default function StudentLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
