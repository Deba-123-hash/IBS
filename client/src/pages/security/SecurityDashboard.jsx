import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { StatusPill } from '../../components/common/StatusPill.jsx';
import {
  ShieldCheck,
  QrCode,
  Users,
  Clock,
  ArrowRight,
  Search,
  CheckCircle,
  LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SecurityDashboard() {
  const [visitors, setVisitors] = useState([
    { id: 'VIS-2026-004', name: 'Manoj Sharma', relation: 'Father of Aarav Sharma (CS2023048)', phone: '+91 94370 12345', status: 'CHECKED_IN', checkInTime: '02:15 PM', checkOutTime: null },
    { id: 'VIS-2026-009', name: 'Sunita Sharma', relation: 'Mother of Aarav Sharma (CS2023048)', phone: '+91 94370 12346', status: 'CHECKED_IN', checkInTime: '02:15 PM', checkOutTime: null },
    { id: 'VIS-2026-012', name: 'Prakash Rao', relation: 'Vendor / Aquaguard Service', phone: '+91 98610 98765', status: 'APPROVED', checkInTime: null, checkOutTime: null }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const handleCheckIn = (id) => {
    setVisitors(visitors.map(v => v.id === id ? { ...v, status: 'CHECKED_IN', checkInTime: 'Just now' } : v));
  };

  const handleCheckOut = (id) => {
    setVisitors(visitors.map(v => v.id === id ? { ...v, status: 'CHECKED_OUT', checkOutTime: 'Just now' } : v));
  };

  const filtered = visitors.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Campus Security & Gate Control Post"
          subtitle="Main Entrance Checkpoint #1 • Digital Entry Logs & QR Verification"
        />

        <div className="flex items-center gap-2">
          <Link to="/security/gate-verification">
            <Button size="sm" variant="primary">
              <QrCode className="h-4 w-4 mr-1.5" />
              <span>Launch QR Scanner Terminal</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Inside Campus" value={visitors.filter(v => v.status === 'CHECKED_IN').length} icon={Users} color="green" />
        <StatCard title="Expected Today" value="8" icon={Clock} color="blue" />
        <StatCard title="Gate Passes Cleared" value="45" icon={ShieldCheck} color="purple" />
        <StatCard title="Total Completed" value="38" icon={CheckCircle} color="slate" />
      </div>

      {/* Visitor Checkpoint Registry */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Active & Expected Visitor Manifest</span>
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search visitor or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((v) => (
            <div key={v.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-600">{v.id}</span>
                  <span className="text-sm font-bold text-slate-900">{v.name}</span>
                  <StatusPill status={v.status} />
                </div>
                <p className="text-xs text-slate-500">{v.relation}</p>
                <p className="text-xs font-mono text-slate-600">Phone: {v.phone}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {v.status === 'APPROVED' && (
                  <Button size="xs" variant="primary" onClick={() => handleCheckIn(v.id)}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Record Entry
                  </Button>
                )}

                {v.status === 'CHECKED_IN' && (
                  <Button size="xs" variant="secondary" onClick={() => handleCheckOut(v.id)}>
                    <LogOut className="h-3.5 w-3.5 mr-1 text-amber-600" />
                    Record Exit
                  </Button>
                )}

                {v.status === 'CHECKED_OUT' && (
                  <span className="text-xs text-slate-400 font-medium">Completed Departure</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
