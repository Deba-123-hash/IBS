import React from 'react';

export const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  badgeText,
  badgeType = 'default',
  className = ''
}) => {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-sm ${className}`}>
      <div className="flex items-center justify-between text-slate-500 mb-2">
        <span className="text-xs font-medium">{label}</span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        {badgeText && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
            {badgeText}
          </span>
        )}
      </div>

      {subtext && <p className="text-[11px] text-slate-400 mt-1">{subtext}</p>}
    </div>
  );
};

export default StatCard;
