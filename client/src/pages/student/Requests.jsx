import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { StatusPill } from '../../components/common/StatusPill.jsx';
import {
  FileText,
  Calendar,
  Shield,
  Award,
  AlertTriangle,
  UserCheck,
  Plus,
  Clock,
  CheckCircle,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function Requests() {
  const [filterType, setFilterType] = useState('ALL');

  const initialRequests = [
    {
      id: 'REQ-1028',
      type: 'CERTIFICATE',
      title: 'Bonafide Certificate for Passport',
      submittedDate: '29 Sep 2026',
      status: 'APPROVED',
      department: 'Academic Section',
      timeline: [
        { label: 'Submitted', time: '29 Sep 09:30 AM', done: true },
        { label: 'Under Review', time: '29 Sep 11:15 AM', done: true },
        { label: 'Approved & Digitally Signed', time: '29 Sep 02:40 PM', done: true }
      ]
    },
    {
      id: 'REQ-1032',
      type: 'GATE_PASS',
      title: 'Day Outing to Apollo Clinic',
      submittedDate: '29 Sep 2026',
      status: 'APPROVED',
      department: 'Hostel Affairs',
      timeline: [
        { label: 'Applied', time: '29 Sep 01:20 PM', done: true },
        { label: 'Warden Verified', time: '29 Sep 01:45 PM', done: true },
        { label: 'Active Dynamic QR', time: 'Ready for checkpoint', done: true }
      ]
    },
    {
      id: 'REQ-1041',
      type: 'COMPLAINT',
      title: 'Bathroom tap leakage in Room B-204',
      submittedDate: '28 Sep 2026',
      status: 'IN_PROGRESS',
      department: 'Plumbing Works',
      timeline: [
        { label: 'Grievance Lodged', time: '28 Sep 03:00 PM', done: true },
        { label: 'AI Triaged: HIGH', time: '28 Sep 03:01 PM', done: true },
        { label: 'Assigned to Ramesh (Technician)', time: '29 Sep 09:15 AM', done: true },
        { label: 'Replacement Valve Ordered', time: 'In Progress', done: false }
      ]
    },
    {
      id: 'REQ-1045',
      type: 'LEAVE',
      title: 'Weekend Family Visit',
      submittedDate: '30 Sep 2026',
      status: 'PENDING',
      department: 'Hostel Warden',
      timeline: [
        { label: 'Application Submitted', time: '30 Sep 10:10 AM', done: true },
        { label: 'Parental Consent Confirmation', time: 'Awaiting Call', done: false },
        { label: 'Hostel Gate Sign-off', time: 'Pending', done: false }
      ]
    }
  ];

  const filtered = filterType === 'ALL'
    ? initialRequests
    : initialRequests.filter(r => r.type === filterType);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'LEAVE': return <Calendar className="h-4 w-4 text-emerald-600" />;
      case 'GATE_PASS': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'CERTIFICATE': return <Award className="h-4 w-4 text-purple-600" />;
      case 'COMPLAINT': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'VISITOR': return <UserCheck className="h-4 w-4 text-teal-600" />;
      default: return <FileText className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Universal Request & Application Desk"
          subtitle="Single transparent workflow hub replacing fragmented office registers and WhatsApp approvals"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/student/leave">
            <Button size="sm" variant="secondary">
              <Calendar className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              Apply Leave
            </Button>
          </Link>
          <Link to="/student/gate-passes">
            <Button size="sm" variant="secondary">
              <Shield className="h-3.5 w-3.5 mr-1 text-blue-600" />
              Gate Pass
            </Button>
          </Link>
          <Link to="/student/certificates">
            <Button size="sm" variant="secondary">
              <Award className="h-3.5 w-3.5 mr-1 text-purple-600" />
              Certificate
            </Button>
          </Link>
          <Link to="/student/complaints">
            <Button size="sm" variant="primary">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Report Issue
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['ALL', 'COMPLAINT', 'GATE_PASS', 'CERTIFICATE', 'LEAVE'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
              filterType === tab
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Requests Timeline Cards */}
      <div className="space-y-4">
        {filtered.map((req) => (
          <Card key={req.id} className="p-5 hover:border-slate-300 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                    {getTypeIcon(req.type)}
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500">{req.id}</span>
                  <StatusPill status={req.status} />
                  <span className="text-[10px] text-slate-400 font-medium">• Submitted {req.submittedDate}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{req.title}</h3>
                <p className="text-xs text-slate-500">Handling Department: <span className="font-semibold text-slate-700">{req.department}</span></p>
              </div>

              {/* Step Timeline */}
              <div className="flex items-center gap-2 overflow-x-auto py-2">
                {req.timeline.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <div className="flex flex-col items-center text-center min-w-[90px]">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        step.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {step.done ? '✓' : idx + 1}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 mt-1">{step.label}</span>
                      <span className="text-[9px] text-slate-400">{step.time}</span>
                    </div>
                    {idx < req.timeline.length - 1 && (
                      <div className={`h-0.5 w-6 sm:w-10 ${step.done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
