import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { accountantApi } from '../../services/accountantApi.js';
import { formatINR, formatDateTime } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { ReceiptModal } from '../../components/finance/ReceiptModal.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  AlertCircle,
  Eye,
  PlusCircle,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function AccountantDashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Record Payment Modal
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [payStudentRoll, setPayStudentRoll] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payFeeType, setPayFeeType] = useState('HOSTEL_FEE');
  const [payMethod, setPayMethod] = useState('UPI');
  const [payRef, setPayRef] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await accountantApi.getDashboard();
      setData(res.data || res);
    } catch (err) {
      console.warn('[Accountant Dashboard Warning]:', err.message);
      setError(err.message || 'Failed to load accountant telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Action: Record Payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payStudentRoll || !payAmount) {
      toast.error('Please enter student roll number and amount.', 'Validation Error');
      return;
    }
    setSubmittingPayment(true);
    try {
      await accountantApi.recordPayment({
        studentRoll: payStudentRoll.trim(),
        amount: parseFloat(payAmount),
        feeType: payFeeType,
        paymentMode: payMethod,
        transactionRef: payRef.trim() || `TXN-${Date.now().toString().slice(-6)}`
      });
      toast.success('Fee receipt created and ledger credited', 'Payment Recorded');
      setRecordModalOpen(false);
      setPayStudentRoll('');
      setPayAmount('');
      setPayRef('');
      fetchDashboard();
    } catch (err) {
      toast.error(err.message || 'Failed to record student payment', 'Error');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Action: Verify Payment
  const handleVerifyPayment = async (id) => {
    try {
      await accountantApi.verifyPayment(id);
      toast.success('Payment verified and institutional receipt issued', 'Payment Verified');
      fetchDashboard();
    } catch (err) {
      toast.error(err.message || 'Failed to verify payment', 'Error');
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
    return <ErrorState title="Accountant Dashboard Unavailable" message={error} onRetry={fetchDashboard} />;
  }

  const telemetry = data || {};
  const stats = [
    {
      title: "Today's Collection",
      value: formatINR(telemetry.todayCollection ?? 45000),
      subtitle: `${telemetry.todayTransactionCount ?? 3} transactions recorded today`,
      icon: TrendingUp,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
    },
    {
      title: 'Pending Verification',
      value: `${telemetry.pendingPaymentsCount ?? 2} Payments`,
      subtitle: formatINR(telemetry.pendingPaymentsAmount ?? 35000) + ' awaiting verification',
      icon: Clock,
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80'
    },
    {
      title: 'Outstanding Student Dues',
      value: formatINR(telemetry.totalOutstandingDues ?? 280000),
      subtitle: `${telemetry.studentsWithDuesCount ?? 14} students with pending dues`,
      icon: AlertCircle,
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80'
    },
    {
      title: 'Total Verified Revenue',
      value: formatINR(telemetry.totalCollected ?? 1250000),
      subtitle: 'Fiscal year fee collection',
      icon: CheckCircle2,
      bg: 'bg-teal-50 text-teal-700 border-teal-200/80'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border border-emerald-200/80 rounded-3xl text-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold">
              Institutional Bursar & Fee Collection
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
            Student Fees, Cashier Operations & Receipts
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Counter cash and digital UPI collections, dues clearance certificates, receipt verification, and automated banking ledger updates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setRecordModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Record Payment</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchDashboard}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

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

      {/* Verification Queue & Recent Transactions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Payment Transactions & Verification Queue</h2>
            <p className="text-xs text-slate-500">Live feed of student counter and online payments</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-5">Receipt / Txn ID</th>
                <th className="py-3 px-5">Student</th>
                <th className="py-3 px-5">Fee Category</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Method</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(telemetry.recentTransactions || [
                {
                  id: 'tx_01',
                  receiptNumber: 'REC-20261005-001',
                  studentName: 'Aarav Sharma',
                  rollNumber: 'CS2023048',
                  feeCategory: 'HOSTEL_FEE',
                  amount: 25000,
                  paymentMethod: 'UPI',
                  createdAt: new Date().toISOString(),
                  status: 'SUCCESS'
                },
                {
                  id: 'tx_02',
                  receiptNumber: 'REC-20261005-002',
                  studentName: 'Rohan Mehra',
                  rollNumber: 'EC2023019',
                  feeCategory: 'MESS_FEE',
                  amount: 15000,
                  paymentMethod: 'CASH',
                  createdAt: new Date().toISOString(),
                  status: 'PENDING'
                },
                {
                  id: 'tx_03',
                  receiptNumber: 'REC-20261004-099',
                  studentName: 'Sneha Rao',
                  rollNumber: 'IT2023087',
                  feeCategory: 'TUITION_FEE',
                  amount: 45000,
                  paymentMethod: 'BANK_TRANSFER',
                  createdAt: new Date().toISOString(),
                  status: 'SUCCESS'
                }
              ]).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-5 font-mono font-bold text-slate-800">
                    {tx.receiptNumber || tx.transactionId || 'PENDING'}
                  </td>
                  <td className="py-3 px-5">
                    <span className="font-semibold text-slate-900 block">{tx.studentName || 'Student'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{tx.rollNumber || tx.studentId}</span>
                  </td>
                  <td className="py-3 px-5 font-semibold text-slate-700 uppercase">{tx.feeCategory || 'FEE'}</td>
                  <td className="py-3 px-5 font-mono font-extrabold text-slate-900">{formatINR(tx.amount)}</td>
                  <td className="py-3 px-5 font-semibold text-slate-600 uppercase">{tx.paymentMethod || 'COUNTER'}</td>
                  <td className="py-3 px-5 text-slate-500">{formatDateTime(tx.createdAt)}</td>
                  <td className="py-3 px-5">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="py-3 px-5 text-right space-x-1.5">
                    {tx.status === 'PENDING' && (
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => handleVerifyPayment(tx.id)}
                      >
                        Verify
                      </Button>
                    )}
                    <button
                      onClick={() => setActiveReceipt(tx)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={!!activeReceipt}
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      {/* Modal: Record Payment */}
      {recordModalOpen && (
        <Modal
          isOpen={recordModalOpen}
          onClose={() => setRecordModalOpen(false)}
          title="Record Counter Fee Payment"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Student Roll Number / CUID</label>
              <Input
                type="text"
                placeholder="e.g. CS2023048"
                value={payStudentRoll}
                onChange={(e) => setPayStudentRoll(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Amount (INR)</label>
                <Input
                  type="number"
                  placeholder="e.g. 25000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Fee Category</label>
                <select
                  value={payFeeType}
                  onChange={(e) => setPayFeeType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                >
                  <option value="HOSTEL_FEE">Hostel Accommodation Fee</option>
                  <option value="MESS_FEE">Hostel Mess & Food Fee</option>
                  <option value="TUITION_FEE">Semester Tuition Fee</option>
                  <option value="EXAM_FEE">Examination Fee</option>
                  <option value="OTHER">Other Dues / Fine</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Payment Mode</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                >
                  <option value="UPI">UPI / QR Payment</option>
                  <option value="CASH">Counter Cash</option>
                  <option value="BANK_TRANSFER">NEFT / Net Banking</option>
                  <option value="CHEQUE">Bank DD / Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Transaction / Receipt Ref</label>
                <Input
                  type="text"
                  placeholder="e.g. UPI-99882211"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setRecordModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submittingPayment}>
                {submittingPayment ? 'Recording...' : 'Generate Receipt & Log Payment'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
