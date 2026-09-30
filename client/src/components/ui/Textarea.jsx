import React from 'react';

export const Textarea = ({
  label,
  error,
  helper,
  rows = 3,
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
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full rounded-xl border ${
          error ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
        } px-3.5 py-2 text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
      {helper && !error && <p className="text-[11px] text-slate-400">{helper}</p>}
    </div>
  );
};

export default Textarea;
