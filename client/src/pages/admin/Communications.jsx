import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import {
  Send,
  Users,
  CheckCircle,
  Eye,
  TrendingUp,
  AlertCircle,
  Bell,
  Clock
} from 'lucide-react';

export default function Communications() {
  const [notices, setNotices] = useState([
    {
      id: 'NTC-2026-088',
      title: 'End-Semester Exam Form Submission Deadline',
      category: 'EXAMINATION',
      priority: 'URGENT',
      target: 'MCA & B.Tech • 3rd Year',
      recipients: 1842,
      readCount: 1701,
      actionCount: 1532,
      publishedAt: '28 Sep 2026'
    },
    {
      id: 'NTC-2026-092',
      title: 'Hostel Block B Hot Water Geyser Maintenance Schedule',
      category: 'HOSTEL',
      priority: 'NORMAL',
      target: 'Hostel Block B Residents',
      recipients: 184,
      readCount: 172,
      actionCount: 110,
      publishedAt: '29 Sep 2026'
    }
  ]);

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'ACADEMIC',
    targetAudience: 'ALL',
    priority: 'NORMAL',
    actionLabel: 'Acknowledge Circular'
  });

  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Deterministic Audience Estimation Calculation
  const getEstimatedRecipients = () => {
    switch (form.targetAudience) {
      case 'ALL': return 2450;
      case 'DEPARTMENT_CS': return 620;
      case 'PROGRAM_MCA': return 180;
      case 'HOSTEL_B': return 184;
      case 'FINAL_YEAR': return 580;
      default: return 2450;
    }
  };

  const handlePublish = (e) => {
    e.preventDefault();
    setPublishing(true);

    const est = getEstimatedRecipients();
    const newNotice = {
      id: `NTC-2026-0${Math.floor(100 + Math.random() * 900)}`,
      title: form.title,
      category: form.category,
      priority: form.priority,
      target: form.targetAudience.replace('_', ' '),
      recipients: est,
      readCount: 1,
      actionCount: 0,
      publishedAt: 'Just now'
    };

    setNotices([newNotice, ...notices]);
    setSuccessMsg(`Targeted circular broadcast published successfully to ${est} eligible students!`);
    setPublishing(false);
    setForm({
      title: '',
      content: '',
      category: 'ACADEMIC',
      targetAudience: 'ALL',
      priority: 'NORMAL',
      actionLabel: 'Acknowledge Circular'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Campus Broadcast & Targeted Communications Hub"
          subtitle="Direct institutional notification engine replacing chaotic WhatsApp forwards with measurable engagement"
        />

        <div className="flex items-center gap-2">
          <Badge variant="purple">Read Rate Benchmark: 92.3%</Badge>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Notice Composer */}
        <Card className="p-6 lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Send className="h-4 w-4 text-blue-600" />
            <span>Compose Targeted Notice</span>
          </h2>

          <form onSubmit={handlePublish} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Headline</label>
              <Input
                placeholder="e.g. Tomorrow class schedule update"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <Select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="ACADEMIC">Academic</option>
                  <option value="EXAMINATION">Examination</option>
                  <option value="HOSTEL">Hostel</option>
                  <option value="FEE">Finance / Fee</option>
                  <option value="EVENT">Event</option>
                  <option value="EMERGENCY">Emergency</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <Select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="NORMAL">Normal</option>
                  <option value="IMPORTANT">Important</option>
                  <option value="URGENT">Urgent Alert</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience Scope</label>
              <Select
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
              >
                <option value="ALL">Entire Campus (All Students)</option>
                <option value="DEPARTMENT_CS">Department: Computer Science</option>
                <option value="PROGRAM_MCA">Program: MCA (All Semesters)</option>
                <option value="FINAL_YEAR">Batch: 3rd / Final Year</option>
                <option value="HOSTEL_B">Residential: Hostel Block B</option>
              </Select>
            </div>

            {/* Target Audience Estimation Callout */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
              <span className="text-blue-900 font-semibold flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                Target Estimation:
              </span>
              <span className="font-bold text-blue-700 font-mono">
                {getEstimatedRecipients()} Students
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Body / Directives</label>
              <Textarea
                placeholder="Full details, instructions, room locations, or deadlines..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4}
                required
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={publishing}>
              Publish & Push Notifications
            </Button>
          </form>
        </Card>

        {/* Notice Engagement Telemetry */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span>Published Circulars & Engagement Intelligence</span>
          </h2>

          <div className="space-y-3">
            {notices.map((n) => {
              const readRate = ((n.readCount / n.recipients) * 100).toFixed(1);
              const actionRate = ((n.actionCount / n.readCount) * 100).toFixed(1);

              return (
                <Card key={n.id} className="p-5 hover:border-slate-300 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">{n.id}</span>
                        <Badge variant={n.priority === 'URGENT' ? 'danger' : 'default'}>{n.priority}</Badge>
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          {n.category}
                        </span>
                        <span className="text-[10px] text-slate-400">• {n.publishedAt}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                      <p className="text-xs text-slate-500">Audience: <strong className="text-slate-700">{n.target}</strong></p>
                    </div>

                    <div className="text-right text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 shrink-0">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Audience Base</div>
                      <div className="font-bold text-slate-800">{n.recipients} Students</div>
                    </div>
                  </div>

                  {/* Read and Action Rate Progress Bars */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">Read Rate:</span>
                        <span className="font-bold text-emerald-600">{readRate}% ({n.readCount})</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${readRate}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">Action Taken:</span>
                        <span className="font-bold text-blue-600">{actionRate}% ({n.actionCount})</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${actionRate}%` }} />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
