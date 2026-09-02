import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Mail, Lock, User, Eye, EyeOff, Pizza, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await authService.register({ name, email, password });
      setMessage(data.data || 'Registration successful! Please login to your account.');
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full w-full bg-slate-950 text-white grid grid-cols-1 lg:grid-cols-12 p-4 sm:p-6 overflow-y-auto">
      {/* Left Panel (Visual Hero - 7 cols on desktop) */}
      <div className="hidden lg:flex lg:col-span-7 relative overflow-hidden items-center justify-center p-12 rounded-3xl m-2">
        <div 
          className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=1920&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/50 to-transparent" />
        
        {/* Floating Glassmorphic Card */}
        <div className="relative z-10 max-w-lg backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-orange-600/30 border border-orange-500/40 rounded-xl text-orange-400">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-orange-400 font-bold px-2.5 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">
                Join SliceMaster
              </span>
              <h1 className="text-2xl font-extrabold mt-1 text-white">Craft Your Perfect Pizza</h1>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Artisan Hand-Crafted Pizzas • Live Real-Time Delivery Tracking 🛵. Create a free account today to unlock custom pizza builder tools, instant order tracking, and exclusive discounts.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center space-x-2 text-slate-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant Verification</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 text-xs">
              <Pizza className="w-4 h-4 text-orange-400" />
              <span>Custom Pizza Builder</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel (Form Area - 5 cols on desktop) */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-5 sm:p-8 rounded-3xl max-w-md w-full my-auto mx-auto bg-slate-950">
        <div className="w-full">
          {/* Role Indicator / Tab Pill */}
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span>New Customer Registration</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">Create an Account</h2>
            <p className="text-slate-400 text-sm">Sign up in seconds to start ordering gourmet pizzas.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-800/80 text-red-300 rounded-xl text-sm flex items-center space-x-3 shadow-lg">
              <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 rounded-xl text-sm flex items-center space-x-3 shadow-lg">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative bg-slate-900/80 border border-slate-800 focus-within:border-red-500 rounded-xl transition-all duration-200">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
                  placeholder="John Doe" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative bg-slate-900/80 border border-slate-800 focus-within:border-red-500 rounded-xl transition-all duration-200">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
                  placeholder="name@example.com" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative bg-slate-900/80 border border-slate-800 focus-within:border-red-500 rounded-xl transition-all duration-200">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3.5 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
