import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { Clock, MapPin, User, AlertCircle } from 'lucide-react';

export default function Timetable() {
  const [scheduleData, setScheduleData] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Tuesday');

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/timetable/my-schedule');
        setScheduleData(res.data);
      } catch (err) {
        console.warn('Timetable load fallback', err);
      }
    }
    load();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const daySchedule = scheduleData?.schedule?.[selectedDay] || [];
  const alerts = scheduleData?.alerts || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Timetable</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Autumn 2026 • 5th Semester Computer Science (Section A)
        </p>
      </div>

      {/* Live Faculty Alerts Banner */}
      {alerts.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>Active Schedule Notice</span>
          </div>
          {alerts.map((al) => (
            <p key={al.id} className="text-amber-800">
              <strong>{al.subject}:</strong> {al.message}
            </p>
          ))}
        </div>
      )}

      {/* Day Selector Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              selectedDay === day
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Class Schedule Periods */}
      <div className="space-y-3">
        {daySchedule.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-200 transition"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold text-xs">
                #{idx + 1}
              </div>
              <div>
                <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {item.code}
                </span>
                <h3 className="text-xs font-bold text-slate-900 mt-1">
                  {item.subject}
                </h3>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {item.faculty}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 text-xs">
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                {item.time}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500 sm:mt-1">
                <MapPin className="h-3 w-3 text-slate-400" />
                {item.room}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
