import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Mail, Phone, Building2, BookOpen, ShieldAlert } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/students/profile');
        setProfile(res.data);
      } catch (err) {
        console.warn('Profile fetch fallback', err);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">Enrolled student identity, academic batch, and verified contact registry</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        {/* Header Avatar Row */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-2xl shadow-sm">
            {user?.firstName?.[0] || 'A'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{profile?.fullName || `${user?.firstName} ${user?.lastName}`}</h2>
            <p className="text-xs text-slate-500">Roll No: <strong className="text-slate-800">{profile?.rollNumber || 'CS2023048'}</strong> • Reg: {profile?.registrationNumber || 'REG-2023-9941'}</p>
            <span className="inline-block mt-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Active Institutional Standing
            </span>
          </div>
        </div>

        {/* Academic Details */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Academic Enrollment</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Department</span>
              <span className="font-semibold text-slate-900">{profile?.department || 'Computer Science & Engineering'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Program & Cohort</span>
              <span className="font-semibold text-slate-900">{profile?.program || 'B.Tech CSE'} (Semester 5)</span>
            </div>
          </div>
        </div>

        {/* Hostel Details */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Residential Hall of Residence</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Hostel & Wing</span>
              <span className="font-semibold text-slate-900">{profile?.hostel || 'Aryabhatta Hall of Residence - Block B'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Allocated Room</span>
              <span className="font-semibold text-slate-900">{profile?.room || 'Room 304'} (Double Occupancy)</span>
            </div>
          </div>
        </div>

        {/* Emergency & Guardian Contact */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Emergency & Guardian Contacts</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Personal Email</span>
              <span className="font-semibold text-slate-900">{user?.email || 'student@campus.demo'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Student Mobile</span>
              <span className="font-semibold text-slate-900">{profile?.emergencyContact || '+91 98765 43210'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Blood Group</span>
              <span className="font-semibold text-slate-900">{profile?.bloodGroup || 'B+'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
