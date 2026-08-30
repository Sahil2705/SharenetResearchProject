import React from 'react';
import { Database, ShieldCheck, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const DataUsageChart = ({ summary, distribution }) => {
  const total = (summary?.totalData || 0) + (summary?.totalReceived || 0);
  const available = summary?.availableData || 0;
  const stored = summary?.storedData || 0;
  const shared = summary?.totalShared || 0;
  const received = summary?.totalReceived || 0;

  const totalCalc = available + stored + shared + 0.001; // Avoid divide by zero

  const availPct = Math.min(100, Math.round((available / totalCalc) * 100));
  const storedPct = Math.min(100, Math.round((stored / totalCalc) * 100));
  const sharedPct = Math.min(100, Math.max(0, 100 - availPct - storedPct));

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Data Allocation Overview</h3>
            <p className="text-xs text-slate-400">Current breakdown of your active and locked data</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Total {summary?.totalData?.toFixed(2) || '0.00'} GB
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="mt-4">
          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-0.5">
            <div
              style={{ width: `${availPct}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-l-full transition-all duration-700"
              title={`Available: ${available.toFixed(2)} GB (${availPct}%)`}
            />
            <div
              style={{ width: `${storedPct}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-vault-400 transition-all duration-700"
              title={`Vault Locked: ${stored.toFixed(2)} GB (${storedPct}%)`}
            />
            <div
              style={{ width: `${sharedPct}%` }}
              className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-r-full transition-all duration-700"
              title={`Shared: ${shared.toFixed(2)} GB (${sharedPct}%)`}
            />
          </div>
        </div>
      </div>

      {/* Metric Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            Available
          </div>
          <p className="text-lg font-bold text-white mt-1">{available.toFixed(2)} <span className="text-xs font-normal text-slate-400">GB</span></p>
          <span className="text-[10px] text-slate-400">{availPct}% allocated</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-1.5 text-purple-400 text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            Vault Locked
          </div>
          <p className="text-lg font-bold text-white mt-1">{stored.toFixed(2)} <span className="text-xs font-normal text-slate-400">GB</span></p>
          <span className="text-[10px] text-slate-400">{storedPct}% offline</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-1.5 text-pink-400 text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-pink-400"></div>
            Shared Out
          </div>
          <p className="text-lg font-bold text-white mt-1">{shared.toFixed(2)} <span className="text-xs font-normal text-slate-400">GB</span></p>
          <span className="text-[10px] text-slate-400">Transferred</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            Received In
          </div>
          <p className="text-lg font-bold text-white mt-1">{received.toFixed(2)} <span className="text-xs font-normal text-slate-400">GB</span></p>
          <span className="text-[10px] text-slate-400">From others</span>
        </div>
      </div>
    </div>
  );
};

export default DataUsageChart;
