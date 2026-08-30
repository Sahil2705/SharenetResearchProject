import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { Spinner } from '../components/common/Loader';
import {
  User,
  Mail,
  Phone,
  Lock,
  PlusCircle,
  Shield,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile, refreshProfile, topUpData } = useAuth();
  const { showToast } = useNotifications();

  // Profile Edit State
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Top Up State
  const [topUpAmt, setTopUpAmt] = useState(10);
  const [topUpLoading, setTopUpLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      showToast({ title: 'Error', message: 'Name and phone cannot be empty.', type: 'error' });
      return;
    }

    try {
      setSavingProfile(true);
      await updateProfile({ full_name: name, phone });
      showToast({ title: 'Profile Updated', message: 'Your details have been saved.', type: 'success' });
    } catch (err) {
      showToast({ title: 'Update Failed', message: err.message, type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast({ title: 'Error', message: 'Both current and new password are required.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      showToast({ title: 'Error', message: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({ title: 'Error', message: 'New passwords do not match.', type: 'error' });
      return;
    }

    try {
      setChangingPass(true);
      const res = await api.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });

      if (res.success) {
        showToast({ title: 'Security', message: 'Password updated successfully.', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showToast({ title: 'Password Error', message: err.message, type: 'error' });
    } finally {
      setChangingPass(false);
    }
  };

  const handleTopUp = async (amt) => {
    try {
      setTopUpLoading(true);
      await topUpData(amt);
      showToast({
        title: 'Simulation Top-Up',
        message: `Credited +${amt.toFixed(2)} GB simulated data to your account!`,
        type: 'success'
      });
    } catch (err) {
      showToast({ title: 'Top-up Failed', message: err.message, type: 'error' });
    } finally {
      setTopUpLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-brand-500/20 uppercase">
          {user?.full_name?.charAt(0) || 'U'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">{user?.full_name}</h1>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {user?.role === 'admin' ? 'Administrator' : 'Verified Member'}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono">{user?.email}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {user?.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member since {new Date(user?.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Current Balances Pill */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center sm:text-right">
          <p className="text-[10px] text-slate-400 uppercase font-bold">Active Available</p>
          <div className="text-2xl font-black text-emerald-400">
            {user?.available_data?.toFixed(2) || '0.00'} <span className="text-xs text-slate-400 font-normal">GB</span>
          </div>
        </div>
      </div>

      {/* Simulation Top-Up Playground */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Simulated Data Top-Up Console</h3>
              <p className="text-xs text-slate-400">Add free test bandwidth to simulate large transfers and vault operations</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400">Instant Credit</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {[5, 10, 25, 50].map((amt) => (
            <button
              key={amt}
              type="button"
              disabled={topUpLoading}
              onClick={() => handleTopUp(amt)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-300 border border-emerald-500/30 transition-all disabled:opacity-50"
            >
              +{amt} GB Allowance
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Edit Profile Form */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-brand-400" />
            Account Details
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Email Address (Read Only)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingProfile ? <Spinner size="sm" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            Security & Password
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">New Password (Min 6 chars)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={changingPass}
              className="w-full py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {changingPass ? <Spinner size="sm" /> : <Lock className="w-4 h-4 text-purple-400" />}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
