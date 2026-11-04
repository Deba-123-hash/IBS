import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Users, Search, ShieldCheck, Mail, UserPlus, RefreshCw, Power } from 'lucide-react';

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Create User Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [role, setRole] = useState('STUDENT');
  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.warn('Users load fallback', err);
      toast.error('Failed to load user directory', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Action: Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || !password.trim()) {
      toast.error('First name, email, and password are required.', 'Validation Error');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/admin/users', {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
        rollNumber: role === 'STUDENT' ? identifier.trim() : undefined,
        designation: role !== 'STUDENT' ? identifier.trim() : undefined
      });
      toast.success(`Created institutional account for ${email}`, 'User Created');
      setCreateModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setIdentifier('');
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to create user account', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Toggle Active Status
  const handleToggleStatus = async (user) => {
    const nextStatus = !user.isActive;
    try {
      await apiClient.patch(`/admin/users/${user.id}/status`, { isActive: nextStatus });
      toast.success(`User ${user.email} marked as ${nextStatus ? 'ACTIVE' : 'DEACTIVATED'}`, 'Status Updated');
      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: nextStatus } : u));
    } catch (err) {
      toast.error(err.message || 'Failed to update account status', 'Error');
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      `${u.firstName} ${u.lastName} ${u.email} ${u.rollNumber || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campus User Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Centralized stakeholder registry across students, faculty, and operational staff</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create New User</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={loadUsers}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
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
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white font-medium text-slate-700"
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
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => {
                const isActive = u.isActive !== false;
                return (
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
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="xs"
                        variant={isActive ? 'secondary' : 'primary'}
                        onClick={() => handleToggleStatus(u)}
                        className="text-[10px]"
                      >
                        <Power className="h-3 w-3 mr-1" />
                        <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create User */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create Institutional Account"
        >
          <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">First Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Alok"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Last Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Mohanty"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Institutional Email</label>
              <Input
                type="email"
                placeholder="e.g. user@campus.demo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Default Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white text-slate-800"
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="WARDEN">Warden</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="SECURITY">Security</option>
                  <option value="ACCOUNTS">Accounts</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {role === 'STUDENT' ? 'Student Roll Number' : 'Employee ID / Department'}
              </label>
              <Input
                type="text"
                placeholder={role === 'STUDENT' ? 'e.g. CS2026099' : 'e.g. Physics / Residential Affairs'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
