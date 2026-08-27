import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now - then) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMins = Math.floor(diffInSeconds / 60);
    if (diffInMins < 60) return `${diffInMins} min${diffInMins > 1 ? 's' : ''} ago`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-red-600 transition-all shadow-sm focus:outline-none flex items-center justify-center cursor-pointer"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notification Drawer / Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-orange-100 z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-linear-to-r from-orange-600 to-red-600 text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔔</span>
              <h3 className="font-bold text-sm tracking-wide">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-lg transition font-medium cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[11px] bg-red-800/40 hover:bg-red-800/60 text-white px-2 py-1 rounded-lg transition font-medium cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <span className="text-3xl">📭</span>
                <p className="text-xs font-semibold text-slate-600 mt-2">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-1">Updates on your orders and alerts will appear here in real time.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  className={`p-3.5 transition flex items-start space-x-3 cursor-pointer ${
                    notif.read ? 'bg-white opacity-85' : 'bg-orange-50/60 hover:bg-orange-50 border-l-4 border-orange-500'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{getIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">{getRelativeTime(notif.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">{notif.message}</p>
                    {!notif.read && (
                      <div className="mt-2 flex justify-end">
                        <span className="text-[10px] text-orange-600 font-semibold hover:underline">Mark as read</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-100 px-4 py-2 text-center border-t border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium">OIBSIP Pizza Real-Time Notification System</span>
          </div>
        </div>
      )}
    </div>
  );
}
