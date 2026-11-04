import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Standardized Lucide Icon Component with consistent sizing, stroke weight, and ARIA defaults.
 */
export const Icon = ({
  name,
  icon: Component,
  size = 'md',
  strokeWidth = 1.75,
  className = '',
  'aria-hidden': ariaHidden = true,
  ...props
}) => {
  let ResolvedIcon = Component;

  if (!ResolvedIcon && name) {
    ResolvedIcon = LucideIcons[name] || LucideIcons.HelpCircle;
  }

  if (!ResolvedIcon) return null;

  const sizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  return (
    <ResolvedIcon
      className={`${sizes[size] || sizes.md} shrink-0 ${className}`}
      strokeWidth={strokeWidth}
      aria-hidden={ariaHidden}
      {...props}
    />
  );
};

export default Icon;

