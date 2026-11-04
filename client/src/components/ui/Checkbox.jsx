import React, { useId } from 'react';
import { Check, Minus } from 'lucide-react';

/**
 * Accessible, animated Checkbox component with indeterminate support and focus visible styling.
 * Light theme design system.
 */
export const Checkbox = ({
  checked = false,
  indeterminate = false,
  onChange,
  label,
  description,
  disabled = false,
  error,
  id,
  className = '',
  ...props
}) => {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex items-start gap-3 select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'
      } ${className}`}
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => !disabled && onChange && onChange(e.target.checked, e)}
          className="sr-only"
          {...props}
        />
        <div
          className={`
            w-4.5 h-4.5 rounded-md border transition-all duration-150 flex items-center justify-center
            group-focus-within:ring-2 group-focus-within:ring-emerald-500 group-focus-within:ring-offset-2
            ${
              checked || indeterminate
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : error
                ? 'border-rose-400 bg-white group-hover:border-rose-500'
                : 'border-slate-300 bg-white group-hover:border-slate-400'
            }
          `}
        >
          {indeterminate ? (
            <Minus className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in-75 duration-100" aria-hidden="true" />
          ) : checked ? (
            <Check className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in-75 duration-100" aria-hidden="true" />
          ) : null}
        </div>
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-semibold text-slate-900 leading-tight">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-slate-500 mt-0.5">
              {description}
            </span>
          )}
          {error && (
            <span role="alert" className="text-[11px] text-rose-600 font-medium mt-0.5">
              {error}
            </span>
          )}
        </div>
      )}
    </label>
  );
};

export default Checkbox;
