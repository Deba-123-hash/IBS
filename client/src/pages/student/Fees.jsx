import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { CreditCard, CheckCircle2, Download, AlertCircle, HelpCircle } from 'lucide-react';
import DataTable from '../../components/tables/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function Fees() {
  const [feeData, setFeeData] = useState(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/fees/my-fees');
        setFeeData(res.data || res);
      } catch (err) {
        console.warn('Fees load fallback', err);
      }
    }
    load();
  }, []);

  const handleQuery = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  const componentsData = feeData?.components || [
    { id: 1, name: 'Academic Tuition Fee', period: 'Semester 5', amount: 65000, status: 'PAID' },
    { id: 2, name: 'Hostel Accommodation & Power', period: 'Semester 5', amount: 18000, status: 'PAID' },
    { id: 3, name: 'Mess Food Advance', period: 'Semester 5', amount: 12000, status: 'PAID' },
    { id: 4, name: 'Library & Lab Caution Deposit', period: 'One-time', amount: 2000, status: 'PAID' }
  ];

  const columns = [
    {
      header: 'Component',
      accessor: 'name',
      isPrimary: true,
      render: (row) => <span className="font-semibold text-slate-900">{row.name}</span>
    },
    {
      header: 'Billing Period',
      accessor: 'period',
      render: (row) => <span className="text-slate-500">{row.period || 'Semester 5'}</span>
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => (
        <span className="font-semibold text-slate-800">
          ₹{row.amount?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'PAID' ? 'success' : 'warning'}>
          {row.status}
        </Badge>
      )
    }
  ];

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
          className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-emerald-300 transition hover-lift"
        >
          <HelpCircle className="h-4 w-4 text-emerald-600" />
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

      {/* Breakdown Ledger Table (Responsive Mobile Cards & Desktop Grid) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900">Itemized Fee Breakdown</h2>
        <DataTable
          columns={columns}
          data={componentsData}
          ariaLabel="Fee Breakdown Ledger"
        />
      </div>

      {/* Accessible Query Dialog */}
      <Modal
        isOpen={showQueryModal}
        onClose={() => setShowQueryModal(false)}
        title="Raise Fee Query"
        subtitle="Direct message to Accounts & Financial Aid Office"
        maxWidth="max-w-md"
      >
        {submittedQuery ? (
          <div className="text-center py-6 text-emerald-600 text-xs font-bold">
            ✓ Query submitted to Accounts Desk!
          </div>
        ) : (
          <form onSubmit={handleQuery} className="space-y-4 text-xs">
            <Input
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Scholarship fee reimbursement inquiry"
              required
            />
            <Textarea
              label="Message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide details or bank transaction reference..."
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowQueryModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
              >
                Submit Query
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
