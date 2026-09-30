import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { User, Mail, Phone, Shield, Building, Award, CheckCircle } from 'lucide-react';
import apiClient from '../../api/client.js';

export default function Profile() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await apiClient.patch('/users/me', { firstName, lastName, phoneNumber });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Institutional Identity & Profile"
        subtitle="Manage personal contact parameters and view official campus credentials"
      />

      {message && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Identity Overview */}
        <Card className="p-6 text-center space-y-4 md:col-span-1">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-blue-100 text-blue-700 text-2xl font-bold border-2 border-blue-200">
            {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Shield className="h-3.5 w-3.5" />
            <span>{user?.role || 'STUDENT'}</span>
          </div>

          <div className="pt-4 border-t border-slate-100 text-left space-y-2 text-xs text-slate-600">
            {user?.rollNumber && (
              <div className="flex justify-between">
                <span className="text-slate-400">Roll No:</span>
                <span className="font-semibold text-slate-800">{user.rollNumber}</span>
              </div>
            )}
            {user?.designation && (
              <div className="flex justify-between">
                <span className="text-slate-400">Designation:</span>
                <span className="font-semibold text-slate-800">{user.designation}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-semibold text-emerald-600">Verified Active</span>
            </div>
          </div>
        </Card>

        {/* Editable Safe Fields */}
        <Card className="p-6 md:col-span-2 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span>Personal Information</span>
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Institutional Email</label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-slate-50 text-slate-400 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Official email is provisioned by university registrar and cannot be modified.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" isLoading={saving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
