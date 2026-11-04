import React, { useState, useId, useRef } from 'react';

/**
 * Accessible Tooltip Component with positioning, delay, and keyboard focus support.
 */
export const Tooltip = ({
  content,
  children,
  placement = 'top',
  delay = 200,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  const tooltipId = useId();

  if (!content) return children;

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const placements = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {React.cloneElement(React.Children.only(children), {
        'aria-describedby': isVisible ? tooltipId : undefined
      })}

      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`
            absolute z-50 px-2.5 py-1 text-xs font-medium text-white bg-slate-900/95 
            rounded-lg shadow-lg whitespace-nowrap pointer-events-none backdrop-blur-xs border border-slate-700/50
            animate-in fade-in zoom-in-95 duration-150
            ${placements[placement] || placements.top}
            ${className}
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;

