import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10'
  };
  return (
    <Loader2 className={`animate-spin text-brand-500 ${sizeMap[size] || sizeMap.md} ${className}`} />
  );
};

export const FullPageLoader = ({ message = 'Loading SmartNet...' }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center animate-pulse">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-slate-800 rounded w-1/2 mb-4"></div>
      <div className="h-3 bg-slate-800 rounded w-3/4"></div>
    </div>
  );
};
