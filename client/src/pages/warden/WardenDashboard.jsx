import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { wardenApi } from '../../services/wardenApi.js';
import apiClient from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import { StatusPill } from '../../components/common/StatusPill.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import {
  Building2,
  Users,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  Clock,
  QrCode,
  Layers,
  Sliders,
  CalendarDays,
  Wrench,
  Search,
  Filter,
  UserCheck,
  PlusCircle,
  XCircle,
  UserPlus,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export default function WardenDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Determine active tab from URL path
  const getTabFromPath = (pathname) => {
    if (pathname.includes('/warden/hostels') || pathname.includes('/warden/rooms')) return 'rooms';
    if (pathname.includes('/warden/allocations') || pathname.includes('/warden/transfers')) return 'allocations';
    if (pathname.includes('/warden/leave-requests') || pathname.includes('/warden/leaves')) return 'leaves';
    if (pathname.includes('/warden/complaints')) return 'complaints';
    if (pathname.includes('/warden/visitors')) return 'visitors';
    if (pathname.includes('/warden/students')) return 'students';
    if (pathname.includes('/warden/gate-passes')) return 'gatepasses';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const pathMap = {
      overview: '/warden/dashboard',
      rooms: '/warden/hostels',
      allocations: '/warden/allocations',
      leaves: '/warden/leave-requests',
      complaints: '/warden/complaints',
      students: '/warden/students',
      gatepasses: '/warden/gate-passes'
    };
    if (pathMap[tab]) {
      navigate(pathMap[tab]);
    }
  };

  // State Management
  const [telemetry, setTelemetry] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [roomSearch, setRoomSearch] = useState('');
  const [complaintFilter, setComplaintFilter] = useState('ALL');
  const [leaveFilter, setLeaveFilter] = useState('ALL');

  // Modals state
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [allocateStudentRoll, setAllocateStudentRoll] = useState('');
  const [allocateRoomId, setAllocateRoomId] = useState('');
  const [submittingAllocate, setSubmittingAllocate] = useState(false);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [statusNotes, setStatusNotes] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const [rejectLeaveModalOpen, setRejectLeaveModalOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');

  // Initial Data Fetch
  const loadWardenData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, roomsRes, leavesRes, complaintsRes, transfersRes, gatePassRes] = await Promise.allSettled([
        wardenApi.getDashboard(),
        wardenApi.getRooms({ limit: 50 }),
        wardenApi.getLeaveRequests({ limit: 50 }),
        wardenApi.getComplaints({ limit: 50 }),
        wardenApi.getRoomTransfers ? wardenApi.getRoomTransfers({ limit: 50 }) : Promise.resolve({ data: [] }),
        apiClient.get('/gatepass')
      ]);

      if (dashRes.status === 'fulfilled') {
        setTelemetry(dashRes.value.data || dashRes.value || {});
      }

      if (roomsRes.status === 'fulfilled') {
        const rData = roomsRes.value.data || roomsRes.value || [];
        setRooms(Array.isArray(rData) ? rData : (rData.rooms || []));
      }

      if (leavesRes.status === 'fulfilled') {
        const lData = leavesRes.value.data || leavesRes.value || [];
        setLeaves(Array.isArray(lData) ? lData : (lData.requests || []));
      }

      if (complaintsRes.status === 'fulfilled') {
        const cData = complaintsRes.value.data || complaintsRes.value || [];
        setComplaints(Array.isArray(cData) ? cData : (cData.complaints || []));
      }

      if (transfersRes.status === 'fulfilled') {
        const tData = transfersRes.value.data || transfersRes.value || [];
        setTransfers(Array.isArray(tData) ? tData : (tData.transfers || []));
      }

      if (gatePassRes.status === 'fulfilled') {
        const gpData = gatePassRes.value.data?.gatePasses || gatePassRes.value.data || [];
        setGatePasses(Array.isArray(gpData) ? gpData : []);
      }
    } catch (err) {
      console.error('[Warden Data Fetch Error]:', err);
      setError(err.message || 'Failed to load warden hostel management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWardenData();
  }, []);

  // -------------------------------------------------------------
  // ACTIONS: Leave Approvals
  // -------------------------------------------------------------
  const handleApproveLeave = async (id) => {
    try {
      await wardenApi.approveLeaveRequest(id);
      toast.success('Leave request approved successfully', 'Leave Authorized');
      setLeaves(leaves.map(l => l.id === id ? { ...l, status: 'APPROVED' } : l));
    } catch (err) {
      toast.error(err.message || 'Failed to approve leave request', 'Error');
    }
  };

  const handleOpenRejectLeave = (id) => {
    setSelectedLeaveId(id);
    setRejectRemarks('');
    setRejectLeaveModalOpen(true);
  };

  const handleConfirmRejectLeave = async () => {
    if (!selectedLeaveId) return;
    try {
      await wardenApi.rejectLeaveRequest(selectedLeaveId, rejectRemarks || 'Not approved by warden');
      toast.success('Leave request rejected', 'Status Updated');
      setLeaves(leaves.map(l => l.id === selectedLeaveId ? { ...l, status: 'REJECTED' } : l));
      setRejectLeaveModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to reject leave request', 'Error');
    }
  };

  // -------------------------------------------------------------
  // ACTIONS: Gate Pass Approvals
  // -------------------------------------------------------------
  const handleApproveGatePass = async (id) => {
    try {
      await apiClient.post(`/gatepass/${id}/approve`, { decision: 'APPROVED' });
      toast.success('Gate pass approved & QR issued', 'Gate Pass Approved');
      setGatePasses(gatePasses.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
    } catch (err) {
      toast.error(err.message || 'Failed to approve gate pass', 'Error');
    }
  };

  const handleRejectGatePass = async (id) => {
    try {
      await apiClient.post(`/gatepass/${id}/approve`, { decision: 'REJECTED' });
      toast.success('Gate pass marked rejected', 'Gate Pass Rejected');
      setGatePasses(gatePasses.map(p => p.id === id ? { ...p, status: 'REJECTED' } : p));
    } catch (err) {
      toast.error(err.message || 'Failed to reject gate pass', 'Error');
    }
  };

  // -------------------------------------------------------------
  // ACTIONS: Complaints & Grievances
  // -------------------------------------------------------------
  const handleOpenUpdateComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status === 'SUBMITTED' ? 'IN_PROGRESS' : 'RESOLVED');
    setStatusNotes('');
    setStatusModalOpen(true);
  };

  const handleConfirmUpdateComplaint = async () => {
    if (!selectedComplaint) return;
    setSubmittingStatus(true);
    try {
      await wardenApi.updateComplaintStatus(selectedComplaint.id, newStatus, statusNotes || 'Status updated by warden');
      toast.success(`Complaint marked as ${newStatus}`, 'Grievance Updated');
      setComplaints(complaints.map(c => c.id === selectedComplaint.id ? { ...c, status: newStatus } : c));
      setStatusModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update complaint status', 'Error');
    } finally {
      setSubmittingStatus(false);
    }
  };

  // -------------------------------------------------------------
  // ACTIONS: Room Transfers
  // -------------------------------------------------------------
  const handleApproveTransfer = async (id) => {
    try {
      await wardenApi.approveRoomTransfer(id);
      toast.success('Room transfer approved and reallocated', 'Transfer Completed');
      setTransfers(transfers.map(t => t.id === id ? { ...t, status: 'APPROVED' } : t));
      loadWardenData();
    } catch (err) {
      toast.error(err.message || 'Failed to approve room transfer', 'Error');
    }
  };

  const handleRejectTransfer = async (id) => {
    try {
      await wardenApi.rejectRoomTransfer(id, 'Denied by warden');
      toast.success('Room transfer rejected', 'Transfer Denied');
      setTransfers(transfers.map(t => t.id === id ? { ...t, status: 'REJECTED' } : t));
    } catch (err) {
      toast.error(err.message || 'Failed to reject room transfer', 'Error');
    }
  };

  // -------------------------------------------------------------
  // ACTIONS: Allocate Student
  // -------------------------------------------------------------
  const handleAllocateRoom = async (e) => {
    e.preventDefault();
    if (!allocateStudentRoll || !allocateRoomId) {
      toast.error('Please specify both student identifier and room.', 'Validation Error');
      return;
    }
    setSubmittingAllocate(true);
    try {
      await wardenApi.allocateRoom({
        studentId: allocateStudentRoll.trim(),
        roomId: allocateRoomId,
        academicYear: '2026-2027'
      });
      toast.success('Student successfully allocated to room', 'Allocation Successful');
      setAllocateModalOpen(false);
      setAllocateStudentRoll('');
      setAllocateRoomId('');
      loadWardenData();
    } catch (err) {
      toast.error(err.message || 'Failed to allocate student to room', 'Error');
    } finally {
      setSubmittingAllocate(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-24 bg-white rounded-3xl border border-slate-200/80 p-6 animate-pulse" />
        <LoadingSkeleton type="cards" />
        <LoadingSkeleton type="table" rows={6} />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Warden Workstation Unavailable" message={error} onRetry={loadWardenData} />;
  }

  // Filtered rooms
  const filteredRooms = rooms.filter(r =>
    r.roomNumber?.toLowerCase().includes(roomSearch.toLowerCase()) ||
    r.blockName?.toLowerCase().includes(roomSearch.toLowerCase()) ||
    r.hostelName?.toLowerCase().includes(roomSearch.toLowerCase())
  );

  // Filtered complaints
  const filteredComplaints = complaints.filter(c =>
    complaintFilter === 'ALL' ? true : c.status === complaintFilter
  );

  // Filtered leaves
  const filteredLeaves = leaves.filter(l =>
    leaveFilter === 'ALL' ? true : l.status === leaveFilter
  );

  // All allocated students list
  const allOccupants = [];
  rooms.forEach(r => {
    if (Array.isArray(r.occupants)) {
      r.occupants.forEach(occ => {
        allOccupants.push({
          ...occ,
          roomNumber: r.roomNumber,
          blockName: r.blockName,
          floorNumber: r.floorNumber
        });
      });
    }
  });

  const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const totalOccupancy = rooms.reduce((acc, r) => acc + (r.currentOccupancy || 0), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 85;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border border-emerald-200/80 rounded-3xl text-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold">
              Residential Affairs & Command Terminal
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
            Hostel Life, Safety & Occupancy Center
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Live hostel telemetry, resident student directory, room allocations, leave authorizations, and rapid facility maintenance resolution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setAllocateModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            <span>Allocate Room</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={loadWardenData}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Live</span>
          </Button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-1 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto text-xs font-bold text-slate-600">
        {[
          { id: 'overview', label: 'Command Overview', icon: Building2 },
          { id: 'rooms', label: `Hostels & Rooms (${rooms.length})`, icon: Layers },
          { id: 'allocations', label: `Allocations & Transfers (${transfers.length})`, icon: Sliders },
          { id: 'leaves', label: `Leave Approvals (${leaves.filter(l => l.status === 'PENDING').length})`, icon: CalendarDays },
          { id: 'gatepasses', label: `Gate Passes (${gatePasses.filter(p => p.status === 'PENDING').length})`, icon: ShieldCheck },
          { id: 'complaints', label: `Hostel Grievances (${complaints.length})`, icon: Wrench },
          { id: 'students', label: `Residents Directory (${allOccupants.length})`, icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900 hover:bg-white/50 text-slate-600'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Telemetry KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Residents"
              value={telemetry?.totalHostelStudents ?? allOccupants.length}
              subtitle="Registered hostel occupants"
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Room Occupancy"
              value={`${occupancyRate}%`}
              subtitle={`${telemetry?.occupiedRooms ?? totalOccupancy} of ${rooms.length} rooms occupied`}
              icon={Building2}
              color="green"
            />
            <StatCard
              title="Pending Outings"
              value={gatePasses.filter(p => p.status === 'PENDING').length}
              subtitle="Gate passes awaiting approval"
              icon={ShieldCheck}
              color="purple"
            />
            <StatCard
              title="Open Grievances"
              value={complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CANCELLED').length}
              subtitle="Maintenance and repair tickets"
              icon={AlertTriangle}
              color="amber"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Quick Gate Pass Outing Approvals Card */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Pending Gate Pass Approvals</span>
                </h3>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {gatePasses.filter(p => p.status === 'PENDING').length} Action Required
                </span>
              </div>

              <div className="space-y-3">
                {gatePasses.filter(p => p.status === 'PENDING').length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No pending gate pass requests requiring authorization.
                  </div>
                ) : (
                  gatePasses.filter(p => p.status === 'PENDING').slice(0, 4).map((pass) => (
                    <div key={pass.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700">{pass.passNumber || pass.id.slice(0, 8)}</span>
                          <span className="text-xs font-bold text-slate-900">{pass.student?.user ? `${pass.student.user.firstName} ${pass.student.user.lastName}` : 'Resident Student'}</span>
                        </div>
                        <StatusPill status={pass.status} />
                      </div>

                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Destination: <strong className="text-slate-800">{pass.destination || 'City Visit'}</strong></span>
                        <span>{pass.reason || 'Personal outing'}</span>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                        <Button size="xs" variant="secondary" onClick={() => handleRejectGatePass(pass.id)}>
                          Reject
                        </Button>
                        <Button size="xs" variant="primary" onClick={() => handleApproveGatePass(pass.id)}>
                          Approve & Issue QR
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Quick Leave Approvals Card */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-indigo-600" />
                  <span>Pending Leave Requests</span>
                </h3>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  {leaves.filter(l => l.status === 'PENDING').length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {leaves.filter(l => l.status === 'PENDING').length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    All resident student leave applications are reviewed and processed.
                  </div>
                ) : (
                  leaves.filter(l => l.status === 'PENDING').slice(0, 4).map((l) => (
                    <div key={l.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{l.student?.user ? `${l.student.user.firstName} ${l.student.user.lastName}` : 'Student'}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({l.leaveType})</span>
                        </div>
                        <StatusPill status={l.status} />
                      </div>

                      <p className="text-xs text-slate-600">{l.reason || 'Home leave requested'}</p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>Contact: <strong>{l.emergencyContact || 'Family'}</strong></span>
                        <div className="flex gap-2">
                          <Button size="xs" variant="secondary" onClick={() => handleOpenRejectLeave(l.id)}>
                            Reject
                          </Button>
                          <Button size="xs" variant="primary" onClick={() => handleApproveLeave(l.id)}>
                            Approve Leave
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Real Visual Room Status Summary */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  <span>Hostel Visual Room Grid (Real Database Records)</span>
                </h3>
                <p className="text-xs text-slate-500">Live room allocation status across campus hostel blocks</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span> Fully Occupied
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-blue-400"></span> Vacant Bed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-slate-300"></span> Empty Room
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5 pt-2">
              {rooms.slice(0, 30).map((r) => {
                const isFull = r.currentOccupancy >= r.capacity && r.capacity > 0;
                const isVacant = r.currentOccupancy === 0;
                return (
                  <div
                    key={r.id}
                    onClick={() => handleTabChange('rooms')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all hover:scale-105 cursor-pointer ${
                      isFull
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : isVacant
                        ? 'border-slate-200 bg-slate-50 text-slate-700'
                        : 'border-blue-200 bg-blue-50 text-blue-900'
                    }`}
                  >
                    <div>{r.roomNumber}</div>
                    <div className="text-[10px] font-normal opacity-80 mt-0.5">
                      {r.currentOccupancy}/{r.capacity} beds
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: HOSTELS & ROOMS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'rooms' && (
        <Card className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hostel Rooms & Bed Allocations</h2>
              <p className="text-xs text-slate-500">Inspect room capacities, current occupants, and floor mappings</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <input
                  type="text"
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  placeholder="Search room number or block..."
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Room No.</th>
                  <th className="py-3 px-4">Hostel & Block</th>
                  <th className="py-3 px-4">Floor</th>
                  <th className="py-3 px-4">Occupancy</th>
                  <th className="py-3 px-4">Vacant Beds</th>
                  <th className="py-3 px-4">Current Occupants</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.roomNumber}</td>
                    <td className="py-3 px-4 text-slate-700">{r.hostelName} • {r.blockName}</td>
                    <td className="py-3 px-4 text-slate-600">Floor {r.floorNumber}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        r.currentOccupancy >= r.capacity
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.currentOccupancy > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {r.currentOccupancy} / {r.capacity} Beds
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">{r.vacantBeds} Free</td>
                    <td className="py-3 px-4">
                      {r.occupants && r.occupants.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {r.occupants.map((o, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-medium">
                              {o.studentName} ({o.rollNumber})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No active occupants</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {r.vacantBeds > 0 ? (
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            setAllocateRoomId(r.id);
                            setAllocateModalOpen(true);
                          }}
                        >
                          Allocate
                        </Button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[10px]">Full</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: ALLOCATIONS & TRANSFERS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'allocations' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pending Room Transfer Requests</h3>
                <p className="text-xs text-slate-500">Student requests to transfer across hostel rooms</p>
              </div>
            </div>

            {transfers.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Zero pending room transfer applications.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Current Room</th>
                      <th className="py-3 px-4">Target Room</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transfers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {t.student?.user ? `${t.student.user.firstName} ${t.student.user.lastName}` : 'Student'}
                        </td>
                        <td className="py-3 px-4 font-mono">{t.fromRoom?.roomNumber || 'Room A'}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">{t.toRoom?.roomNumber || 'Room B'}</td>
                        <td className="py-3 px-4 text-slate-600">{t.reason || 'Medical / Study reason'}</td>
                        <td className="py-3 px-4"><StatusPill status={t.status} /></td>
                        <td className="py-3 px-4">
                          {t.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button size="xs" variant="primary" onClick={() => handleApproveTransfer(t.id)}>
                                Approve
                              </Button>
                              <Button size="xs" variant="secondary" onClick={() => handleRejectTransfer(t.id)}>
                                Reject
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: LEAVE APPROVALS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'leaves' && (
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Resident Student Leave Applications</h2>
              <p className="text-xs text-slate-500">Sign off on student overnight home leaves and medical permissions</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={leaveFilter}
                onChange={(e) => setLeaveFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Emergency Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {l.student?.user ? `${l.student.user.firstName} ${l.student.user.lastName}` : 'Resident Student'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{l.student?.rollNumber || 'STU-ROSTER'}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{l.leaveType}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{l.reason}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{l.emergencyContact || '—'}</td>
                    <td className="py-3 px-4"><StatusPill status={l.status} /></td>
                    <td className="py-3 px-4">
                      {l.status === 'PENDING' ? (
                        <div className="flex gap-1.5">
                          <Button size="xs" variant="primary" onClick={() => handleApproveLeave(l.id)}>
                            Approve
                          </Button>
                          <Button size="xs" variant="secondary" onClick={() => handleOpenRejectLeave(l.id)}>
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-medium">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: GATE PASSES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'gatepasses' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Gate Passes & QR Clearance</h2>
              <p className="text-xs text-slate-500">Student local outing approvals and digital pass generation</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Pass No.</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Out Time</th>
                  <th className="py-3 px-4">Expected In Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gatePasses.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{p.passNumber || p.id.slice(0, 8)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p.student?.user ? `${p.student.user.firstName} ${p.student.user.lastName}` : 'Resident Student'}
                    </td>
                    <td className="py-3 px-4 text-slate-800">{p.destination}</td>
                    <td className="py-3 px-4 text-slate-600">{p.outTimeExpected || p.outTime || 'Today'}</td>
                    <td className="py-3 px-4 text-slate-600">{p.inTimeExpected || 'Evening'}</td>
                    <td className="py-3 px-4"><StatusPill status={p.status} /></td>
                    <td className="py-3 px-4">
                      {p.status === 'PENDING' ? (
                        <div className="flex gap-1.5">
                          <Button size="xs" variant="primary" onClick={() => handleApproveGatePass(p.id)}>
                            Approve QR
                          </Button>
                          <Button size="xs" variant="secondary" onClick={() => handleRejectGatePass(p.id)}>
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: COMPLAINTS & MAINTENANCE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'complaints' && (
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hostel Facility Grievances & Work Orders</h2>
              <p className="text-xs text-slate-500">Track plumbing, electrical, carpentry, and cleanliness complaints</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={complaintFilter}
                onChange={(e) => setComplaintFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title / Issue</th>
                  <th className="py-3 px-4">Student / Room</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{c.id.slice(0, 8)}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{c.title}</div>
                      <div className="text-[11px] text-slate-500 max-w-sm truncate">{c.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">
                        {c.student?.user ? `${c.student.user.firstName} ${c.student.user.lastName}` : 'Student'}
                      </div>
                      <div className="text-[10px] text-slate-400">Hostel Resident</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={c.priority === 'HIGH' || c.priority === 'CRITICAL' ? 'danger' : 'warning'}>
                        {c.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4"><StatusPill status={c.status} /></td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {c.assignedStaff ? `${c.assignedStaff.user.firstName} (Maintenance)` : 'Unassigned'}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => handleOpenUpdateComplaint(c)}
                      >
                        Update Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: RESIDENTS DIRECTORY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'students' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hostel Resident Directory</h2>
              <p className="text-xs text-slate-500">All registered students currently allocated to hostel accommodations</p>
            </div>
            <Badge variant="success">{allOccupants.length} Active Residents</Badge>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Room No.</th>
                  <th className="py-3 px-4">Block / Floor</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allOccupants.map((occ, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{occ.studentName}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{occ.rollNumber}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">{occ.roomNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{occ.blockName} • Floor {occ.floorNumber}</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ACTIVE RESIDENT
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: Allocate Student to Room */}
      {/* ------------------------------------------------------------- */}
      {allocateModalOpen && (
        <Modal
          isOpen={allocateModalOpen}
          onClose={() => setAllocateModalOpen(false)}
          title="Allocate Student to Room"
        >
          <form onSubmit={handleAllocateRoom} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Student ID or Roll Number
              </label>
              <Input
                type="text"
                placeholder="e.g. CS2023048 or student CUID"
                value={allocateStudentRoll}
                onChange={(e) => setAllocateStudentRoll(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Select Available Room
              </label>
              <select
                value={allocateRoomId}
                onChange={(e) => setAllocateRoomId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white text-slate-800 focus:outline-none focus:border-emerald-500"
                required
              >
                <option value="">-- Choose a room --</option>
                {rooms.filter(r => r.vacantBeds > 0).map(r => (
                  <option key={r.id} value={r.id}>
                    Room {r.roomNumber} ({r.hostelName} - {r.blockName}) — {r.vacantBeds} free bed(s)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setAllocateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submittingAllocate}>
                {submittingAllocate ? 'Allocating...' : 'Confirm Allocation'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: Update Complaint Status */}
      {/* ------------------------------------------------------------- */}
      {statusModalOpen && selectedComplaint && (
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title={`Update Complaint Status: ${selectedComplaint.title}`}
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Select New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white text-slate-800"
              >
                <option value="IN_PROGRESS">IN_PROGRESS (Staff dispatched)</option>
                <option value="RESOLVED">RESOLVED (Work complete & verified)</option>
                <option value="REJECTED">REJECTED (Invalid request)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Warden Notes / Action Taken</label>
              <Textarea
                rows={3}
                placeholder="Details of repair or action taken..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmUpdateComplaint} disabled={submittingStatus}>
                {submittingStatus ? 'Saving...' : 'Save Status Update'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: Reject Leave Request */}
      {/* ------------------------------------------------------------- */}
      {rejectLeaveModalOpen && (
        <Modal
          isOpen={rejectLeaveModalOpen}
          onClose={() => setRejectLeaveModalOpen(false)}
          title="Reject Student Leave Request"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600">Please provide a reason for rejecting this leave application.</p>
            <Textarea
              rows={3}
              placeholder="e.g. Inadequate attendance / Parent confirmation pending..."
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setRejectLeaveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmRejectLeave}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
