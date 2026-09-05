import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useSocket } from '../../hooks/useSocket';
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useAssignDriverMutation,
  useClaimApprovalMutation,
  useUpdateOrderETAMutation
} from '../../store/api/orderApi';
import API from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
  </svg>
);

export default function IncomingOrders() {
  const socket = useSocket();
  const { data: ordersData, isLoading: loading, error: queryError, refetch } = useGetOrdersQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [assignDriverMutation] = useAssignDriverMutation();
  const [claimApprovalMutation] = useClaimApprovalMutation();
  const [updateOrderETAMutation] = useUpdateOrderETAMutation();

  const orders = ordersData?.data || ordersData || [];
  const error = queryError ? (queryError.data?.error || queryError.message || 'Failed to fetch incoming orders') : '';

  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [incomingClaim, setIncomingClaim] = useState(null);
  const [assignModalOrder, setAssignModalOrder] = useState(null);
  const [onlineDrivers, setOnlineDrivers] = useState([]);

  useEffect(() => {
    fetchOnlineDrivers();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdated = () => {
      refetch();
    };

    const handleClaimNotification = (data) => {
      setIncomingClaim(data);
    };

    const handleClaimRequested = (data) => {
      setIncomingClaim(data);
    };

    const handleClaimResolved = () => {
      setIncomingClaim(null);
      refetch();
    };

    socket.on('order_updated', handleOrderUpdated);
    socket.on('admin:claim_notification', handleClaimNotification);
    socket.on('order:claim_requested', handleClaimRequested);
    socket.on('order:claim_resolved', handleClaimResolved);

    return () => {
      socket.off('order_updated', handleOrderUpdated);
      socket.off('admin:claim_notification', handleClaimNotification);
      socket.off('order:claim_requested', handleClaimRequested);
      socket.off('order:claim_resolved', handleClaimResolved);
    };
  }, [socket, refetch]);

  const fetchOnlineDrivers = async () => {
    try {
      const res = await API.get('/admin/drivers');
      const drivers = res.data.data || res.data || [];
      setOnlineDrivers(drivers.filter(d => d.isOnline || d.status === 'active'));
    } catch (err) {
      console.error('Failed to fetch online drivers', err);
    }
  };

  const handleClaimApproval = async (orderId, approved, driverId) => {
    try {
      await claimApprovalMutation({ orderId, approved, driverId }).unwrap();
      setIncomingClaim(null);
      refetch();
      toast.success('Driver claim ' + (approved ? 'approved' : 'declined'));
    } catch (err) {
      console.error('Failed to process claim approval', err);
    }
  };

  const handleAssignDriverSubmit = async (orderId, driverId) => {
    try {
      await assignDriverMutation({ orderId, driverId }).unwrap();
      setAssignModalOrder(null);
      refetch();
      toast.success('Driver assigned successfully!');
    } catch (err) {
      console.error('Failed to assign driver', err);
    }
  };

  const toggleRow = (orderId) => {
    setExpandedRows(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ orderId, status: newStatus }).unwrap();
      toast.success('Order status updated to ' + newStatus);
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  const handleUpdateETA = async (orderId, minutes) => {
    try {
      await updateOrderETAMutation({ orderId, estimatedMinutes: minutes }).unwrap();
      refetch();
      toast.success('Order ETA updated successfully!');
    } catch (err) {
      console.error('Failed to update order ETA', err);
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
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'In Kitchen':
      case 'Baked':
        return 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800';
      case 'Sent to Delivery':
      case 'Out for Delivery':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'Delivered':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Cancelled':
        return 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <AdminLayout title="Incoming Orders Panel">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 p-4 rounded-xl mb-6 flex justify-between items-center shadow-sm">
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Incoming Customer Orders</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage customer custom pizza orders, review item breakdowns, and update fulfillment statuses in real time.</p>
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
              className="w-full md:w-64 pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
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
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner fullScreen={false} message="Fetching latest data..." />
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
          <span className="text-4xl">📭</span>
          <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200 mt-3">No orders found</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">There are no incoming orders matching the selected status filter.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="min-w-[850px] w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white text-xs uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-3 font-bold w-[130px]">Order ID & Date</th>
                <th className="py-3 px-3 font-bold w-[200px]">Customer Info</th>
                <th className="py-3 px-3 font-bold w-[200px]">Items Summary</th>
                <th className="py-3 px-3 font-bold w-[100px]">Price</th>
                <th className="py-3 px-3 font-bold w-[120px]">Payment Status</th>
                <th className="py-3 px-3 font-bold w-full">Action / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredOrders.map(order => {
                const customerName = order.user?.name || 'Guest Customer';
                const customerEmail = order.user?.email || 'N/A';
                const paymentStatus = order.paymentInfo?.status === 'Paid' ? 'Completed' : (order.paymentInfo?.status || 'Pending');
                const isExpanded = !!expandedRows[order._id];

                return (
                  <React.Fragment key={order._id}>
                    <tr 
                      onClick={() => toggleRow(order._id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      {/* Order ID & Date */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded block w-fit">
                          #{order._id.slice(-6)}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Customer Name & Email */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[190px]">{customerName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[190px]" title={customerEmail}>{customerEmail}</p>
                        {order.deliveryAddress?.phone && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[190px]">📞 {order.deliveryAddress.phone}</p>
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
                              className="flex items-center space-x-1 whitespace-nowrap text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 text-left truncate max-w-[180px]"
                            >
                              <span>{pizza.name || 'Custom Pizza'} (x{pizza.quantity || 1})</span>
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Total Price */}
                      <td className="py-3 px-3 align-top font-mono font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                        ₹{Number(order.totalAmount || order.totalPrice || 0).toFixed(2)}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          paymentStatus === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400'
                        }`}>
                          {paymentStatus}
                        </span>
                      </td>

                      {/* Status Dropdown <select> */}
                      <td className="py-3 px-3 align-top w-[160px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1.5">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold border shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer ${getStatusBadgeColor(order.status)}`}
                          >
                            {statusOptions.map(st => (
                              <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-normal">
                                {st}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setAssignModalOrder(order)}
                            className="w-full py-1.5 px-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>🚗</span> Assign Driver
                          </button>
                          <div className="text-[10px] text-slate-400">
                            Updated: {new Date(order.updatedAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Accordion Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 dark:bg-slate-950/80 transition-all duration-300 ease-in-out border-b border-slate-200 dark:border-slate-800">
                        <td colSpan={6} className="py-5 px-6">
                          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                Full Delivery Details
                              </h4>
                              <span className="text-xs font-mono text-slate-400">ID: #{order._id}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Pizza Ingredient Details */}
                              <div>
                                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2.5">Pizza Configurations</h5>
                                <div className="space-y-3">
                                  {order.pizzas?.map((pizza, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-xs space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wide">{pizza.name || 'Custom Pizza'}</span>
                                        <span className="bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-400 font-bold px-2 py-0.5 rounded-md">Qty: {pizza.quantity || 1}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                        <div><strong className="text-slate-900 dark:text-white">Base:</strong> {pizza.base || 'Standard Crust'}</div>
                                        <div><strong className="text-slate-900 dark:text-white">Sauce:</strong> {pizza.sauce || 'Classic Tomato'}</div>
                                        <div><strong className="text-slate-900 dark:text-white">Cheese:</strong> {pizza.cheese|| 'Mozzarella'}</div>
                                        <div className="col-span-2"><strong className="text-slate-900 dark:text-white">Veggies:</strong> {pizza.veggies?.length > 0 ? pizza.veggies.join(', ') : 'None'}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Delivery Address & Contact Info */}
                              <div>
                                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2.5">Delivery Destination</h5>
                                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-xs space-y-2 text-slate-700 dark:text-slate-300 h-full">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 dark:text-white">Recipient:</span>
                                    <span>{order.deliveryAddress?.name || order.user?.name || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 dark:text-white">Phone:</span>
                                    <span>{order.deliveryAddress?.phone || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">Address:</span>
                                    <span>{order.deliveryAddress?.address || order.deliveryAddress?.street || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 dark:text-white">City / Zip:</span>
                                    <span>{order.deliveryAddress?.city || 'N/A'} {order.deliveryAddress?.postalCode ? `- ${order.deliveryAddress.postalCode}` : ''}</span>
                                  </div>
                                  {order.driver && (
                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                      <span className="font-bold text-orange-700 dark:text-orange-400">Assigned Driver:</span>
                                      <span className="bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 font-semibold px-2 py-0.5 rounded">
                                        {order.driver.name} ({order.driver.phone || order.driver.email})
                                      </span>
                                    </div>
                                  )}
                                  {order.deliveryAddress?.notes && (
                                    <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 rounded-lg">
                                      <strong>Delivery Notes:</strong> {order.deliveryAddress.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Estimated Delivery Time Control */}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                <div>
                                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Estimated Delivery Time (ETA)</h5>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Target Arrival: <strong className="text-slate-900 dark:text-white font-mono">
                                      {order.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : '30 mins from order'}
                                    </strong>
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Quick Presets:</span>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleUpdateETA(order._id, 10); }}
                                    className="px-2.5 py-1 bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors"
                                  >
                                    +10 min
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleUpdateETA(order._id, 15); }}
                                    className="px-2.5 py-1 bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors"
                                  >
                                    +15 min
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleUpdateETA(order._id, 30); }}
                                    className="px-2.5 py-1 bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors"
                                  >
                                    +30 min
                                  </button>
                                  <div className="flex items-center gap-1 ml-2">
                                    <input
                                      type="number"
                                      placeholder="Mins"
                                      id={`custom-eta-${order._id}`}
                                      className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
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

      {/* Real-Time Approval Dialog Modal */}
      {incomingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-6 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">🚨</span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Incoming Driver Claim Request</h3>
              </div>
              <button onClick={() => setIncomingClaim(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl">&times;</button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 p-4 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-orange-900 dark:text-orange-300 uppercase tracking-wider">Driver Details</h4>
                <p><strong>Name:</strong> {incomingClaim.driverDetails?.name || 'Driver'}</p>
                <p><strong>Phone:</strong> {incomingClaim.driverDetails?.phone || incomingClaim.driverDetails?.email || 'N/A'}</p>
                <p><strong>Vehicle / Status:</strong> Active Delivery Driver 🛵</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Order #{incomingClaim.orderDetails?._id?.slice(-6)}</h4>
                <p><strong>Total Amount:</strong> ₹{incomingClaim.orderDetails?.totalPrice || incomingClaim.orderDetails?.totalAmount}</p>
                <p><strong>Destination:</strong> {incomingClaim.orderDetails?.deliveryAddress?.street || incomingClaim.orderDetails?.deliveryAddress?.address}, {incomingClaim.orderDetails?.deliveryAddress?.city}</p>
                <div>
                  <strong className="block mb-1 text-slate-900 dark:text-white">Items Breakdown:</strong>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {incomingClaim.orderDetails?.pizzas?.map((p, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-slate-800 dark:text-slate-200">
                        <span>{p.name || 'Pizza'} (x{p.quantity || 1})</span>
                        <span className="font-mono font-bold">₹{p.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleClaimApproval(incomingClaim.orderDetails?._id || incomingClaim.orderId, true, incomingClaim.driverDetails?._id)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Approve & Dispatch</span>
                <span>🚀</span>
              </button>
              <button
                type="button"
                onClick={() => handleClaimApproval(incomingClaim.orderDetails?._id || incomingClaim.orderId, false)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Decline</span>
                <span>❌</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Driver Assignment Modal */}
      {assignModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚗</span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Manual Driver Assignment</h3>
              </div>
              <button onClick={() => setAssignModalOrder(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl">&times;</button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Select an online driver to directly assign Order <strong className="font-mono text-slate-900 dark:text-white">#{assignModalOrder._id.slice(-6)}</strong>:
              </p>

              {onlineDrivers.length === 0 ? (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-4 rounded-2xl text-xs text-amber-800 dark:text-amber-300 text-center">
                  No online drivers available at the moment.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {onlineDrivers.map(driver => (
                    <div 
                      key={driver._id} 
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-slate-200 dark:border-slate-700 hover:border-orange-300 rounded-2xl flex justify-between items-center transition cursor-pointer"
                      onClick={() => handleAssignDriverSubmit(assignModalOrder._id, driver._id)}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{driver.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{driver.email} | {driver.phone || 'No phone'}</p>
                      </div>
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm"
                      >
                        Assign 🚀
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setAssignModalOrder(null)}
                className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-2xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
