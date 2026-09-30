import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { StatusPill } from '../../components/common/StatusPill.jsx';
import {
  FileText,
  Search,
  Filter,
  ArrowRight,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

export default function AdminRequests() {
  const [requests, setRequests] = useState([
    { id: 'REQ-1028', type: 'CERTIFICATE', requester: 'Aarav Sharma (CS2023048)', title: 'Bonafide Certificate for Passport', department: 'Academic Section', priority: 'MEDIUM', status: 'PENDING_APPROVAL', age: '4h 21m', due: 'Today 6:00 PM' },
    { id: 'REQ-1032', type: 'GATE_PASS', requester: 'Rohan Mehra (IT2023012)', title: 'Day Outing to City Market', department: 'Hostel Affairs', priority: 'NORMAL', status: 'APPROVED', age: '1h 10m', due: 'Today 8:00 PM' },
    { id: 'REQ-1041', type: 'COMPLAINT', requester: 'Aarav Sharma (CS2023048)', title: 'Bathroom tap leaking in Room B-204', department: 'Plumbing Works', priority: 'HIGH', status: 'IN_PROGRESS', age: '1d 4h', due: 'Overdue by 2h' },
    { id: 'REQ-1045', type: 'LEAVE', requester: 'Vikram Joshi (ME2022091)', title: 'Weekend Family Visit', department: 'Hostel Affairs', priority: 'NORMAL', status: 'PENDING_APPROVAL', age: '2h 15m', due: 'Tomorrow 10:00 AM' },
    { id: 'REQ-1050', type: 'FEE_QUERY', requester: 'Pooja Hegde (CS2024018)', title: 'Semester 3 scholarship adjustment discrepancy', department: 'Finance & Accounts', priority: 'MEDIUM', status: 'UNDER_REVIEW', age: '6h 40m', due: 'Tomorrow 2:00 PM' }
  ]);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filtered = requests.filter(r => {
    const matchType = filterType === 'ALL' || r.type === filterType;
    const matchSearch = r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.requester.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleUpdateStatus = (id, newStatus) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Universal Campus Request Center"
          subtitle="Unified queue managing student applications, tickets, gate passes, and certificates"
        />

        <div className="flex items-center gap-2">
          <Badge variant="purple">Queue: {requests.length} Active Records</Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search request ID, student, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          {['ALL', 'COMPLAINT', 'GATE_PASS', 'CERTIFICATE', 'LEAVE', 'FEE_QUERY'].map((tab) => (
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
      </div>

      {/* Requests Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Age / Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{req.id}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-[10px]">
                      {req.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{req.requester}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{req.title}</td>
                  <td className="py-3 px-4 text-slate-500">{req.department}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-700">{req.age}</div>
                    <div className={`text-[10px] ${req.due.includes('Overdue') ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                      {req.due}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusPill status={req.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {req.status === 'PENDING_APPROVAL' && (
                        <>
                          <Button size="xs" variant="primary" onClick={() => handleUpdateStatus(req.id, 'APPROVED')}>
                            Approve
                          </Button>
                          <Button size="xs" variant="secondary" onClick={() => handleUpdateStatus(req.id, 'REJECTED')}>
                            Reject
                          </Button>
                        </>
                      )}
                      {req.status === 'IN_PROGRESS' && (
                        <Button size="xs" variant="success" onClick={() => handleUpdateStatus(req.id, 'RESOLVED')}>
                          Resolve
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
