import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { QrCode, CheckCircle2, AlertTriangle, UserCheck, ShieldCheck, Camera, Search } from 'lucide-react';

export default function GateVerification() {
  const [tokenInput, setTokenInput] = useState('GP-SECURE-TOKEN-CS2023048-DAY42');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const loadLogs = async () => {
    try {
      const res = await apiClient.get('/security/logs');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.warn('Security logs load fallback', err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) return;

    setLoading(true);
    try {
      const res = await apiClient.post('/security/verify-qr', {
        qrCodeToken: tokenInput.trim()
      });
      setVerificationResult(res.data);
      await loadLogs();
    } catch (err) {
      alert('QR Verification Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Gate Clearance Terminal</h1>
            <p className="text-xs text-slate-500">Camera QR Scanner & Student Departure/Arrival Verification (Gate 1)</p>
          </div>
        </div>
      </div>

      {/* Camera / Token Input Scanner Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            QR Scanner Input
          </span>
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Camera & Barcode Reader Active
          </span>
        </div>

        <form onSubmit={handleVerify} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Scan or enter token: GP-SECURE-TOKEN-..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
            <QrCode className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
          >
            <UserCheck className="h-4 w-4" />
            <span>Verify Pass</span>
          </button>
        </form>
      </div>

      {/* Verification Result Banner Card */}
      {verificationResult && (
        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 p-6 shadow-md animate-in fade-in zoom-in-95">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                  Gate Clearance Approved
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  {verificationResult.studentName}
                </h2>
                <p className="text-xs text-slate-600">
                  Roll: <strong className="text-slate-900">{verificationResult.rollNumber}</strong> • {verificationResult.hostel}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-white p-3 border border-emerald-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Event Recorded</span>
              <div className="text-xs font-bold text-emerald-700">CHECK-OUT RECORDED</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{verificationResult.timestamp}</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 pt-4 text-xs">
            <div className="rounded-xl bg-white p-3 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Pass Category</span>
              <span className="font-bold text-slate-800">{verificationResult.type}</span>
            </div>
            <div className="rounded-xl bg-white p-3 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Destination</span>
              <span className="font-bold text-slate-800">{verificationResult.destination}</span>
            </div>
            <div className="rounded-xl bg-white p-3 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Return Curfew Window</span>
              <span className="font-bold text-slate-800">{verificationResult.validUntil}</span>
            </div>
          </div>
        </div>
      )}

      {/* Security Checkpoint Live Ledger */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-3">Today's Gate Crossing Logs</h2>
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs border border-slate-100"
            >
              <div>
                <span className="font-bold text-slate-900">{log.name}</span>
                <span className="text-slate-500 ml-2">({log.roll || log.hostRoll})</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{log.type.replace('_', ' ')} • {log.gate}</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-800">{log.time}</span>
                <div>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[9px] font-bold">
                    {log.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
