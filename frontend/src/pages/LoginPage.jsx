import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Lock, Mail, ArrowRight, Shield, User, Users, AlertCircle } from 'lucide-react';
import { Spinner } from '../components/common/Loader';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      showToast({ title: 'Welcome Back!', message: 'Signed in successfully.', type: 'success' });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-brand-600 to-vault-600 shadow-xl shadow-brand-500/20 mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Sign in to SmartNet</h2>
          <p className="text-xs text-slate-400 mt-2">
            Access your data balances, peer transfers, and offline Data Vault
          </p>
        </div>

        {/* Demo Account Quick Switch Buttons */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
            <span>🚀 Quick 1-Click Demo Accounts</span>
            <span className="text-[10px] text-brand-400 font-normal">Click to Autofill</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@smartnet.com', 'Admin@123')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-purple-500/30 text-left transition-all hover:scale-[1.02] flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold">
                <Shield className="w-3.5 h-3.5" /> Admin
              </div>
              <span className="text-[10px] text-slate-400 mt-1 truncate">admin@smartnet</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('user@smartnet.com', 'User@123')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-brand-500/30 text-left transition-all hover:scale-[1.02] flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 text-brand-400 text-xs font-bold">
                <User className="w-3.5 h-3.5" /> User (Alex)
              </div>
              <span className="text-[10px] text-slate-400 mt-1 truncate">user@smartnet</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('receiver@smartnet.com', 'Receiver@123')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/30 text-left transition-all hover:scale-[1.02] flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <Users className="w-3.5 h-3.5" /> Recipient
              </div>
              <span className="text-[10px] text-slate-400 mt-1 truncate">receiver@smartnet</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Spinner size="sm" /> Signing In...
                </>
              ) : (
                <>
                  Sign In to Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-400 hover:text-brand-300">
              Create Account (10 GB Free)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
