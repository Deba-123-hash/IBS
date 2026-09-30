import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
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
  X
} from 'lucide-react';

export default function Complaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('PLUMBING');
  const [location, setLocation] = useState('Hostel Block B - Room 304');
  const [priority, setPriority] = useState('HIGH');
  const [photoUrl, setPhotoUrl] = useState('');
  const [aiPreview, setAiPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState('');

  const loadComplaints = async () => {
    try {
      const res = await apiClient.get('/complaints');
      setComplaints(res.data.complaints || []);
      if (!selectedTicket && res.data.complaints?.length > 0) {
        setSelectedTicket(res.data.complaints[0]);
      }
    } catch (err) {
      console.warn('Failed to load complaints', err);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleTestAi = async () => {
    if (!title && !description) return;
    try {
      const res = await apiClient.post('/ai/classify-complaint', {
        title,
        description,
        location
      });
      setAiPreview(res.data);
      if (res.data.category) setCategory(res.data.category);
      if (res.data.priority) setPriority(res.data.priority);
    } catch (err) {
      console.warn('AI classification error', err);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
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
      setShowModal(false);
      setTitle('');
      setDescription('');
      setAiPreview(null);
      await loadComplaints();
      if (res.data.complaint) {
        setSelectedTicket(res.data.complaint);
      }
    } catch (err) {
      alert('Error creating complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      await apiClient.patch(`/complaints/${selectedTicket.id}/status`, {
        status: newStatus,
        comment: `Technician updated ticket to ${newStatus}`
      });
      await loadComplaints();
      setSelectedTicket((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTicket) return;
    try {
      await apiClient.post(`/complaints/${selectedTicket.id}/comments`, {
        message: commentText
      });
      setCommentText('');
      await loadComplaints();
      setSelectedTicket((prev) => ({
        ...prev,
        comments: [
          ...(prev.comments || []),
          { id: `c_${Date.now()}`, sender: `${user?.firstName || 'User'}`, message: commentText, time: 'Just now' }
        ]
      }));
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  const filtered = filterStatus === 'ALL'
    ? complaints
    : complaints.filter(c => c.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hostel Grievances & Repairs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            SLA-tracked digital maintenance pipeline with AI triage and photo audit logs
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Report New Grievance</span>
        </button>
      </div>

      {/* Status Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['ALL', 'SUBMITTED', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filterStatus === st
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Two Column Layout: Ticket List & Ticket Detail View */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.map((item) => {
            const isSelected = selectedTicket?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedTicket(item)}
                className={`cursor-pointer rounded-2xl border p-4 bg-white shadow-xs transition hover:border-blue-300 ${
                  isSelected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {item.ticketNumber}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.status === 'IN_PROGRESS'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                  <span>{item.category} • {item.location}</span>
                  <span className="font-semibold text-slate-700">{item.priority}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Ticket Detail */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Priority: <strong className="text-red-600">{selectedTicket.priority}</strong>
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedTicket.title}
                  </h2>
                </div>

                {/* Maintenance / Admin Status Control Buttons */}
                <div className="flex items-center gap-2">
                  {selectedTicket.status !== 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleStatusUpdate('IN_PROGRESS')}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {selectedTicket.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleStatusUpdate('RESOLVED')}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                    >
                      Resolve Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Milestones Stepper */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Resolution Progress Stepper
                </div>
                <div className="grid grid-cols-4 text-center text-[11px]">
                  <div className="flex flex-col items-center">
                    <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mb-1">
                      ✓
                    </div>
                    <span className="font-semibold text-slate-900">Submitted</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mb-1">
                      ✓
                    </div>
                    <span className="font-semibold text-slate-900">Assigned</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                      selectedTicket.status === 'IN_PROGRESS' || selectedTicket.status === 'RESOLVED' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {selectedTicket.status === 'RESOLVED' ? '✓' : '⚙'}
                    </div>
                    <span className="font-semibold text-slate-900">In Progress</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                      selectedTicket.status === 'RESOLVED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {selectedTicket.status === 'RESOLVED' ? '✓' : '4'}
                    </div>
                    <span className="font-semibold text-slate-900">Resolved</span>
                  </div>
                </div>
              </div>

              {/* Description & Metadata */}
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-slate-900">Issue Description:</div>
                <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                  {selectedTicket.description}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-slate-500">
                  <div><strong>Assigned To:</strong> {selectedTicket.assignedStaff}</div>
                  <div><strong>Location:</strong> {selectedTicket.location}</div>
                </div>

                {selectedTicket.photoUrl && (
                  <div className="pt-2">
                    <span className="font-semibold text-slate-900 block mb-1">Photo Evidence:</span>
                    <img
                      src={selectedTicket.photoUrl}
                      alt="Complaint attachment"
                      className="h-44 w-auto rounded-xl border border-slate-200 object-cover shadow-xs"
                    />
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span>Discussion & Technician Updates</span>
                </h3>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(selectedTicket.comments || []).map((cm, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100">
                      <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                        <span>{cm.sender}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{cm.time}</span>
                      </div>
                      <p className="text-slate-600">{cm.message}</p>
                    </div>
                  ))}
                  {(!selectedTicket.comments || selectedTicket.comments.length === 0) && (
                    <p className="text-xs text-slate-400 italic">No comments yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type an update or reply..."
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 text-xs">
              Select a ticket on the left to review its lifecycle and technician updates.
            </div>
          )}
        </div>

      </div>

      {/* New Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900">Lodge Maintenance Grievance</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bathroom sink water pipe broken and leaking"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened, noise, smoke, leak severity..."
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* AI Classification Trigger */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>AI Smart Triage & Priority</span>
                  </div>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Auto-classifies trade and priority to accelerate dispatch
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestAi}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-blue-700 transition"
                >
                  Analyze with AI
                </button>
              </div>

              {aiPreview && (
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-slate-700 space-y-1">
                  <div><strong>AI Trade Detected:</strong> {aiPreview.category}</div>
                  <div><strong>Suggested Priority:</strong> <span className="text-red-600 font-bold">{aiPreview.priority}</span></div>
                  <div><strong>Department:</strong> {aiPreview.department}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                  >
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="INTERNET">Internet / Wi-Fi</option>
                    <option value="CLEANING">Cleaning & Janitorial</option>
                    <option value="FURNITURE">Furniture & Carpentry</option>
                    <option value="OTHER">Other Facilities</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent (Safety Risk)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room / Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Block B, Room 304"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Photo Proof URL (Optional)</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  {submitting ? 'Submitting...' : 'Register Ticket'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
