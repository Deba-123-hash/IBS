import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { Users, Search, ShieldCheck, Mail } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/admin/users');
        setUsers(res.data.users || []);
      } catch (err) {
        console.warn('Users load fallback', err);
      }
    }
    load();
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch =
      `${u.firstName} ${u.lastName} ${u.email} ${u.rollNumber || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campus User Directory</h1>
        <p className="text-xs text-slate-500 mt-0.5">Centralized stakeholder registry across students, faculty, and operational staff</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll number, or email..."
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
        >
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="FACULTY">Faculty</option>
          <option value="WARDEN">Wardens</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="SECURITY">Security</option>
          <option value="ACCOUNTS">Accounts</option>
          <option value="ADMIN">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500">
              <tr>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Department / Designation</th>
                <th className="py-3 px-4 font-semibold">Identifier</th>
                <th className="py-3 px-4 font-semibold">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{u.firstName} {u.lastName}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-bold">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {u.designation || u.department || 'Academic'}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {u.rollNumber || 'EMP-ROSTER'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
