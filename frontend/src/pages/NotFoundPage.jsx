import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4">
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mb-6">
        <Lock className="w-12 h-12 text-brand-400" />
      </div>
      <h1 className="text-6xl font-black text-white tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mt-2 mb-8 leading-relaxed">
        The route you are trying to access does not exist or has been relocated to another vault.
      </p>

      <Link
        to="/"
        className="px-6 py-3 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-600/25 transition-all flex items-center gap-2"
      >
        <Home className="w-4 h-4" /> Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
