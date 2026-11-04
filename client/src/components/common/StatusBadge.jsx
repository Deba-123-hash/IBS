import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RotateCcw,
  LogIn,
  LogOut,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

export function StatusBadge({ status, className = '' }) {
  if (!status) return null;
  const s = String(status).toUpperCase();

  let config = {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: HelpCircle,
    label: s
  };

  switch (s) {
    // Success States
    case 'SUCCESS':
    case 'VERIFIED':
    case 'APPROVED':
    case 'ACTIVE':
    case 'MATCHED':
    case 'RESOLVED':
    case 'PAID':
      config = {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        icon: CheckCircle2,
        label: s === 'SUCCESS' ? 'Verified' : s
      };
      break;

    // Warning / Pending States
    case 'PENDING':
    case 'SUBMITTED':
    case 'ASSIGNED':
    case 'IN_PROGRESS':
    case 'PENDING_REVIEW':
    case 'INSIDE':
    case 'OPEN':
      config = {
        bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
        icon: s === 'INSIDE' ? LogIn : Clock,
        label: s === 'INSIDE' ? 'Inside Campus' : s.replace('_', ' ')
      };
      break;

    // Danger / Rejected States
    case 'REJECTED':
    case 'FAILED':
    case 'CRITICAL':
    case 'HIGH':
    case 'OVERDUE':
    case 'DISCREPANCY':
      config = {
        bg: 'bg-rose-50 text-rose-800 border-rose-200/80',
        icon: s === 'CRITICAL' || s === 'HIGH' ? ShieldAlert : XCircle,
        label: s.replace('_', ' ')
      };
      break;

    // Neutral / Terminal States
    case 'REFUNDED':
    case 'CANCELLED':
    case 'EXITED':
    case 'CLOSED':
    case 'INACTIVE':
      config = {
        bg: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: s === 'REFUNDED' ? RotateCcw : (s === 'EXITED' ? LogOut : AlertTriangle),
        label: s === 'EXITED' ? 'Exited Campus' : s
      };
      break;

    default:
      config = {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: Clock,
        label: s
      };
  }

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border uppercase ${config.bg} ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}

export default StatusBadge;
