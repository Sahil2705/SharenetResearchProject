import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  Lock,
  RefreshCw,
  Zap,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Database,
  BarChart3,
  Globe,
  Users,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const faqs = [
    {
      q: 'How does SmartNet data sharing work?',
      a: 'Users can send any portion of their available data allowance to another registered user using their email or phone number. The transaction occurs atomically with instant ledger updates.'
    },
    {
      q: 'What is the Data Vault feature?',
      a: 'When you are heading into a no-network or offline zone (e.g. remote hiking, flight, subway), you can deposit your unused mobile data into your personal Data Vault. When you return to network coverage, you can restore and unlock that data with a single click.'
    },
    {
      q: 'Is SmartNet free to test and use?',
      a: 'Yes! Every new account comes with a 10.00 GB complimentary starter data allowance. You can also simulate top-ups in your profile settings.'
    },
    {
      q: 'Is this real mobile telecom data or a simulation?',
      a: 'SmartNet is a software data management simulation system designed to showcase modern full-stack web architectures, ACID database transactions, and intuitive bandwidth asset management.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-600/20 to-vault-600/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-brand-300 shadow-xl mb-8 animate-in fade-in slide-in-from-top-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Next-Gen Bandwidth & Storage Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Your Data. <span className="brand-gradient-text">Your Control.</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Share your unused internet data, store it securely when you're offline, and restore it whenever you need it most.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-600/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-600/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  Get Started (10 GB Free) <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  Sign In with Demo Accounts
                </Link>
              </>
            )}
          </div>

          {/* Visual Step-by-Step Cycle */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20 font-bold">
                  1
                </div>
                <h4 className="text-sm font-bold text-white">Share</h4>
                <p className="text-[11px] text-slate-400 text-center">Transfer GB to friends instantly</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 font-bold">
                  2
                </div>
                <h4 className="text-sm font-bold text-white">Store</h4>
                <p className="text-[11px] text-slate-400 text-center">Lock in Data Vault when offline</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 font-bold">
                  3
                </div>
                <h4 className="text-sm font-bold text-white">Restore</h4>
                <p className="text-[11px] text-slate-400 text-center">Unlock data on return</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 font-bold">
                  4
                </div>
                <h4 className="text-sm font-bold text-white">Use</h4>
                <p className="text-[11px] text-slate-400 text-center">Browse without data wastage</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400">Engineered For Reliability</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Everything you need to master your data economy
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Instant Peer Transfers</h4>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Send unused data seamlessly to family, colleagues, or classmates using just their verified phone number or email address.
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> ACID MySQL Transaction guarantee</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero overdraft or negative balances</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Offline Data Vault</h4>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Heading to a dead zone or on a flight? Lock your remaining quota into the Data Vault so your data never expires in transit.
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Single-click instant restoration</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Detailed offline timestamps & audit logs</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Transparent Analytics</h4>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Track every megabyte sent, received, and vaulted with interactive distribution charts, filterable history, and real-time alerts.
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Instant in-app notification center</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Comprehensive admin management suite</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Data Vault Showcase Highlight */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/40 border border-purple-500/30 vault-glow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  Unique Smart Feature
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-4">
                  The Data Vault: Never waste data in dead zones again
                </h3>
                <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                  Traditional plans charge you whether you have cellular reception or not. SmartNet's simulated Data Vault lets you pause and safeguard your data balance before stepping into a remote terrain or underground metro.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Entering Dead Zone:</span>
                    <span className="text-purple-400 font-bold">5.00 GB &rarr; Data Vault [Locked]</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Returning Online:</span>
                    <span className="text-emerald-400 font-bold">Data Vault &rarr; 5.00 GB [Restored]</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    to="/vault"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/25"
                  >
                    Explore Data Vault <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Vault UI Mockup Preview */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-400" /> DATA VAULT ACTIVE
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold text-[10px]">
                    SECURE
                  </span>
                </div>

                <div className="py-8 text-center">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Currently Stored in Vault</p>
                  <div className="text-5xl font-black text-white mt-2 tracking-tight flex items-center justify-center gap-2">
                    5.20 <span className="text-xl text-purple-400 font-medium">GB</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Locked for Himalayan Mountain Expedition</p>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                    <span>Recent Storage History</span>
                    <span className="text-slate-400">Status</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 rounded-lg bg-slate-900 flex items-center justify-between">
                      <span className="font-medium text-slate-300">5.00 GB &bull; Stored</span>
                      <span className="text-purple-400 font-semibold text-[10px]">LOCKED</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 flex items-center justify-between">
                      <span className="font-medium text-slate-300">2.00 GB &bull; Restored</span>
                      <span className="text-emerald-400 font-semibold text-[10px]">RESTORED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 bg-slate-900/30 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-400 mt-2">Everything you need to know about SmartNet</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h4 className="text-sm font-bold text-white">{faq.q}</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
