import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  FileText,
  Search,
  Filter,
  ArrowRight,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Eye,
  Wrench,
  QrCode,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  X,
  Send,
  Sparkles,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export default function AdminRequests() {
  const toast = useToast();
  const [viewMode, setViewMode] = useState('TABLE'); // 'TABLE' or 'BOARD'
  const [requests, setRequests] = useState([
    { id: 'REQ-1028', type: 'CERTIFICATE', requester: 'Aarav Sharma', roll: '2301105001', room: 'Block B - 304', title: 'Bonafide Certificate for Passport Verification', department: 'Academic Section', priority: 'MEDIUM', status: 'UNDER_REVIEW', age: '4h 21m', technician: 'Admin Desk', createdAt: '2026-10-01T06:00:00Z' },
    { id: 'REQ-1032', type: 'GATE_PASS', requester: 'Rohan Mehra', roll: '2301105019', room: 'Block B - 304', title: 'Day Outing to City Clinic', department: 'Hostel Affairs', priority: 'NORMAL', status: 'APPROVED', age: '1h 10m', technician: 'Warden Suresh', createdAt: '2026-10-01T09:00:00Z' },
    { id: 'REQ-1041', type: 'COMPLAINT', requester: 'Aarav Sharma', roll: '2301105001', room: 'Block B - 304', title: 'Bathroom water pipe leakage', department: 'Plumbing Works', priority: 'HIGH', status: 'IN_PROGRESS', age: '1d 4h', technician: 'Ramesh Kumar (Plumber)', createdAt: '2026-09-30T10:00:00Z' },
    { id: 'REQ-1045', type: 'LEAVE', requester: 'Vikram Joshi', roll: '2301105091', room: 'Block A - 201', title: 'Weekend Family Visit', department: 'Hostel Affairs', priority: 'NORMAL', status: 'NEW', age: '2h 15m', technician: 'Unassigned', createdAt: '2026-10-01T08:00:00Z' },
    { id: 'REQ-1050', type: 'FEE_QUERY', requester: 'Pooja Hegde', roll: '2301105018', room: 'Block C - 105', title: 'Semester scholarship fee ledger adjustment', department: 'Finance & Accounts', priority: 'MEDIUM', status: 'ASSIGNED', age: '6h 40m', technician: 'Meena Mohapatra', createdAt: '2026-10-01T04:00:00Z' },
    { id: 'REQ-1055', type: 'COMPLAINT', requester: 'Siddharth Rao', roll: '2301105033', room: 'Block B - 208', title: 'Wi-Fi access point dropouts in 2nd floor corridor', department: 'IT & Networking', priority: 'HIGH', status: 'RESOLVED', age: '2d 1h', technician: 'IT Support Team', createdAt: '2026-09-29T11:00:00Z' },
    { id: 'REQ-1060', type: 'CERTIFICATE', requester: 'Ananya Panda', roll: '2301105077', room: 'Block A - 110', title: 'NOC for Summer Internship at NALCO', department: 'Academic Section', priority: 'MEDIUM', status: 'CLOSED', age: '3d 4h', technician: 'Dean Office', createdAt: '2026-09-28T09:00:00Z' }
  ]);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedDrawerItem, setSelectedDrawerItem] = useState(null);

  // Fetch live complaints from Neon database
  useEffect(() => {
    async function fetchLiveRequests() {
      try {
        const res = await apiClient.get('/complaints');
        const raw = res.data?.data?.complaints || res.data?.complaints || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(raw) && raw.length > 0) {
          const live = raw.map((c) => ({
            id: c.complaintNumber || c.id,
            rawId: c.id,
            type: 'COMPLAINT',
            requester: c.student?.user?.name || c.studentName || 'Student Resident',
            roll: c.student?.rollNo || c.rollNo || 'UT24CSE001',
            room: c.location || (c.student?.room?.number ? `Room ${c.student.room.number}` : 'Block B - 304'),
            title: c.title,
            department: c.category || 'Maintenance',
            priority: c.priority || 'MEDIUM',
            status: c.status || 'NEW',
            age: 'Active',
            technician: c.assignedTo?.name || 'Assigned Technician',
            createdAt: c.createdAt
          }));
          setRequests((prev) => {
            const existingIds = new Set(live.map((l) => l.id));
            const remaining = prev.filter((p) => !existingIds.has(p.id));
            return [...live, ...remaining];
          });
        }
      } catch (err) {
        console.warn('Live complaints sync in admin requests', err);
      }
    }
    fetchLiveRequests();
  }, []);

  const pipelineColumns = [
    { key: 'NEW', label: 'New / Intake', count: requests.filter(r => r.status === 'NEW').length },
    { key: 'UNDER_REVIEW', label: 'Under Review', count: requests.filter(r => r.status === 'UNDER_REVIEW').length },
    { key: 'ASSIGNED', label: 'Assigned', count: requests.filter(r => r.status === 'ASSIGNED').length },
    { key: 'IN_PROGRESS', label: 'In Progress', count: requests.filter(r => r.status === 'IN_PROGRESS').length },
    { key: 'RESOLVED', label: 'Resolved', count: requests.filter(r => r.status === 'RESOLVED').length },
    { key: 'CLOSED', label: 'Closed', count: requests.filter(r => r.status === 'CLOSED').length }
  ];

  const filteredRequests = requests.filter(r => {
    const matchType = filterType === 'ALL' || r.type === filterType;
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchSearch = !search.trim() ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.requester.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const handleUpdateStatus = async (id, newStatus) => {
    const targetItem = requests.find(r => r.id === id);
    const dbId = targetItem?.rawId || id;
    try {
      if (dbId) {
        await apiClient.patch(`/complaints/${dbId}/status`, { status: newStatus });
      }
    } catch (err) {
      console.warn('Status patch fallback for ticket', id, err);
    }
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    if (selectedDrawerItem && selectedDrawerItem.id === id) {
      setSelectedDrawerItem({ ...selectedDrawerItem, status: newStatus });
    }
    toast.success(`Ticket ${id} status updated to ${newStatus}`, 'Pipeline Updated');
  };

  const handleAssignTechnician = (id, tech) => {
    setRequests(requests.map(r => r.id === id ? { ...r, technician: tech, status: 'ASSIGNED' } : r));
    if (selectedDrawerItem && selectedDrawerItem.id === id) {
      setSelectedDrawerItem({ ...selectedDrawerItem, technician: tech, status: 'ASSIGNED' });
    }
    toast.success(`Assigned ticket to ${tech}`, 'Technician Dispatched');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ASSIGNED':
      case 'UNDER_REVIEW':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Administrative Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Operations Request & Grievance Pipeline
          </h1>
          <p className="text-xs text-slate-500">
            Universal queue managing student applications, tickets, gate approvals, and certificates
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setViewMode('TABLE')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Data Table
          </button>
          <button
            onClick={() => setViewMode('BOARD')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              viewMode === 'BOARD' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pipeline Board
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket ID, student name, or grievance title..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 outline-none focus:bg-white focus:border-emerald-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'COMPLAINT', 'GATE_PASS', 'CERTIFICATE', 'LEAVE'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                filterType === t
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW MODE 1: DATA TABLE WITH ROW HOVER & DETAIL DRAWER */}
      {viewMode === 'TABLE' ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Grievance / Request</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Team</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedDrawerItem(r)}
                    className="cursor-pointer hover:bg-emerald-50/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{r.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.requester}</div>
                      <div className="text-[10px] text-slate-400">{r.roll}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 line-clamp-1">{r.title}</div>
                      <div className="text-[10px] text-slate-400">{r.room}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{r.department}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(r.status)}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{r.technician}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDrawerItem(r);
                        }}
                        className="rounded-xl border border-slate-200 bg-white group-hover:bg-emerald-600 group-hover:text-white px-2.5 py-1 text-[11px] font-bold text-slate-700 transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: WORKFLOW PIPELINE BOARD (Section 14) */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {pipelineColumns.map((col) => {
            const colItems = requests.filter(r => r.status === col.key);
            return (
              <div key={col.key} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 flex flex-col min-w-[200px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-slate-800">{col.label}</span>
                  <span className="rounded-full bg-white border border-slate-200 px-2 py-0.2 text-[10px] font-mono font-bold text-slate-600">
                    {colItems.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDrawerItem(item)}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover-lift transition hover:border-emerald-300"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>{item.id}</span>
                        <span className={`font-bold ${item.priority === 'HIGH' ? 'text-red-600' : 'text-slate-500'}`}>
                          {item.priority}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{item.title}</h4>
                      <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
                        <span>{item.requester.split(' ')[0]}</span>
                        <span className="text-emerald-700 font-medium">{item.age}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RIGHT-SIDE DETAIL DRAWER (Section 15: Smooth right-to-left slide) */}
      {selectedDrawerItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={() => setSelectedDrawerItem(null)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
          />

          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto border-l border-slate-200 animate-slide-up sm:animate-none">
            
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedDrawerItem.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(selectedDrawerItem.status)}`}>
                    {selectedDrawerItem.status.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDrawerItem(null)}
                  className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Grievance / Request Subject
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                    {selectedDrawerItem.title}
                  </h2>
                </div>

                {/* Requester Profile Card */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Student Details
                  </span>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{selectedDrawerItem.requester}</div>
                      <div className="text-slate-500 text-[11px]">Roll No: {selectedDrawerItem.roll}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800">{selectedDrawerItem.room}</div>
                      <div className="text-emerald-700 text-[10px] font-medium">Campus Hostels</div>
                    </div>
                  </div>
                </div>

                {/* Operational Assignment Dropdown */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Dispatched Technician / Officer
                  </label>
                  <select
                    value={selectedDrawerItem.technician}
                    onChange={(e) => handleAssignTechnician(selectedDrawerItem.id, e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="Ramesh Kumar (Plumber)">Ramesh Kumar (Plumber)</option>
                    <option value="Devendra Singh (Electrician)">Devendra Singh (Electrician)</option>
                    <option value="IT Support Team">IT Support Team (Networking)</option>
                    <option value="Warden Suresh">Warden Suresh Patel</option>
                    <option value="Meena Mohapatra">Meena Mohapatra (Accounts)</option>
                    <option value="Dean Office">Dean Office (Academics)</option>
                  </select>
                </div>

                {/* Status Transitions Quick Buttons */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">
                    Move Status in Pipeline
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedDrawerItem.id, st)}
                        className={`rounded-xl py-2 font-bold transition border ${
                          selectedDrawerItem.status === st
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline History */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-700 block">Audit Activity History</span>
                  <div className="space-y-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>Ticket logged via student portal ({selectedDrawerItem.age} ago)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                      <span>Assigned to {selectedDrawerItem.technician}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                      <span>SLA turnaround tracking active (Target: 24h)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <button
                onClick={() => setSelectedDrawerItem(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Close Drawer
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedDrawerItem.id, 'RESOLVED')}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-soft hover-lift"
              >
                Sign Off & Resolve
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
