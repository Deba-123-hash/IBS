import React from 'react';

export function LoadingSkeleton({ type = 'table', rows = 5 }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-2xl border border-slate-200/60 p-5">
            <div className="h-4 w-24 bg-slate-200 rounded mb-3"></div>
            <div className="h-8 w-32 bg-slate-200 rounded mb-2"></div>
            <div className="h-3 w-40 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'details') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-slate-100 rounded-xl"></div>
          <div className="h-16 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="h-32 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  // Default: table skeleton
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
      <div className="h-12 bg-slate-50 border-b border-slate-100 px-5 flex items-center gap-4">
        <div className="h-4 w-20 bg-slate-200 rounded"></div>
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
        <div className="h-4 w-24 bg-slate-200 rounded ml-auto"></div>
      </div>
      <div className="divide-y divide-slate-100 p-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 px-4 flex items-center gap-4">
            <div className="h-4 w-12 bg-slate-100 rounded"></div>
            <div className="h-4 w-40 bg-slate-100 rounded"></div>
            <div className="h-4 w-24 bg-slate-100 rounded"></div>
            <div className="h-6 w-16 bg-slate-100 rounded-full ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;
