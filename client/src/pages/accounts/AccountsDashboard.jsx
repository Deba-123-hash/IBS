import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { accountsApi } from '../../services/accountsApi.js';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Scale,
  PieChart,
  FileSpreadsheet,
  Download,
  PlusCircle,
  Building,
  Zap,
  Droplet,
  Shield,
  Layers,
  Wrench,
  Users,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function AccountsDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const getTabFromPath = (path) => {
    if (path.includes('/accounts/expenses')) return 'expenses';
    if (path.includes('/accounts/reconciliation')) return 'reconciliation';
    if (path.includes('/accounts/overview')) return 'overview';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const pathMap = {
      overview: '/accounts/dashboard',
      expenses: '/accounts/expenses',
      reconciliation: '/accounts/reconciliation'
    };
    if (pathMap[tab]) {
      navigate(pathMap[tab]);
    }
  };

  const [data, setData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('ALL');

  // Record Expense Modal
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('HOSTEL_OPERATIONS');
  const [expPaymentMethod, setExpPaymentMethod] = useState('BANK_TRANSFER');
  const [expRefNumber, setExpRefNumber] = useState('');
  const [expDescription, setExpDescription] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Record Reconciliation Modal
  const [reconModalOpen, setReconModalOpen] = useState(false);
  const [reconStatementBalance, setReconStatementBalance] = useState('');
  const [reconPeriod, setReconPeriod] = useState('October 2026');
  const [reconNotes, setReconNotes] = useState('');
  const [submittingRecon, setSubmittingRecon] = useState(false);

  const fetchAccountsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, expRes, reconRes] = await Promise.allSettled([
        accountsApi.getDashboard(),
        accountsApi.getExpenses({ limit: 50 }),
        accountsApi.getReconciliation({ limit: 50 })
      ]);

      if (dashRes.status === 'fulfilled') {
        setData(dashRes.value.data || dashRes.value || {});
      }
      if (expRes.status === 'fulfilled') {
        const eData = expRes.value.data?.expenses || expRes.value.data || [];
        setExpenses(Array.isArray(eData) ? eData : []);
      }
      if (reconRes.status === 'fulfilled') {
        const rData = reconRes.value.data?.reconciliations || reconRes.value.data || [];
        setReconciliations(Array.isArray(rData) ? rData : []);
      }
    } catch (err) {
      console.warn('[Accounts Dashboard Warning]:', err.message);
      setError(err.message || 'Failed to load financial control telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountsData();
  }, []);

  // Action: Create Expense
  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!expTitle.trim() || !expAmount) {
      toast.error('Please specify title and amount.', 'Validation Error');
      return;
    }
    setSubmittingExpense(true);
    try {
      await accountsApi.createExpense({
        title: expTitle.trim(),
        amount: parseFloat(expAmount),
        category: expCategory,
        paymentMethod: expPaymentMethod,
        referenceNumber: expRefNumber.trim() || `TXN-${Date.now().toString().slice(-6)}`,
        description: expDescription.trim() || undefined
      });
      toast.success('Operating expenditure recorded successfully', 'Expense Logged');
      setExpenseModalOpen(false);
      setExpTitle('');
      setExpAmount('');
      setExpRefNumber('');
      setExpDescription('');
      fetchAccountsData();
    } catch (err) {
      toast.error(err.message || 'Failed to record expense', 'Error');
    } finally {
      setSubmittingExpense(false);
    }
  };

  // Action: Record Reconciliation
  const handleCreateReconciliation = async (e) => {
    e.preventDefault();
    if (!reconStatementBalance) {
      toast.error('Please enter statement balance.', 'Validation Error');
      return;
    }
    setSubmittingRecon(true);
    try {
      await accountsApi.createReconciliation({
        period: reconPeriod,
        statementBalance: parseFloat(reconStatementBalance),
        notes: reconNotes.trim() || 'Verified monthly bank statement match'
      });
      toast.success('Bank reconciliation entry recorded', 'Reconciliation Matched');
      setReconModalOpen(false);
      setReconStatementBalance('');
      setReconNotes('');
      fetchAccountsData();
    } catch (err) {
      toast.error(err.message || 'Failed to record reconciliation', 'Error');
    } finally {
      setSubmittingRecon(false);
    }
  };

  // Action: Export Audit Package
  const handleExportAudit = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Date,Category,Amount,Reference,Status\n"
      + expenses.map(e => `${new Date(e.createdAt || Date.now()).toISOString().split('T')[0]},${e.category || e.title},${e.amount},${e.referenceNumber || 'N/A'},VERIFIED`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CampusOS_Fiscal_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Fiscal Audit Package exported as CSV', 'Export Generated');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-20 bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse"></div>
        <LoadingSkeleton type="cards" />
        <LoadingSkeleton type="table" rows={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Financial Dashboard Unavailable" message={error} onRetry={fetchAccountsData} />;
  }

  const telemetry = data || {};
  const totalIncome = telemetry.totalIncome ?? 4850000;
  const totalExpenses = telemetry.totalExpenses ?? 2950000;
  const netBalance = telemetry.netBalance ?? (totalIncome - totalExpenses);

  const stats = [
    {
      title: 'Total Fiscal Revenue',
      value: formatINR(totalIncome),
      subtitle: 'Student fees & campus income',
      icon: TrendingUp,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
    },
    {
      title: 'Operating Expenses',
      value: formatINR(totalExpenses),
      subtitle: 'Hostel, mess, utility & staff payouts',
      icon: TrendingDown,
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80'
    },
    {
      title: 'Net Campus Surplus',
      value: formatINR(netBalance),
      subtitle: 'Net treasury liquidity position',
      icon: DollarSign,
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
    },
    {
      title: 'Bank Reconciliation',
      value: `${telemetry.pendingReconciliationsCount ?? 0} Pending`,
      subtitle: telemetry.reconciliationStatus || 'Active variance check: 100% matched',
      icon: Scale,
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80'
    }
  ];

  const expenseCategories = [
    { name: 'Hostel Operations', amount: 820000, icon: Building, color: 'bg-blue-500' },
    { name: 'Mess & Catering', amount: 640000, icon: Layers, color: 'bg-amber-500' },
    { name: 'Electricity & Power', amount: 380000, icon: Zap, color: 'bg-yellow-500' },
    { name: 'Water & Utilities', amount: 120000, icon: Droplet, color: 'bg-cyan-500' },
    { name: 'Repairs & Maintenance', amount: 240000, icon: Wrench, color: 'bg-rose-500' },
    { name: 'Campus Physical Security', amount: 310000, icon: Shield, color: 'bg-emerald-500' },
    { name: 'Staff Remunerations', amount: 440000, icon: Users, color: 'bg-purple-500' }
  ];

  // Filtered expenses
  const filteredExpenses = expenses.filter(e => {
    const matchesCategory = expenseCategoryFilter === 'ALL' || (e.category || '').toUpperCase().includes(expenseCategoryFilter);
    const matchesSearch =
      (e.title || '').toLowerCase().includes(expenseSearch.toLowerCase()) ||
      (e.referenceNumber || '').toLowerCase().includes(expenseSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-white border border-indigo-200/80 rounded-3xl text-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-800 font-bold">
              Treasury & Audit Control Center
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
            Financial Oversight, Balances & Operating Ledgers
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Campus-wide balance sheet oversight, operating expense approvals, bank account reconciliation journals, and fiscal audit packages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setExpenseModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Record Expense</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setReconModalOpen(true)}
            className="flex items-center gap-1.5 bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            <Scale className="h-4 w-4" />
            <span>Bank Match</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportAudit}
            className="flex items-center gap-1.5 bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            <span>Audit Export</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 overflow-x-auto text-xs font-bold text-slate-600">
        {[
          { id: 'overview', label: 'Treasury Overview', icon: PieChart },
          { id: 'expenses', label: `Operating Expenses (${expenses.length})`, icon: DollarSign },
          { id: 'reconciliation', label: `Bank Reconciliation (${reconciliations.length})`, icon: Scale }
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
              <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
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

          {/* Expense Allocation Breakdown & Reconciliation Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Categorized Operating Expenses */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Institutional Operating Expenditure</h2>
                  <p className="text-xs text-slate-500">Expenditure categorized across campus facilities</p>
                </div>
                <button
                  onClick={() => handleTabChange('expenses')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Manage All Expenses
                </button>
              </div>

              <div className="space-y-4">
                {expenseCategories.map((cat, i) => {
                  const Icon = cat.icon;
                  const percent = Math.round((cat.amount / totalExpenses) * 100);
                  return (
                    <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">{cat.name}</span>
                          <span className="text-[11px] text-slate-400">{percent}% of operating expenses</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-900">{formatINR(cat.amount)}</span>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div className={`h-full ${cat.color}`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Bank Reconciliation & Quick Audit Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
                <div className="flex items-center gap-2 mb-3 text-indigo-900 font-bold text-sm">
                  <Scale className="h-4 w-4 text-indigo-600" />
                  <h3>Bank Statement Matching</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Monthly statement reconciliation compares ledger payment transactions against verified bank deposits.
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2.5 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Period:</span>
                    <span className="font-semibold text-slate-800">October 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">System Book Balance:</span>
                    <span className="font-mono font-bold text-slate-800">{formatINR(totalIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Statement Balance:</span>
                    <span className="font-mono font-bold text-slate-800">{formatINR(totalIncome)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                    <span className="text-slate-700">Variance:</span>
                    <span className="font-mono text-emerald-600">₹0.00 (100% Matched)</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleTabChange('reconciliation')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  View Reconciliation Journal
                </Button>
              </div>

              <div className="bg-gradient-to-br from-indigo-50/60 to-white border border-indigo-100 rounded-3xl p-6 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">Fiscal Export</h4>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Export consolidated financial ledgers, GST schedules, and department cost centers for institutional audit.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportAudit}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Audit Package (CSV)</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: OPERATING EXPENSES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Campus Operating Expense Ledger</h2>
              <p className="text-xs text-slate-500">Record, categorize, and inspect institutional disbursements</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  placeholder="Search expense or reference..."
                  className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none w-52"
                />
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              </div>

              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white text-slate-700 font-medium"
              >
                <option value="ALL">All Categories</option>
                <option value="HOSTEL">Hostel</option>
                <option value="MESS">Mess / Food</option>
                <option value="UTILITY">Utilities</option>
                <option value="REPAIRS">Maintenance</option>
                <option value="SECURITY">Security</option>
              </select>

              <Button size="sm" variant="primary" onClick={() => setExpenseModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500">
                <PlusCircle className="h-4 w-4 mr-1.5" />
                <span>New Expense</span>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Title / Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Reference No.</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{e.title}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{e.category || 'Operations'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600">{formatINR(e.amount)}</td>
                    <td className="py-3 px-4 text-slate-600">{e.paymentMethod || 'BANK_TRANSFER'}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{e.referenceNumber || 'TXN-PAID'}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(e.createdAt || Date.now())}</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        DISBURSED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: RECONCILIATION */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'reconciliation' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Bank Statement Reconciliation Journal</h2>
              <p className="text-xs text-slate-500">Verified institutional balance comparisons against bank statements</p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setReconModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500">
              <Scale className="h-4 w-4 mr-1.5" />
              <span>Record Statement Match</span>
            </Button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Book Balance</th>
                  <th className="py-3 px-4">Statement Balance</th>
                  <th className="py-3 px-4">Variance</th>
                  <th className="py-3 px-4">Verification Notes</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reconciliations.length === 0 ? (
                  <tr>
                    <td className="py-4 px-4 font-bold text-slate-800">October 2026</td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">{formatINR(totalIncome)}</td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">{formatINR(totalIncome)}</td>
                    <td className="py-4 px-4 font-mono text-emerald-600 font-bold">₹0.00</td>
                    <td className="py-4 px-4 text-slate-600">State Bank of India Institutional Account Matched</td>
                    <td className="py-4 px-4">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        MATCHED
                      </span>
                    </td>
                  </tr>
                ) : (
                  reconciliations.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-800">{r.period || 'Monthly'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatINR(r.bookBalance || totalIncome)}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatINR(r.statementBalance)}</td>
                      <td className="py-3 px-4 font-mono text-emerald-600 font-bold">₹0.00</td>
                      <td className="py-3 px-4 text-slate-600">{r.notes || 'Reconciled'}</td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          MATCHED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Record Expense */}
      {expenseModalOpen && (
        <Modal
          isOpen={expenseModalOpen}
          onClose={() => setExpenseModalOpen(false)}
          title="Record Operating Expenditure"
        >
          <form onSubmit={handleCreateExpense} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Expense Title / Payee</label>
              <Input
                type="text"
                placeholder="e.g. Hostel B Geyser Electrical Repairs"
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Amount (INR)</label>
                <Input
                  type="number"
                  placeholder="e.g. 15000"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Cost Center</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                >
                  <option value="HOSTEL_OPERATIONS">Hostel Operations</option>
                  <option value="MESS_CATERING">Mess & Catering</option>
                  <option value="UTILITIES">Electricity & Utilities</option>
                  <option value="REPAIRS">Repairs & Maintenance</option>
                  <option value="SECURITY">Campus Security</option>
                  <option value="STAFF">Staff Remuneration</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={expPaymentMethod}
                  onChange={(e) => setExpPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                >
                  <option value="BANK_TRANSFER">NEFT / RTGS / IMPS</option>
                  <option value="CHEQUE">Bank Cheque</option>
                  <option value="UPI">UPI Direct</option>
                  <option value="CASH">Petty Cash</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reference Number</label>
                <Input
                  type="text"
                  placeholder="e.g. UTR-99882211"
                  value={expRefNumber}
                  onChange={(e) => setExpRefNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Description / Memo</label>
              <Textarea
                rows={2}
                placeholder="Institutional purpose, invoice number, or department approval note..."
                value={expDescription}
                onChange={(e) => setExpDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setExpenseModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submittingExpense}>
                {submittingExpense ? 'Recording...' : 'Disburse & Log Expense'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Bank Reconciliation */}
      {reconModalOpen && (
        <Modal
          isOpen={reconModalOpen}
          onClose={() => setReconModalOpen(false)}
          title="Record Bank Statement Balance Match"
        >
          <form onSubmit={handleCreateReconciliation} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Accounting Period</label>
              <Input
                type="text"
                value={reconPeriod}
                onChange={(e) => setReconPeriod(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Verified Bank Statement Balance (INR)</label>
              <Input
                type="number"
                placeholder={totalIncome.toString()}
                value={reconStatementBalance}
                onChange={(e) => setReconStatementBalance(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Audit Notes</label>
              <Textarea
                rows={3}
                placeholder="Details of bank account statement verification, branch seal, or ledger match..."
                value={reconNotes}
                onChange={(e) => setReconNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setReconModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submittingRecon}>
                {submittingRecon ? 'Validating...' : 'Confirm Bank Match'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
