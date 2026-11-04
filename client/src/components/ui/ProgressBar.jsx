import React from 'react';

/**
 * Accessible linear progress bar with role="progressbar" and color variants.
 * Light theme design system.
 */
export const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  showLabel = false,
  color = 'emerald',
  size = 'md',
  className = ''
}) => {
  const percentage = Math.min(Math.max(0, Math.round((value / max) * 100)), 100);

  const colors = {
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
    indigo: 'bg-indigo-600'
  };

  const sizes = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {(label || showLabel) && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          {label && <span>{label}</span>}
          {showLabel && <span>{percentage}%</span>}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
        className={`w-full bg-slate-100 rounded-full overflow-hidden ${
          sizes[size] || sizes.md
        }`}
      >
        <div
          className={`h-full rounded-full ${
            colors[color] || colors.emerald
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Circular progress ring for attendance percentage, occupancy, and quota gauges.
 */
export const CircularProgress = ({
  value = 0,
  max = 100,
  size = 64,
  strokeWidth = 6,
  color = 'emerald',
  showLabel = true,
  className = ''
}) => {
  const percentage = Math.min(Math.max(0, Math.round((value / max) * 100)), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const strokeColors = {
    emerald: 'text-emerald-600',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
    sky: 'text-sky-500',
    indigo: 'text-indigo-600'
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-100"
        />
        {/* Dynamic progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className={`rounded-full ${
            strokeColors[color] || strokeColors.emerald
          }`}
        />
      </svg>

      {showLabel && (
        <span className="absolute text-xs font-bold text-slate-800">
          {percentage}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
