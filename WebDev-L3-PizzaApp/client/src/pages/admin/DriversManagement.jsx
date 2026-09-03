import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { userService } from '../../services/userService';
import { useVerifyDriverMutation } from '../../store/api/authApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function DriversManagement() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verifyDriverMutation] = useVerifyDriverMutation();

  // Modal State for Create / Edit
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDriverId, setCurrentDriverId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await userService.getDrivers();
      setDrivers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setCurrentDriverId(null);
    setFormData({ name: '', email: '', phone: '', password: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (driver) => {
    setIsEditing(true);
    setCurrentDriverId(driver._id);
    setFormData({
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      password: '' // leave blank unless updating
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMessage('');
      if (isEditing) {
        const res = await userService.updateDriver(currentDriverId, formData);
        setDrivers(drivers.map(d => d._id === currentDriverId ? res.data : d));
        setSuccessMessage('Driver profile updated successfully!');
        toast.success('Driver profile updated successfully!');
      } else {
        const res = await userService.createDriver(formData);
        setDrivers([...drivers, res.data]);
        setSuccessMessage('Driver account created successfully!');
        toast.success('Driver account created successfully!');
      }
      setShowModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to save driver profile';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setError('');
      const res = await userService.toggleDriverStatus(id);
      setDrivers(drivers.map(d => d._id === id ? res.data : d));
      setSuccessMessage('Driver status updated!');
      toast.success('Driver status updated!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to toggle status';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleVerifyDriver = async (id) => {
    try {
      setError('');
      await verifyDriverMutation(id).unwrap();
      toast.success('Driver verified successfully! 🛡️');
      fetchDrivers();
    } catch (err) {
      const errMsg = err.data?.error || err.message || 'Failed to verify driver';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      setError('');
      await userService.deleteDriver(id);
      setDrivers(drivers.filter(d => d._id !== id));
      setSuccessMessage('Driver deleted successfully!');
      toast.success('Driver deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to delete driver';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <AdminLayout title="Driver Fleet Management">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 font-bold">&times;</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-lg mb-6 flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold">&times;</button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Fleet Drivers Overview</h3>
          <p className="text-sm text-slate-500">Manage driver accounts, contact info, status, and credentials.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <span>➕</span>
          <span>Register New Driver</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner fullScreen={false} message="Fetching latest data..." />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="p-4">#</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      No drivers registered yet. Click "+ Register New Driver" to add one.
                    </td>
                  </tr>
                ) : (
                  drivers.map((driver, index) => {
                    const isActive = driver.isActive !== false;
                    const isVerified = driver.isVerified === true;
                    return (
                      <tr key={driver._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 text-slate-500 font-medium">{index + 1}</td>
                        <td className="p-4 font-semibold text-slate-800">{driver.name}</td>
                        <td className="p-4 text-slate-600">{driver.email}</td>
                        <td className="p-4 text-slate-600">{driver.phone || 'N/A'}</td>
                        <td className="p-4">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase">
                            {driver.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${
                            isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isVerified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2 whitespace-nowrap">
                            {!isVerified ? (
                              <button
                                onClick={() => handleVerifyDriver(driver._id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                              >
                                Verify Driver 🛡️
                              </button>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center space-x-1">
                                <span>Verified</span>
                                <span>✓</span>
                              </span>
                            )}
                            <button
                              onClick={() => handleOpenEditModal(driver)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(driver._id)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                                isActive
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(driver._id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form for Create / Update */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <span>🚚</span>
                <span>{isEditing ? 'Update Driver Profile' : 'Register New Driver Account'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="driver@pizzaapp.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isEditing ? 'New Password (leave blank to keep current)' : 'Temporary Password'}
                </label>
                <input
                  type="password"
                  {...(!isEditing ? { required: true, minLength: 6 } : {})}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow cursor-pointer"
                >
                  {isEditing ? 'Save Changes' : 'Create Driver Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
