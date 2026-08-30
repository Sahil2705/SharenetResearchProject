import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { DataUsageChart } from '../components/charts/DataUsageChart';
import { TransferActivityChart } from '../components/charts/TransferActivityChart';
import { TransactionBadge, StatusBadge } from '../components/common/Badge';
import { FullPageLoader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import {
  Send,
  Lock,
  RefreshCw,
  PlusCircle,
  Database,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  History,
  Zap
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, refreshProfile, topUpData } = useAuth();
  const { showToast } = useNotifications();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      showToast({ title: 'Error', message: 'Failed to load dashboard statistics.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickTopUp = async () => {
    try {
      setTopUpLoading(true);
      const res = await topUpData(5.0);
      showToast({
        title: 'Simulation Top-Up',
        message: 'Successfully added 5.00 GB to your available balance!',
        type: 'success'
      });
      fetchDashboard();
    } catch (err) {
      showToast({ title: 'Top-up Failed', message: err.message, type: 'error' });
    } finally {
      setTopUpLoading(false);
    }
  };

  if (loading && !dashboardData) {
    return <FullPageLoader message="Loading your data balances & activity ledger..." />;
  }

  const summary = dashboardData?.summary || {
    totalData: user?.total_data || 0,
    availableData: user?.available_data || 0,
    storedData: user?.stored_data || 0,
    totalShared: 0,
    totalReceived: 0,
    totalVaultStored: 0,
    totalVaultRestored: 0,
    activeVaultCount: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
              Live Connection
            </span>
            <span className="text-xs text-slate-400">&bull; ID: #{user?.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Welcome back, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            You currently have <strong className="text-emerald-400 font-bold">{summary.availableData.toFixed(2)} GB</strong> ready to share or lock into your Data Vault.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/transfer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20 transition-all hover:scale-105"
          >
            <Send className="w-4 h-4" /> Share Data
          </Link>
          <Link
            to="/vault"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
          >
            <Lock className="w-4 h-4" /> Data Vault
          </Link>
          <button
            onClick={handleQuickTopUp}
            disabled={topUpLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all disabled:opacity-50"
            title="Add +5 GB simulated data allowance for testing"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            {topUpLoading ? 'Adding...' : '+5 GB Top-Up'}
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Available Data"
          value={summary.availableData.toFixed(2)}
          subtitle="Ready to use or share"
          icon={Zap}
          color="emerald"
        />
        <StatCard
          title="Data in Vault"
          value={summary.storedData.toFixed(2)}
          subtitle={`${summary.activeVaultCount} active lock(s)`}
          icon={ShieldCheck}
          color="purple"
        />
        <StatCard
          title="Data Shared"
          value={summary.totalShared.toFixed(2)}
          subtitle="Transferred out"
          icon={ArrowUpRight}
          color="rose"
        />
        <StatCard
          title="Data Received"
          value={summary.totalReceived.toFixed(2)}
          subtitle="Received from peers"
          icon={ArrowDownLeft}
          color="blue"
        />
        <StatCard
          title="Total Lifetime"
          value={summary.totalData.toFixed(2)}
          subtitle="Allocated allowance"
          icon={Database}
          color="amber"
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DataUsageChart
          summary={summary}
          distribution={dashboardData?.distribution}
        />
        <TransferActivityChart />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-brand-400" />
                  Recent Transactions
                </h3>
                <p className="text-xs text-slate-400">Latest data sharing, vault and bonus activities</p>
              </div>
              <Link
                to="/transactions"
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                View all &rarr;
              </Link>
            </div>

            {(!dashboardData?.recentTransactions || dashboardData.recentTransactions.length === 0) ? (
              <EmptyState
                title="No transactions yet"
                description="Your recent transfers and vault operations will show up here."
                actionLabel="Share Data Now"
                onAction={() => window.location.href = '/transfer'}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-3">Transaction</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Party</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {dashboardData.recentTransactions.map((trx) => {
                      const isSender = trx.sender_id === user?.id;
                      const otherParty = isSender
                        ? (trx.receiver_name || trx.receiver_email || 'Vault')
                        : (trx.sender_name || trx.sender_email || 'SmartNet');

                      return (
                        <tr key={trx.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 font-mono font-medium text-slate-300">
                            {trx.transaction_code}
                          </td>
                          <td className="py-3">
                            <TransactionBadge type={trx.type} />
                          </td>
                          <td className="py-3 font-bold text-white">
                            {trx.amount ? parseFloat(trx.amount).toFixed(2) : '0.00'} GB
                          </td>
                          <td className="py-3 text-slate-300 truncate max-w-[120px]">
                            {otherParty}
                          </td>
                          <td className="py-3">
                            <StatusBadge status={trx.status} />
                          </td>
                          <td className="py-3 text-right text-slate-400 whitespace-nowrap">
                            {new Date(trx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Data Vault Quick Card (1 Col) */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950/30 border border-purple-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Vault Status
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300">
                {summary.activeVaultCount > 0 ? 'ACTIVE LOCK' : 'IDLE'}
              </span>
            </div>

            <div className="py-4 text-center">
              <p className="text-xs text-slate-400">Locked Data Balance</p>
              <div className="text-4xl font-black text-white mt-1">
                {summary.storedData.toFixed(2)} <span className="text-lg text-purple-400 font-medium">GB</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Safeguarded for offline travel</p>
            </div>

            {/* Active Vault Records */}
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Active Locks</p>
              {(!dashboardData?.activeVaultRecords || dashboardData.activeVaultRecords.length === 0) ? (
                <p className="text-xs text-slate-500 italic">No data currently locked in vault.</p>
              ) : (
                dashboardData.activeVaultRecords.map((v) => (
                  <div key={v.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-purple-300">{parseFloat(v.amount).toFixed(2)} GB</p>
                      <p className="text-[10px] text-slate-400">{v.notes || 'Offline reserve'}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(v.stored_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex gap-2">
            <Link
              to="/vault"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all"
            >
              Open Vault Hub &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
