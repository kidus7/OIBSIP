import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/driver')) {
    return null;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-red-600 to-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <span className="text-xl">🍕</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl bg-linear-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent tracking-tight">
                  OIBSIP Pizza
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase -mt-1">
                  Artisan & Fresh
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-orange-50/80 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/custom-builder"
              className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-orange-50/80 transition-colors flex items-center gap-1.5"
            >
              <span>Custom Builder</span>
              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Hot</span>
            </Link>
            <Link
              to="/orders"
              className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-orange-50/80 transition-colors"
            >
              My Orders
            </Link>
            {user && user.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="px-4 py-2 rounded-full text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Search Bar Placeholder */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search pizzas, crusts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-60 pl-9 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white transition-all"
              />
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Cart Icon with Counter Badge */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-red-600 transition-all shadow-sm group"
              title="View Cart"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* Auth Buttons / Profile */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800">{user.name || 'User'}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{user.role || 'Customer'}</span>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-orange-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full text-xs font-bold bg-linear-to-r from-red-600 to-orange-500 text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:scale-105 transition-all"
                >
                  Register
                </Link>
              </div>
            )}

          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex items-center md:hidden gap-2">
            <NotificationBell />
            <Link
              to="/cart"
              className="relative p-2 rounded-full bg-orange-50 text-orange-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-orange-100 px-4 pt-2 pb-6 space-y-3 shadow-xl animate-fadeIn">
          <form onSubmit={handleSearch} className="relative mb-3">
            <input
              type="text"
              placeholder="Search pizzas, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-full text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>

          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
          >
            Home
          </Link>
          <Link
            to="/custom-builder"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
          >
            Custom Builder 🍕
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
          >
            My Orders
          </Link>
          {user && user.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50"
            >
              Admin Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-800">{user.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-red-600 to-orange-500 text-white shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
