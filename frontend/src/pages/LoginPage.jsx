import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 text-white shadow-xl shadow-brand-500/30 mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">BarangayConnect</h2>
          <p className="text-sm text-slate-400 mt-1">Smart Barangay Management System</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">Portal Sign In</h3>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@barangayconnect.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In to Portal <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-8 pt-6 border-t border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@barangayconnect.com', 'Admin@123')}
                className="p-2 text-left bg-slate-900/40 hover:bg-slate-900 border border-slate-700/40 rounded-xl text-xs text-slate-300 transition-colors"
              >
                <span className="font-semibold block text-brand-400">Super Admin</span>
                <span className="text-[10px] text-slate-500">Full System Control</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('captain@barangayconnect.com', 'Admin@123')}
                className="p-2 text-left bg-slate-900/40 hover:bg-slate-900 border border-slate-700/40 rounded-xl text-xs text-slate-300 transition-colors"
              >
                <span className="font-semibold block text-emerald-400">Captain</span>
                <span className="text-[10px] text-slate-500">Approvals & Analytics</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff1@barangayconnect.com', 'Admin@123')}
                className="p-2 text-left bg-slate-900/40 hover:bg-slate-900 border border-slate-700/40 rounded-xl text-xs text-slate-300 transition-colors"
              >
                <span className="font-semibold block text-amber-400">Staff</span>
                <span className="text-[10px] text-slate-500">Residents & Processing</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('resident1@barangayconnect.com', 'Admin@123')}
                className="p-2 text-left bg-slate-900/40 hover:bg-slate-900 border border-slate-700/40 rounded-xl text-xs text-slate-300 transition-colors"
              >
                <span className="font-semibold block text-indigo-400">Resident</span>
                <span className="text-[10px] text-slate-500">Requests & Complaints</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
