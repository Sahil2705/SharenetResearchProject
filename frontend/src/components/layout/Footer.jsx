import React from 'react';
import { Lock, ShieldCheck, Heart, Info, Cpu, Database, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 mt-auto">
      {/* Informational Simulation Notice Banner */}
      <div className="bg-brand-950/40 border-b border-brand-800/20 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs text-brand-300">
          <Info className="w-4 h-4 text-brand-400 flex-shrink-0" />
          <span>
            <strong>SmartNet Simulation Engine:</strong> This platform demonstrates software-defined internet data management, peer transfers, and offline data vault buffering.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-vault-600 flex items-center justify-center shadow-md">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Smart<span className="text-brand-400">Net</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              SmartNet is a production-grade internet data sharing and storage management platform.
              Seamlessly share unused bandwidth with friends, lock data into your offline Data Vault,
              and restore it immediately when you regain cellular coverage.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-1">
                <Database className="w-3 h-3 text-cyan-400" /> MySQL 8
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400" /> Express Node.js
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-1">
                <Cloud className="w-3 h-3 text-blue-400" /> Vercel Ready
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/" className="hover:text-brand-400 transition-colors">Home & Features</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-400 transition-colors">User Dashboard</Link></li>
              <li><Link to="/transfer" className="hover:text-brand-400 transition-colors">Data Sharing / Send</Link></li>
              <li><Link to="/vault" className="hover:text-brand-400 transition-colors">Offline Data Vault</Link></li>
              <li><Link to="/transactions" className="hover:text-brand-400 transition-colors">Ledger & History</Link></li>
            </ul>
          </div>

          {/* Col 3: Demo & Admin */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Demo Credentials</h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div><span className="text-slate-400">Admin:</span> <code className="text-purple-300">admin@smartnet.com</code></div>
              <div><span className="text-slate-400">User:</span> <code className="text-blue-300">user@smartnet.com</code></div>
              <div><span className="text-slate-400">Pass:</span> <code className="text-slate-300">User@123 / Admin@123</code></div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; 2026 SmartNet Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for modern full-stack web architectures</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
