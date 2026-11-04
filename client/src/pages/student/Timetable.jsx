import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import {
  Clock,
  MapPin,
  User,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Info,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Timetable() {
  const [scheduleData, setScheduleData] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Tuesday');
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/timetable/my-schedule');
        setScheduleData(res.data?.data || res.data || res);
      } catch (err) {
        console.warn('Timetable load fallback', err);
      }
    }
    load();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  const defaultSchedule = {
    Monday: [
      { code: 'CS-401', subject: 'Database Management Systems', time: '09:00 - 10:00 AM', room: 'Lecture Hall 204', faculty: 'Dr. Priya Nair', status: 'COMPLETED' },
      { code: 'CS-402', subject: 'Computer Networks & Security', time: '10:15 - 11:15 AM', room: 'LH-204', faculty: 'Prof. Ananya Sen', status: 'COMPLETED' },
      { code: 'CS-403', subject: 'Design & Analysis of Algorithms', time: '11:30 AM - 12:30 PM', room: 'LH-201', faculty: 'Dr. A. K. Das', status: 'COMPLETED' },
      { code: 'CS-405', subject: 'Algorithm Laboratory (Batch A)', time: '02:00 - 04:00 PM', room: 'Computing Lab 2', faculty: 'Dr. A. K. Das', status: 'COMPLETED' }
    ],
    Tuesday: [
      { code: 'CS-403', subject: 'Design & Analysis of Algorithms', time: '10:00 - 11:00 AM', room: 'Lecture Hall 201', faculty: 'Dr. A. K. Das', status: 'CURRENT' },
      { code: 'CS-402', subject: 'Computer Networks & Security', time: '11:15 AM - 12:15 PM', room: 'Lecture Hall 204', faculty: 'Dr. Priya Nair', status: 'UPCOMING' },
      { code: 'HS-201', subject: 'Professional Ethics & Cyber Law', time: '02:00 - 03:00 PM', room: 'Auditorium Hall', faculty: 'Prof. S. Mishra', status: 'UPCOMING' },
      { code: 'CS-406', subject: 'Network Simulation Lab', time: '03:15 - 05:15 PM', room: 'Lab 3 (Networking)', faculty: 'Prof. Ananya Sen', status: 'UPCOMING' }
    ],
    Wednesday: [
      { code: 'CS-404', subject: 'Operating Systems & System Ops', time: '09:00 - 10:00 AM', room: 'Lecture Hall 201', faculty: 'Dr. Rajesh Rao', status: 'UPCOMING' },
      { code: 'CS-401', subject: 'Database Management Systems', time: '10:15 - 11:15 AM', room: 'Lecture Hall 204', faculty: 'Dr. Priya Nair', status: 'UPCOMING' },
      { code: 'CS-407', subject: 'Web Technologies & Cloud Arch', time: '11:30 AM - 12:30 PM', room: 'LH-204', faculty: 'Prof. K. Verma', status: 'UPCOMING' }
    ],
    Thursday: [
      { code: 'CS-404', subject: 'Operating Systems & System Ops', time: '10:00 - 11:00 AM', room: 'LH-201', faculty: 'Dr. Rajesh Rao', status: 'UPCOMING' },
      { code: 'CS-403', subject: 'Design & Analysis of Algorithms', time: '11:15 AM - 12:15 PM', room: 'LH-201', faculty: 'Dr. A. K. Das', status: 'UPCOMING' },
      { code: 'CS-408', subject: 'Database Systems Lab', time: '02:00 - 04:00 PM', room: 'Database Lab 1', faculty: 'Dr. Priya Nair', status: 'UPCOMING' }
    ],
    Friday: [
      { code: 'CS-402', subject: 'Computer Networks & Security', time: '09:00 - 10:00 AM', room: 'LH-204', faculty: 'Prof. Ananya Sen', status: 'UPCOMING' },
      { code: 'HS-201', subject: 'Professional Ethics & Cyber Law', time: '10:15 - 11:15 AM', room: 'Auditorium Hall', faculty: 'Prof. S. Mishra', status: 'UPCOMING' },
      { code: 'CS-409', subject: 'Technical Seminar & Viva', time: '02:30 - 04:30 PM', room: 'Conference Hall B', faculty: 'Department Faculty', status: 'UPCOMING' }
    ]
  };

  const daySchedule = scheduleData?.schedule?.[selectedDay] || defaultSchedule[selectedDay] || [];
  const alerts = scheduleData?.alerts || [
    {
      id: 'al_1',
      subject: 'Network Simulation Lab',
      message: 'Classroom moved from Lab 1 to Lab 3 (Networking Block B) due to Gigabit switch maintenance.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Department of Computer Science
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Academic Timetable
          </h1>
          <p className="text-xs text-slate-500">
            Autumn Semester 2026 • B.Tech CSE (Section A) • CAMPUS OS
          </p>
        </div>

        {/* Time-sensitive indicator badge */}
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 px-4 py-2.5 text-xs text-emerald-900 shadow-2xs">
          <Clock className="h-4 w-4 text-emerald-600" />
          <span>
            <strong>Next class in 24 min:</strong> CS-402 in LH-204
          </span>
        </div>
      </div>

      {/* Active Faculty Schedule Notices */}
      {alerts.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>Active Schedule Notice</span>
          </div>
          {alerts.map((al) => (
            <p key={al.id} className="text-slate-700 leading-relaxed">
              <strong>{al.subject}:</strong> {al.message}
            </p>
          ))}
        </div>
      )}

      {/* Day Selector Tabs (With Today highlighted) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {days.map((day) => {
          const isToday = day === 'Tuesday';
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`relative rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-700 text-white shadow-soft'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase ${
                  isSelected ? 'bg-emerald-900 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Class Schedule Periods (Interactive cards) */}
      <div className="space-y-3.5">
        {daySchedule.map((item, idx) => {
          const isCurrent = item.status === 'CURRENT' || (selectedDay === 'Tuesday' && idx === 0);
          const isCompleted = item.status === 'COMPLETED';

          return (
            <div
              key={idx}
              onClick={() => setSelectedPeriod(selectedPeriod === idx ? null : idx)}
              className={`group cursor-pointer rounded-2xl border p-4.5 transition-all hover-lift ${
                isCurrent
                  ? 'border-emerald-300 bg-emerald-50/30 shadow-soft'
                  : isCompleted
                  ? 'border-slate-200/60 bg-slate-50/40 opacity-80'
                  : 'border-slate-200/80 bg-white hover:border-emerald-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Period badge */}
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-emerald-glow'
                      : isCompleted
                      ? 'bg-slate-200 text-slate-600'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {isCurrent ? 'NOW' : `#${idx + 1}`}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {item.code}
                      </span>
                      {isCurrent && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          In Progress
                        </span>
                      )}
                      {isCompleted && (
                        <span className="flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.2 text-[10px] font-medium text-slate-600">
                          <CheckCircle2 className="h-3 w-3 text-slate-500" /> Finished
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-1">{item.subject}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {item.faculty}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {item.room}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 text-xs">
                  <div className="text-right">
                    <span className="flex items-center gap-1 font-bold text-slate-900">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" />
                      {item.time}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">60 Minutes</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition" />
                </div>
              </div>

              {/* Expandable Class Details */}
              {selectedPeriod === idx && (
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-white/70 p-3.5 rounded-xl space-y-1 animate-slide-down">
                  <p><strong>Faculty Office:</strong> Cabin 208, Academic Block A (Visiting Hours: 03:00 - 04:30 PM)</p>
                  <p><strong>Attendance Policy:</strong> Biometric scanning at the classroom entrance closes 10 minutes after lecture start.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
