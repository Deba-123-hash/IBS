import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  title = 'No records found',
  description = 'There are currently no items to display in this list.',
  icon: Icon = Inbox,
  action
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
      <div className="p-4 mb-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400">
        <Icon className="h-8 w-8 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;
