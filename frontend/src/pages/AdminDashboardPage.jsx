import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { TransactionBadge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Spinner, FullPageLoader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import {
  Shield,
  Users,
  UserX,
  UserCheck,
  Database,
  ArrowUpRight,
  Lock,
  Search,
  Sliders,
  AlertTriangle,
  History,
  CheckCircle2,
  PlusCircle
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // User Table Filters
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Balance Adjustment Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('Administrative Loyalty Bonus');
  const [adjusting, setAdjusting] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, trxRes] = await Promise.all([
        api.get('/admin/statistics'),
        api.get('/admin/users', { search: userSearch, status: statusFilter }),
        api.get('/admin/transactions', { limit: 15 })
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsersList(usersRes.data?.users || []);
      if (trxRes.success) setTransactions(trxRes.data?.transactions || []);
    } catch (err) {
      console.error('Admin data fetch error:', err);
      showToast({ title: 'Error', message: 'Failed to load admin statistics.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminData();
  };

  const handleToggleUserStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.patch(`/admin/users/${targetUser.id}/status`, { status: newStatus });
      if (res.success) {
        showToast({
          title: 'User Status Updated',
          message: `${targetUser.full_name} is now ${newStatus}.`,
          type: 'success'
        });
        fetchAdminData();
      }
    } catch (err) {
      showToast({ title: 'Status Update Failed', message: err.message, type: 'error' });
    }
  };

  const handleOpenAdjustModal = (targetUser) => {
    setSelectedUser(targetUser);
    setAdjustAmount('5.00');
    setAdjustReason('Platform Loyalty Credit');
    setAdjustModalOpen(true);
  };

  const handleExecuteAdjustment = async (e) => {
    e.preventDefault();
    const numAmt = parseFloat(adjustAmount);
    if (isNaN(numAmt) || numAmt === 0) {
      showToast({ title: 'Invalid Amount', message: 'Enter a non-zero adjustment amount.', type: 'error' });
      return;
    }

    try {
      setAdjusting(true);
      const res = await api.post(`/admin/users/${selectedUser.id}/adjust-balance`, {
        amount: numAmt,
        reason: adjustReason.trim()
      });

      if (res.success) {
        showToast({ title: 'Balance Adjusted', message: res.message, type: 'success' });
        setAdjustModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      showToast({ title: 'Adjustment Failed', message: err.message, type: 'error' });
    } finally {
      setAdjusting(false);
    }
  };

  if (loading && !stats) {
    return <FullPageLoader message="Loading Administrator Command Center..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Shield className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              System Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Platform Master Console
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Global metrics, user permissions control, and platform-wide ledger auditing.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
        >
          Refresh Live Data
        </button>
      </div>

      {/* 5 Platform Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          unit=""
          subtitle={`${stats?.activeUsers || 0} active, ${stats?.suspendedUsers || 0} suspended`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Transferred Volume"
          value={(stats?.totalDataTransferred || 0).toFixed(2)}
          subtitle="Peer transfers"
          icon={ArrowUpRight}
          color="rose"
        />
        <StatCard
          title="Vault Safeguarded"
          value={(stats?.totalVaultLocked || 0).toFixed(2)}
          subtitle="Offline buffer locked"
          icon={Lock}
          color="purple"
        />
        <StatCard
          title="Total Platform Data"
          value={(stats?.platformTotalData || 0).toFixed(2)}
          subtitle="Allocated system capacity"
          icon={Database}
          color="emerald"
        />
        <StatCard
          title="Total Transactions"
          value={stats?.totalTransactions || 0}
          unit=""
          subtitle="Audit ledger entries"
          icon={History}
          color="amber"
        />
      </div>

      {/* User Management Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-400" />
              Registered User Directory
            </h3>
            <p className="text-xs text-slate-400">Search, manage status, and adjust user allowances</p>
          </div>

          <div className="flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user..."
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter users by status"
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>

        {usersList.length === 0 ? (
          <EmptyState title="No users found" description="No accounts match your current filter query." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Available</th>
                  <th className="pb-3">Vault</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3">
                      <div>
                        <p className="font-bold text-white">{u.full_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300 font-mono">{u.phone}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-emerald-400">{parseFloat(u.available_data).toFixed(2)} GB</td>
                    <td className="py-3 font-bold text-purple-400">{parseFloat(u.stored_data).toFixed(2)} GB</td>
                    <td className="py-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenAdjustModal(u)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 inline-flex items-center gap-1"
                      >
                        <PlusCircle className="w-3 h-3 text-emerald-400" /> Adjust
                      </button>

                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global Transaction Audit Ledger */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-brand-400" />
              Global Audit Ledger (All Users)
            </h3>
            <p className="text-xs text-slate-400">Live platform transaction operations</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3">Transaction ID</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Sender</th>
                <th className="pb-3">Receiver</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-mono font-medium text-brand-400">{trx.transaction_code}</td>
                  <td className="py-3"><TransactionBadge type={trx.type} /></td>
                  <td className="py-3 font-bold text-white">{parseFloat(trx.amount).toFixed(2)} GB</td>
                  <td className="py-3 text-slate-300">{trx.sender_name || 'System / Starter'}</td>
                  <td className="py-3 text-slate-300">{trx.receiver_name || 'Data Vault'}</td>
                  <td className="py-3"><StatusBadge status={trx.status} /></td>
                  <td className="py-3 text-right text-slate-400 whitespace-nowrap">
                    {new Date(trx.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Balance Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Adjust User Data Balance"
        subtitle={`Manually credit or deduct data balance for ${selectedUser?.full_name}`}
      >
        <form onSubmit={handleExecuteAdjustment} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <p className="text-slate-400">Target User: <strong className="text-white">{selectedUser?.full_name} ({selectedUser?.email})</strong></p>
            <p className="text-slate-400">Current Available: <strong className="text-emerald-400">{parseFloat(selectedUser?.available_data || 0).toFixed(2)} GB</strong></p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Adjustment Amount (GB)</label>
            <input
              type="number"
              step="0.01"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              required
              placeholder="e.g. +5.00 or -2.50"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">Use positive numbers to add data allowance, negative numbers to deduct.</p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Reason / Audit Memo</label>
            <input
              type="text"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              required
              placeholder="e.g. Platform bonus promotion"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAdjustModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adjusting}
              className="flex-1 py-2.5 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20 flex items-center justify-center gap-1.5"
            >
              {adjusting ? <Spinner size="sm" /> : <CheckCircle2 className="w-4 h-4" />} Apply Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
