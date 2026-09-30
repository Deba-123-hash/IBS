import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import {
  TrendingUp,
  Clock,
  Wrench,
  AlertTriangle,
  Building2,
  Users,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30D');

  const requestVolumeData = [
    { date: '24 Sep', requests: 42, resolved: 38 },
    { date: '25 Sep', requests: 55, resolved: 49 },
    { date: '26 Sep', requests: 48, resolved: 45 },
    { date: '27 Sep', requests: 62, resolved: 58 },
    { date: '28 Sep', requests: 78, resolved: 65 },
    { date: '29 Sep', requests: 84, resolved: 72 },
    { date: '30 Sep', requests: 91, resolved: 80 }
  ];

  const complaintAgeingData = [
    { range: '< 1 day', count: 18, color: '#10b981' },
    { range: '1–2 days', count: 12, color: '#3b82f6' },
    { range: '2–3 days', count: 7, color: '#f59e0b' },
    { range: '3–7 days', count: 6, color: '#f97316' },
    { range: '7–14 days', count: 3, color: '#ef4444' },
    { range: '14+ days', count: 2, color: '#991b1b' }
  ];

  const departmentWorkloadData = [
    { name: 'Plumbing', active: 23, resolved: 45 },
    { name: 'Electrical', active: 14, resolved: 38 },
    { name: 'Carpentry', active: 8, resolved: 22 },
    { name: 'Internet/IT', active: 6, resolved: 31 },
    { name: 'Cleaning', active: 4, resolved: 50 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Campus Intelligence & Telemetry Command Center"
          subtitle="Real-time multi-dimensional operational metrics, SLA compliance, and recurring anomaly detection"
        />

        {/* Date Range Selector & Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-2xs font-semibold">
            {['TODAY', '7D', '30D', 'MONTH'].map((d) => (
              <button
                key={d}
                onClick={() => setDateRange(d)}
                className={`px-3 py-1 rounded-lg transition ${
                  dateRange === d ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <Button size="sm" variant="secondary" onClick={() => alert('CSV export initiated for current filtered view.')}>
            <Download className="h-3.5 w-3.5 mr-1" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <StatCard title="Total Students" value="2,450" icon={Users} color="blue" />
        <StatCard title="Active Requests" value="126" icon={TrendingUp} color="purple" />
        <StatCard title="Open Complaints" value="48" icon={Wrench} color="amber" />
        <StatCard title="SLA Breaches" value="5" icon={AlertTriangle} color="danger" />
        <StatCard title="Avg Turnaround" value="6.2h" icon={Clock} color="green" />
        <StatCard title="SLA Compliance" value="87.4%" icon={ShieldCheck} color="blue" />
      </div>

      {/* Operational Critical Alerts Panel */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>Operational Attention Signals (Action Required)</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white/90 rounded-xl border border-amber-200 space-y-1">
            <span className="font-bold text-red-600">5 Overdue Tickets</span>
            <p className="text-slate-600 text-[11px]">Plumbing tickets in Hostel B exceeding 24h SLA. Lead technician notified.</p>
          </div>
          <div className="p-3 bg-white/90 rounded-xl border border-amber-200 space-y-1">
            <span className="font-bold text-amber-700">Recurring Pattern Warning</span>
            <p className="text-slate-600 text-[11px]">23 plumbing complaints recorded in Block B over 30 days indicating riser pipe fault.</p>
          </div>
          <div className="p-3 bg-white/90 rounded-xl border border-amber-200 space-y-1">
            <span className="font-bold text-blue-700">Approval Backlog</span>
            <p className="text-slate-600 text-[11px]">12 certificate applications pending review for &gt; 18 hours in Registrar office.</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Request Volume Timeline */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>Campus Operational Workload Volume (Last 7 Days)</span>
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={requestVolumeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="requests" stroke="#2563eb" strokeWidth={2.5} name="Lodged" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2.5} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Complaint Ageing Buckets */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <span>Complaint Ageing Distribution (MTTR Tracking)</span>
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={complaintAgeingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department Workload Distribution */}
        <Card className="p-5 space-y-3 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-emerald-600" />
            <span>Department & Maintenance Trade Workload Allocation</span>
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={departmentWorkloadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="active" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Active / In Progress" />
                <Bar dataKey="resolved" fill="#10b981" radius={[6, 6, 0, 0]} name="Resolved This Month" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* AI Recurring Anomaly Detector */}
      <Card className="p-6 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border border-blue-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Deterministic Cluster & AI Recurring Issue Intelligence
              </h3>
              <p className="text-xs text-slate-500">Autonomous pattern recognition on 30-day ticket density</p>
            </div>
          </div>

          <Badge variant="purple">AI Model: Gemini 1.5 Flash</Badge>
        </div>

        <div className="p-4 bg-white rounded-xl border border-blue-200/60 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              Cluster #01: Residential Block B Riser Plumbing Concentration
            </span>
            <span className="text-xs font-bold text-red-600">23 Tickets • 14 Rooms</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            AI Synthesis: Recurring water leakage pattern observed across 14 independent rooms in Hostel B (Floors 2 & 3). Frequency indicates systemic main distribution riser pipe pressure failure rather than isolated fixture wear. Recommended preventative overhaul.
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Primary Category: <strong className="text-slate-700">PLUMBING</strong></span>
            <span>Est. Preventive ROI: <strong className="text-emerald-600">₹45,000 / 92 hours saved</strong></span>
          </div>
        </div>
      </Card>
    </div>
  );
}
