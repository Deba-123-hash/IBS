import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'p-5',
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white ${padding} shadow-xs ${
        hover ? 'transition hover:shadow-sm hover:border-blue-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
    <div>
      <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default Card;
