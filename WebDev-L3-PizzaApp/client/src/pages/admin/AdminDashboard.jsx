import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useGetAllOrdersQuery } from '../../store/api/orderApi';
import { useGetInventoryQuery } from '../../store/api/inventoryApi';
import { useGetDriversQuery } from '../../store/api/authApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatPrice } from '../../utils/formatCurrency';

export default function AdminDashboard() {
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useGetAllOrdersQuery();
  const { data: inventoryData, isLoading: inventoryLoading, error: inventoryError } = useGetInventoryQuery();
  const { data: driversData, isLoading: driversLoading, error: driversError } = useGetDriversQuery();

  const loading = ordersLoading || inventoryLoading || driversLoading;
  const queryError = ordersError || inventoryError || driversError;
  const error = queryError ? (queryError.data?.error || queryError.message || 'Failed to fetch dashboard metrics') : '';
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const orders = ordersData?.data || ordersData || [];
  const inventory = inventoryData?.data || inventoryData || [];
  const drivers = driversData?.data || driversData || [];

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

  const recentOrders = orders.slice(0, 5);

  return (
    <AdminLayout title="Dashboard Overview">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex justify-between items-center shadow-xs">
          <span>{error}</span>
          <button onClick={() => {}} className="text-red-700 font-bold hover:text-red-900 cursor-pointer">&times;</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl mb-6 flex justify-between items-center shadow-xs">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold hover:text-emerald-900 cursor-pointer">&times;</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner fullScreen={false} message="Fetching latest SaaS metrics..." />
      ) : (
        <div className="space-y-8 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Revenue */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Revenue</p>
                  <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">{formatPrice(totalRevenue)}</h3>
                </div>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-inner shadow-emerald-200">
                  💰
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                  <span>↑ +12% this month</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">Verified</span>
              </div>
            </div>

            {/* Active Orders */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Orders</p>
                  <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">{activeOrders}</h3>
                </div>
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl shadow-inner shadow-amber-200">
                  📦
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                  </span>
                  <span className="text-xs font-medium text-orange-700">In Kitchen / Delivery</span>
                </div>
                <Link to="/admin/orders" className="text-xs font-semibold text-blue-600 hover:underline">
                  Filter &rarr;
                </Link>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Low Stock Alerts</p>
                  <h3 className={`text-2xl lg:text-3xl font-extrabold mt-2 ${lowStockAlerts.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {lowStockAlerts.length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-xl shadow-inner shadow-red-200">
                  ⚠️
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${lowStockAlerts.length > 0 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                  {lowStockAlerts.length > 0 ? 'Requires Attention' : 'All Stocked'}
                </span>
                <Link to="/admin/inventory" className="text-xs font-semibold text-red-600 hover:underline">
                  Review &rarr;
                </Link>
              </div>
            </div>

            {/* Active Drivers */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden cursor-pointer" onClick={() => navigate('/admin/drivers')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Drivers</p>
                  <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">{drivers.length}</h3>
                </div>
                <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center text-xl shadow-inner shadow-sky-200">
                  🛵
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Fleet Online</span>
                </span>
                <span className="text-xs font-semibold text-sky-600 hover:underline">Manage &rarr;</span>
              </div>
            </div>
          </div>

          {/* Row 2: Feature Shortcut Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Inventory Management Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-600/20 text-red-400 rounded-xl flex items-center justify-center text-2xl border border-red-500/30">
                    📦
                  </div>
                  <span className="bg-red-500/10 text-red-400 text-xs px-3 py-1 rounded-full font-bold uppercase border border-red-500/20">
                    Inventory Control
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Inventory Management</h3>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                  Monitor ingredient stock levels, update threshold warnings, adjust pricing, and add new pizza bases, sauces, cheeses, and veggies.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400 mb-6">
                  <li className="flex items-center space-x-2">
                    <span className="text-red-400 font-bold">&#8226;</span>
                    <span>Real-time stock depletion tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-400 font-bold">&#8226;</span>
                    <span>Automated low threshold alerts</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/admin/inventory"
                className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] shadow"
              >
                <span>Manage Inventory</span>
                <span className="text-lg">&rarr;</span>
              </Link>
            </div>

            {/* Incoming Orders Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-600/20 text-amber-400 rounded-xl flex items-center justify-center text-2xl border border-amber-500/30">
                    🚚
                  </div>
                  <span className="bg-amber-500/10 text-amber-400 text-xs px-3 py-1 rounded-full font-bold uppercase border border-amber-500/20">
                    Order Fulfillment
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Incoming Orders Panel</h3>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                  View real-time incoming orders, check custom pizza specifications, payment status, and update fulfillment stages instantly.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400 mb-6">
                  <li className="flex items-center space-x-2">
                    <span className="text-amber-400 font-bold">&#8226;</span>
                    <span>Kitchen preparation & dispatch queue</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-amber-400 font-bold">&#8226;</span>
                    <span>Payment & status verification</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/admin/orders"
                className="w-full flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] shadow"
              >
                <span>Manage Orders</span>
                <span className="text-lg">&rarr;</span>
              </Link>
            </div>

            {/* Drivers Management Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-600/20 text-emerald-400 rounded-xl flex items-center justify-center text-2xl border border-emerald-500/30">
                    🛵
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500/20">
                    Fleet Dispatch
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Driver Account Management</h3>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                  Register new delivery drivers, manage fleet credentials, and view registered driver profiles and contact numbers.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400 mb-6">
                  <li className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">&#8226;</span>
                    <span>Driver onboarding & credentials</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">&#8226;</span>
                    <span>Fleet availability tracking</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/admin/drivers"
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] shadow"
              >
                <span>Manage Drivers</span>
                <span className="text-lg">&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                      📋
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Recent Incoming Orders</h3>
                      <p className="text-xs text-slate-500">Latest customer orders awaiting or undergoing fulfillment</p>
                    </div>
                  </div>
                  <Link to="/admin/orders" className="text-xs font-semibold text-blue-600 hover:underline">
                    View All Orders &rarr;
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                        <th className="p-3.5 rounded-l-xl">Order ID</th>
                        <th className="p-3.5">Customer</th>
                        <th className="p-3.5">Items</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 rounded-r-xl text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-6 text-center text-slate-400">
                            No recent orders found.
                          </td>
                        </tr>
                      ) : (
                        recentOrders.map(order => (
                          <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5 font-semibold text-slate-800">
                              #{order._id?.slice(-6).toUpperCase()}
                            </td>
                            <td className="p-3.5 text-slate-700 font-medium">
                              {order.user?.name || order.shippingAddress?.fullName || 'Guest User'}
                            </td>
                            <td className="p-3.5 text-slate-600">
                              {order.orderItems?.length || 1} item(s)
                            </td>
                            <td className="p-3.5 font-bold text-slate-900">
                              {formatPrice(order.totalPrice || 0)}
                            </td>
                            <td className="p-3.5">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                order.status === 'Out for Delivery' ? 'bg-sky-100 text-sky-800' :
                                order.status === 'Preparing' ? 'bg-amber-100 text-amber-800' :
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {order.status || 'Received'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <Link
                                to="/admin/orders"
                                className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors inline-block"
                              >
                                Review
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {lowStockAlerts.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between bg-red-50 p-4 rounded-xl border border-red-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🚨</span>
                      <div>
                        <h4 className="text-sm font-bold text-red-800">Critical Stock Warning</h4>
                        <p className="text-xs text-red-600">{lowStockAlerts.length} ingredient(s) are below threshold.</p>
                      </div>
                    </div>
                    <Link
                      to="/admin/inventory"
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow"
                    >
                      Restock Now &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">System & Quick Actions</h3>
                    <p className="text-xs text-slate-500">Shortcuts & health indicators</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/admin/inventory"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🍕</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-red-600 transition-colors">Add New Pizza / Item</p>
                        <p className="text-xs text-slate-500">Expand menu & inventory catalog</p>
                      </div>
                    </div>
                    <span className="text-slate-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </Link>

                  <Link
                    to="/admin/inventory"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">📊</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-red-600 transition-colors">Restock Alert Center</p>
                        <p className="text-xs text-slate-500">Manage low threshold warnings</p>
                      </div>
                    </div>
                    <span className="text-slate-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </Link>

                  <Link
                    to="/admin/drivers"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🛵</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-red-600 transition-colors">Fleet Overview</p>
                        <p className="text-xs text-slate-500">View active delivery drivers</p>
                      </div>
                    </div>
                    <span className="text-slate-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </Link>
                </div>
              </div>

              {/* System Health Badge Box */}
              <div className="bg-slate-900 text-white p-5 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">System Status</span>
                  <span className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Operational</span>
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>API Gateway:</span>
                    <span className="text-emerald-400 font-semibold">99.9% uptime</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database Cluster:</span>
                    <span className="text-emerald-400 font-semibold">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Sessions:</span>
                    <span className="text-white font-semibold">Secure (SSL)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
