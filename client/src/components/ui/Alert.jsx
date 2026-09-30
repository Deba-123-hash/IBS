import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export const Alert = ({
  type = 'info',
  title,
  children,
  className = ''
}) => {
  const types = {
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="h-4 w-4 text-blue-600 shrink-0" />
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
    },
    danger: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
    }
  };

  const current = types[type] || types.info;

  return (
    <div className={`rounded-xl border p-3.5 text-xs flex items-start gap-2.5 ${current.bg} ${className}`}>
      {current.icon}
      <div className="flex-1">
        {title && <h4 className="font-bold leading-tight mb-0.5">{title}</h4>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

export const Toast = Alert;

export default Alert;
