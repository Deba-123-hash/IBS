import React from 'react';

/**
 * Static non-animated loading status indicator for CAMPUS OS.
 * Provides accessible role="status" feedback with zero rotational movement.
 */
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3'
  };

  return (
    <div
      className={`rounded-full border-emerald-600 border-t-emerald-200 ${sizes[size] || sizes.md} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
