import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <Outlet />
    </div>
  );
}
