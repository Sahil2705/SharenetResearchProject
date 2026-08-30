import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { TransactionBadge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Spinner, FullPageLoader } from '../components/common/Loader';
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  Calendar,
  User,
  FileText
} from 'lucide-react';

export const TransactionHistoryPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [activeType, setActiveType] = useState('all');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Selected Transaction for Detail Modal
  const [selectedTrx, setSelectedTrx] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/data/transactions', {
        type: activeType,
        status,
        search,
        sort,
        page,
        limit: 10
      });

      if (res.success && res.data) {
        setTransactions(res.data.transactions || []);
        setPagination(res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      }
    } catch (err) {
      console.error('Transactions fetch error:', err);
      showToast({ title: 'Error', message: 'Failed to load transaction ledger.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [activeType, status, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleTypeChange = (type) => {
    setActiveType(type);
    setPage(1);
  };

  const typeTabs = [
    { key: 'all', label: 'All Transactions' },
    { key: 'sent', label: 'Sent' },
    { key: 'received', label: 'Received' },
    { key: 'stored', label: 'Vault Locked' },
    { key: 'restored', label: 'Vault Restored' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <History className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Immutable Ledger
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Transaction History
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Complete audit trail of peer transfers, vault locks, restorations, and bonus grants.
          </p>
        </div>

        <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs flex items-center gap-4">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Operations</span>
            <span className="text-lg font-black text-white">{pagination.total}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        {/* Type Tabs */}
        <div className="flex overflow-x-auto gap-1.5 pb-2 sm:pb-0 scrollbar-none">
          {typeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTypeChange(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeType === tab.key
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, email or memo..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </form>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              aria-label="Filter transactions by status"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Sort */}
          <div className="sm:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort transactions"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Highest Amount</option>
              <option value="amount_low">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No matching transactions found"
            description="Try clearing your search query or selecting a different transaction type."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Transaction Code</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Counterparty</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {transactions.map((trx) => {
                  const isSender = trx.sender_id === user?.id;
                  const counterparty = isSender
                    ? (trx.receiver_name || trx.receiver_email || 'Data Vault')
                    : (trx.sender_name || trx.sender_email || 'SmartNet Allocation');

                  return (
                    <tr
                      key={trx.id}
                      onClick={() => setSelectedTrx(trx)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 font-mono font-medium text-brand-400">
                        {trx.transaction_code}
                      </td>
                      <td className="py-3.5">
                        <TransactionBadge type={trx.type} />
                      </td>
                      <td className="py-3.5 font-bold text-white">
                        {parseFloat(trx.amount).toFixed(2)} GB
                      </td>
                      <td className="py-3.5 text-slate-300 max-w-[150px] truncate">
                        {counterparty}
                      </td>
                      <td className="py-3.5">
                        <StatusBadge status={trx.status} />
                      </td>
                      <td className="py-3.5 text-slate-400 whitespace-nowrap">
                        {new Date(trx.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="text-slate-400 group-hover:text-white transition-colors">
                          Details &rarr;
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={!!selectedTrx}
        onClose={() => setSelectedTrx(null)}
        title="Transaction Ledger Details"
        subtitle="Complete verified record from MySQL transactions ledger"
      >
        {selectedTrx && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono font-bold text-brand-400">{selectedTrx.transaction_code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Operation Type:</span>
                <TransactionBadge type={selectedTrx.type} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Data Volume:</span>
                <span className="font-bold text-white text-sm">{parseFloat(selectedTrx.amount).toFixed(2)} GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Ledger Status:</span>
                <StatusBadge status={selectedTrx.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sender:</span>
                <span className="text-slate-200">{selectedTrx.sender_name || 'System / Starter Allocation'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Receiver:</span>
                <span className="text-slate-200">{selectedTrx.receiver_name || 'Personal Data Vault'}</span>
              </div>
              {selectedTrx.note && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Note / Reason:</span>
                  <span className="text-slate-300 italic">{selectedTrx.note}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-300">{new Date(selectedTrx.created_at).toUTCString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTrx(null)}
              className="w-full py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white"
            >
              Close Receipt
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TransactionHistoryPage;
