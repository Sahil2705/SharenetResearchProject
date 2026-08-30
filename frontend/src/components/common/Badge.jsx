import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ShieldCheck, RefreshCw, Gift, Sliders, CheckCircle2, AlertOctagon } from 'lucide-react';

export const TransactionBadge = ({ type }) => {
  switch (type) {
    case 'transfer_sent':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
          <ArrowUpRight className="w-3.5 h-3.5" />
          Sent
        </span>
      );
    case 'transfer_received':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ArrowDownLeft className="w-3.5 h-3.5" />
          Received
        </span>
      );
    case 'vault_stored':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Vault Locked
        </span>
      );
    case 'vault_restored':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <RefreshCw className="w-3.5 h-3.5" />
          Vault Restored
        </span>
      );
    case 'bonus_allocated':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Gift className="w-3.5 h-3.5" />
          Starter Pack
        </span>
      );
    case 'admin_adjustment':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Sliders className="w-3.5 h-3.5" />
          Admin Bonus
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
          {type}
        </span>
      );
  }
};

export const StatusBadge = ({ status }) => {
  if (status === 'active' || status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  if (status === 'suspended' || status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <AlertOctagon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
      {status}
    </span>
  );
};
