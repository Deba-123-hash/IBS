import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Wrench,
  Plus,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Image as ImageIcon,
  Check,
  Send,
  X,
  Search,
  Filter,
  User,
  MapPin,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Layers,
  Zap,
  Wifi,
  Droplet,
  Trash2,
  Armchair,
  Fan
} from 'lucide-react';

export default function Complaints() {
  const { user } = useAuth();
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(false);

  // Multi-step Wizard State (Steps 1 to 5)
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Plumbing & Drainage');
  const [location, setLocation] = useState('Hostel Block B - Room 304');
  const [priority, setPriority] = useState('HIGH');
  const [photoUrl, setPhotoUrl] = useState('');
  const [aiPreview, setAiPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const categories = [
    { id: 'Plumbing & Drainage', label: 'Plumbing', icon: Droplet, desc: 'Water leak, tap, flush' },
    { id: 'Electrical & Power', label: 'Electrical', icon: Zap, desc: 'Switch, light, fan socket' },
    { id: 'Internet & Wi-Fi', label: 'Wi-Fi / LAN', icon: Wifi, desc: 'Signal drop, LAN port' },
    { id: 'Housekeeping & Sanitation', label: 'Cleaning', icon: Trash2, desc: 'Corridor, waste disposal' },
    { id: 'Hostel Furniture & Fixtures', label: 'Furniture', icon: Armchair, desc: 'Bed, study table, lock' },
    { id: 'Classroom AC & Audio/Visual', label: 'Appliance / AC', icon: Fan, desc: 'Water cooler, AC unit' }
  ];

  const timelineSteps = [
    { key: 'SUBMITTED', label: 'Submitted', desc: 'Ticket registered' },
    { key: 'ASSIGNED', label: 'Assigned', desc: 'Technician dispatched' },
    { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Work underway' },
    { key: 'RESOLVED', label: 'Resolved', desc: 'Action complete' },
    { key: 'CLOSED', label: 'Closed', desc: 'Student verified' }
  ];

  const loadComplaints = async () => {
    try {
      const res = await apiClient.get('/complaints');
      const list = res.data?.data?.complaints || res.data?.complaints || res.complaints || (Array.isArray(res.data) ? res.data : []);
      setComplaints(list);
      if (list.length > 0 && !selectedTicket) {
        setSelectedTicket(list[0]);
      }
    } catch (err) {
      console.warn('Failed to load complaints', err);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleAiAssistance = async () => {
    if (!title && !description) return;
    try {
      const res = await apiClient.post('/ai/classify-complaint', {
        title,
        description,
        location
      });
      const data = res.data?.data || res.data;
      setAiPreview(data);
      if (data?.category) setCategory(data.category);
      if (data?.priority) setPriority(data.priority);
      toast.info('AI classified category and SLA priority', 'AI Assistant');
    } catch (err) {
      console.warn('AI classification fallback', err);
    }
  };

  const handleCreateSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await apiClient.post('/complaints', {
        title,
        description,
        category,
        location,
        priority,
        photoUrl
      });
      const comp = res.data?.data?.complaint || res.data?.complaint || res.data;
      setCreatedResult(comp || {
        ticketNumber: `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        category,
        status: 'SUBMITTED'
      });
      setCurrentStep(5);
      await loadComplaints();
      toast.success('Your maintenance grievance was logged successfully!', 'Ticket Logged');
    } catch (err) {
      toast.error('Could not submit complaint. Please check fields.', 'Submission Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTicket) return;
    setPostingComment(true);
    try {
      await apiClient.post(`/complaints/${selectedTicket.id}/comments`, {
        comment: commentText
      });
      setCommentText('');
      await loadComplaints();
      toast.success('Comment appended to grievance audit trail', 'Comment Posted');
    } catch (err) {
      toast.error('Failed to post comment', 'Error');
    } finally {
      setPostingComment(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchCat = filterCategory === 'ALL' || c.category?.name?.includes(filterCategory) || c.category === filterCategory;
    const matchSearch = !searchQuery.trim() || c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || c.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const getStepIndex = (status) => {
    switch (status) {
      case 'SUBMITTED': return 0;
      case 'ASSIGNED': return 1;
      case 'IN_PROGRESS': return 2;
      case 'RESOLVED': return 3;
      case 'CLOSED': return 4;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Campus Facilities & Maintenance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Hostel Grievances & Work Orders
          </h1>
          <p className="text-xs text-slate-500">
            Automated dispatching, SLA tracking, and technician assignment with AI categorization
          </p>
        </div>

        <button
          onClick={() => {
            setShowWizard(true);
            setCurrentStep(1);
            setAiPreview(null);
            setCreatedResult(null);
          }}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-soft transition hover-lift"
        >
          <Plus className="h-4 w-4" />
          <span>New Grievance Ticket</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticket ID or title (e.g. CMP-2026-0042, tap leak)..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 outline-none focus:bg-white focus:border-emerald-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'Plumbing', 'Electrical', 'Internet'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                filterCategory === cat
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: List & Detail with Horizontal Timeline */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Complaints List (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-1">
          {filteredComplaints.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-slate-800">You're all clear!</div>
              <p>No open grievance tickets found matching your query.</p>
            </div>
          ) : (
            filteredComplaints.map((c) => {
              const isSelected = selectedTicket?.id === c.id;
              const catName = c.category?.name || c.category || 'General';
              const isUrgent = c.priority === 'CRITICAL' || c.priority === 'HIGH';

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedTicket(c)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all hover-lift ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-soft'
                      : 'border-slate-200/80 bg-white hover:border-emerald-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {c.ticketNumber || 'CMP-2026'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'RESOLVED' || c.status === 'CLOSED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                    {c.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-500 mt-2">
                    <span className="font-medium text-slate-700">{catName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {c.location || 'Block B - Room 304'}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Logged 2 days ago</span>
                    <span className={`font-semibold ${isUrgent ? 'text-amber-700' : 'text-slate-600'}`}>
                      Priority: {c.priority}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Complaint Detail & Interactive Horizontal Timeline (7 cols) */}
        {selectedTicket && (
          <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 md:p-7 shadow-xs space-y-6">
            
            {/* Ticket Header */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {selectedTicket.ticketNumber}
                </span>
                <span className="text-[11px] text-slate-400">
                  Created {new Date(selectedTicket.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{selectedTicket.title}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                {selectedTicket.description}
              </p>
            </div>

            {/* Horizontal Interactive Timeline (Demo Moment 3) */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Track Complaint SLA Lifecycle
              </span>

              <div className="relative flex items-center justify-between">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-100 z-0" />
                
                {/* Active Colored Fill Line */}
                <div
                  className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-emerald-500 z-0 transition-all duration-700"
                  style={{ width: `${(getStepIndex(selectedTicket.status) / (timelineSteps.length - 1)) * 100}%` }}
                />

                {timelineSteps.map((step, idx) => {
                  const currentIdx = getStepIndex(selectedTicket.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}>
                        {isDone ? <Check className="h-4 w-4" /> : idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold mt-1.5 ${
                        isCurrent ? 'text-emerald-800' : isDone ? 'text-slate-800' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assignment & Location Details */}
            <div className="grid sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                <span className="text-[11px] text-slate-400 block">Assigned Technician</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {selectedTicket.assignedTo?.user ? `${selectedTicket.assignedTo.user.firstName} ${selectedTicket.assignedTo.user.lastName}` : 'Ramesh Kumar (Plumber)'}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">On-Duty Maintenance Team</span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                <span className="text-[11px] text-slate-400 block">Location Verified</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedTicket.location || 'Hostel Block B - Room 304'}</span>
                <span className="text-[10px] text-slate-500">Floor 3 • West Wing</span>
              </div>
            </div>

            {/* Comments & Activity Stream */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Grievance Activity & Notes
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(selectedTicket.comments || [
                  { id: 'cm_1', comment: 'Assigned to plumbing technician for emergency seal replacement.', user: { firstName: 'Suresh', lastName: 'Patel' }, createdAt: '2026-09-30T10:00:00Z' },
                  { id: 'cm_2', comment: 'Parts requisition approved. Arriving at Room 304 at 11:30 AM.', user: { firstName: 'Ramesh', lastName: 'Kumar' }, createdAt: '2026-09-30T10:30:00Z' }
                ]).map((cm) => (
                  <div key={cm.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{cm.user?.firstName} {cm.user?.lastName}</span>
                      <span className="text-slate-400 text-[10px]">Recent</span>
                    </div>
                    <p className="text-slate-600">{cm.comment}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add note for technician or warden..."
                  className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={postingComment}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* STEP-BASED CREATE COMPLAINT WIZARD MODAL (Section 8 & Demo Moment 4) */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowWizard(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
          />

          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-10 animate-slide-down">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                  {currentStep < 5 ? `${currentStep}/4` : '✓'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {currentStep === 1 && 'Step 1: Select Facility Category'}
                    {currentStep === 2 && 'Step 2: Describe Grievance'}
                    {currentStep === 3 && 'Step 3: Location & Details'}
                    {currentStep === 4 && 'Step 4: Confirm & Review'}
                    {currentStep === 5 && 'Ticket Registered Successfully'}
                  </h3>
                  <p className="text-[11px] text-slate-500">CAMPUS OS Automated Facility Dispatch</p>
                </div>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              
              {/* STEP 1: Category Selection */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-slate-500">
                    Select the trade or department responsible for this maintenance request:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={`cursor-pointer rounded-2xl border p-3.5 text-center transition-all ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-soft ring-2 ring-emerald-500/20'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="text-xs font-bold">{cat.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{cat.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: Issue Description + AI Auto-Classifier */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Issue Summary Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Bathroom sink water leakage, Room door lock jammed..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Detailed Problem Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what happened, floor damage, severity, or urgency..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* AI Assistance Trigger */}
                  <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-teal-600" />
                      <span className="text-teal-900 font-medium">Smart AI Auto-Classification</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAiAssistance}
                      className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 text-[11px] font-bold transition shadow-2xs"
                    >
                      Classify SLA
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Location & Room Confirmation */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hostel Unit / Campus Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      SLA Urgency Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`rounded-xl py-2 text-xs font-bold transition border ${
                            priority === p
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Confirm */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">Category</span>
                      <span className="font-bold text-slate-900">{category}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">Title</span>
                      <span className="font-bold text-slate-900">{title || 'Facility Issue'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">Location</span>
                      <span className="font-bold text-slate-900">{location}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Priority Tier</span>
                      <span className="font-bold text-amber-700">{priority} (24h Target Turnaround)</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    Once submitted, our maintenance routing engine dispatches this directly to the warden and on-duty technician.
                  </p>
                </div>
              )}

              {/* STEP 5: Success State with Animated Checkmark (Demo Moment 4) */}
              {currentStep === 5 && (
                <div className="text-center py-6 space-y-4 animate-fade-in">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-emerald-glow">
                    <svg className="w-10 h-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" className="animate-draw-check" />
                    </svg>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Grievance Ticket Created!</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Ticket ID: <strong className="font-mono text-emerald-700">{createdResult?.ticketNumber || 'CMP-2026-0043'}</strong>
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-left space-y-1">
                    <div className="font-bold text-emerald-950">Estimated Turnaround Status:</div>
                    <p className="text-slate-600">Dispatched to Maintenance Desk • Expected technician visit within 4 hours.</p>
                  </div>

                  <button
                    onClick={() => setShowWizard(false)}
                    className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-xs font-bold transition shadow-soft hover-lift"
                  >
                    Return to Grievances
                  </button>
                </div>
              )}

            </div>

            {/* Modal Footer Controls (Steps 1 to 4) */}
            {currentStep < 5 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
                <button
                  type="button"
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Back
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep === 2 && !title.trim()) {
                        toast.warning('Please enter a brief title for your grievance', 'Title Required');
                        return;
                      }
                      setCurrentStep((prev) => prev + 1);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-2xs"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleCreateSubmit}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold transition shadow-soft hover-lift"
                  >
                    <span>{submitting ? 'Dispatching...' : 'Confirm & Submit'}</span>
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
