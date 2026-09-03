import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout, theme, setTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const hiddenRoutes = [
    '/admin',
    '/driver',
    '/login',
    '/logout',
    '/admin-login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ];

  const shouldHideNavbar = hiddenRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  if (shouldHideNavbar) {
    return null;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleMenuClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/dashboard') {
      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/dashboard#menu');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-3 left-0 right-0 z-50 px-6 sm:px-10 md:px-14 lg:px-16 xl:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 px-4 lg:px-6 py-2 flex items-center justify-between transition-all duration-300">
          <div className="w-full flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-tr from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                  <span className="text-lg sm:text-xl">🍕</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base sm:text-lg bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent tracking-tight">
                    SliceMasters
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-widest uppercase -mt-1">
                    Artisan & Fresh
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-3 min-w-0 flex-1 justify-center">
              <Link
                to="/dashboard"
                className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs xl:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors whitespace-nowrap flex-shrink-0"
              >
                Home
              </Link>
              <a
                href="/dashboard#menu"
                onClick={handleMenuClick}
                className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs xl:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer"
              >
                Menu
              </a>
              <Link
                to="/custom-builder"
                className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs xl:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0"
              >
                <span>Custom Builder 🍕</span>
                <span className="bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">Hot</span>
              </Link>
              <Link
                to="/orders"
                className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs xl:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors whitespace-nowrap flex-shrink-0"
              >
                My Orders
              </Link>
              {user && user.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs xl:text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative flex-shrink min-w-[120px] max-w-[200px]">
                <input
                  type="text"
                  placeholder="Search food, pizzas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 lg:py-2 bg-slate-100/80 dark:bg-slate-950/80 rounded-full text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-900 transition-all border border-slate-200/60 dark:border-slate-800"
                />
                <svg
                  className="absolute left-2.5 top-2.5 w-3 h-3 text-slate-400 dark:text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-sm flex-shrink-0"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Notification Bell */}
              <div className="flex-shrink-0">
                <NotificationBell />
              </div>

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-sm group flex-shrink-0"
                title="View Cart"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[10px] w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    {cart.length}
                  </span>
                )}
              </Link>

              {/* Auth Buttons / Profile */}
              {user ? (
                <div className="relative pl-2 lg:pl-3 border-l border-slate-200 flex-shrink-0" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-9 h-9 rounded-full bg-linear-to-tr from-slate-900 to-slate-800 text-white font-extrabold text-xs flex items-center justify-center shadow-sm hover:scale-105 transition-all"
                  >
                    {getInitials(user.name)}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xl p-3 z-50">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-bold text-slate-800">{user.name || 'User'}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email || ''}</p>
                        <span className="text-[10px] font-bold uppercase bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full inline-block mt-1">
                          {user.role || 'Customer'}
                        </span>
                      </div>
                      <div className="border-t border-slate-100 my-2" />
                      <div className="space-y-1">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          <span>👤</span> Profile & Settings
                        </Link>
                        <Link
                          to="/my-orders"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          <span>📦</span> Order History
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
                          >
                            <span>🛡️</span> Admin Dashboard
                          </Link>
                        )}
                        {user.role === 'driver' && (
                          <Link
                            to="/driver/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-sky-700 hover:bg-sky-50 transition-colors"
                          >
                            <span>🚚</span> Driver Dashboard
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-slate-100 my-2" />
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="text-xs font-semibold text-red-600 hover:bg-red-50 w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 pl-2 lg:pl-3 border-l border-slate-200 flex-shrink-0">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs font-bold text-slate-700 hover:text-orange-600 transition-colors flex-shrink-0"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs font-bold bg-linear-to-r from-orange-500 to-red-600 text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:scale-105 transition-all flex-shrink-0"
                  >
                    Register
                  </Link>
                </div>
              )}

            </div>

            {/* Mobile Hamburger Toggle Button & Icons */}
            <div className="flex items-center lg:hidden gap-2">
              <NotificationBell />
              <Link
                to="/cart"
                className="relative w-9 h-9 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm dark:bg-slate-800 dark:text-orange-400 dark:hover:bg-slate-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="p-2 rounded-full text-slate-700 hover:text-orange-600 hover:bg-orange-50 focus:outline-none transition-colors"
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
        </nav>

        {/* Mobile Open Menu Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden w-full bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl px-5 py-4 space-y-4 rounded-3xl mt-2 animate-fadeIn">
            {/* 1. Mobile Search Pill at top */}
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search pizzas, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-100 rounded-full text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <svg className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>

            {/* 2. Menu Items as full-width interactive cards */}
            <div className="space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors bg-slate-50/50 border border-slate-100"
              >
                Home
              </Link>
              <a
                href="/dashboard#menu"
                onClick={handleMenuClick}
                className="block w-full px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors bg-slate-50/50 border border-slate-100 cursor-pointer"
              >
                Menu
              </a>
              <Link
                to="/custom-builder"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors bg-slate-50/50 border border-slate-100"
              >
                <span>Custom Builder 🍕</span>
                <span className="bg-red-100 text-red-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">Hot</span>
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors bg-slate-50/50 border border-slate-100"
              >
                My Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors bg-slate-50/50 border border-slate-100"
              >
                Profile Settings
              </Link>
              {user && user.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 rounded-2xl text-sm font-bold text-amber-700 bg-amber-50 border border-amber-100"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>

            <button
              onClick={toggleTheme}
              type="button"
              className="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-semibold text-sm transition-all duration-200 border border-slate-200/60 dark:border-slate-700/60"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{theme === 'dark' ? '🌙' : '☀️'}</span>
                <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </div>

              {/* Custom Animated Switch Track */}
              <div
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${theme === 'dark' ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </div>
            </button>
            <div className="pt-2 border-t border-slate-100">
              {user ? (
                <div className="flex flex-col space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-tr from-slate-900 to-slate-800 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      <span className="text-[10px] font-bold uppercase bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {user.role || 'Customer'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2.5 bg-red-100 text-red-600 rounded-xl text-xs font-bold hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl text-xs font-bold bg-linear-to-r from-orange-500 to-red-600 text-white shadow-md"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
