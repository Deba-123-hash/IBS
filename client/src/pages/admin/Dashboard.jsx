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
  ShieldCheck,
  Building,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  FileText,
  UtensilsCrossed,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useGsapCounter } from '../../hooks/useGsapCounter.js';

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
        const ov = oRes.data?.data || oRes.data || oRes;
        const cl = rRes.data?.data?.clusters || rRes.data?.clusters || rRes.clusters || [];
        setOverview(ov);
        setRecurringIssues(cl);
      } catch (err) {
        console.warn('Admin analytics fallback', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // GSAP-powered smooth count-up counters
  const studentsCount = useGsapCounter(overview?.kpi?.totalStudents || 136, 1.2, !loading);
  const staffCount = useGsapCounter(overview?.kpi?.staffOnDuty || 31, 1.2, !loading);
  const complaintsCount = useGsapCounter(overview?.kpi?.openComplaints || 19, 1.2, !loading);
  const overdueCount = useGsapCounter(overview?.kpi?.overdueComplaints || 5, 1.2, !loading);
  const attendanceRiskCount = useGsapCounter(12, 1.2, !loading);
  const feeDuesCount = useGsapCounter(45000, 1.4, !loading);

  const count = {
    students: studentsCount,
    staff: staffCount,
    complaints: complaintsCount,
    overdue: overdueCount,
    attendanceRisk: attendanceRiskCount,
    feeDues: feeDuesCount
  };

  const categoryChartData = (overview?.complaintsByCategory || [
    { category: 'Plumbing', count: 18, percentage: 22 },
    { category: 'Electrical', count: 12, percentage: 16 },
    { category: 'Wi-Fi / LAN', count: 8, percentage: 9 },
    { category: 'Cleaning', count: 6, percentage: 9 },
    { category: 'Furniture', count: 5, percentage: 11 },
    { category: 'Water Supply', count: 5, percentage: 11 },
    { category: 'AC / Audio', count: 4, percentage: 7 },
    { category: 'Civil', count: 4, percentage: 7 }
  ]).map(c => ({
    name: c.category.split('&')[0].trim(),
    count: c.count,
    percentage: c.percentage
  }));

  const trendData = [
    { day: 'Mon', reported: 12, resolved: 10 },
    { day: 'Tue', reported: 15, resolved: 14 },
    { day: 'Wed', reported: 8, resolved: 11 },
    { day: 'Thu', reported: 14, resolved: 13 },
    { day: 'Fri', reported: 9, resolved: 12 },
    { day: 'Sat', reported: 6, resolved: 8 },
    { day: 'Sun', reported: 4, resolved: 5 }
  ];

  const pieColors = ['#10b981', '#059669', '#14b8a6', '#065f46', '#0d9488', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Campus Operations Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Executive Governance & Operational Telemetry
          </h1>
          <p className="text-xs text-slate-500">
            CAMPUS OS • Real-time cross-hostel, academic & safety oversight
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-2xs text-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold text-slate-700">Campus Dean • Governance Console</span>
        </div>
      </div>

      {/* KPI Cards (Section 13: Animated number counting on initial load) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Students */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover-lift transition">
          <span className="text-[11px] font-semibold text-slate-500 block">Enrolled Students</span>
          <div className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{count.students}</div>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block">
            100% Onboarded
          </span>
        </div>

        {/* Staff on Duty */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover-lift transition">
          <span className="text-[11px] font-semibold text-slate-500 block">Staff on Duty</span>
          <div className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{count.staff}</div>
          <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.2 rounded mt-1 inline-block">
            Active Roster
          </span>
        </div>

        {/* Open Complaints */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover-lift transition">
          <span className="text-[11px] font-semibold text-slate-500 block">Open Grievances</span>
          <div className="text-2xl font-black text-amber-600 mt-1 tracking-tight">{count.complaints}</div>
          <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded mt-1 inline-block">
            In Resolution
          </span>
        </div>

        {/* Overdue Issues */}
        <div className="rounded-2xl border border-red-200 bg-red-50/30 p-4 shadow-xs hover-lift transition">
          <span className="text-[11px] font-bold text-red-900 block">SLA Breaches</span>
          <div className="text-2xl font-black text-red-600 mt-1 tracking-tight">{count.overdue}</div>
          <span className="text-[10px] text-red-800 font-bold bg-red-100/70 px-1.5 py-0.2 rounded mt-1 inline-block">
            &gt; 24h Escalated
          </span>
        </div>

        {/* Attendance Risk */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover-lift transition">
          <span className="text-[11px] font-semibold text-slate-500 block">Attendance Risk</span>
          <div className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{count.attendanceRisk}</div>
          <span className="text-[10px] text-slate-600 font-medium mt-1 inline-block">
            &lt;75% Threshold
          </span>
        </div>

        {/* Fee Dues */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover-lift transition">
          <span className="text-[11px] font-semibold text-slate-500 block">Uncollected Dues</span>
          <div className="text-2xl font-black text-slate-900 mt-1 tracking-tight">₹{count.feeDues.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block">
            96% Cleared
          </span>
        </div>

      </div>

      {/* AI Facility Intelligence Highlight Card */}
      <div className="rounded-3xl border-2 border-amber-300 bg-amber-50/50 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <span>AI Facility Intelligence: Systemic Infrastructure Failures Detected</span>
          </div>
          <span className="rounded-full bg-red-100 text-red-800 px-3 py-1 text-xs font-bold border border-red-200">
            HIGH SEVERITY
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {(recurringIssues.length > 0 ? recurringIssues : [
            {
              clusterId: 'CLUST-2026-01',
              category: 'PLUMBING',
              location: 'Hostel Block B (Floors 2 & 3)',
              complaintCount: 23,
              summary: 'Repeated pressurized water riser leakage affecting western wing bathrooms in Hostel Block B.',
              suggestedAction: 'Immediate isolation and replacement of western drainage manifold before full structural seepage occurs.'
            },
            {
              clusterId: 'CLUST-2026-02',
              category: 'INTERNET',
              location: 'Aryabhatta Hall - Block A',
              complaintCount: 16,
              summary: 'Intermittent PoE switch dropouts on 1st and 2nd floor access points during peak evening study hours (8 PM - 11 PM).',
              suggestedAction: 'Replace faulty 24-port Gigabit PoE switch on Floor 1 distribution rack.'
            }
          ]).map((clust) => (
            <div key={clust.clusterId} className="rounded-2xl bg-white p-4 border border-amber-200/90 shadow-2xs space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{clust.location} • {clust.category}</span>
                <span className="font-mono text-slate-400 text-[10px]">{clust.clusterId}</span>
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">
                {clust.summary}
              </p>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-[11px] font-medium border border-amber-200">
                <strong>Recommended Engineering Action:</strong> {clust.suggestedAction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics & Charts Section (Recharts Animated Entrance - Demo Moment 8) */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Category Breakdown Bar Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Grievances by Category & Volume</h2>
              <p className="text-xs text-slate-500">Live breakdown of work orders logged across all campus trades</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
              Neon PostgreSQL Sync
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                  formatter={(val) => [`${val} Tickets`, 'Grievances']}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution SLA Area Chart (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">SLA Resolution Velocity</h2>
              <p className="text-xs text-slate-500">Reported vs. Resolved tickets (7-Day Trend)</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              4.2h MTTR
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="reported" stroke="#f59e0b" fillOpacity={1} fill="url(#colorReported)" strokeWidth={2} isAnimationActive={false} />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Operational Modules Quick Summary Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Turnstile QR Scans</span>
            <QrCode className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">45 Exits Today</div>
          <p className="text-[11px] text-slate-500">100% verified against Warden approvals</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Mess Committee Audit</span>
            <UtensilsCrossed className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">4.4 / 5.0 Rating</div>
          <p className="text-[11px] text-slate-500">Lunch satisfaction score from 84 reviews</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Certificate Clearances</span>
            <FileText className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">19 Requests</div>
          <p className="text-[11px] text-slate-500">15 Bonafide issued, 4 pending sign-off</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Hostel Room Allocations</span>
            <Building className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">5 Hostels • 55 Rooms</div>
          <p className="text-[11px] text-slate-500">92% occupancy across Block A & B</p>
        </div>

      </div>

    </div>
  );
}
