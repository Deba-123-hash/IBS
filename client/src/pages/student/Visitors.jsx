import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { StatusPill } from '../../components/common/StatusPill.jsx';
import { UserCheck, Clock, CheckCircle } from 'lucide-react';

export default function Visitors() {
  const [visitorRequests, setVisitorRequests] = useState([
    {
      id: 'VIS-2026-004',
      visitorName: 'Manoj Sharma',
      relation: 'Father',
      phoneNumber: '+91 94370 12345',
      expectedDate: '2026-10-01',
      expectedTime: '04:00 PM',
      duration: '2 hours',
      status: 'APPROVED'
    },
    {
      id: 'VIS-2026-009',
      visitorName: 'Sunita Sharma',
      relation: 'Mother',
      phoneNumber: '+91 94370 12346',
      expectedDate: '2026-10-01',
      expectedTime: '04:00 PM',
      duration: '2 hours',
      status: 'APPROVED'
    }
  ]);

  const [form, setForm] = useState({
    visitorName: '',
    relation: 'Parent / Guardian',
    phoneNumber: '',
    expectedDate: '',
    expectedTime: '',
    duration: '1 hour'
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const newReq = {
      id: `VIS-2026-${Math.floor(100 + Math.random() * 900)}`,
      ...form,
      status: 'PENDING'
    };

    setVisitorRequests([newReq, ...visitorRequests]);
    setSuccessMsg('Visitor pre-registration submitted! Security checkpoint notified.');
    setSubmitting(false);
    setForm({
      visitorName: '',
      relation: 'Parent / Guardian',
      phoneNumber: '',
      expectedDate: '',
      expectedTime: '',
      duration: '1 hour'
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitor Registration & Outstation Guest Pass"
        subtitle="Pre-clear family and official visitors for seamless security gate check-in"
      />

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-600" />
            <span>Pre-Register Visitor</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Full Name</label>
              <Input
                placeholder="e.g. Ramesh Chandra"
                value={form.visitorName}
                onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
              <Select
                value={form.relation}
                onChange={(e) => setForm({ ...form, relation: e.target.value })}
              >
                <option value="Parent / Guardian">Parent / Guardian</option>
                <option value="Sibling">Sibling</option>
                <option value="Relative">Relative</option>
                <option value="Academic Colleague">Academic Colleague</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <Input
                placeholder="+91 Phone Number"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Date</label>
                <Input
                  type="date"
                  value={form.expectedDate}
                  onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Time</label>
                <Input
                  type="time"
                  value={form.expectedTime}
                  onChange={(e) => setForm({ ...form, expectedTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Stay Duration</label>
              <Select
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              >
                <option value="30 mins">30 mins</option>
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="Half Day (4h)">Half Day (4h)</option>
                <option value="Full Day">Full Day</option>
              </Select>
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
              Submit Visitor Request
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-600" />
            <span>Visitor Pre-Clearances</span>
          </h2>

          <div className="space-y-3">
            {visitorRequests.map((vis) => (
              <Card key={vis.id} className="p-4 hover:border-slate-300 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">{vis.id}</span>
                      <StatusPill status={vis.status} />
                      <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        {vis.relation}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{vis.visitorName}</h3>
                    <p className="text-xs text-slate-500">
                      Contact: <span className="font-mono text-slate-800 font-medium">{vis.phoneNumber}</span> •
                      Duration: <span className="text-slate-700 font-medium">{vis.duration}</span>
                    </p>
                  </div>

                  <div className="text-right text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 shrink-0">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Scheduled Arrival</div>
                    <div className="font-bold text-slate-800">{vis.expectedDate} at {vis.expectedTime}</div>
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
