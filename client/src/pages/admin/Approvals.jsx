import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { StatusPill } from '../../components/common/StatusPill.jsx';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  User,
  Award,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function AdminApprovals() {
  const [approvals, setApprovals] = useState([
    {
      id: 'APR-101',
      requestType: 'CERTIFICATE',
      title: 'Bonafide Certificate (Passport Application)',
      applicant: 'Aarav Sharma',
      identifier: 'CS2023048 • 3rd Year B.Tech CSE',
      submittedAt: 'Today 09:30 AM',
      status: 'PENDING',
      details: 'Applying for regional passport office verification. Academic dues cleared.'
    },
    {
      id: 'APR-102',
      requestType: 'LEAVE',
      title: 'Academic Outstation Leave (Hackathon Attendance)',
      applicant: 'Pooja Hegde',
      identifier: 'CS2024018 • 2nd Year MCA',
      submittedAt: 'Today 10:15 AM',
      status: 'PENDING',
      details: 'Representing university at Smart India Hackathon zonal round in Bhubaneswar.'
    },
    {
      id: 'APR-103',
      requestType: 'GATE_PASS',
      title: 'Emergency Clinic Visit Gate Pass',
      applicant: 'Rohan Mehra',
      identifier: 'IT2023012 • 3rd Year IT',
      submittedAt: '1 hour ago',
      status: 'PENDING',
      details: 'Consultation appointment at Apollo Clinic for severe migraine.'
    }
  ]);

  const handleApprove = (id) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'APPROVED' } : a));
  };

  const handleReject = (id) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'REJECTED' } : a));
  };

  const handleRequestInfo = (id) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'PENDING_INFORMATION' } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Executive Approvals & Sign-off Console"
          subtitle="Authorized clearance desk for student bonafides, institutional leave, and emergency permits"
        />

        <div className="flex items-center gap-2">
          <Badge variant="purple">Pending: {approvals.filter(a => a.status === 'PENDING').length} Actions</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {approvals.map((app) => (
          <Card key={app.id} className="p-5 hover:border-slate-300 transition space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">{app.id}</span>
                  <Badge variant="default">{app.requestType}</Badge>
                  <StatusPill status={app.status} />
                  <span className="text-[10px] text-slate-400 font-medium">• Submitted {app.submittedAt}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{app.title}</h3>
                <p className="text-xs text-slate-500">
                  Applicant: <strong className="text-slate-800">{app.applicant}</strong> ({app.identifier})
                </p>
              </div>

              <div className="text-right text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 shrink-0">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Clearance Level</div>
                <div className="font-bold text-emerald-700">Dean / Warden Sign-off</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {app.details}
            </p>

            {/* Approval Decision Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Decision timestamp will be permanently logged to immutable audit trail</span>

              <div className="flex items-center gap-2">
                {app.status === 'PENDING' && (
                  <>
                    <Button size="xs" variant="secondary" onClick={() => handleRequestInfo(app.id)}>
                      <HelpCircle className="h-3.5 w-3.5 mr-1" />
                      Request Info
                    </Button>
                    <Button size="xs" variant="secondary" onClick={() => handleReject(app.id)}>
                      <XCircle className="h-3.5 w-3.5 mr-1 text-red-500" />
                      Reject
                    </Button>
                    <Button size="xs" variant="primary" onClick={() => handleApprove(app.id)}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Approve & Dispatch
                    </Button>
                  </>
                )}

                {app.status === 'APPROVED' && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>Approved & Cleared</span>
                  </span>
                )}

                {app.status === 'REJECTED' && (
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    <span>Application Rejected</span>
                  </span>
                )}

                {app.status === 'PENDING_INFORMATION' && (
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <HelpCircle className="h-4 w-4" />
                    <span>Awaiting Student Response</span>
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
