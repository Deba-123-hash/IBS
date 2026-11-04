import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck2, QrCode, Wrench, Bot } from 'lucide-react';

export default function BottomNav() {
  const items = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/student/attendance', icon: CalendarCheck2, label: 'Attendance' },
    { to: '/student/gate-passes', icon: QrCode, label: 'Gate Pass' },
    { to: '/student/complaints', icon: Wrench, label: 'Complaints' },
    { to: '/student/chatbot', icon: Bot, label: 'Chatbot' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur px-2 shadow-lg md:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-1 px-3 text-[10px] font-medium transition ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
