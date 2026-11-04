import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  label,
  error,
  helper,
  options = [],
  children,
  className = '',
  id,
  required,
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || props.name || generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  const ariaDescribedBy = [
    error ? errorId : null,
    helper && !error ? helperId : null
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={selectId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={ariaDescribedBy}
          className={`w-full appearance-none rounded-xl border ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 text-rose-900'
              : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100 text-slate-900'
          } pl-3.5 pr-10 py-2 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 transition duration-150 min-h-[38px] ${className}`}
          {...props}
        >
          {children ||
            options.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-slate-900 bg-white">
                {opt.label}
              </option>
            ))}
        </select>
        <div className="pointer-events-none absolute right-3 inset-y-0 flex items-center text-slate-400">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-rose-600 font-medium">
          {error}
        </p>
      )}
      {helper && !error && (
        <p id={helperId} className="text-[11px] text-slate-400">
          {helper}
        </p>
      )}
    </div>
  );
};

export default Select;
