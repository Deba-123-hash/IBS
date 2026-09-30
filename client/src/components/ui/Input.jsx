import React from 'react';

export const Input = ({
  label,
  error,
  helper,
  icon: Icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl border ${
            error ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
          } ${Icon ? 'pl-9' : 'px-3.5'} py-2 text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
      {helper && !error && <p className="text-[11px] text-slate-400">{helper}</p>}
    </div>
  );
};

export default Input;
