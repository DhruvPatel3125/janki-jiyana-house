import React, { useState } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, Save, Lock } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

export const AdminSecurity = () => {
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showErrorToast('New passwords do not match');
      return;
    }
    
    if (passwords.newPassword.length < 6) {
      showErrorToast('New password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    try {
      await api.changePassword(passwords.oldPassword, passwords.newPassword);
      showSuccessToast('Password updated successfully!');
      setPasswords({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      showErrorToast(error.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Security Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your admin account password and security.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm max-w-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Change Password</h3>
            <p className="text-xs text-slate-500">Ensure your account is using a long, random password to stay secure.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                placeholder="Enter new password (min 6 characters)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 disabled:bg-brand-400"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
