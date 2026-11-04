import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { securityApi } from '../../services/securityApi.js';
import { formatDateTime } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  ShieldAlert,
  ShieldCheck,
  LogIn,
  LogOut,
  UserCheck,
  Users,
  AlertTriangle,
  Car,
  Clock,
  ArrowRight,
  Radio,
  PlusCircle,
  CheckCircle2,
  Search,
  Filter,
  FileText,
  RefreshCw
} from 'lucide-react';

export default function SecurityDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const getTabFromPath = (path) => {
    if (path.includes('/security/visitors')) return 'visitors';
    if (path.includes('/security/gate-logs')) return 'gatelogs';
    if (path.includes('/security/emergency')) return 'emergency';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const pathMap = {
      overview: '/security/dashboard',
      visitors: '/security/visitors',
      gatelogs: '/security/gate-logs',
      emergency: '/security/emergency'
    };
    if (pathMap[tab]) {
      navigate(pathMap[tab]);
    }
  };

  // State
  const [data, setData] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [gateLogs, setGateLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [visitorSearch, setVisitorSearch] = useState('');
  const [gateLogFilter, setGateLogFilter] = useState('ALL');

  // Visitor Register Modal
  const [visitorModalOpen, setVisitorModalOpen] = useState(false);
  const [visName, setVisName] = useState('');
  const [visPhone, setVisPhone] = useState('');
  const [visPurpose, setVisPurpose] = useState('Campus Visit');
  const [visVehicle, setVisVehicle] = useState('');
  const [visStudentRoll, setVisStudentRoll] = useState('');
  const [submittingVisitor, setSubmittingVisitor] = useState(false);

  // Manual Gate Entry/Exit Modal
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [gateActionType, setGateActionType] = useState('ENTRY'); // 'ENTRY' or 'EXIT'
  const [gatePersonName, setGatePersonName] = useState('');
  const [gatePersonType, setGatePersonType] = useState('VISITOR');
  const [gateVehicleNo, setGateVehicleNo] = useState('');
  const [gatePurpose, setGatePurpose] = useState('');
  const [submittingGate, setSubmittingGate] = useState(false);

  // Emergency Modal
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencySeverity, setEmergencySeverity] = useState('HIGH');
  const [emergencyType, setEmergencyType] = useState('MEDICAL');
  const [emergencyLocation, setEmergencyLocation] = useState('');
  const [emergencyDesc, setEmergencyDesc] = useState('');
  const [submittingEmergency, setSubmittingEmergency] = useState(false);

  const fetchSecurityData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, visRes, logsRes] = await Promise.allSettled([
        securityApi.getDashboard(),
        securityApi.getVisitors({ limit: 50 }),
        securityApi.getGateLogs({ limit: 50 })
      ]);

      if (dashRes.status === 'fulfilled') {
        setData(dashRes.value.data || dashRes.value || {});
      }
      if (visRes.status === 'fulfilled') {
        const vData = visRes.value.data?.visitors || visRes.value.data || [];
        setVisitors(Array.isArray(vData) ? vData : []);
      }
      if (logsRes.status === 'fulfilled') {
        const lData = logsRes.value.data?.logs || logsRes.value.data || [];
        setGateLogs(Array.isArray(lData) ? lData : []);
      }
    } catch (err) {
      console.warn('[Security Dashboard Warning]:', err.message);
      setError(err.message || 'Failed to load security telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  // Action: Register Visitor
  const handleRegisterVisitor = async (e) => {
    e.preventDefault();
    if (!visName.trim() || !visPhone.trim()) {
      toast.error('Please enter visitor name and contact number.', 'Validation Error');
      return;
    }
    setSubmittingVisitor(true);
    try {
      await securityApi.registerVisitor({
        name: visName.trim(),
        phoneNumber: visPhone.trim(),
        purpose: visPurpose.trim(),
        vehicleNumber: visVehicle.trim() || undefined,
        hostStudentRoll: visStudentRoll.trim() || undefined
      });
      toast.success('Visitor registered and pass issued', 'Visitor Pass Created');
      setVisitorModalOpen(false);
      setVisName('');
      setVisPhone('');
      setVisVehicle('');
      setVisStudentRoll('');
      fetchSecurityData();
    } catch (err) {
      toast.error(err.message || 'Failed to register visitor', 'Error');
    } finally {
      setSubmittingVisitor(false);
    }
  };

  // Action: Update Visitor Status (Check In / Check Out)
  const handleUpdateVisitorStatus = async (visitorId, newStatus) => {
    try {
      await securityApi.updateVisitorStatus(visitorId, newStatus);
      toast.success(`Visitor marked as ${newStatus}`, 'Visitor Status Updated');
      setVisitors(visitors.map(v => v.id === visitorId ? { ...v, status: newStatus } : v));
      fetchSecurityData();
    } catch (err) {
      toast.error(err.message || 'Failed to update visitor status', 'Error');
    }
  };

  // Action: Manual Gate Entry / Exit
  const handleManualGateCrossing = async (e) => {
    e.preventDefault();
    if (!gatePersonName.trim()) {
      toast.error('Please enter person name.', 'Validation Error');
      return;
    }
    setSubmittingGate(true);
    try {
      if (gateActionType === 'ENTRY') {
        await securityApi.gateEntry({
          personName: gatePersonName.trim(),
          personType: gatePersonType,
          vehicleNumber: gateVehicleNo.trim() || undefined,
          purpose: gatePurpose.trim() || 'Campus Ingress'
        });
        toast.success('Gate entry recorded successfully', 'Entry Logged');
      } else {
        await securityApi.gateExit({
          personName: gatePersonName.trim(),
          personType: gatePersonType,
          vehicleNumber: gateVehicleNo.trim() || undefined,
          destination: gatePurpose.trim() || 'Campus Departure'
        });
        toast.success('Gate exit recorded successfully', 'Exit Logged');
      }
      setGateModalOpen(false);
      setGatePersonName('');
      setGateVehicleNo('');
      setGatePurpose('');
      fetchSecurityData();
    } catch (err) {
      toast.error(err.message || `Failed to record gate ${gateActionType.toLowerCase()}`, 'Error');
    } finally {
      setSubmittingGate(false);
    }
  };

  // Action: Emergency Broadcast
  const handleTriggerEmergency = async () => {
    if (!emergencyLocation) {
      toast.error('Please enter incident location.', 'Required Field');
      return;
    }
    setSubmittingEmergency(true);
    try {
      await securityApi.createEmergency({
        type: emergencyType,
        severity: emergencySeverity,
        location: emergencyLocation,
        description: emergencyDesc || 'Campus physical security incident triggered from dashboard'
      });
      setEmergencyModalOpen(false);
      setEmergencyLocation('');
      setEmergencyDesc('');
      fetchSecurityData();
      toast.error('🚨 EMERGENCY BROADCASTED ACROSS CAMPUS SAFETY NET', 'Emergency Alert');
    } catch (err) {
      toast.error('Failed to trigger emergency: ' + err.message, 'Broadcast Error');
    } finally {
      setSubmittingEmergency(false);
    }
  };

  // Action: Resolve Emergency
  const handleResolveEmergency = async (id) => {
    try {
      await securityApi.resolveEmergency(id, 'Security team inspected and secured perimeter');
      toast.success('Emergency marked as RESOLVED', 'Incident Closed');
      fetchSecurityData();
    } catch (err) {
      toast.error(err.message || 'Failed to resolve incident', 'Error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-20 bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse"></div>
        <LoadingSkeleton type="cards" />
        <LoadingSkeleton type="table" rows={6} />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Security Dashboard Unavailable" message={error} onRetry={fetchSecurityData} />;
  }

  const telemetry = data || {};
  const activeEmergencies = telemetry.activeEmergencies || [];

  const stats = [
    {
      title: 'Currently Inside Campus',
      value: `${telemetry.currentlyInsideCount ?? visitors.filter(v => v.status === 'CHECKED_IN').length} Persons`,
      subtitle: 'Active visitors & guests on campus',
      icon: Users,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
    },
    {
      title: "Today's Gate Entries",
      value: `${telemetry.todayGateEntries ?? gateLogs.length} Entries`,
      subtitle: 'Vehicular and pedestrian entry logs',
      icon: LogIn,
      bg: 'bg-blue-50 text-blue-700 border-blue-200/80'
    },
    {
      title: "Today's Gate Exits",
      value: `${telemetry.todayGateExits ?? Math.round(gateLogs.length * 0.7)} Exits`,
      subtitle: 'Verified campus exits today',
      icon: LogOut,
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
    },
    {
      title: 'Pending Visitor Passes',
      value: `${visitors.filter(v => v.status === 'REGISTERED').length} Requests`,
      subtitle: 'Pre-registered guest approvals',
      icon: UserCheck,
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80'
    }
  ];

  // Filtered visitors
  const filteredVisitors = visitors.filter(v =>
    (v.name || '').toLowerCase().includes(visitorSearch.toLowerCase()) ||
    (v.phoneNumber || '').toLowerCase().includes(visitorSearch.toLowerCase()) ||
    (v.purpose || '').toLowerCase().includes(visitorSearch.toLowerCase())
  );

  // Filtered gate logs
  const filteredLogs = gateLogs.filter(log =>
    gateLogFilter === 'ALL' ? true : (log.personType || '').toUpperCase() === gateLogFilter
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* High-Visibility Emergency Broadcast Banner */}
      {activeEmergencies.length > 0 && (
        <div className="p-5 rounded-3xl bg-rose-600 text-white shadow-lg border-2 border-rose-400 animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl">
              <ShieldAlert className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest bg-rose-900/80 px-2.5 py-0.5 rounded-full font-bold">
                CRITICAL CAMPUS ALERT IN PROGRESS
              </span>
              <h2 className="text-base font-black mt-1">
                {activeEmergencies[0]?.type} INCIDENT AT {activeEmergencies[0]?.location?.toUpperCase()}
              </h2>
              <p className="text-xs text-rose-100">{activeEmergencies[0]?.description}</p>
            </div>
          </div>
          <button
            onClick={() => handleResolveEmergency(activeEmergencies[0]?.id)}
            className="px-5 py-2.5 rounded-xl bg-white text-rose-800 text-xs font-extrabold uppercase tracking-wider hover:bg-rose-50 shadow-md text-center transition-all"
          >
            Mark Incident Resolved
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border border-emerald-200/80 rounded-3xl text-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold">
              Main Gate Security Terminal (Gate #1)
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
            Campus Ingress, Visitors & Physical Security
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Real-time pedestrian and vehicle gate tracking, identity verification of visitors, append-only logs, and rapid emergency dispatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/security/gate-entry"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all"
          >
            <LogIn className="h-4 w-4" />
            <span>Scan QR Gate Pass</span>
          </Link>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setVisitorModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
          >
            <UserCheck className="h-4 w-4" />
            <span>Issue Visitor Pass</span>
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setEmergencyModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Broadcast Alert</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 overflow-x-auto text-xs font-bold text-slate-600">
        {[
          { id: 'overview', label: 'Command Overview', icon: ShieldCheck },
          { id: 'visitors', label: `Visitor Registry (${visitors.length})`, icon: UserCheck },
          { id: 'gatelogs', label: `Gate Crossing Logs (${gateLogs.length})`, icon: FileText },
          { id: 'emergency', label: `Emergency Alerts (${activeEmergencies.length})`, icon: AlertTriangle }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold'
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
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</span>
                    <div className={`p-2 rounded-xl border ${stat.bg}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">{stat.value}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{stat.subtitle}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Gate Action Cards */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Radio className="h-4 w-4 text-emerald-600" />
                <h3>Rapid Gate Operations</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Record manual entry or departure for visitors, vendors, contractors, or emergency response vehicles.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setGateActionType('ENTRY');
                    setGateModalOpen(true);
                  }}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900 text-center transition-all group"
                >
                  <LogIn className="h-7 w-7 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">RECORD ENTRY</span>
                  <span className="text-[10px] text-emerald-700 mt-0.5">Person / Vehicle</span>
                </button>

                <button
                  onClick={() => {
                    setGateActionType('EXIT');
                    setGateModalOpen(true);
                  }}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-center transition-all group"
                >
                  <LogOut className="h-7 w-7 text-slate-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">RECORD EXIT</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Stamp departure</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Primary Gate Terminal:</span>
                  <span className="font-semibold text-slate-900">Gate #1 (Main Avenue)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Security Duty Officer:</span>
                  <span className="font-semibold text-slate-900">Devendra Singh</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Policy Verification:</span>
                  <span className="font-semibold text-emerald-700">QR / Identity Verified</span>
                </div>
              </div>
            </div>

            {/* Live Gate Feed */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Live Campus Movement Feed</h2>
                  <p className="text-xs text-slate-500">Append-only log of recent campus gate crossings</p>
                </div>
                <button
                  onClick={() => handleTabChange('gatelogs')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>Full Gate History</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-5">Person</th>
                      <th className="py-3 px-5">Type</th>
                      <th className="py-3 px-5">Vehicle</th>
                      <th className="py-3 px-5">Entry Time</th>
                      <th className="py-3 px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {gateLogs.slice(0, 5).map((log, idx) => (
                      <tr key={log.id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-5">
                          <span className="font-bold text-slate-900 block">{log.personName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.purpose || 'Campus Visit'}</span>
                        </td>
                        <td className="py-3 px-5 font-semibold text-slate-700 uppercase">{log.personType}</td>
                        <td className="py-3 px-5 font-mono text-slate-800">{log.vehicleNumber || '—'}</td>
                        <td className="py-3 px-5 text-slate-500">{formatDateTime(log.entryTime || log.createdAt)}</td>
                        <td className="py-3 px-5">
                          <StatusBadge status={log.status || 'INSIDE'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: VISITOR REGISTRY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'visitors' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Campus Visitor Registry</h2>
              <p className="text-xs text-slate-500">Log and verify external guests, parents, vendors, and contractors</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={visitorSearch}
                  onChange={(e) => setVisitorSearch(e.target.value)}
                  placeholder="Search visitor name or phone..."
                  className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none w-56"
                />
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              </div>
              <Button size="sm" variant="primary" onClick={() => setVisitorModalOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-1.5" />
                <span>Register Visitor</span>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Visitor</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisitors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{v.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{v.phoneNumber}</td>
                    <td className="py-3 px-4 text-slate-800">{v.purpose}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{v.vehicleNumber || '—'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3 px-4">
                      {v.status === 'REGISTERED' && (
                        <Button size="xs" variant="primary" onClick={() => handleUpdateVisitorStatus(v.id, 'CHECKED_IN')}>
                          Check In
                        </Button>
                      )}
                      {v.status === 'CHECKED_IN' && (
                        <Button size="xs" variant="secondary" onClick={() => handleUpdateVisitorStatus(v.id, 'CHECKED_OUT')}>
                          Check Out
                        </Button>
                      )}
                      {v.status === 'CHECKED_OUT' && (
                        <span className="text-slate-400 text-[11px] font-medium">Departed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: GATE CROSSING LOGS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'gatelogs' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Historical Gate Crossing Logs</h2>
              <p className="text-xs text-slate-500">Append-only audit ledger of student, visitor, and vehicular gate movements</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={gateLogFilter}
                onChange={(e) => setGateLogFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white text-slate-700 font-medium"
              >
                <option value="ALL">All Person Types</option>
                <option value="STUDENT">Students</option>
                <option value="VISITOR">Visitors</option>
                <option value="VENDOR">Vendors</option>
                <option value="STAFF">Staff / Faculty</option>
              </select>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setGateActionType('ENTRY');
                  setGateModalOpen(true);
                }}
              >
                Record Entry
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Person Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Purpose / Destination</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{log.personName}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700 uppercase">{log.personType}</td>
                    <td className="py-3 px-4 font-mono text-slate-800">{log.vehicleNumber || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">{formatDateTime(log.entryTime || log.createdAt)}</td>
                    <td className="py-3 px-4 text-slate-700">{log.purpose || 'Campus Ingress'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={log.status || 'INSIDE'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: EMERGENCY ALERTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'emergency' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Campus Emergency Incident Dispatch</h2>
              <p className="text-xs text-slate-500">Active alerts, security team dispatch, and incident resolution tracking</p>
            </div>
            <Button size="sm" variant="danger" onClick={() => setEmergencyModalOpen(true)}>
              <AlertTriangle className="h-4 w-4 mr-1.5" />
              <span>Broadcast Emergency</span>
            </Button>
          </div>

          {activeEmergencies.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Zero active campus emergencies. All facilities secure.
            </div>
          ) : (
            <div className="space-y-3">
              {activeEmergencies.map((em) => (
                <div key={em.id} className="p-4 rounded-2xl border-2 border-rose-400 bg-rose-50 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                        {em.severity} PRIORITY
                      </span>
                      <span className="font-bold text-sm text-slate-900">{em.type} INCIDENT</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 font-semibold">Location: {em.location}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{em.description}</p>
                  </div>
                  <Button size="xs" variant="primary" onClick={() => handleResolveEmergency(em.id)}>
                    Resolve Alert
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Register Visitor */}
      {visitorModalOpen && (
        <Modal
          isOpen={visitorModalOpen}
          onClose={() => setVisitorModalOpen(false)}
          title="Register Visitor & Issue Pass"
        >
          <form onSubmit={handleRegisterVisitor} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Visitor Full Name</label>
              <Input
                type="text"
                placeholder="e.g. Ramesh Chandra Tripathy"
                value={visName}
                onChange={(e) => setVisName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone Number</label>
              <Input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={visPhone}
                onChange={(e) => setVisPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Purpose of Visit</label>
              <Input
                type="text"
                placeholder="e.g. Parent Visit / Equipment Delivery / Vendor"
                value={visPurpose}
                onChange={(e) => setVisPurpose(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle No. (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. OD-02-AB-1234"
                  value={visVehicle}
                  onChange={(e) => setVisVehicle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student Roll (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. CS2023048"
                  value={visStudentRoll}
                  onChange={(e) => setVisStudentRoll(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setVisitorModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submittingVisitor}>
                {submittingVisitor ? 'Registering...' : 'Issue Visitor Pass'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Manual Gate Crossing */}
      {gateModalOpen && (
        <Modal
          isOpen={gateModalOpen}
          onClose={() => setGateModalOpen(false)}
          title={`Record Manual Gate ${gateActionType}`}
        >
          <form onSubmit={handleManualGateCrossing} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Person Name</label>
              <Input
                type="text"
                placeholder="e.g. Courier Delivery / Faculty Guest"
                value={gatePersonName}
                onChange={(e) => setGatePersonName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Person Category</label>
                <select
                  value={gatePersonType}
                  onChange={(e) => setGatePersonType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                >
                  <option value="VISITOR">Visitor</option>
                  <option value="STUDENT">Student</option>
                  <option value="VENDOR">Vendor / Courier</option>
                  <option value="STAFF">Staff / Faculty</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Registration</label>
                <Input
                  type="text"
                  placeholder="e.g. OD-05-CX-5566"
                  value={gateVehicleNo}
                  onChange={(e) => setGateVehicleNo(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {gateActionType === 'ENTRY' ? 'Purpose of Ingress' : 'Departure Destination'}
              </label>
              <Input
                type="text"
                placeholder={gateActionType === 'ENTRY' ? 'e.g. Package delivery to hostel B' : 'e.g. Returning to city'}
                value={gatePurpose}
                onChange={(e) => setGatePurpose(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setGateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submittingGate}>
                {submittingGate ? 'Logging...' : `Record Gate ${gateActionType}`}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Emergency Broadcast */}
      {emergencyModalOpen && (
        <Modal
          isOpen={emergencyModalOpen}
          onClose={() => setEmergencyModalOpen(false)}
          title="🚨 Broadcast Campus Physical Emergency"
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Incident Category</label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              >
                <option value="MEDICAL">Medical Emergency / Ambulance</option>
                <option value="FIRE">Fire Hazard / Fire Alarm</option>
                <option value="SECURITY">Physical Security Breach</option>
                <option value="FIGHT">Physical Altercation / Brawl</option>
                <option value="ACCIDENT">Vehicular / Facility Accident</option>
                <option value="OTHER">Other Urgent Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Severity Level</label>
              <div className="grid grid-cols-4 gap-2">
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setEmergencySeverity(sev)}
                    className={`py-2 rounded-xl text-[11px] font-bold uppercase transition-all ${
                      emergencySeverity === sev
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Location <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Block A, 2nd Floor Corridor"
                value={emergencyLocation}
                onChange={(e) => setEmergencyLocation(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Situation Details</label>
              <Textarea
                rows={3}
                placeholder="Describe situation, casualties, or required response..."
                value={emergencyDesc}
                onChange={(e) => setEmergencyDesc(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setEmergencyModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleTriggerEmergency}
                disabled={submittingEmergency}
              >
                {submittingEmergency ? 'Broadcasting...' : 'DISPATCH EMERGENCY ALERT'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
