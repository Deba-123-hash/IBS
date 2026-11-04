import React, { useId } from 'react';

export const RadioButton = ({
  value,
  selectedValue,
  onChange,
  name,
  label,
  description,
  disabled = false,
  className = ''
}) => {
  const isChecked = selectedValue === value;
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-start gap-3 select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'
      } ${className}`}
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          id={inputId}
          type="radio"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          onChange={() => !disabled && onChange && onChange(value)}
          className="sr-only"
        />
        <div
          className={`
            w-4.5 h-4.5 rounded-full border transition-all duration-150 flex items-center justify-center
            group-focus-within:ring-2 group-focus-within:ring-emerald-500 group-focus-within:ring-offset-2
            ${
              isChecked
                ? 'border-emerald-600 bg-white shadow-xs'
                : 'border-slate-300 bg-white group-hover:border-slate-400'
            }
          `}
        >
          {isChecked && (
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-in zoom-in-75 duration-100"
              aria-hidden="true"
            />
          )}
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
        </div>
      )}
    </label>
  );
};

export const RadioGroup = ({
  name,
  value,
  onChange,
  options = [],
  children,
  label,
  error,
  orientation = 'vertical',
  className = ''
}) => {
  const groupId = useId();

  return (
    <div
      role="radiogroup"
      aria-labelledby={label ? `${groupId}-label` : undefined}
      className={`space-y-2 ${className}`}
    >
      {label && (
        <span id={`${groupId}-label`} className="block text-xs font-semibold text-slate-700">
          {label}
        </span>
      )}

      <div
        className={`flex ${
          orientation === 'horizontal' ? 'flex-row flex-wrap gap-4' : 'flex-col space-y-2'
        }`}
      >
        {options.length > 0
          ? options.map((opt) => (
              <RadioButton
                key={opt.value}
                name={name}
                value={opt.value}
                selectedValue={value}
                onChange={onChange}
                label={opt.label}
                description={opt.description}
                disabled={opt.disabled}
              />
            ))
          : React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(child, {
                    name,
                    selectedValue: value,
                    onChange
                  })
                : child
            )}
      </div>

      {error && (
        <p role="alert" className="text-[11px] text-rose-600 font-medium mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default RadioGroup;
