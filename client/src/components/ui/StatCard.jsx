import React from 'react';
import { useGsapCounter } from '../../hooks/useGsapCounter.js';

export const StatCard = ({
  label,
  title,
  value,
  subtext,
  subtitle,
  icon: Icon,
  badgeText,
  badgeType = 'default',
  trend,
  color = 'emerald',
  className = '',
  animate = true,
  onClick
}) => {
  const displayTitle = label || title;
  const displaySubtitle = subtext || subtitle;

  const isNumeric = typeof value === 'number' || (!isNaN(Number(value)) && value !== '' && value !== null && typeof value !== 'boolean');
  const numericVal = isNumeric ? Number(value) : null;
  const animatedNumber = useGsapCounter(numericVal ?? 0, 1.0, animate && isNumeric);
  const renderedValue = isNumeric && animate ? animatedNumber.toLocaleString() : value;

  const colorStyles = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    sky: 'bg-sky-50 text-sky-700',
    indigo: 'bg-indigo-50 text-indigo-700'
  };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs
        ${onClick ? 'cursor-pointer hover:border-emerald-300' : ''}
        ${className}
      `}
    >
      <div className="flex items-center justify-between text-slate-500 mb-2">
        <span className="text-xs font-semibold text-slate-600">{displayTitle}</span>
        {Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-2xs ${colorStyles[color] || colorStyles.emerald}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-slate-900 tracking-tight">
          {renderedValue}
        </span>
        {badgeText && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
            {badgeText}
          </span>
        )}
        {trend && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
            trend.isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>

      {displaySubtitle && (
        <p className="text-[11px] text-slate-500 mt-1.5">{displaySubtitle}</p>
      )}
    </div>
  );
};

export default StatCard;
