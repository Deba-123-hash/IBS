import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { maintenanceApi } from '../../services/maintenanceApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import { StatusPill } from '../../components/common/StatusPill.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import {
  Wrench,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  RefreshCw,
  MessageSquare,
  Filter,
  Search,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';

export default function MaintenanceDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'inprogress', 'resolved', 'all'
  const [tradeFilter, setTradeFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [workComment, setWorkComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await maintenanceApi.getComplaints({ limit: 50 });
      const rawList = res.data?.complaints || res.data || res.complaints || [];
      setTickets(Array.isArray(rawList) ? rawList : []);
    } catch (err) {
      console.warn('[Maintenance Dashboard Warning]:', err.message);
      setError(err.message || 'Failed to load maintenance work orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Update Status to In-Progress
  const handleStartWork = async (ticketId) => {
    try {
      await maintenanceApi.updateStatus(ticketId, 'IN_PROGRESS', 'Technician started work order');
      toast.success('Task status updated to IN PROGRESS', 'Work Started');
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'IN_PROGRESS' } : t));
    } catch (err) {
      toast.error(err.message || 'Failed to update ticket status', 'Error');
    }
  };

  // Open Resolve Modal
  const handleOpenResolve = (ticket) => {
    setSelectedTicket(ticket);
    setResolutionNotes('');
    setResolveModalOpen(true);
  };

  // Confirm Resolve
  const handleConfirmResolve = async () => {
    if (!selectedTicket) return;
    setSubmitting(true);
    try {
      await maintenanceApi.updateStatus(selectedTicket.id, 'RESOLVED', resolutionNotes || 'Repairs completed and inspected');
      toast.success('Work order marked as RESOLVED', 'Task Completed');
      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'RESOLVED' } : t));
      setResolveModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to mark ticket resolved', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Comment Modal
  const handleOpenComment = (ticket) => {
    setSelectedTicket(ticket);
    setWorkComment('');
    setCommentModalOpen(true);
  };

  // Confirm Comment
  const handleConfirmComment = async () => {
    if (!selectedTicket || !workComment.trim()) return;
    setSubmitting(true);
    try {
      await maintenanceApi.addComment(selectedTicket.id, workComment.trim());
      toast.success('Work note appended to repair log', 'Note Added');
      setCommentModalOpen(false);
      setWorkComment('');
    } catch (err) {
      toast.error(err.message || 'Failed to append work note', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-20 bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse" />
        <LoadingSkeleton type="cards" />
        <LoadingSkeleton type="table" rows={6} />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Maintenance Terminal Unavailable" message={error} onRetry={fetchTickets} />;
  }

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesTab =
      activeTab === 'all' ? true :
      activeTab === 'active' ? (t.status === 'SUBMITTED' || t.status === 'ASSIGNED') :
      activeTab === 'inprogress' ? t.status === 'IN_PROGRESS' :
      activeTab === 'resolved' ? t.status === 'RESOLVED' : true;

    const matchesTrade = tradeFilter === 'ALL' || (t.category?.name || t.category || '').toUpperCase().includes(tradeFilter);
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesSearch =
      (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesTrade && matchesPriority && matchesSearch;
  });

  const assignedCount = tickets.filter(t => t.status === 'SUBMITTED' || t.status === 'ASSIGNED').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;
  const criticalCount = tickets.filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-white border border-amber-200/80 rounded-3xl text-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">
              Facility Repairs & Work Order Dispatch
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
            Campus Technician & Maintenance Workstation
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Real-time work queue for plumbing, electrical, carpentry, HVAC, and civil repairs with SLA monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchTickets}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Orders</span>
          </Button>
        </div>
      </div>

      {/* Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Orders"
          value={assignedCount}
          subtitle="Awaiting technician pickup"
          icon={Wrench}
          color="amber"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Active on-site repairs"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          subtitle="Inspected and completed"
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="High Priority"
          value={criticalCount}
          subtitle="Emergency & critical SLA"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Main Work Orders Card */}
      <Card className="p-6 space-y-5">
        {/* Navigation Tabs & Search Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
            {[
              { id: 'active', label: `Pending Pickup (${assignedCount})` },
              { id: 'inprogress', label: `In Progress (${inProgressCount})` },
              { id: 'resolved', label: `Completed (${resolvedCount})` },
              { id: 'all', label: `All Orders (${tickets.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket or issue..."
                className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none w-48"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            </div>

            <select
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white text-slate-700"
            >
              <option value="ALL">All Trades</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="CARPENTRY">Carpentry</option>
              <option value="CIVIL">Civil / Masonry</option>
            </select>
          </div>
        </div>

        {/* Tickets Grid / Table */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No work orders match the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-600">
                      {t.id.slice(0, 10)}
                    </span>
                    <Badge variant={t.priority === 'CRITICAL' || t.priority === 'HIGH' ? 'danger' : 'warning'}>
                      {t.priority}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{t.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{t.description}</p>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-amber-600" />
                      <span>Hostel Resident • Student Grievance</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Trade: <strong className="text-slate-800">{t.category?.name || t.category || 'Maintenance'}</strong></span>
                      <StatusPill status={t.status} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => handleOpenComment(t)}
                    className="text-slate-600 flex items-center gap-1 text-[11px]"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Add Note</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {t.status !== 'IN_PROGRESS' && t.status !== 'RESOLVED' && (
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => handleStartWork(t.id)}
                      >
                        Start Work
                      </Button>
                    )}
                    {t.status !== 'RESOLVED' && (
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => handleOpenResolve(t)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal: Mark Resolved */}
      {resolveModalOpen && selectedTicket && (
        <Modal
          isOpen={resolveModalOpen}
          onClose={() => setResolveModalOpen(false)}
          title={`Complete Work Order: ${selectedTicket.title}`}
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600">
              Provide details of the repairs performed, replacement parts used, or verification checks done.
            </p>
            <Textarea
              rows={4}
              placeholder="e.g. Replaced elbow valve on under-sink pipe. Leak tested under pressure, verified fully dry."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmResolve} disabled={submitting}>
                {submitting ? 'Marking Resolved...' : 'Confirm Resolution'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Add Work Comment */}
      {commentModalOpen && selectedTicket && (
        <Modal
          isOpen={commentModalOpen}
          onClose={() => setCommentModalOpen(false)}
          title={`Add Work Note: ${selectedTicket.id.slice(0, 10)}`}
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600">
              Add internal progress remarks, parts requested, or follow-up notes for the warden and dispatch office.
            </p>
            <Textarea
              rows={3}
              placeholder="e.g. Spoke with resident, required replacement ceramic washer on order from central store..."
              value={workComment}
              onChange={(e) => setWorkComment(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setCommentModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmComment} disabled={submitting}>
                {submitting ? 'Saving Note...' : 'Append Work Note'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
