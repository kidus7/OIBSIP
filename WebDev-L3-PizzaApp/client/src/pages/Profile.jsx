import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useUpdateProfileMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Car, Lock, Shield, Settings, Save, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const dispatch = useDispatch();
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
        vehicleDetails: user?.role === 'driver' ? vehicleDetails : undefined,
        preferences: {
          notifications,
          theme
        },
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      };

      const response = await updateProfileMutation(payload).unwrap();
      dispatch(setCredentials({ user: response.data, token }));
      toast.success('Profile updated successfully!');
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.data?.error || err.data?.message || err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>{user?.role?.toUpperCase()} ACCOUNT</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Account & Profile Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your personal information, security, and role preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Details Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800/80">
            <div className="p-2.5 bg-red-600/20 border border-red-500/30 rounded-xl text-red-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
              <p className="text-xs text-slate-400">Update your name, email address, and phone number.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Full Name</label>
              <div className="relative bg-slate-950 border border-slate-800 focus-within:border-red-500 rounded-xl transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-600"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Email Address</label>
              <div className="relative bg-slate-950 border border-slate-800 focus-within:border-red-500 rounded-xl transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-600"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Phone Number</label>
              <div className="relative bg-slate-950 border border-slate-800 focus-within:border-red-500 rounded-xl transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-600"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {user?.role === 'driver' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Vehicle Details</label>
                <div className="relative bg-slate-950 border border-slate-800 focus-within:border-red-500 rounded-xl transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Car className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={vehicleDetails}
                    onChange={(e) => setVehicleDetails(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-600"
                    placeholder="e.g. Honda Civic - ABC 1234"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800/80">
            <div className="p-2.5 bg-orange-600/20 border border-orange-500/30 rounded-xl text-orange-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Preferences</h2>
              <p className="text-xs text-slate-400">Configure your notification alerts and display preferences.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <span className="block text-sm font-semibold text-white">Push Notifications</span>
                <span className="text-xs text-slate-400">Receive alerts on order status updates</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Theme Preference</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl text-white text-sm focus:outline-none"
              >
                <option value="dark">Dark Mode (Default)</option>
                <option value="light">Light Mode</option>
                <option value="system">System Default</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security / Password Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800/80">
            <div className="p-2.5 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Security & Password</h2>
              <p className="text-xs text-slate-400">Leave blank if you do not wish to change your password.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl text-white text-sm focus:outline-none placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl text-white text-sm focus:outline-none placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl text-white text-sm focus:outline-none placeholder-slate-600"
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
            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
