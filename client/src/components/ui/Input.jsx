import React, { useId, useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

export const Input = ({
  label,
  error,
  success,
  helper,
  icon: Icon,
  rightIcon: RightIcon,
  className = '',
  id,
  type = 'text',
  required,
  clearable = false,
  onClear,
  value,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const successId = `${inputId}-success`;

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const ariaDescribedBy = [
    error ? errorId : null,
    success && !error ? successId : null,
    helper && !error && !success ? helperId : null
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}

        <input
          id={inputId}
          type={effectiveType}
          value={value}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={ariaDescribedBy}
          className={`w-full rounded-xl border ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 text-rose-900'
              : success
              ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100'
              : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100 text-slate-900'
          } ${Icon ? 'pl-9.5' : 'px-3.5'} ${
            isPassword || clearable || RightIcon ? 'pr-10' : 'pr-3.5'
          } py-2 text-xs bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition duration-150 min-h-[38px] ${className}`}
          {...props}
        />

        {/* Clearable button */}
        {clearable && value && !props.disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-8 flex items-center pr-2 text-slate-400 hover:text-slate-600"
            aria-label="Clear input"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}

        {/* Password visibility toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-r-xl"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}

        {/* Custom right icon */}
        {!isPassword && RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <RightIcon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-rose-600 font-medium">
          {error}
        </p>
      )}
      {success && !error && (
        <p id={successId} className="text-[11px] text-emerald-600 font-medium">
          {success}
        </p>
      )}
      {helper && !error && !success && (
        <p id={helperId} className="text-[11px] text-slate-400">
          {helper}
        </p>
      )}
    </div>
  );
};

export default Input;
