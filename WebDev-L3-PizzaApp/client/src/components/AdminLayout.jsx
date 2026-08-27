import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar (Dark/Slate) */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shadow-xl h-full overflow-y-auto shrink-0">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <span className="text-3xl">🍕</span>
            <div>
              <h1 className="font-bold text-lg tracking-wide text-white">SliceMasters</h1>
              <span className="text-xs uppercase tracking-wider text-red-400 font-semibold">Admin Portal</span>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
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

        <div className="p-4 border-t border-slate-800">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2"
          >
            <span>🏠</span>
            <span>Back to Main Site</span>
          </Link>
          <div className="text-xs text-slate-500 px-4 py-1">v1.0.0 Production</div>
        </div>
      </aside>

      {/* Main Content Region */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-slate-800">{title || 'Admin Control Panel'}</h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Admin Profile Badge */}
            <div className="flex items-center space-x-3 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{adminName}</p>
                <p className="text-xs text-slate-500">{adminEmail}</p>
              </div>
              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase ml-2">
                Admin
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-red-200 cursor-pointer"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
