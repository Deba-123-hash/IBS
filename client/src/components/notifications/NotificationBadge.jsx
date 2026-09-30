import React from 'react';
import { Bell } from 'lucide-react';

export const NotificationBadge = ({ count = 0, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBadge;
