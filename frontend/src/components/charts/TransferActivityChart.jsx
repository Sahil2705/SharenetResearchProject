import React from 'react';
import { Activity, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';

export const TransferActivityChart = () => {
  // Simulated dynamic activity trends over the last 7 days
  const days = [
    { day: 'Mon', sent: 1.5, received: 0.0, vault: 2.0 },
    { day: 'Tue', sent: 0.5, received: 3.0, vault: 0.0 },
    { day: 'Wed', sent: 2.0, received: 1.0, vault: 4.5 },
    { day: 'Thu', sent: 0.0, received: 0.5, vault: 0.0 },
    { day: 'Fri', sent: 3.2, received: 2.0, vault: 1.5 },
    { day: 'Sat', sent: 1.0, received: 4.0, vault: 5.0 },
    { day: 'Sun', sent: 2.5, received: 1.5, vault: 3.0 },
  ];

  const maxVal = 6; // max scale in GB

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-400" />
            7-Day Activity Trends
          </h3>
          <p className="text-xs text-slate-400">Daily sharing, receiving and vault activity volume</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> Sent
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Received
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Vault
          </span>
        </div>
      </div>

      {/* SVG Bar Chart Visualization */}
      <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-slate-800">
        {days.map((item, idx) => {
          const sentHeight = (item.sent / maxVal) * 100;
          const recHeight = (item.received / maxVal) * 100;
          const vaultHeight = (item.vault / maxVal) * 100;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-1 h-32 px-1">
                {/* Sent Bar */}
                <div
                  style={{ height: `${sentHeight}%` }}
                  className="w-2 sm:w-2.5 bg-gradient-to-t from-pink-600 to-pink-400 rounded-t-sm transition-all duration-500 group-hover:opacity-80"
                  title={`Sent: ${item.sent} GB`}
                />
                {/* Received Bar */}
                <div
                  style={{ height: `${recHeight}%` }}
                  className="w-2 sm:w-2.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-500 group-hover:opacity-80"
                  title={`Received: ${item.received} GB`}
                />
                {/* Vault Bar */}
                <div
                  style={{ height: `${vaultHeight}%` }}
                  className="w-2 sm:w-2.5 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-sm transition-all duration-500 group-hover:opacity-80"
                  title={`Vault: ${item.vault} GB`}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-400">{item.day}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>⚡ Smart simulation ledger updated real-time</span>
        <span className="text-brand-400 font-medium">Activity Score: 98% Optimal</span>
      </div>
    </div>
  );
};

export default TransferActivityChart;
