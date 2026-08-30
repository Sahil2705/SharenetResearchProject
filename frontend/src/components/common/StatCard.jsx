import React from 'react';

export const StatCard = ({
  title,
  value,
  unit = 'GB',
  subtitle,
  icon: Icon,
  color = 'blue', // 'blue' | 'purple' | 'emerald' | 'amber' | 'rose'
  trend = null,
  onClick = null,
  actionLabel = null
}) => {
  const colorMap = {
    blue: {
      border: 'hover:border-blue-500/40',
      glow: 'hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]',
      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      badge: 'text-blue-400 bg-blue-500/10',
      accent: 'from-blue-500/20 to-transparent'
    },
    purple: {
      border: 'hover:border-purple-500/40',
      glow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]',
      iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      badge: 'text-purple-400 bg-purple-500/10',
      accent: 'from-purple-500/20 to-transparent'
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      glow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      badge: 'text-emerald-400 bg-emerald-500/10',
      accent: 'from-emerald-500/20 to-transparent'
    },
    amber: {
      border: 'hover:border-amber-500/40',
      glow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      badge: 'text-amber-400 bg-amber-500/10',
      accent: 'from-amber-500/20 to-transparent'
    },
    rose: {
      border: 'hover:border-rose-500/40',
      glow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]',
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      badge: 'text-rose-400 bg-rose-500/10',
      accent: 'from-rose-500/20 to-transparent'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-6 transition-all duration-300 ${scheme.border} ${scheme.glow} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Top subtle gradient highlight */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${scheme.accent}`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
            {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(subtitle || trend || actionLabel) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {trend && (
            <span className={`font-semibold px-2 py-0.5 rounded-full ${scheme.badge}`}>
              {trend}
            </span>
          )}
          {actionLabel && (
            <span className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              {actionLabel} &rarr;
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
