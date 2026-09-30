import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { CreditCard, CheckCircle2, Download, AlertCircle, HelpCircle } from 'lucide-react';

export default function Fees() {
  const [feeData, setFeeData] = useState(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/fees/my-fees');
        setFeeData(res.data);
      } catch (err) {
        console.warn('Fees load fallback', err);
      }
    }
    load();
  }, []);

  const handleQuery = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/fees/queries', { subject, message });
      setSubmittedQuery(true);
      setTimeout(() => {
        setShowQueryModal(false);
        setSubmittedQuery(false);
        setSubject('');
        setMessage('');
      }, 1500);
    } catch (err) {
      alert('Failed to submit query');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fee Ledger & Accounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Semester tuition, hostel charges, mess advance, and clearance receipts
          </p>
        </div>

        <button
          onClick={() => setShowQueryModal(true)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          <HelpCircle className="h-4 w-4 text-blue-600" />
          <span>Raise Accounts Query</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Semester Dues</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹97,000</div>
          <span className="text-[11px] text-slate-400">Autumn 2026 • Sem 5</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Amount Paid</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">₹97,000</div>
          <span className="text-[11px] text-emerald-600 font-medium">100% Cleared via NetBanking</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
          <span className="text-xs font-semibold text-emerald-900">Current Outstanding Balance</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">₹0.00</div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> No-Dues Financial Clearance Active
          </span>
        </div>
      </div>

      {/* Breakdown Ledger Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-3">Itemized Fee Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Component</th>
                <th className="py-2.5 px-3 font-semibold">Billing Period</th>
                <th className="py-2.5 px-3 font-semibold">Amount</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(feeData?.components || [
                { name: 'Academic Tuition Fee', amount: 65000, status: 'PAID' },
                { name: 'Hostel Accommodation & Power', amount: 18000, status: 'PAID' },
                { name: 'Mess Food Advance', amount: 12000, status: 'PAID' },
                { name: 'Library & Lab Caution Deposit', amount: 2000, status: 'PAID' }
              ]).map((comp, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-medium text-slate-900">{comp.name}</td>
                  <td className="py-3 px-3 text-slate-500">Semester 5</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">₹{comp.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                      {comp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Query Modal */}
      {showQueryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Raise Fee Query</h2>
            <p className="text-xs text-slate-500 mb-4">Direct message to Accounts & Financial Aid Office</p>

            {submittedQuery ? (
              <div className="text-center py-6 text-emerald-600 text-xs font-bold">
                ✓ Query submitted to Accounts Desk!
              </div>
            ) : (
              <form onSubmit={handleQuery} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Scholarship fee reimbursement inquiry"
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details or bank transaction reference..."
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowQueryModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-blue-700"
                  >
                    Submit Query
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
