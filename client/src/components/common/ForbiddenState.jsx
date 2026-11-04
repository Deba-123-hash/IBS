import React from 'react';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ForbiddenState({
  title = 'Access Restricted',
  message = "You don't have permission to perform this action or view this resource under your current role.",
  requiredPermission
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-14 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-lg mx-auto my-8">
      <div className="p-4 mb-4 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
        <ShieldX className="h-10 w-10 stroke-[1.75]" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h2>
      <p className="text-xs text-slate-600 max-w-sm mb-4 leading-relaxed">{message}</p>
      
      {requiredPermission && (
        <div className="mb-6 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700">
          Required permission: <span className="font-semibold text-emerald-800">{requiredPermission}</span>
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Previous Page</span>
      </button>
    </div>
  );
}

export default ForbiddenState;
