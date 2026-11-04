import React, { useId } from 'react';

export const Textarea = ({
  label,
  error,
  helper,
  rows = 3,
  className = '',
  id,
  required,
  ...props
}) => {
  const generatedId = useId();
  const textareaId = id || props.name || generatedId;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  const ariaDescribedBy = [
    error ? errorId : null,
    helper && !error ? helperId : null
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-bold text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={ariaDescribedBy}
        className={`w-full rounded-xl border ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
        } px-3.5 py-2 text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-red-600 font-medium">
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

export default Textarea;
