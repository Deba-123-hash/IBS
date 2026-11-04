import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  QrCode,
  Plus,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  Maximize2,
  ShieldCheck,
  User,
  ArrowRight,
  Sparkles,
  Building2,
  FileCheck
} from 'lucide-react';

export default function GatePasses() {
  const { user } = useAuth();
  const toast = useToast();
  const [passes, setPasses] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedQrPass, setSelectedQrPass] = useState(null);

  // Form inputs
  const [type, setType] = useState('DAY_OUTING');
  const [reason, setReason] = useState('');
  const [destination, setDestination] = useState('');
  const [outTime, setOutTime] = useState('17:00');
  const [inTime, setInTime] = useState('21:00');
  const [submitting, setSubmitting] = useState(false);

  const loadPasses = async () => {
    try {
      const res = await apiClient.get('/gate-passes');
      const list = res.data?.data?.gatePasses || res.data?.gatePasses || (Array.isArray(res.data) ? res.data : []);
      setPasses(list);
    } catch (err) {
      console.warn('Gate pass fetch fallback', err);
    }
  };

  useEffect(() => {
    loadPasses();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!destination.trim() || !reason.trim()) {
      toast.warning('Please enter destination and reason for gate outing', 'Missing Information');
      return;
    }
    setSubmitting(true);
    try {
      const now = new Date();
      const outDate = new Date(now.setHours(parseInt(outTime.split(':')[0]), parseInt(outTime.split(':')[1])));
      const inDate = new Date(now.setHours(parseInt(inTime.split(':')[0]), parseInt(inTime.split(':')[1])));

      await apiClient.post('/gate-passes', {
        type,
        reason,
        destination,
        outTimeExpected: outDate.toISOString(),
        inTimeExpected: inDate.toISOString()
      });

      setShowApplyModal(false);
      setReason('');
      setDestination('');
      await loadPasses();
      toast.success('Gate pass submitted to Hostel Warden for review', 'Request Dispatched');
    } catch (err) {
      toast.error('Failed to submit gate pass request', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWardenDecision = async (passId, decision) => {
    try {
      await apiClient.patch(`/gate-passes/${passId}/decision`, {
        decision,
        remarks: 'Warden reviewed request'
      });
      await loadPasses();
      toast.success(`Pass updated to ${decision}`, 'Warden Review');
    } catch (err) {
      toast.error('Decision update failed', 'Error');
    }
  };

  const activePass = passes.find((p) => p.status === 'APPROVED' || p.status === 'CHECKED_OUT') || passes[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hostel Residential Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Hostel Gate Passes (QR Exit)
          </h1>
          <p className="text-xs text-slate-500">
            Paperless permissions, Warden clearance, and cryptographic QR turnstile scanning
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-soft transition hover-lift"
        >
          <Plus className="h-4 w-4" />
          <span>Apply for Gate Pass</span>
        </button>
      </div>

      {/* Featured Approved Pass Card (Demo Moment 5) */}
      {activePass && (
        <div className="rounded-3xl border border-emerald-300 bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/40 p-6 md:p-8 shadow-soft">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                  APPROVED & ACTIVE
                </span>
                <span className="font-mono text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                  {activePass.passNumber || 'GP-2026-0042'}
                </span>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {activePass.type || 'DAY OUTING'}
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {user?.firstName || 'Aarav'} {user?.lastName || 'Sharma'}
                </h2>
                <p className="text-xs text-slate-500">
                  Roll: {user?.rollNumber || '2301105001'} • Hostel Block B, Room 304 • CAMPUS OS
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-700 bg-white/80 p-4 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Approved Destination</span>
                    <strong>{activePass.destination || 'Apollo Health Center, Patia'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Exit / Entry Curfew</span>
                    <strong>05:00 PM – 09:00 PM Today</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center bg-white p-5 rounded-3xl border border-slate-200 shadow-soft">
              <div className="p-3 border-2 border-slate-900 rounded-2xl bg-white shadow-2xs">
                <svg className="w-32 h-32 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M10 10h30v30h-30z M15 15v20h20v-20z M20 20h10v10h-10z M60 10h30v30h-30z M65 15v20h20v-20z M70 20h10v10h-10z M10 60h30v30h-30z M15 65v20h20v-20z M20 70h10v10h-10z M50 15h5v5h-5z M50 25h5v15h-5z M60 50h15v5h-15z M80 50h10v15h-10z M50 65h10v5h-10z M65 65h15v10h-15z M50 80h10v10h-10z M70 85h20v5h-20z" />
                </svg>
              </div>
              <span className="text-[11px] font-mono text-slate-600 font-semibold mt-2.5">
                {activePass.qrCodeToken || 'GP-TOKEN-CS2023048-DAY42'}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                ● Security Turnstile Ready
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Gate Pass History Registry */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">Your Gate Pass Requests & History</h2>

        <div className="grid gap-3">
          {passes.map((pass) => (
            <div
              key={pass.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover-lift transition"
            >
              <div className="flex items-start gap-3.5">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                  pass.status === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : pass.status === 'PENDING'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <QrCode className="h-5 w-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      {pass.passNumber || 'GP-2026-0042'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pass.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : pass.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pass.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {pass.destination}
                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Reason: {pass.reason}
                  </p>
                </div>
              </div>

              {/* Action buttons / details */}
              <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                {(user?.role === 'WARDEN' || user?.role === 'ADMIN') && pass.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleWardenDecision(pass.id, 'APPROVED')}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleWardenDecision(pass.id, 'REJECTED')}
                      className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs"
                    >
                      Reject
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setSelectedQrPass(pass)}
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition"
                >
                  View Pass
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Gate Pass Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowApplyModal(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
          />

          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl z-10 animate-slide-down space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Hostel Gate Pass</h3>
                <p className="text-xs text-slate-500">Dispatched to Warden Suresh Patel</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pass Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {['DAY_OUTING', 'NIGHT_OUT'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`rounded-xl py-2 font-bold transition border ${
                        type === t
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination Address / Landmark</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Apollo Hospital, KIIT Square, Bhubaneswar Market..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Exit Time</label>
                  <input
                    type="time"
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Curfew Return Time</label>
                  <input
                    type="time"
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Reason for Outing</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Medical checkup, textbook purchase, emergency family requirement..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold transition shadow-soft hover-lift"
                >
                  {submitting ? 'Submitting...' : 'Submit to Warden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
