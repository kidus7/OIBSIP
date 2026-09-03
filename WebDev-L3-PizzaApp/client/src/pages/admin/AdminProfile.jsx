import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AdminLayout from '../../components/AdminLayout';
import { useUpdateProfileMutation } from '../../store/api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, ShieldCheck, Settings, Save } from 'lucide-react';

export default function AdminProfile() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [updateProfileMutation, { isLoading: loading }] = useUpdateProfileMutation();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true);

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
        preferences: {
          notifications
        },
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      };

      const response = await updateProfileMutation(payload).unwrap();
      dispatch(setCredentials({ user: response.data, token }));
      toast.success('Admin profile updated successfully!');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.data?.error || err.data?.message || err.message || 'Failed to update admin profile');
    }
  };

  return (
    <AdminLayout title="Admin Profile & Settings">
      <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN ACCOUNT</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Security & Profile Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your administrative credentials, security policies, and system preferences.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Details Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-red-50 dark:bg-red-600/20 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Details</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update your administrator name, contact email, and phone number.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <div className="relative bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus-within:border-red-500 rounded-xl transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-600"
                    placeholder="Admin Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <div className="relative bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus-within:border-red-500 rounded-xl transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-600"
                    placeholder="admin@pizzaapp.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                <div className="relative bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus-within:border-red-500 rounded-xl transition-all">
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure your system notification alerts and display theme.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div>
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">Push Notifications</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Receive alerts on new orders and inventory thresholds</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Leave blank if you do not wish to change your admin password.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-red-500 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-600"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-red-500 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-600"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-red-500 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-600"
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
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
