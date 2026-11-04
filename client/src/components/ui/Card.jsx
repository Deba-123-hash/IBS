import React from 'react';

/**
 * Premium Card Component with ambient elevation, subtle borders, and optional hover-lift micro-interactions.
 * Strictly light theme design system.
 */
export const Card = ({
  children,
  className = '',
  hover = false,
  interactive = false,
  padding = 'p-5',
  variant = 'default',
  ...props
}) => {
  const isHoverable = hover || interactive;

  const variants = {
    default: 'bg-white border-slate-200/80 shadow-xs',
    elevated: 'bg-white border-slate-200/60 shadow-soft',
    flat: 'bg-slate-50 border-slate-200/60 shadow-none',
    highlight: 'bg-gradient-to-br from-emerald-50/50 to-white border-emerald-200/60 shadow-xs'
  };

  return (
    <div
      style={{ colorScheme: 'light', ...props.style }}
      className={`
        rounded-2xl border ${padding}
        ${variants[variant] || variants.default}
        ${
          isHoverable
            ? 'hover:border-emerald-300 cursor-pointer'
            : ''
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, children, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
    {title || subtitle ? (
      <div>
        {title && (
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    ) : (
      children
    )}
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-base font-bold text-slate-900 tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-xs text-slate-500 mt-0.5 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4 ${className}`}>
    {children}
  </div>
);

export default Card;
