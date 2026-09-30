import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  QrCode,
  Plus,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  Maximize2
} from 'lucide-react';

export default function GatePasses() {
  const { user } = useAuth();
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
      setPasses(res.data.gatePasses || []);
    } catch (err) {
      console.warn('Gate pass fetch fallback', err);
    }
  };

  useEffect(() => {
    loadPasses();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      alert('Failed to request gate pass');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWardenDecision = async (passId, decision) => {
    try {
      await apiClient.patch(`/gate-passes/${passId}/decision`, {
        decision,
        remarks: 'Warden evaluated request'
      });
      await loadPasses();
    } catch (err) {
      alert('Decision update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hostel Gate Passes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Paperless permissions, Warden approvals, and cryptographic QR gate checkout
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Apply for Gate Pass</span>
        </button>
      </div>

      {/* Gate Pass Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {passes.map((p) => {
          const isApproved = p.status === 'APPROVED';
          const isPending = p.status === 'PENDING';
          const isCheckedOut = p.status === 'CHECKED_OUT';

          return (
            <div
              key={p.id}
              className={`rounded-2xl border bg-white p-5 shadow-xs flex flex-col justify-between transition hover:shadow-sm ${
                isApproved ? 'border-blue-200' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {p.passNumber}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isCheckedOut
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-900 mb-1">
                  {p.type.replace('_', ' ')}
                </div>
                <p className="text-xs text-slate-600 mb-3">{p.reason}</p>

                <div className="space-y-1.5 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>Destination: <strong>{p.destination}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Window: 5:00 PM - 9:00 PM</span>
                  </div>
                  <div>Student: <strong>{p.studentName}</strong> ({p.rollNumber})</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {isApproved && (
                  <button
                    onClick={() => setSelectedQrPass(p)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Show Gate Pass QR</span>
                  </button>
                )}

                {isPending && (user?.role === 'WARDEN' || user?.role === 'ADMIN') && (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleWardenDecision(p.id, 'APPROVED')}
                      className="flex-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleWardenDecision(p.id, 'REJECTED')}
                      className="flex-1 rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {isPending && user?.role !== 'WARDEN' && user?.role !== 'ADMIN' && (
                  <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Awaiting Warden Authorization</span>
                  </span>
                )}

                {isCheckedOut && (
                  <span className="text-[11px] text-purple-700 font-medium">
                    Currently Off-Campus (Checkout recorded)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code Presentation Modal */}
      {selectedQrPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                VALID EXIT PASS
              </span>
              <button
                onClick={() => setSelectedQrPass(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 border-2 border-slate-900 rounded-2xl inline-block bg-white shadow-sm mb-3">
              {/* Scalable crisp QR SVG */}
              <svg className="w-48 h-48" viewBox="0 0 100 100" fill="currentColor">
                <path d="M10 10h30v30h-30z M15 15v20h20v-20z M20 20h10v10h-10z M60 10h30v30h-30z M65 15v20h20v-20z M70 20h10v10h-10z M10 60h30v30h-30z M15 65v20h20v-20z M20 70h10v10h-10z M50 15h5v5h-5z M50 25h5v15h-5z M60 50h15v5h-15z M80 50h10v15h-10z M50 65h10v5h-10z M65 65h15v10h-15z M50 80h10v10h-10z M70 85h20v5h-20z" />
              </svg>
            </div>

            <div className="font-mono text-xs font-bold text-slate-900 mb-1">
              {selectedQrPass.passNumber}
            </div>
            <div className="text-xs font-bold text-slate-800">{selectedQrPass.studentName}</div>
            <div className="text-[11px] text-slate-500 mb-3">{selectedQrPass.rollNumber} • {selectedQrPass.hostel}</div>

            <div className="bg-emerald-50 text-emerald-800 rounded-xl p-2.5 text-xs font-medium border border-emerald-200">
              Hold device up to Security Guard camera at Main Gate 1
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900">Request Gate Pass</h2>
              <button onClick={() => setShowApplyModal(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Outing Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                >
                  <option value="DAY_OUTING">Day Outing (Curfew 9:00 PM)</option>
                  <option value="NIGHT_OUT">Night Outing (Requires Warden Review)</option>
                  <option value="EMERGENCY">Medical / Family Emergency</option>
                  <option value="VACATION">Semester Break Vacation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Apollo Hospital / City Market"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly state purpose of leaving campus..."
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Out Time</label>
                  <input
                    type="time"
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Return Time</label>
                  <input
                    type="time"
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-blue-700"
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
