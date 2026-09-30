import React, { useState } from 'react';
import apiClient from '../../api/client.js';
import { HelpCircle, User, QrCode, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function HelpDesk() {
  const [studentRoll, setStudentRoll] = useState('CS2023048');
  const [requestType, setRequestType] = useState('COMPLAINT');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [generatedSlip, setGeneratedSlip] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.post('/help-desk/proxy-request', {
        studentRoll,
        requestType,
        title,
        details
      });
      setGeneratedSlip(res.data.ticket);
    } catch (err) {
      alert('Proxy ticket generation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Help Desk Proxy Service Terminal</h1>
            <p className="text-xs text-slate-500">Assisting students without smartphones, dead batteries, or network outages</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Form Panel */}
        <div className="md:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">Log Physical Student Request</h2>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student Roll Number (From Physical ID Card)</label>
              <input
                type="text"
                value={studentRoll}
                onChange={(e) => setStudentRoll(e.target.value)}
                required
                placeholder="e.g. CS2023048"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Service Requisition Type</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
              >
                <option value="COMPLAINT">Hostel Facility Grievance (Repair)</option>
                <option value="GATE_PASS">Emergency Gate Exit Pass</option>
                <option value="CERTIFICATE">Academic Certificate Application</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Request Summary</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bathroom sink pipe burst"
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Detailed Particulars</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Specific room number, reason, emergency phone..."
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              {submitting ? 'Generating Slip...' : 'Issue Proxy Ticket & Barcode Slip'}
            </button>
          </form>
        </div>

        {/* Printed Receipt Slip Panel */}
        <div className="md:col-span-5">
          {generatedSlip ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 shadow-sm text-center space-y-4">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 py-1 rounded-lg">
                <CheckCircle2 className="h-4 w-4" />
                <span>OFFICIAL CAMPUS RECEIPT</span>
              </div>

              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">{generatedSlip.ticketNumber}</h3>
                <p className="text-[11px] text-slate-500">{generatedSlip.title}</p>
              </div>

              {/* Barcode Mock */}
              <div className="p-3 bg-slate-50 rounded-xl flex flex-col items-center justify-center">
                <div className="h-10 w-44 bg-slate-800 flex items-center justify-around px-2 text-white text-[9px] font-mono tracking-widest">
                  ||||| ||| |||| || |||||
                </div>
                <span className="font-mono text-[10px] text-slate-500 mt-1">{generatedSlip.barcode}</span>
              </div>

              <div className="text-left text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
                <div><strong>Student:</strong> {generatedSlip.studentName} ({generatedSlip.studentRoll})</div>
                <div><strong>Officer:</strong> {generatedSlip.loggedByStaff}</div>
                <div><strong>Logged:</strong> {new Date(generatedSlip.createdAt).toLocaleTimeString()}</div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
              >
                <Printer className="h-4 w-4" />
                <span>Print Physical Slip</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-xs">
              Fill out student details on the left to generate an authoritative printed reference token slip with barcode.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
