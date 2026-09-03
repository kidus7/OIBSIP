import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useUpdateProfileMutation } from '../../store/api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Car, Lock, ShieldCheck, Settings, Save, ArrowLeft } from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';

export default function DriverProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [updateProfileMutation, { isLoading: loading }] = useUpdateProfileMutation();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [vehicleDetails, setVehicleDetails] = useState(user?.vehicleDetails || '');
  const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true);
  const [theme, setTheme] = useState(user?.preferences?.theme || 'dark');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      const payload = {
        name,
        email,
        phone,
        vehicleDetails,
        preferences: {
          notifications,
          theme
        },
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      };

      const response = await updateProfileMutation(payload).unwrap();
      dispatch(setCredentials({ user: response.data, token }));
      toast.success('Driver profile updated successfully!');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.data?.error || err.data?.message || err.message || 'Failed to update driver profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/driver/dashboard')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xl">🍕</span>
            <span className="font-extrabold text-lg bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              SliceMasters
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            DRIVER PORTAL
          </span>
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DRIVER ACCOUNT</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Driver Profile & Vehicle Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your driver credentials, vehicle details, security, and notification preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Details Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-600/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal & Vehicle Information</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update your driver name, email address, phone number, and vehicle details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
              <div className="relative bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus-within:border-emerald-500 rounded-xl transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-600"
                  placeholder="Driver Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <div className="relative bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus-within:border-emerald-500 rounded-xl transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-600"
                  placeholder="driver@pizzaapp.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
              <div className="relative bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus-within:border-emerald-500 rounded-xl transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-600"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Vehicle Details</label>
              <div className="relative bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus-within:border-emerald-500 rounded-xl transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Car className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={vehicleDetails}
                  onChange={(e) => setVehicleDetails(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-600"
                  placeholder="e.g. Honda Civic - ABC 1234"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 bg-orange-50 dark:bg-orange-600/20 border border-orange-200 dark:border-orange-500/30 rounded-xl text-orange-600 dark:text-orange-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Preferences</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure your delivery alert notifications and display theme.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div>
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">Push Notifications</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Receive alerts on new delivery assignments</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Theme Preference</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none"
              >
                <option value="dark">Dark Mode (Default)</option>
                <option value="light">Light Mode</option>
                <option value="system">System Default</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security / Password Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-600/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security & Password</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Leave blank if you do not wish to change your driver password.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
