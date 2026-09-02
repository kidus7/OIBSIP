import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const adminName = user?.name || storedUser.name || 'Admin User';
  const adminEmail = user?.email || storedUser.email || 'admin@pizzaapp.com';

  const navItems = [
    { path: '/admin/dashboard', label: 'Overview', icon: '📊' },
    { path: '/admin/inventory', label: 'Inventory Management', icon: '📦' },
    { path: '/admin/orders', label: 'Incoming Orders', icon: '🚚' },
    { path: '/admin/drivers', label: 'Drivers', icon: '🛵' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/70">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Responsive/Collapsible) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shadow-xl h-full overflow-y-auto shrink-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🍕</span>
              <div>
                <h1 className="font-bold text-lg tracking-wide text-white">SliceMasters</h1>
                <span className="text-xs uppercase tracking-wider text-red-400 font-semibold">Admin Portal</span>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 text-xl font-bold"
            >
              &times;
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* <div className="p-4 border-t border-slate-800">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2"
          >
            <span>🏠</span>
            <span>Back to Main Site</span>
          </Link>
          <div className="text-xs text-slate-500 px-4 py-1">v1.0.0 Production</div>
        </div> */}
      </aside>

      {/* Main Content Region */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 lg:px-8 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-hidden"
              aria-label="Open Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800">{title || 'Admin Control Panel'}</h2>
          </div>

          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Admin Profile Badge */}
            <div className="flex items-center space-x-3 bg-slate-100 px-3 lg:px-4 py-2 rounded-full border border-slate-200">
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{adminName}</p>
                <p className="text-xs text-slate-500">{adminEmail}</p>
              </div>
              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase ml-1 lg:ml-2">
                Admin
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 lg:px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-red-200 cursor-pointer"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
