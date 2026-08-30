import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { Spinner } from '../components/common/Loader';
import {
  Send,
  Search,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Zap,
  Info,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TransferDataPage = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [receiver, setReceiver] = useState(null);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Confirmation Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  // Success Receipt Modal
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const availableBalance = user?.available_data || 0;
  const numAmount = parseFloat(amount) || 0;
  const remainingBalance = Math.max(0, availableBalance - numAmount);
  const isBalanceSufficient = availableBalance >= numAmount && numAmount > 0;

  // Search Receiver
  const handleSearchReceiver = async (e) => {
    e?.preventDefault();
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchError('Enter an email address or phone number to look up.');
      return;
    }

    try {
      setSearching(true);
      setSearchError('');
      setReceiver(null);

      const res = await api.get('/data/transfer/search', { query: searchQuery.trim() });
      if (res.success && res.data) {
        setReceiver(res.data);
      }
    } catch (err) {
      setSearchError(err.message || 'No registered user found with this email or phone.');
    } finally {
      setSearching(false);
    }
  };

  const handlePresetAmount = (preset) => {
    if (preset === 'max') {
      setAmount(availableBalance.toFixed(2));
    } else {
      setAmount(preset.toString());
    }
  };

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    if (!receiver) {
      setSearchError('Please verify a recipient first.');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      showToast({ title: 'Invalid Amount', message: 'Enter a valid data amount greater than 0 GB.', type: 'error' });
      return;
    }
    if (numAmount > availableBalance) {
      showToast({ title: 'Insufficient Balance', message: `You only have ${availableBalance.toFixed(2)} GB available.`, type: 'error' });
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleExecuteTransfer = async () => {
    try {
      setSubmitting(true);
      const res = await api.post('/data/transfer/send', {
        receiver_id: receiver.id,
        amount: numAmount,
        note: note.trim() || `Transfer to ${receiver.full_name}`
      });

      if (res.success && res.data) {
        setReceiptData({
          ...res.data,
          transferred_at: new Date().toISOString(),
          note: note.trim()
        });
        setConfirmModalOpen(false);
        setSuccessModalOpen(true);
        showToast({ title: 'Transfer Complete', message: res.message, type: 'success' });
        await refreshProfile();
        // Reset form
        setAmount('');
        setNote('');
      }
    } catch (err) {
      showToast({ title: 'Transfer Failed', message: err.message, type: 'error' });
      setConfirmModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Send className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Peer-to-Peer Transfer
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Share Internet Data
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Transfer unused mobile data balance instantly to any registered SmartNet user.
          </p>
        </div>

        {/* Current Balance Display */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-right flex-shrink-0">
          <p className="text-[10px] uppercase font-bold text-slate-400">Available to Send</p>
          <div className="text-2xl font-black text-emerald-400 mt-0.5">
            {availableBalance.toFixed(2)} <span className="text-xs text-slate-400 font-medium">GB</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Transfer Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Receiver Search */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                Find Recipient
              </h3>
              <span className="text-xs text-slate-400">Search by Email or Phone</span>
            </div>

            <form onSubmit={handleSearchReceiver} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. receiver@smartnet.com or +1 (555)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {searching ? <Spinner size="sm" /> : <Search className="w-3.5 h-3.5" />} Look Up
              </button>
            </form>

            {searchError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Verified Recipient Card */}
            {receiver && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{receiver.full_name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{receiver.email} &bull; {receiver.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiver(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Transfer Details */}
          <form onSubmit={handleOpenConfirm} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                Transfer Amount
              </h3>
              <span className="text-xs text-slate-400">Minimum: 0.10 GB</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount to Send (GB)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.10"
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-lg font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-400">GB</span>
              </div>
            </div>

            {/* Quick Amount Presets */}
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 mb-2">Quick Select Presets</span>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 5, 10].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetAmount(preset)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                  >
                    +{preset} GB
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handlePresetAmount('max')}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-xs font-semibold text-brand-300 border border-brand-500/30 transition-colors"
                >
                  Max ({availableBalance.toFixed(2)} GB)
                </button>
              </div>
            </div>

            {/* Note Memo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Transfer Note / Memo (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. For semester project research"
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={!receiver || !isBalanceSufficient}
              className="w-full py-3.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Review & Confirm Transfer <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Balance Preview & Transfer Summary (1 Col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-400" />
              Transfer Simulation Preview
            </h3>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-400">Current Balance:</span>
                <span className="font-bold text-white">{availableBalance.toFixed(2)} GB</span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-400">Transfer Amount:</span>
                <span className="font-bold text-pink-400">-{numAmount.toFixed(2)} GB</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-semibold text-slate-300">Remaining Balance:</span>
                <span className={`font-black text-sm ${remainingBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {remainingBalance.toFixed(2)} GB
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Shield className="w-3.5 h-3.5 text-brand-400" /> Security Guarantee
              </div>
              <p>Transactions are validated through atomic database locks to eliminate double-spending or negative balances.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
            <Link
              to="/transactions"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center justify-center gap-1"
            >
              <History className="w-3.5 h-3.5" /> View Past Transfers &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Data Transfer"
        subtitle="Please review the transaction details carefully before sending."
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Recipient Name:</span>
              <span className="font-bold text-white">{receiver?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recipient Email:</span>
              <span className="font-mono text-slate-300">{receiver?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Transfer Amount:</span>
              <span className="font-bold text-pink-400 text-sm">{numAmount.toFixed(2)} GB</span>
            </div>
            {note && (
              <div className="flex justify-between">
                <span className="text-slate-400">Note:</span>
                <span className="text-slate-300 italic">{note}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-800">
              <span className="text-slate-400">Your New Balance:</span>
              <span className="font-bold text-emerald-400">{remainingBalance.toFixed(2)} GB</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setConfirmModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteTransfer}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25 flex items-center justify-center gap-1.5"
            >
              {submitting ? <Spinner size="sm" /> : <Send className="w-3.5 h-3.5" />} Confirm & Send
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Receipt Modal */}
      <Modal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Transfer Successful 🎉"
        subtitle="Your internet data transfer has been completed and recorded."
      >
        <div className="space-y-4 text-xs text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Transaction ID:</span>
              <span className="font-mono font-bold text-brand-400">{receiptData?.transaction_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount Sent:</span>
              <span className="font-bold text-white">{receiptData?.amount?.toFixed(2)} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recipient:</span>
              <span className="text-slate-200">{receiptData?.receiver_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Remaining Balance:</span>
              <span className="font-bold text-emerald-400">{receiptData?.remaining_available_data?.toFixed(2)} GB</span>
            </div>
          </div>

          <button
            onClick={() => setSuccessModalOpen(false)}
            className="w-full py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white"
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TransferDataPage;
