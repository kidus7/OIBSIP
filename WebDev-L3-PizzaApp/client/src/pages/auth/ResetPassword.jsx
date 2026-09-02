import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';

export default function ResetPassword() {
  const { id, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await authService.resetPassword(id, token, password);
      setMessage(data.message || 'Password successfully updated! Redirecting to login...');
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to reset password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full w-full bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 p-5 sm:p-8 rounded-3xl shadow-2xl my-auto">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-red-600/30 border border-red-500/40 rounded-2xl text-red-400 mb-3">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Reset Password</h2>
          <p className="text-slate-400 text-sm">Enter your new secure password below.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/80 text-red-300 rounded-xl text-xs flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-500 rounded-full shrink-0"></span>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full shrink-0"></span>
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">New Password</label>
            <div className="relative bg-slate-950/70 border border-slate-800 focus-within:border-red-500 rounded-xl transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent text-white placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none"
                placeholder="••••••••" 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <div className="relative bg-slate-950/70 border border-slate-800 focus-within:border-red-500 rounded-xl transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-transparent text-white placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none"
                placeholder="••••••••" 
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl py-3.5 shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Updating...' : 'Update Password'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Back to <Link to="/login" className="text-red-400 hover:text-red-300 font-semibold transition-colors">Login</Link>
        </div>
      </div>
    </div>
  );
}
