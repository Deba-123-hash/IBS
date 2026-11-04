import React from 'react';

/**
 * Premium Button Component with Uiverse-inspired micro-interactions,
 * 10 variants, 5 size tiers, loading indicators, and tactile press response.
 * Light theme design system.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  isLoading = false,
  loadingText,
  icon: Icon,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const isBusy = loading || isLoading;
  const EffectiveLeftIcon = LeftIcon || Icon;

  const baseStyles = 'relative inline-flex items-center justify-center font-semibold rounded-xl shadow-xs focus:outline-none focus:ring-2 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] select-none';

  const variants = {
    // Primary Brand Emerald
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-500 shadow-sm',
    
    // Secondary Neutral Surface
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-400',
    
    // Clean Outline
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-emerald-400',
    
    // Danger / Destructive
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-500 shadow-sm',
    
    // Success / Approval
    success: 'bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900 focus-visible:ring-emerald-600 shadow-sm',
    
    // Warning / Caution
    warning: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 focus-visible:ring-amber-400 shadow-sm',
    
    // Info / Advisory
    info: 'bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 focus-visible:ring-sky-400 shadow-sm',
    
    // Ghost / Flat
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-none',
    
    // Text Link Button
    text: 'text-emerald-600 hover:text-emerald-700 hover:underline p-0 shadow-none h-auto',
    
    // Gradient Badge Button
    shine: 'relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white shadow-sm'
  };

  const sizes = {
    xs: 'text-[11px] px-2.5 py-1 gap-1 rounded-lg min-h-[28px]',
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg min-h-[32px]',
    md: 'text-xs px-3.5 py-2 gap-2 rounded-xl min-h-[40px]',
    lg: 'text-sm px-5 py-2.5 gap-2.5 rounded-xl min-h-[44px]',
    xl: 'text-base px-6 py-3 gap-3 rounded-2xl min-h-[48px]'
  };

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-4.5 w-4.5',
    xl: 'h-5 w-5'
  };

  return (
    <button
      type={type}
      disabled={disabled || isBusy}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isBusy ? (
        <span
          className={`${iconSizes[size] || 'h-4 w-4'} border-2 border-current border-t-transparent rounded-full animate-spin shrink-0`}
          aria-hidden="true"
        />
      ) : EffectiveLeftIcon ? (
        <EffectiveLeftIcon className={`${iconSizes[size] || 'h-4 w-4'} shrink-0`} aria-hidden="true" />
      ) : null}

      <span>{isBusy && loadingText ? loadingText : children}</span>

      {!isBusy && RightIcon && (
        <RightIcon className={`${iconSizes[size] || 'h-4 w-4'} shrink-0`} aria-hidden="true" />
      )}
    </button>
  );
};

export default Button;
