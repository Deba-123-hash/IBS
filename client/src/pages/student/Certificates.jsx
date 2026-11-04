import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { FileText, Plus, Download, Clock, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export default function Certificates() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [certType, setCertType] = useState('BONAFIDE');
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCerts = async () => {
    try {
      const res = await apiClient.get('/certificates');
      const list = res.data?.requests || res.requests || (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
      setRequests(list);
    } catch (err) {
      console.warn('Certificate fetch fallback', err);
    }
  };

  useEffect(() => {
    loadCerts();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/certificates/request', {
        certificateType: certType,
        purpose
      });
      setShowApplyModal(false);
      setPurpose('');
      await loadCerts();
    } catch (err) {
      alert('Application failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await apiClient.patch(`/certificates/${id}/approve`, {
        remarks: 'Cleared by Academic Section Dean'
      });
      await loadCerts();
    } catch (err) {
      alert('Approval failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Certificates</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Digital requisition and verified issuance of Bonafide, Study, and Fee Estimate certificates
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-soft transition hover-lift"
        >
          <Plus className="h-4 w-4" />
          <span>Apply for Certificate</span>
        </button>
      </div>

      <div className="space-y-4">
        {requests.map((item) => {
          const isReady = item.status === 'AVAILABLE';

          return (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-emerald-300 hover-lift"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  isReady ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-700'
                }`}>
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{item.requestNumber}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isReady ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Purpose: <strong>{item.purpose}</strong></p>
                  <p className="text-[11px] text-slate-400 mt-1">Student: {item.studentName} ({item.rollNumber})</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isReady && (
                  <a
                    href={item.documentUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-emerald-700 transition hover-lift"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Signed PDF</span>
                  </a>
                )}

                {!isReady && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition hover-lift shadow-2xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve & Issue</span>
                  </button>
                )}

                {!isReady && user?.role !== 'ADMIN' && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>Academic Section Processing (24h SLA)</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900">Apply for Certificate</h2>
              <button onClick={() => setShowApplyModal(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Certificate Type</label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                >
                  <option value="BONAFIDE">Bonafide Certificate (Proof of Enrollment)</option>
                  <option value="STUDY">Study / Medium of Instruction Certificate</option>
                  <option value="CHARACTER">Character & Conduct Certificate</option>
                  <option value="FEE_ESTIMATE">Institutional Fee Estimate Certificate (Loan/Scholarship)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Purpose of Requisition</label>
                <textarea
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Applying for State Post-Matric Scholarship or Passport verification..."
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-[11px] text-emerald-900 border border-emerald-200">
                Automatic check: System verifies that semester fee dues are ₹0 prior to digital issuance.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-soft hover:bg-emerald-700 transition hover-lift"
                >
                  {submitting ? 'Lodging Requisition...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
