import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import AdminLayout from '../../components/AdminLayout';
import API from '../../services/api';

const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
  </svg>
);

export default function IncomingOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchOrders();

    // Socket.io real-time synchronization
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
    const socket = io(socketUrl);

    socket.on('connect', () => {
      socket.emit('join_role', 'admin');
    });

    socket.on('order_updated', () => {
      fetchOrders(); // Instant re-fetch on any order update
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(false); // don't flash full screen loader on silent updates
      const res = await API.get('/orders');
      const rawOrders = res.data.data || res.data || [];
      // Sort orders by newest date first (createdAt descending)
      const sorted = [...rawOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch incoming orders');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (orderId) => {
    setExpandedRows(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setError('');
      setSuccessMessage('');
      const res = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      const updatedOrder = res.data.data || res.data;
      setOrders(orders.map(order => (order._id === orderId ? updatedOrder : order)));
      setSuccessMessage(`Order #${orderId.slice(-6)} status updated to ${newStatus} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update order status');
    }
  };

  const handleUpdateETA = async (orderId, minutes) => {
    try {
      setError('');
      setSuccessMessage('');
      const res = await API.put(`/orders/${orderId}/eta`, { estimatedMinutes: minutes });
      const updatedOrder = res.data.data || res.data;
      setOrders(orders.map(order => (order._id === orderId ? updatedOrder : order)));
      setSuccessMessage(`Order #${orderId.slice(-6)} ETA updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update order ETA');
    }
  };

  const handleCustomETA = async (orderId, customMinutes) => {
    if (isNaN(customMinutes) || customMinutes === '') return;
    handleUpdateETA(orderId, Number(customMinutes));
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();

    const orderIdFull = (order._id || '').toLowerCase();
    const orderIdShort = (order._id ? order._id.slice(-6) : '').toLowerCase();
    const customerName = (order.user?.name || order.deliveryAddress?.name || '').toLowerCase();
    const phoneNum = (order.deliveryAddress?.phone || order.user?.phone || '').toLowerCase();

    return (
      orderIdFull.includes(q) ||
      orderIdShort.includes(q) ||
      customerName.includes(q) ||
      phoneNum.includes(q)
    );
  });

  const statusOptions = [
    'Order Received',
    'In Kitchen',
    'Sent to Delivery',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Order Received':
      case 'Order Placed':
      case 'Order Accepted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'In Kitchen':
      case 'Baked':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Sent to Delivery':
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <AdminLayout title="Incoming Orders Panel">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex justify-between items-center shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 font-bold">&times;</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl mb-6 flex justify-between items-center shadow-sm">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold">&times;</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Incoming Customer Orders</h3>
          <p className="text-sm text-slate-500 mt-1">Manage customer custom pizza orders, review item breakdowns, and update fulfillment statuses in real time.</p>
        </div>

        {/* Search Input & Status Filter Tabs */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          {/* Top Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search ID, Name, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            />
            <svg className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Order Received', 'In Kitchen', 'Sent to Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === status
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <span className="text-4xl">📭</span>
          <h4 className="text-lg font-bold text-slate-700 mt-3">No orders found</h4>
          <p className="text-sm text-slate-500 mt-1">There are no incoming orders matching the selected status filter.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[850px] w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                <th className="py-3 px-3 font-bold w-[130px]">Order ID & Date</th>
                <th className="py-3 px-3 font-bold w-[200px]">Customer Info</th>
                <th className="py-3 px-3 font-bold w-[200px]">Items Summary</th>
                <th className="py-3 px-3 font-bold w-[100px]">Price</th>
                <th className="py-3 px-3 font-bold w-[120px]">Payment Status</th>
                <th className="py-3 px-3 font-bold w-full">Action / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredOrders.map(order => {
                const customerName = order.user?.name || 'Guest Customer';
                const customerEmail = order.user?.email || 'N/A';
                const paymentStatus = order.paymentInfo?.status === 'Paid' ? 'Completed' : (order.paymentInfo?.status || 'Pending');
                const isExpanded = !!expandedRows[order._id];

                return (
                  <React.Fragment key={order._id}>
                    <tr 
                      onClick={() => toggleRow(order._id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Order ID & Date */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded block w-fit">
                          #{order._id.slice(-6)}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Customer Name & Email */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <p className="font-bold text-slate-900 truncate max-w-[190px]">{customerName}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[190px]" title={customerEmail}>{customerEmail}</p>
                        {order.deliveryAddress?.phone && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[190px]">📞 {order.deliveryAddress.phone}</p>
                        )}
                      </td>

                      {/* Items Summary */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {order.pizzas?.map((pizza, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleRow(order._id); }}
                              className="flex items-center space-x-1 whitespace-nowrap text-xs font-semibold text-slate-800 hover:text-orange-600 text-left truncate max-w-[180px]"
                            >
                              <span>{pizza.name || 'Custom Pizza'} (x{pizza.quantity || 1})</span>
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Total Price */}
                      <td className="py-3 px-3 align-top font-mono font-extrabold text-slate-900 whitespace-nowrap">
                        ₹{Number(order.totalAmount || order.totalPrice || 0).toFixed(2)}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          paymentStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {paymentStatus}
                        </span>
                      </td>

                      {/* Status Dropdown <select> */}
                      <td className="py-3 px-3 align-top w-[160px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold border shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer ${getStatusBadgeColor(order.status)}`}
                          >
                            {statusOptions.map(st => (
                              <option key={st} value={st} className="bg-white text-slate-800 font-normal">
                                {st}
                              </option>
                            ))}
                          </select>
                          <div className="text-[10px] text-slate-400">
                            Updated: {new Date(order.updatedAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Accordion Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 transition-all duration-300 ease-in-out border-b border-slate-200">
                        <td colSpan={6} className="py-5 px-6">
                          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-md space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                Full Delivery Details
                              </h4>
                              <span className="text-xs font-mono text-slate-400">ID: #{order._id}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Pizza Ingredient Details */}
                              <div>
                                <h5 className="text-xs font-bold text-slate-700 uppercase mb-2.5">Pizza Configurations</h5>
                                <div className="space-y-3">
                                  {order.pizzas?.map((pizza, idx) => (
                                    <div key={idx} className="bg-slate-50/80 border border-slate-200 p-3.5 rounded-xl text-xs space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="font-extrabold text-red-600 uppercase tracking-wide">{pizza.name || 'Custom Pizza'}</span>
                                        <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-md">Qty: {pizza.quantity || 1}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-slate-700">
                                        <div><strong className="text-slate-900">Base:</strong> {pizza.base || 'Standard Crust'}</div>
                                        <div><strong className="text-slate-900">Sauce:</strong> {pizza.sauce || 'Classic Tomato'}</div>
                                        <div><strong className="text-slate-900">Cheese:</strong> {pizza.cheese|| 'Mozzarella'}</div>
                                        <div className="col-span-2"><strong className="text-slate-900">Veggies:</strong> {pizza.veggies?.length > 0 ? pizza.veggies.join(', ') : 'None'}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Delivery Address & Contact Info */}
                              <div>
                                <h5 className="text-xs font-bold text-slate-700 uppercase mb-2.5">Delivery Destination</h5>
                                <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl text-xs space-y-2 text-slate-700 h-full">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">Recipient:</span>
                                    <span>{order.deliveryAddress?.name || order.user?.name || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">Phone:</span>
                                    <span>{order.deliveryAddress?.phone || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="font-bold text-slate-900 whitespace-nowrap">Address:</span>
                                    <span>{order.deliveryAddress?.address || order.deliveryAddress?.street || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">City / Zip:</span>
                                    <span>{order.deliveryAddress?.city || 'N/A'} {order.deliveryAddress?.postalCode ? `- ${order.deliveryAddress.postalCode}` : ''}</span>
                                  </div>
                                  {order.driver && (
                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                                      <span className="font-bold text-orange-700">Assigned Driver:</span>
                                      <span className="bg-orange-50 text-orange-800 font-semibold px-2 py-0.5 rounded">
                                        {order.driver.name} ({order.driver.phone || order.driver.email})
                                      </span>
                                    </div>
                                  )}
                                  {order.deliveryAddress?.notes && (
                                    <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
                                      <strong>Delivery Notes:</strong> {order.deliveryAddress.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Estimated Delivery Time Control */}
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                <div>
                                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Estimated Delivery Time (ETA)</h5>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    Target Arrival: <strong className="text-slate-900 font-mono">
                                      {order.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : '30 mins from order'}
                                    </strong>
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold text-slate-600">Quick Presets:</span>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleUpdateETA(order._id, 10); }}
                                    className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors"
                                  >
                                    +10 min
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleUpdateETA(order._id, 15); }}
                                    className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors"
                                  >
                                    +15 min
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleUpdateETA(order._id, 30); }}
                                    className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors"
                                  >
                                    +30 min
                                  </button>
                                  <div className="flex items-center gap-1 ml-2">
                                    <input
                                      type="number"
                                      placeholder="Mins"
                                      id={`custom-eta-${order._id}`}
                                      className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const inputVal = document.getElementById(`custom-eta-${order._id}`).value;
                                        if (inputVal) handleCustomETA(order._id, inputVal);
                                      }}
                                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
                                    >
                                      Set ETA
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
