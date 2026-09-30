import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import {
  Activity,
  Users,
  Wrench,
  Clock,
  AlertTriangle,
  QrCode,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [recurringIssues, setRecurringIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [oRes, rRes] = await Promise.all([
          apiClient.get('/analytics/overview'),
          apiClient.get('/ai/recurring-issues')
        ]);
        setOverview(oRes.data);
        setRecurringIssues(rRes.data.clusters || []);
      } catch (err) {
        console.warn('Admin analytics fallback', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const kpi = overview?.kpi || {
    totalStudents: 2450,
    staffOnDuty: 148,
    openComplaints: 12,
    overdueComplaints: 2,
    avgResolutionHours: 4.2,
    todayGatePasses: 45
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Executive Telemetry
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Campus Operations Command Center
          </h1>
          <p className="text-xs text-slate-500">Live operational oversight across residential halls, academics, and gates</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-slate-700">Governance Level: Campus Dean</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Enrolled Students</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{kpi.totalStudents}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">99.4% Onboarded</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Staff on Duty</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{kpi.staffOnDuty}</div>
          <span className="text-[10px] text-blue-600 font-semibold">Active Roster</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Open Grievances</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{kpi.openComplaints}</div>
          <span className="text-[10px] text-slate-400">All Trades</span>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 shadow-xs">
          <span className="text-xs font-bold text-red-900">SLA Breaches</span>
          <div className="text-2xl font-black text-red-600 mt-1">{kpi.overdueComplaints}</div>
          <span className="text-[10px] text-red-700 font-semibold">&gt; 24h Unresolved</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Avg MTTR</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{kpi.avgResolutionHours}h</div>
          <span className="text-[10px] text-emerald-600 font-semibold">Fast Turnaround</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Today's Exits</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{kpi.todayGatePasses}</div>
          <span className="text-[10px] text-slate-400">QR Verified</span>
        </div>
      </div>

      {/* AI Recurring Issue Intelligence Highlight Card */}
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span>AI Facility Intelligence: Systemic Recurring Failure Detected</span>
          </div>
          <span className="rounded-full bg-red-100 text-red-700 px-2.5 py-0.5 text-[10px] font-bold">
            HIGH SEVERITY
          </span>
        </div>

        {recurringIssues.map((clust) => (
          <div key={clust.clusterId} className="rounded-xl bg-white p-4 border border-amber-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{clust.location} • {clust.category}</span>
              <span className="font-mono text-slate-500 text-[11px]">{clust.clusterId}</span>
            </div>
            <p className="text-slate-700 leading-relaxed font-medium">
              {clust.summary}
            </p>
            <div className="text-[11px] text-slate-500">
              <strong>Affected Rooms:</strong> {clust.affectedRooms?.join(', ') || '301, 304, 308, 312'} ({clust.complaintCount} complaints within {clust.timeSpanDays} days)
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-900 text-[11px] font-medium border border-amber-200">
              <strong>Recommended Engineering Action:</strong> {clust.suggestedAction}
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Breakdown Section */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Complaints by Category Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">Grievances by Category</h2>
          <div className="space-y-3">
            {(overview?.complaintsByCategory || [
              { category: 'Plumbing', count: 18, percentage: 38 },
              { category: 'Electrical', count: 12, percentage: 25 },
              { category: 'Internet / Wi-Fi', count: 8, percentage: 17 },
              { category: 'Cleaning & Janitorial', count: 6, percentage: 12 },
              { category: 'Furniture / Carpentry', count: 4, percentage: 8 }
            ]).map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{item.category}</span>
                  <span>{item.count} tickets ({item.percentage}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complaint Ageing Matrix */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">Complaint Ageing & SLA Compliance</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
              <span className="text-slate-500 block text-[11px]">0 - 12 Hours</span>
              <span className="text-2xl font-bold text-emerald-600">7</span>
              <p className="text-[10px] text-slate-400 mt-1">Within first response SLA</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
              <span className="text-slate-500 block text-[11px]">12 - 24 Hours</span>
              <span className="text-2xl font-bold text-blue-600">3</span>
              <p className="text-[10px] text-slate-400 mt-1">Parts ordered</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
              <span className="text-slate-500 block text-[11px]">24 - 48 Hours</span>
              <span className="text-2xl font-bold text-amber-600">2</span>
              <p className="text-[10px] text-slate-400 mt-1">Approaching breach</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
              <span className="text-red-700 block text-[11px] font-bold">&gt; 48 Hours</span>
              <span className="text-2xl font-black text-red-600">0</span>
              <p className="text-[10px] text-red-600 mt-1">Zero critical breaches</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
