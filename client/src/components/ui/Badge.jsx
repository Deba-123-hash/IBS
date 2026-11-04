import React from 'react';

/**
 * Standardized Badge component with semantic color variants, status dots, and icon slots.
 * Light theme design system.
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  icon: Icon,
  className = ''
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-sky-50 text-sky-700 border-sky-200/80',
    purple: 'bg-violet-50 text-violet-800 border-violet-200/80',
    outline: 'bg-transparent text-slate-700 border-slate-300'
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.25 gap-1',
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-0.5 gap-1.5'
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${
        variants[variant] || variants.default
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" aria-hidden="true" />}
      {Icon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
