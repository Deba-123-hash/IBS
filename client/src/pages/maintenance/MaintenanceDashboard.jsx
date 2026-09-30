import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { StatusPill } from '../../components/common/StatusPill.jsx';
import {
  Wrench,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  Camera,
  MessageSquare
} from 'lucide-react';

export default function MaintenanceDashboard() {
  const [tickets, setTickets] = useState([
    {
      id: 'CMP-2026-0042',
      title: 'Bathroom pipe leakage in Room B-204',
      trade: 'PLUMBING',
      location: 'Hostel Block B • Room B-204',
      reportedBy: 'Aarav Sharma (CS2023048)',
      priority: 'HIGH',
      slaHours: '4h remaining',
      status: 'IN_PROGRESS',
      description: 'Severe water dripping from under-sink elbow joint. Needs replacement valve.'
    },
    {
      id: 'CMP-2026-0048',
      title: 'Corridor switchboard sparking',
      trade: 'ELECTRICAL',
      location: 'Hostel Block B • 3rd Floor East Wing',
      reportedBy: 'Warden Suresh Patel',
      priority: 'CRITICAL',
      slaHours: '1h 30m remaining',
      status: 'ASSIGNED',
      description: 'Main corridor MCB tripping repeatedly under geyser load.'
    },
    {
      id: 'CMP-2026-0038',
      title: 'Study table drawer jammed',
      trade: 'CARPENTRY',
      location: 'Hostel Block A • Room A-102',
      reportedBy: 'Vikram Joshi',
      priority: 'LOW',
      slaHours: 'Completed',
      status: 'RESOLVED',
      description: 'Replaced ball-bearing drawer slide channel.'
    }
  ]);

  const handleUpdateStatus = (id, newStatus) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Maintenance Workstation & Field Dispatch"
          subtitle="Work order queue, SLA countdowns, and completion verification"
        />

        <div className="flex items-center gap-2">
          <Badge variant="success">Technician: Ramesh Kumar</Badge>
          <Badge variant="default">Trade: Lead Plumbing & Works</Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Active Queue" value={tickets.filter(t => t.status !== 'RESOLVED').length} icon={Wrench} color="blue" />
        <StatCard title="Critical SLA" value="1" icon={AlertTriangle} color="danger" />
        <StatCard title="Resolved Today" value="5" icon={CheckCircle} color="green" />
        <StatCard title="Avg Turnaround" value="2.8h" icon={Clock} color="purple" />
      </div>

      {/* Assigned Tickets Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-blue-600" />
            <span>Assigned Operational Tickets</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Sorted by SLA Urgency</span>
        </div>

        <div className="space-y-3">
          {tickets.map((t) => (
            <Card key={t.id} className="p-5 hover:border-slate-300 transition-all space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-600">{t.id}</span>
                    <Badge variant={t.priority === 'CRITICAL' ? 'danger' : t.priority === 'HIGH' ? 'warning' : 'default'}>
                      {t.priority}
                    </Badge>
                    <StatusPill status={t.status} />
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {t.trade}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{t.location}</span> • Reported by: <span className="font-medium text-slate-700">{t.reportedBy}</span>
                  </p>
                </div>

                <div className="text-right text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 shrink-0">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">SLA Window</div>
                  <div className="font-bold text-red-600">{t.slaHours}</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                {t.description}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <button className="flex items-center gap-1 hover:text-blue-600 transition">
                    <Camera className="h-3.5 w-3.5" />
                    <span>Attach Photo</span>
                  </button>
                  <span>•</span>
                  <button className="flex items-center gap-1 hover:text-blue-600 transition">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Add Note</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {t.status === 'ASSIGNED' && (
                    <Button size="xs" variant="primary" onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}>
                      Accept & Start Work
                    </Button>
                  )}

                  {t.status === 'IN_PROGRESS' && (
                    <Button size="xs" variant="success" onClick={() => handleUpdateStatus(t.id, 'RESOLVED')}>
                      ✓ Mark Resolved
                    </Button>
                  )}

                  {t.status === 'RESOLVED' && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Resolution Verified</span>
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
