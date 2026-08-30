import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { Spinner, FullPageLoader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import {
  Lock,
  Unlock,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowRight,
  Sparkles,
  Info,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const DataVaultPage = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useNotifications();

  const [vaultSummary, setVaultSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lock Form State
  const [storeAmount, setStoreAmount] = useState('');
  const [storeNotes, setStoreNotes] = useState('');
  const [storing, setStoring] = useState(false);

  // Restore State
  const [restoring, setRestoring] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [targetRestoreItem, setTargetRestoreItem] = useState(null);

  const availableBalance = user?.available_data || 0;
  const storedBalance = user?.stored_data || 0;

  const fetchVaultData = async () => {
    try {
      setLoading(true);
      const [summaryRes, historyRes] = await Promise.all([
        api.get('/data/vault/summary'),
        api.get('/data/vault/history')
      ]);

      if (summaryRes.success) setVaultSummary(summaryRes.data);
      if (historyRes.success) setHistory(historyRes.data || []);
    } catch (err) {
      console.error('Vault data fetch error:', err);
      showToast({ title: 'Error', message: 'Failed to load Data Vault data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultData();
  }, []);

  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    const numAmt = parseFloat(storeAmount);

    if (!numAmt || numAmt <= 0) {
      showToast({ title: 'Invalid Amount', message: 'Enter a valid data amount to lock.', type: 'error' });
      return;
    }

    if (numAmt > availableBalance) {
      showToast({ title: 'Insufficient Balance', message: `You only have ${availableBalance.toFixed(2)} GB available to store.`, type: 'error' });
      return;
    }

    try {
      setStoring(true);
      const res = await api.post('/data/vault/store', {
        amount: numAmt,
        notes: storeNotes.trim() || 'Offline Buffer Storage'
      });

      if (res.success) {
        showToast({ title: 'Data Vault Locked', message: res.message, type: 'success' });
        setStoreAmount('');
        setStoreNotes('');
        await refreshProfile();
        fetchVaultData();
      }
    } catch (err) {
      showToast({ title: 'Lock Failed', message: err.message, type: 'error' });
    } finally {
      setStoring(false);
    }
  };

  const handleRestoreClick = (storageItem = null) => {
    setTargetRestoreItem(storageItem);
    setRestoreModalOpen(true);
  };

  const handleExecuteRestore = async () => {
    try {
      setRestoring(true);
      const payload = targetRestoreItem
        ? { storage_id: targetRestoreItem.id }
        : { amount: storedBalance };

      const res = await api.post('/data/vault/restore', payload);
      if (res.success) {
        showToast({ title: 'Data Vault Restored', message: res.message, type: 'success' });
        setRestoreModalOpen(false);
        setTargetRestoreItem(null);
        await refreshProfile();
        fetchVaultData();
      }
    } catch (err) {
      showToast({ title: 'Restore Failed', message: err.message, type: 'error' });
    } finally {
      setRestoring(false);
    }
  };

  if (loading && !vaultSummary) {
    return <FullPageLoader message="Opening secure Data Vault..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Vault Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 p-8 sm:p-10 shadow-2xl vault-glow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Col 1 & 2: Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Personal Offline Data Vault</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Safeguard your data before heading offline
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Going into an airplane mode, underground transit, or remote mountain trail? Lock your unused data into the Data Vault. Restore and unlock your full allowance the second you step back into network coverage.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <span className="text-slate-400">Available: </span>
                <strong className="text-emerald-400">{availableBalance.toFixed(2)} GB</strong>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <span className="text-slate-400">Vault Locked: </span>
                <strong className="text-purple-400">{storedBalance.toFixed(2)} GB</strong>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Restore Big Hero Badge */}
          <div className="p-6 rounded-2xl bg-slate-950/90 border border-purple-500/40 text-center space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span className="font-semibold text-slate-300">TOTAL STORED DATA</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                {storedBalance > 0 ? 'LOCKED' : 'EMPTY'}
              </span>
            </div>

            <div className="text-5xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              {storedBalance.toFixed(2)} <span className="text-xl text-purple-400 font-semibold">GB</span>
            </div>

            <button
              onClick={() => handleRestoreClick(null)}
              disabled={storedBalance <= 0 || restoring}
              className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {restoring ? <Spinner size="sm" /> : <Unlock className="w-4 h-4" />}
              Restore All Stored Data ({storedBalance.toFixed(2)} GB)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deposit into Vault Form (1 Col) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              Lock Data into Vault
            </h3>
            <span className="text-xs text-slate-400">Available: {availableBalance.toFixed(2)} GB</span>
          </div>

          <form onSubmit={handleStoreSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount to Lock (GB)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.10"
                  max={availableBalance}
                  value={storeAmount}
                  onChange={(e) => setStoreAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-base font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-400">GB</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setStoreAmount(preset.toString())}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300"
                >
                  +{preset} GB
                </button>
              ))}
              <button
                type="button"
                onClick={() => setStoreAmount(availableBalance.toFixed(2))}
                className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 text-[11px] font-semibold border border-purple-500/30"
              >
                All Available
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Storage Note / Reason</label>
              <input
                type="text"
                value={storeNotes}
                onChange={(e) => setStoreNotes(e.target.value)}
                placeholder="e.g. Flight to Tokyo / Camping in Alps"
                maxLength={80}
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={storing || availableBalance <= 0}
              className="w-full py-3 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {storing ? <Spinner size="sm" /> : <Lock className="w-3.5 h-3.5" />}
              Lock Data in Vault
            </button>
          </form>

          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-[11px] text-purple-300/90 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <span>Locked data is deducted from your active balance and safely stored until you click Restore.</span>
          </div>
        </div>

        {/* Storage History & Active Locks (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Locks Widget */}
          {vaultSummary?.activeLocks && vaultSummary.activeLocks.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Active Locked Blocks ({vaultSummary.activeLocks.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vaultSummary.activeLocks.map((lockItem) => (
                  <div
                    key={lockItem.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {parseFloat(lockItem.amount).toFixed(2)} GB
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300">
                          {lockItem.storage_code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{lockItem.notes || 'Offline lock'}</p>
                      <span className="text-[10px] text-slate-500">
                        Locked on {new Date(lockItem.stored_at).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRestoreClick(lockItem)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 transition-colors flex items-center gap-1"
                    >
                      <Unlock className="w-3 h-3" /> Unlock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Storage History Table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" />
                Vault Storage & Restoration History
              </h3>
              <span className="text-xs text-slate-400">{history.length} operations</span>
            </div>

            {history.length === 0 ? (
              <EmptyState
                title="Vault History Empty"
                description="When you lock or restore data, your full timeline will be cataloged here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-3">Storage Code</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Stored Date</th>
                      <th className="pb-3">Restored Date</th>
                      <th className="pb-3 text-right">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-mono font-medium text-slate-300">
                          {item.storage_code}
                        </td>
                        <td className="py-3 font-bold text-white">
                          {parseFloat(item.amount).toFixed(2)} GB
                        </td>
                        <td className="py-3">
                          {item.status === 'stored' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              LOCKED
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              RESTORED
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-slate-300 whitespace-nowrap">
                          {new Date(item.stored_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3 text-slate-400 whitespace-nowrap">
                          {item.restored_at
                            ? new Date(item.restored_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="py-3 text-right text-slate-400 max-w-[140px] truncate">
                          {item.notes || 'Offline reserve'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      <Modal
        isOpen={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        title="Restore Data from Vault"
        subtitle="Move safeguarded data back into your active available balance."
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Restore Target:</span>
              <span className="font-bold text-white">
                {targetRestoreItem ? `Block #${targetRestoreItem.storage_code}` : 'Entire Vault Balance'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount to Restore:</span>
              <span className="font-bold text-emerald-400 text-sm">
                +{targetRestoreItem ? parseFloat(targetRestoreItem.amount).toFixed(2) : storedBalance.toFixed(2)} GB
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800">
              <span className="text-slate-400">New Available Balance:</span>
              <span className="font-bold text-white">
                {(availableBalance + (targetRestoreItem ? parseFloat(targetRestoreItem.amount) : storedBalance)).toFixed(2)} GB
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRestoreModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteRestore}
              disabled={restoring}
              className="flex-1 py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25 flex items-center justify-center gap-1.5"
            >
              {restoring ? <Spinner size="sm" /> : <Unlock className="w-3.5 h-3.5" />}
              Confirm & Restore
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DataVaultPage;
