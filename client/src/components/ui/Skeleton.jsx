import React from 'react';

export const Skeleton = ({ className = '', height = 'h-4', width = 'w-full' }) => {
  return (
    <div
      className={`rounded-xl bg-slate-200/80 animate-pulse ${height} ${width} ${className}`}
    />
  );
};

export default Skeleton;
