import React from 'react';

export const Select = ({
  label,
  error,
  options = [],
  children,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-xl border ${
          error ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
        } px-3.5 py-2 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 transition ${className}`}
        {...props}
      >
        {children || options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
};

export default Select;
