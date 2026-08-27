import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { orderService } from '../../services/orderService';
import { inventoryService } from '../../services/inventoryService';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, inventoryRes, driversRes] = await Promise.all([
        orderService.getAllOrders(),
        inventoryService.getInventory(),
        userService.getDrivers()
      ]);

      setOrders(ordersRes.data || []);
      setInventory(inventoryRes.data || []);
      setDrivers(driversRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  // Calculate Metrics
  const totalRevenue = orders
    .filter(order => order.paymentInfo?.status === 'Paid' || order.status !== 'Cancelled')
    .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  const activeOrders = orders.filter(
    order => order.status !== 'Delivered' && order.status !== 'Cancelled'
  ).length;

  const lowStockAlerts = inventory.filter(
    item => (item.stock ?? 0) <= (item.minThreshold ?? 20)
  );

  return (
    <AdminLayout title="Dashboard Overview">
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

      {loading ? (
        <LoadingSpinner fullScreen={false} message="Fetching latest data..." />
      ) : (
        <div className="space-y-8">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">₹{totalRevenue.toLocaleString()}</h3>
                <p className="text-xs text-emerald-600 mt-1 font-medium">↑ Verified & Completed Orders</p>
              </div>
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full text-2xl">
                💰
              </div>
            </div>

            {/* Active Orders */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Orders</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{activeOrders}</h3>
                <p className="text-xs text-blue-600 mt-1 font-medium">Pending Kitchen / Delivery</p>
              </div>
              <div className="p-4 bg-blue-50 text-blue-600 rounded-full text-2xl">
                📦
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Low Stock Alerts</p>
                <h3 className={`text-3xl font-extrabold mt-2 ${lowStockAlerts.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {lowStockAlerts.length}
                </h3>
                <p className="text-xs text-red-500 mt-1 font-medium">Items requiring restocking</p>
              </div>
              <div className="p-4 bg-red-50 text-red-600 rounded-full text-2xl">
                ⚠️
              </div>
            </div>

            {/* Registered Drivers */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between cursor-pointer" onClick={() => navigate('/admin/drivers')}>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Drivers</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{drivers.length}</h3>
                <p className="text-xs text-amber-600 mt-1 font-medium">Registered fleet drivers</p>
              </div>
              <div className="p-4 bg-amber-50 text-amber-600 rounded-full text-2xl">
                🚚
              </div>
            </div>
          </div>

          {/* Quick Actions / Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-md flex flex-col justify-between">
              <div>
                <span className="text-3xl">📦</span>
                <h3 className="text-xl font-bold mt-3">Inventory Management</h3>
                <p className="text-slate-300 text-sm mt-1">
                  Monitor ingredient stock levels, update threshold warnings, adjust pricing, and add new pizza bases, sauces, cheeses, and veggies.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  to="/admin/inventory"
                  className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow"
                >
                  Manage Inventory &rarr;
                </Link>
              </div>
            </div>

            <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-md flex flex-col justify-between">
              <div>
                <span className="text-3xl">🚚</span>
                <h3 className="text-xl font-bold mt-3">Incoming Orders Panel</h3>
                <p className="text-slate-300 text-sm mt-1">
                  View real-time incoming orders, check custom pizza specifications, payment status, and update fulfillment stages instantly.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  to="/admin/orders"
                  className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow"
                >
                  Manage Orders &rarr;
                </Link>
              </div>
            </div>

            <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-md flex flex-col justify-between">
              <div>
                <span className="text-3xl">👤</span>
                <h3 className="text-xl font-bold mt-3">Driver Account Management</h3>
                <p className="text-slate-300 text-sm mt-1">
                  Register new delivery drivers, manage fleet credentials, and view registered driver profiles and contact numbers.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  to="/admin/drivers"
                  className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow"
                >
                  Manage Drivers &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Low Stock Warning List Section */}
          {lowStockAlerts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-red-700 flex items-center space-x-2">
                  <span>🚨</span>
                  <span>Critical Inventory Stock Warnings</span>
                </h3>
                <Link to="/admin/inventory" className="text-sm font-semibold text-red-600 hover:underline">
                  View All Inventory &rarr;
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-red-50 text-red-900 text-xs uppercase tracking-wider">
                      <th className="p-3">Ingredient Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Current Stock</th>
                      <th className="p-3">Min Threshold</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100 text-sm">
                    {lowStockAlerts.map(item => (
                      <tr key={item._id} className="hover:bg-red-50/50">
                        <td className="p-3 font-semibold text-slate-800">{item.name}</td>
                        <td className="p-3 capitalize text-slate-600">{item.category}</td>
                        <td className="p-3 font-bold text-red-600">{item.stock} {item.unit || 'units'}</td>
                        <td className="p-3 text-slate-500">{item.minThreshold || 20}</td>
                        <td className="p-3">
                          <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase animate-pulse">
                            Low Stock
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
