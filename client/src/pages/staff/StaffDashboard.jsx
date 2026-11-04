import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { facultyApi } from '../../services/facultyApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import {
  Users,
  CalendarDays,
  Clock,
  CheckCircle,
  FileText,
  UserCheck,
  AlertCircle,
  BookOpen,
  Send,
  Search,
  Filter,
  Check,
  X,
  GraduationCap
} from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const location = useLocation();

  // Tab state synced with URL pathname or local state
  const getInitialTab = () => {
    if (location.pathname.includes('/attendance')) return 'attendance';
    if (location.pathname.includes('/students')) return 'students';
    if (location.pathname.includes('/notices')) return 'notices';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('ALL');

  // Attendance modal state
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attBatchId, setAttBatchId] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // 1. Fetch Dashboard Telemetry
  const { data: dashboardData, isLoading: dashLoading } = useQuery({
    queryKey: ['faculty-dashboard'],
    queryFn: () => facultyApi.getDashboard().then(r => r.data || r),
    staleTime: 30000
  });

  // 2. Fetch Classes / Batches
  const { data: classesData } = useQuery({
    queryKey: ['faculty-classes'],
    queryFn: () => facultyApi.getClasses().then(r => r.data || r || []),
    staleTime: 60000
  });

  // 3. Fetch Students Roster
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['faculty-students', selectedBatch, studentSearch],
    queryFn: () => facultyApi.getStudents({
      batchId: selectedBatch !== 'ALL' ? selectedBatch : undefined,
      search: studentSearch || undefined
    }).then(r => r.data || r || []),
    staleTime: 30000
  });

  // Endorse Leave Mutation
  const endorseMutation = useMutation({
    mutationFn: ({ id, decision, remarks }) => facultyApi.endorseLeave(id, decision, remarks),
    onSuccess: (_, variables) => {
      toast.success(`Leave request ${variables.decision.toLowerCase()} successfully`);
      queryClient.invalidateQueries(['faculty-dashboard']);
    },
    onError: () => toast.error('Failed to update leave endorsement')
  });

  // Submit Attendance Mutation
  const attendanceMutation = useMutation({
    mutationFn: (payload) => facultyApi.saveAttendance(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Attendance recorded successfully');
      setIsAttendanceModalOpen(false);
      queryClient.invalidateQueries(['faculty-dashboard']);
      queryClient.invalidateQueries(['faculty-students']);
    },
    onError: () => toast.error('Failed to record attendance')
  });

  const handleOpenAttendanceModal = (batchId = '') => {
    setAttBatchId(batchId);
    const initial = {};
    if (Array.isArray(studentsData)) {
      studentsData.forEach(s => {
        initial[s.id] = 'PRESENT';
      });
    }
    setAttendanceRecords(initial);
    setIsAttendanceModalOpen(true);
  };

  const handleToggleAttendance = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = () => {
    const formatted = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      studentId,
      status
    }));

    if (formatted.length === 0) {
      toast.error('No student attendance records to submit');
      return;
    }

    attendanceMutation.mutate({
      batchId: attBatchId,
      date: new Date().toISOString(),
      attendanceRecords: formatted
    });
  };

  const profile = dashboardData?.profile || {};
  const stats = dashboardData?.stats || {
    activeBatches: 4,
    totalStudents: 120,
    todayLectures: 3,
    pendingApprovals: 2
  };
  const todaySchedule = dashboardData?.todaySchedule || [];
  const pendingLeaves = dashboardData?.pendingLeaves || [];
  const recentNotices = dashboardData?.recentNotices || [];
  const batches = Array.isArray(classesData) ? classesData : [];
  const students = Array.isArray(studentsData) ? studentsData : [];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title={`Faculty Portal: ${profile.name || user?.name || 'Dr. Professor'}`}
        subtitle={`${profile.designation || 'Faculty Member'} • Department of ${profile.department || 'Computer Science & Engineering'}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries(['faculty-dashboard'])}
            >
              Refresh Data
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenAttendanceModal()}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
          </div>
        }
      />

      {/* 2. Top Telemetry KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Batches"
          value={dashLoading ? '...' : stats.activeBatches}
          icon={Users}
          color="blue"
          subtitle="Assigned academic cohorts"
        />
        <StatCard
          title="Total Students"
          value={dashLoading ? '...' : stats.totalStudents}
          icon={GraduationCap}
          color="purple"
          subtitle="Department enrolled roster"
        />
        <StatCard
          title="Today's Lectures"
          value={dashLoading ? '...' : stats.todayLectures}
          icon={CalendarDays}
          color="emerald"
          subtitle="Scheduled timetable periods"
        />
        <StatCard
          title="Pending Leave Reviews"
          value={dashLoading ? '...' : stats.pendingApprovals}
          icon={Clock}
          color={stats.pendingApprovals > 0 ? 'amber' : 'green'}
          subtitle="Student leave requests"
        />
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        {[
          { id: 'overview', label: 'Command Overview', icon: BookOpen },
          { id: 'attendance', label: 'Classes & Schedule', icon: CalendarDays },
          { id: 'students', label: 'Student Roster', icon: Users },
          { id: 'leaves', label: 'Leave Endorsements', icon: UserCheck, count: pendingLeaves.length },
          { id: 'notices', label: 'Academic Bulletins', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Views */}

      {/* VIEW 1: COMMAND OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Today's Lectures */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                Today's Lecture Schedule
              </h3>
              <Badge variant="info">Day: {new Date().toLocaleDateString('en-US', { weekday: 'long' })}</Badge>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <p className="font-medium">No further lectures scheduled for today.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map(lec => (
                  <div key={lec.id} className="p-3.5 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-slate-900">
                        {lec.subject} ({lec.subjectCode})
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                        <span>Cohort: <strong className="text-slate-700">{lec.batchName}</strong></span>
                        <span>Hall: <strong className="text-slate-700">{lec.roomNumber}</strong></span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <Badge variant="primary">{lec.startTime} - {lec.endTime}</Badge>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleOpenAttendanceModal(lec.batchId)}
                      >
                        Record Roster
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending Leave Endorsements */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-500" />
                Student Leave Endorsements
              </h3>
              <span className="text-xs text-slate-500">{pendingLeaves.length} pending review</span>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Check className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <p className="font-medium">All student leave requests endorsed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeaves.map(leave => (
                  <div key={leave.id} className="p-3.5 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{leave.studentName}</span>
                      <Badge variant="warning">PENDING</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 italic">
                      "{leave.reason}"
                    </p>
                    <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                      <span>{new Date(leave.startDate).toLocaleDateString()} ➔ {new Date(leave.endDate).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="xs"
                          variant="danger"
                          onClick={() => endorseMutation.mutate({ id: leave.id, decision: 'REJECTED', remarks: 'Attendance requirement not met' })}
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Decline
                        </Button>
                        <Button
                          size="xs"
                          variant="success"
                          onClick={() => endorseMutation.mutate({ id: leave.id, decision: 'APPROVED' })}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Recommend
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* VIEW 2: CLASSES & BATCHES */}
      {activeTab === 'attendance' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Academic Cohorts & Class Directory</h3>
              <p className="text-xs text-slate-500">Cohorts and lecture batches under your instructional purview</p>
            </div>
            <Button size="sm" onClick={() => handleOpenAttendanceModal()}>
              <UserCheck className="w-4 h-4 mr-2" />
              Mark Batch Attendance
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {batches.map(b => (
              <div key={b.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">{b.name}</span>
                    <Badge variant="info">Sem {b.currentSemester}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div>Department: <strong>{b.department}</strong></div>
                    <div>Academic Year: <strong>{b.academicYear}</strong></div>
                    <div>Enrolled Students: <strong className="text-indigo-600">{b.studentCount} active</strong></div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      setSelectedBatch(b.id);
                      setActiveTab('students');
                    }}
                  >
                    View Roster
                  </Button>
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => handleOpenAttendanceModal(b.id)}
                  >
                    Mark Roll
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* VIEW 3: STUDENT ROSTER */}
      {activeTab === 'students' && (
        <Card className="p-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Department Student Roster</h3>
              <p className="text-xs text-slate-500">Real-time attendance rates and academic directory</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  placeholder="Search student or roll no..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
              <Select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="text-xs md:w-40"
              >
                <option value="ALL">All Batches</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </div>
          </div>

          {studentsLoading ? (
            <div className="text-center py-12"><Spinner /></div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No student records match the search filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Cohort</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Accommodation</th>
                    <th className="p-3">Attendance Rate</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-indigo-600">{s.rollNumber}</td>
                      <td className="p-3 font-semibold text-slate-900">
                        {s.name}
                        <div className="text-slate-400 text-[10px]">{s.email}</div>
                      </td>
                      <td className="p-3">{s.batch} (Sem {s.semester})</td>
                      <td className="p-3">{s.phone}</td>
                      <td className="p-3">
                        <Badge variant={s.room === 'Day Scholar' ? 'default' : 'info'}>
                          {s.room === 'Day Scholar' ? 'Day Scholar' : `Room ${s.room}`}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${s.attendancePercentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {s.attendancePercentage}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {s.attendancePercentage >= 75 ? 'Eligible' : 'Shortage'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={s.status === 'ACTIVE' ? 'success' : 'danger'}>{s.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* VIEW 4: LEAVE ENDORSEMENTS */}
      {activeTab === 'leaves' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Student Academic Leave Endorsements</h3>
              <p className="text-xs text-slate-500">Endorse student leaves for academic and attendance waiver tracking</p>
            </div>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
              <p className="font-semibold text-slate-700">No pending leave requests.</p>
              <p className="text-xs">All departmental requests have been processed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingLeaves.map(leave => (
                <div key={leave.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{leave.studentName}</div>
                    <p className="text-xs text-slate-600 mt-1">{leave.reason}</p>
                    <div className="text-xs text-slate-400 mt-1">
                      Duration: {new Date(leave.startDate).toLocaleDateString()} ➔ {new Date(leave.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => endorseMutation.mutate({ id: leave.id, decision: 'REJECTED', remarks: 'Attendance requirement not met' })}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => endorseMutation.mutate({ id: leave.id, decision: 'APPROVED' })}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Recommend Endorsement
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* VIEW 5: NOTICES & BULLETINS */}
      {activeTab === 'notices' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Academic Circulars & Institutional Notices</h3>
              <p className="text-xs text-slate-500">Official bulletins distributed to students and departmental staff</p>
            </div>
          </div>

          <div className="space-y-3">
            {recentNotices.map(n => (
              <div key={n.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={n.priority === 'HIGH' ? 'danger' : 'info'}>{n.category}</Badge>
                    <span className="font-bold text-sm text-slate-900">{n.title}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Published on {new Date(n.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <Badge variant="default">Published</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 5. MODAL: MARK BATCH ATTENDANCE */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title="Mark Lecture Attendance Roster"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Record attendance status for each enrolled student in this period.
          </p>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-200 border rounded-lg p-2">
            {students.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">Loading student roster...</div>
            ) : (
              students.map(s => {
                const cur = attendanceRecords[s.id] || 'PRESENT';
                return (
                  <div key={s.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{s.name}</div>
                      <div className="text-slate-400 text-[10px] font-mono">{s.rollNumber}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {['PRESENT', 'ABSENT', 'LATE'].map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleToggleAttendance(s.id, status)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                            cur === status
                              ? status === 'PRESENT'
                                ? 'bg-emerald-600 text-white'
                                : status === 'ABSENT'
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setIsAttendanceModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={attendanceMutation.isPending}
              onClick={handleSaveAttendance}
            >
              Submit Attendance
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
