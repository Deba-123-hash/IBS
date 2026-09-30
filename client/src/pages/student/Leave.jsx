import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { StatusPill } from '../../components/common/StatusPill.jsx';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client.js';

export default function Leave() {
  const [leaves, setLeaves] = useState([
    {
      id: 'LV-2026-008',
      type: 'FAMILY',
      startDate: '2026-10-02',
      endDate: '2026-10-05',
      destination: 'Bhubaneswar, Odisha',
      reason: 'Sister wedding ceremony',
      emergencyContact: '+91 94370 12345',
      status: 'APPROVED'
    },
    {
      id: 'LV-2026-014',
      type: 'MEDICAL',
      startDate: '2026-10-12',
      endDate: '2026-10-14',
      destination: 'Cuttack Hospital',
      reason: 'Scheduled dental procedure',
      emergencyContact: '+91 98610 54321',
      status: 'PENDING'
    }
  ]);

  const [form, setForm] = useState({
    type: 'PERSONAL',
    startDate: '',
    endDate: '',
    destination: '',
    reason: '',
    emergencyContact: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      // API call to leave endpoint
      const newLeave = {
        id: `LV-2026-${Math.floor(100 + Math.random() * 900)}`,
        ...form,
        status: 'PENDING'
      };

      setLeaves([newLeave, ...leaves]);
      setSuccessMsg('Leave application lodged successfully! Warden notified.');
      setForm({
        type: 'PERSONAL',
        startDate: '',
        endDate: '',
        destination: '',
        reason: '',
        emergencyContact: ''
      });
    } catch (err) {
      console.warn(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel & Academic Leave Application"
        subtitle="Digital outstation permission with automatic parent notification and warden sign-off"
      />

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leave Form */}
        <Card className="p-6 lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>Apply for Leave</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Category</label>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="PERSONAL">Personal / Vacation</option>
                <option value="MEDICAL">Medical Emergency / Consultation</option>
                <option value="FAMILY">Family Function / Visit</option>
                <option value="ACADEMIC">Academic Conference / Event</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Return Date</label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Outstation Destination</label>
              <Input
                placeholder="City / Address"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency / Guardian Contact</label>
              <Input
                placeholder="+91 Phone Number"
                value={form.emergencyContact}
                onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave</label>
              <Textarea
                placeholder="Provide detailed justification..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={3}
                required
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
              Submit Leave Request
            </Button>
          </form>
        </Card>

        {/* Existing Leaves List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-600" />
            <span>Active & Past Applications</span>
          </h2>

          <div className="space-y-3">
            {leaves.map((leave) => (
              <Card key={leave.id} className="p-4 hover:border-slate-300 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">{leave.id}</span>
                      <StatusPill status={leave.status} />
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {leave.type}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{leave.reason}</h3>
                    <p className="text-xs text-slate-500">
                      Destination: <span className="text-slate-800 font-medium">{leave.destination}</span> •
                      Emergency Phone: <span className="font-mono text-slate-700">{leave.emergencyContact}</span>
                    </p>
                  </div>

                  <div className="text-right text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 shrink-0">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Duration</div>
                    <div className="font-bold text-slate-800">{leave.startDate} to {leave.endDate}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
