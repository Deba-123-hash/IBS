import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatINR, formatDateTime } from '../../utils/formatters.js';

export function ReceiptModal({ isOpen, receipt, onClose }) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:p-0 print:bg-white">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Official Institutional Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 md:p-8 space-y-6 bg-white" id="printable-receipt">
          {/* Institution Header */}
          <div className="text-center border-b border-slate-200 pb-5">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
              CampusOS Unified Operations
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">Finance & Student Accounts Department</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200/80 text-[11px] font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{receipt.status || 'VERIFIED'} PAYMENT</span>
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Receipt Number</span>
              <span className="font-mono font-bold text-slate-800">{receipt.receiptNumber || 'REC-PENDING'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Transaction ID</span>
              <span className="font-mono text-slate-700 truncate block">{receipt.transactionId || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Student Name</span>
              <span className="font-semibold text-slate-900">{receipt.studentName || 'Student'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Student ID / Roll No</span>
              <span className="font-mono text-slate-700">{receipt.studentRoll || receipt.studentId || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Fee Category</span>
              <span className="font-semibold text-slate-800 uppercase">{receipt.feeCategory || receipt.feeType || 'Institutional Fee'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Payment Method</span>
              <span className="font-semibold text-slate-800 uppercase">{receipt.paymentMethod || receipt.method || 'COUNTER'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Payment Date & Time</span>
              <span className="text-slate-700">{formatDateTime(receipt.paymentDate || receipt.createdAt || new Date())}</span>
            </div>
          </div>

          {/* Total Box */}
          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">Amount Paid</span>
            <span className="text-xl font-extrabold text-emerald-800 font-mono">
              {formatINR(receipt.amount || 0)}
            </span>
          </div>

          {/* Verification Watermark & Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Verified by: {receipt.verifiedBy || 'Finance Office'}</span>
            <span>Digitally Generated via CampusOS</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReceiptModal;
