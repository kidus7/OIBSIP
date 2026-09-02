import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await authService.adminLogin({ email, password });
      
      if (data.user.role !== 'admin') {
        setError('Access denied. Administrator privileges required.');
        toast.error('Access denied. Administrator privileges required.');
        setLoading(false);
        return;
      }

      login(data.user, data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);

      setMessage('Admin login successful! Redirecting...');
      toast.success('Admin login successful!');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Invalid admin credentials';
      setError(errMsg);
      toast.error(errMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full w-full bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-linear-to-br from-slate-950 via-slate-900 to-red-950/30">
      {/* Outer Card: Rounded split container */}
      <div className="max-w-4xl w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 my-auto">
        
        {/* Left Visual Branding Banner (Desktop View) */}
        <div className="hidden md:flex relative overflow-hidden flex-col justify-between p-8 lg:p-12">
          <div 
            className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-1000"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1920&auto=format&fit=crop')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/95 via-slate-950/70 to-red-950/40" />

          {/* Top Pill Badge */}
          <div className="relative z-10">
            <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-2">
              ADMIN GATEWAY 🛡️
            </span>
          </div>

          {/* Center Content */}
          <div className="relative z-10 my-auto py-8">
            <h1 className="text-3xl font-black text-white leading-tight mb-4">
              SliceMasters Control Center
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Command station for high-throughput pizzeria management, order routing, and inventory sync.
            </p>

            {/* Features List */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0" />
                <span>Real-Time Order Tracking</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0" />
                <span>Inventory Management</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0" />
                <span>Driver Dispatching</span>
              </div>
            </div>
          </div>

          {/* Footer badge */}
          {/* <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secured 256-bit Admin Encryption</span>
          </div> */}
        </div>

        {/* Right Form Panel */}
        <div className="flex flex-col justify-center p-5 sm:p-8 md:p-10 bg-slate-950/70 my-auto">
          <div className="w-full max-w-sm mx-auto">
            
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white mb-1">Admin Portal Sign In</h2>
              <p className="text-slate-400 text-sm">Enter authorization credentials to access management controls.</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 text-red-300 rounded-xl text-xs flex items-center gap-2">
                <span className="w-1.5 h-4 bg-red-500 rounded-full shrink-0"></span>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full shrink-0"></span>
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950/70 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none placeholder-slate-600"
                    placeholder="admin@slicemasters.com" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950/70 border border-slate-800 text-white rounded-xl pl-10 pr-10 py-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none placeholder-slate-600"
                    placeholder="••••••••" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-2 bg-linear-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl py-3.5 shadow-lg shadow-red-900/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Admin Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              Need an admin account?{' '}
              <Link to="/admin-register" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
                Register Admin
              </Link>
            </div>

            {/* Admin Security Disclaimer Footnote */}
            <div className="mt-8 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                "Restricted Area: Authorized personnel only. Access logs monitored."
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
