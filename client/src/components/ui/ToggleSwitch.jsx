import React, { useId } from 'react';

/**
 * Accessible Toggle Switch component with ARIA role="switch" and keyboard navigation.
 * Light theme design system.
 */
export const ToggleSwitch = ({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  id,
  className = ''
}) => {
  const generatedId = useId();
  const switchId = id || generatedId;

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  const sizes = {
    sm: {
      track: 'w-8 h-4.5 p-0.5',
      thumb: 'w-3.5 h-3.5',
      translate: 'translate-x-3.5'
    },
    md: {
      track: 'w-10 h-5.5 p-0.5',
      thumb: 'w-4.5 h-4.5',
      translate: 'translate-x-4.5'
    },
    lg: {
      track: 'w-12 h-6.5 p-0.5',
      thumb: 'w-5.5 h-5.5',
      translate: 'translate-x-5.5'
    }
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      onClick={handleToggle}
    >
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex items-center rounded-full
          focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
          ${currentSize.track}
          ${
            checked
              ? 'bg-emerald-600'
              : 'bg-slate-300'
          }
        `}
      >
        <span
          className={`
            inline-block rounded-full bg-white shadow-sm transform
            ${currentSize.thumb}
            ${checked ? currentSize.translate : 'translate-x-0'}
          `}
          aria-hidden="true"
        />
      </button>

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
        </div>
      )}
    </div>
  );
};

export default ToggleSwitch;
