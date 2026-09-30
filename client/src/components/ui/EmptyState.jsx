import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button.jsx';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are currently no items to display in this view.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mx-auto mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
