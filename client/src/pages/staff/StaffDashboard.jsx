import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Users, ClipboardList, CheckCircle, Clock } from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name || 'Faculty / Staff'}`}
        subtitle={`Role: ${user?.role || 'STAFF'} • Campus Operations Workstation`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Active Classes" value="4" icon={Users} color="blue" />
        <StatCard title="Pending Approvals" value="3" icon={Clock} color="amber" />
        <StatCard title="Tickets Resolved" value="18" icon={CheckCircle} color="green" />
        <StatCard title="Assigned Tasks" value="7" icon={ClipboardList} color="purple" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Daily Schedule & Lectures</h3>
          <p className="text-xs text-slate-500">
            Phase 1 placeholder for faculty lecture schedules and attendance marking rosters.
          </p>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Operational Action Queue</h3>
          <p className="text-xs text-slate-500">
            Pending student leave requests, gate pass endorsements, and department notices.
          </p>
        </Card>
      </div>
    </div>
  );
}
