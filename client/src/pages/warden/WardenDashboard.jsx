import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { StatusPill } from '../../components/common/StatusPill.jsx';
import {
  Building2,
  Users,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  Clock,
  QrCode,
  UtensilsCrossed,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WardenDashboard() {
  const [gatePasses, setGatePasses] = useState([
    { id: 'GP-2026-0042', student: 'Aarav Sharma', roll: 'CS2023048', room: 'B-204', type: 'DAY_OUTING', dest: 'Apollo Clinic', outTime: '04:30 PM', returnTime: '08:00 PM', status: 'PENDING' },
    { id: 'GP-2026-0045', student: 'Rohan Mehra', roll: 'IT2023012', room: 'B-108', type: 'NIGHT_OUT', dest: 'Home Visit', outTime: '06:00 PM', returnTime: 'Tomorrow 08:00 AM', status: 'PENDING' }
  ]);

  const [activeComplaints, setActiveComplaints] = useState([
    { id: 'HST-1028', room: 'B-204', category: 'PLUMBING', issue: 'Bathroom tap leaking for 9 days', priority: 'HIGH', status: 'SUBMITTED', assignedTo: 'Unassigned' },
    { id: 'HST-1033', room: 'B-312', category: 'ELECTRICAL', issue: 'Ceiling fan humming loudly', priority: 'MEDIUM', status: 'IN_PROGRESS', assignedTo: 'Electrical Team' }
  ]);

  const handleApproveGatePass = (id) => {
    setGatePasses(gatePasses.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
  };

  const handleRejectGatePass = (id) => {
    setGatePasses(gatePasses.map(p => p.id === id ? { ...p, status: 'REJECTED' } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Hostel Command & Residential Affairs"
          subtitle="Hostel Block B (Senior Hall of Residence) • Warden Workstation"
        />

        <div className="flex items-center gap-2">
          <Badge variant="success">Warden Live: Suresh Patel</Badge>
          <Badge variant="default">Hostel B</Badge>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Residents" value="184" icon={Users} color="blue" />
        <StatCard title="Room Occupancy" value="87%" icon={Building2} color="green" />
        <StatCard title="Pending Gate Passes" value={gatePasses.filter(p => p.status === 'PENDING').length} icon={ShieldCheck} color="purple" />
        <StatCard title="Open Grievances" value="12" icon={AlertTriangle} color="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Gate Pass Authorizations */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Pending Outing Approvals</span>
            </h3>
            <span className="text-xs font-semibold text-slate-400">Requires Sign-off</span>
          </div>

          <div className="space-y-3">
            {gatePasses.map((pass) => (
              <div key={pass.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-600">{pass.id}</span>
                    <span className="text-xs font-bold text-slate-900">{pass.student}</span>
                    <span className="text-[10px] text-slate-400">({pass.roll} • {pass.room})</span>
                  </div>
                  <StatusPill status={pass.status} />
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Destination: <strong className="text-slate-800">{pass.dest}</strong></span>
                  <span>{pass.outTime} → {pass.returnTime}</span>
                </div>

                {pass.status === 'PENDING' && (
                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-200/60">
                    <Button size="xs" variant="secondary" onClick={() => handleRejectGatePass(pass.id)}>
                      Reject
                    </Button>
                    <Button size="xs" variant="primary" onClick={() => handleApproveGatePass(pass.id)}>
                      Approve & Issue QR
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Hostel Grievances & Work Orders */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Active Facility Issues</span>
            </h3>
            <span className="text-xs font-semibold text-blue-600">SLA Tracked</span>
          </div>

          <div className="space-y-3">
            {activeComplaints.map((comp) => (
              <div key={comp.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-600">{comp.id}</span>
                    <span className="text-xs font-bold text-slate-900">Room {comp.room}</span>
                    <Badge variant={comp.priority === 'HIGH' ? 'danger' : 'warning'}>{comp.priority}</Badge>
                  </div>
                  <StatusPill status={comp.status} />
                </div>

                <p className="text-xs text-slate-600">{comp.issue}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>Trade: <strong className="text-slate-700">{comp.category}</strong></span>
                  <span>Assigned: <strong className="text-blue-600">{comp.assignedTo}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 24-Room Block Grid Matrix */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span>Block B • 2nd Floor Visual Occupancy Matrix</span>
          </h3>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span> Fully Occupied</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-blue-400"></span> 1 Bed Free</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400"></span> Maintenance</span>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 pt-2">
          {Array.from({ length: 24 }).map((_, i) => {
            const roomNo = `B-2${(i + 1).toString().padStart(2, '0')}`;
            const isMaint = i === 3;
            const isPartial = i % 5 === 0;

            return (
              <div
                key={roomNo}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition hover:shadow-xs cursor-pointer ${
                  isMaint
                    ? 'border-amber-300 bg-amber-50 text-amber-900'
                    : isPartial
                    ? 'border-blue-200 bg-blue-50 text-blue-900'
                    : 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                }`}
              >
                <div>{roomNo}</div>
                <div className="text-[10px] font-normal opacity-80 mt-0.5">
                  {isMaint ? 'Repair' : isPartial ? '1/2' : '2/2'}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
