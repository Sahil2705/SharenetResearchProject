import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { EmptyState } from '../components/common/EmptyState';
import {
  Bell,
  Check,
  CheckCheck,
  Send,
  Lock,
  RefreshCw,
  AlertCircle,
  Info,
  Calendar,
  Gift
} from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case 'transfer_success':
        return <Send className="w-5 h-5 text-pink-400" />;
      case 'transfer_received':
        return <Gift className="w-5 h-5 text-emerald-400" />;
      case 'vault_stored':
        return <Lock className="w-5 h-5 text-purple-400" />;
      case 'vault_restored':
        return <RefreshCw className="w-5 h-5 text-blue-400" />;
      case 'account_alert':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      default:
        return <Info className="w-5 h-5 text-brand-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Bell className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Activity Alerts
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Notification Center
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time updates regarding your transfers, vault deposits, and account activities.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20 transition-all flex items-center gap-2 flex-shrink-0"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'unread'
              ? 'bg-brand-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications found"
            description="You are all caught up! New alerts will show up here automatically."
          />
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.is_read) markAsRead(item.id);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !item.is_read
                  ? 'bg-slate-900/90 border-brand-500/40 shadow-lg shadow-brand-500/5'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70'
              }`}
            >
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0">
                {getNotifIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {item.title}
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                    )}
                  </h4>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.message}</p>
              </div>

              {!item.is_read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(item.id);
                  }}
                  className="text-xs text-slate-400 hover:text-brand-400 p-1.5 rounded-lg hover:bg-slate-800"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
