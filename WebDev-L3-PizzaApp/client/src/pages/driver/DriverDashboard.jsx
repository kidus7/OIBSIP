import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setCredentials } from '../../store/slices/authSlice';
import {
  useGetOrdersQuery,
  useRespondToAssignmentMutation,
  useVerifyDeliveryOTPMutation,
  useClaimOrderMutation
} from '../../store/api/orderApi';
import { useUpdateDriverStatusMutation } from '../../store/api/authApi';
import NotificationBell from '../../components/NotificationBell';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DriverDashboard() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { data: ordersData, isLoading: loading, error: queryError, refetch } = useGetOrdersQuery('/orders/driver/available');
  const [respondToAssignment] = useRespondToAssignmentMutation();
  const [verifyDeliveryOTP] = useVerifyDeliveryOTPMutation();
  const [updateDriverStatus] = useUpdateDriverStatusMutation();
  const [claimOrder] = useClaimOrderMutation();

  const orders = ordersData?.data || ordersData || [];
  const error = queryError ? (queryError.data?.error || queryError.message || 'Failed to fetch driver deliveries') : '';

  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'active', or 'completed'
  const [completingOrderId, setCompletingOrderId] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(user?.isOnline ?? (user?.status === 'active') ?? true);
  const [directAssignmentModalData, setDirectAssignmentModalData] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user?.isOnline !== undefined) {
      setIsOnline(user.isOnline);
    } else if (user?.status !== undefined) {
      setIsOnline(user.status === 'active');
    }
  }, [user]);

  useEffect(() => {
    // Socket.io real-time synchronization
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
    const socket = io(socketUrl);

    socket.on('connect', () => {
      socket.emit('join_role', 'driver');
      if (user?._id) {
        socket.emit('join_driver', user._id);
      }
    });

    socket.on('order_updated', () => {
      refetch();
    });

    socket.on('order:claim_resolved', (data) => {
      refetch();
      toast.success(data.approved ? '🎉 Your order claim was approved by Admin!' : '❌ Your order claim was declined.');
    });

    socket.on('order:direct_assignment', (data) => {
      setDirectAssignmentModalData(data);
      refetch();
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleAcceptDirectAssignment = async (orderId) => {
    try {
      await respondToAssignment({ id: orderId, accept: true }).unwrap();
      setDirectAssignmentModalData(null);
      refetch();
      toast.success('Accepted direct assignment successfully! 🛵');
    } catch (err) {
      toast.error(err.data?.error || err.message || 'Failed to accept assignment');
    }
  };

  const handleDeclineDirectAssignment = async (orderId) => {
    try {
      await respondToAssignment({ id: orderId, accept: false }).unwrap();
      setDirectAssignmentModalData(null);
      refetch();
      toast.success('Declined job assignment.');
    } catch (err) {
      toast.error(err.data?.error || err.message || 'Failed to decline assignment');
    }
  };

  const isMyPendingClaim = (order) => {
    const pId = order.pendingDriverId?._id?.toString() || order.pendingDriverId?.toString();
    const uId = user?._id?.toString() || user?.id?.toString();
    return order.claimStatus === 'pending' && pId && uId && pId === uId;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'D';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleToggleStatus = async (newStatus) => {
    try {
      const res = await updateDriverStatus({ isOnline: newStatus }).unwrap();
      const updated = res.data || res;
      setIsOnline(updated.isOnline);
      dispatch(setCredentials({ user: { ...user, isOnline: updated.isOnline, status: updated.status, isActive: updated.isActive }, token }));
      if (updated.isOnline) {
        toast.success('🟢 Online & Ready for Orders');
        refetch();
      } else {
        toast.success('🔴 Offline / On Break');
      }
    } catch (err) {
      toast.error(err.data?.error || err.message || 'Failed to update availability status');
    }
  };

  const handleClaimOrder = async (orderId) => {
    if (!isOnline) {
      toast.error('You must be Online to claim delivery orders.');
      return;
    }
    try {
      setSuccessMsg('');
      await claimOrder(orderId).unwrap();
      refetch();
      toast.success(`Successfully accepted Order #${orderId.slice(-6)}! Out for delivery 🛵`);
      setSuccessMsg(`Successfully accepted Order #${orderId.slice(-6)}! Out for delivery 🛵`);
      setActiveTab('active');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      const errMsg = err.data?.error || err.message || 'Failed to claim order';
      toast.error(errMsg);
    }
  };

  const handleCompleteOrderWithCode = async (orderId) => {
    try {
      setSuccessMsg('');
      await verifyDeliveryOTP({ id: orderId, deliveryCode: inputCode }).unwrap();
      toast.success(`Order #${orderId.slice(-6)} marked as Delivered! 🎉`);
      setSuccessMsg(`Order #${orderId.slice(-6)} marked as Delivered! 🎉`);
      setCompletingOrderId(null);
      setInputCode('');
      setTimeout(() => setSuccessMsg(''), 4000);
      refetch();
    } catch (err) {
      const errMsg = err.data?.error || err.message || 'Failed to complete order with delivery code';
      toast.error(errMsg);
    }
  };

  const isMyOrder = (order) => {
    const dId = order.driverId?._id?.toString() || order.driverId?.toString() || order.driver?._id?.toString() || order.driver?.toString();
    const uId = user?._id?.toString() || user?.id?.toString();
    return dId && uId && dId === uId;
  };

  const isUnassigned = (order) => {
    const dId = order.driverId?._id?.toString() || order.driverId?.toString() || order.driver?._id?.toString() || order.driver?.toString();
    return !dId;
  };

  const availableOrders = orders.filter(o => 
    (o.status === 'Out for Delivery' || o.status === 'Sent to Delivery') && isUnassigned(o)
  );
  const activeDeliveries = orders.filter(o => 
    isMyOrder(o) && ['Out for Delivery', 'In Transit', 'On The Way', 'Sent to Delivery'].includes(o.status)
  );
  const completedDeliveries = orders.filter(o => 
    isMyOrder(o) && o.status === 'Delivered'
  );

  return (
    <div className="max-w-md md:max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-8 space-y-6 min-h-screen overflow-x-hidden">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-20">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍕</span>
            <span className="font-extrabold text-base sm:text-lg bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              SliceMasters
            </span>
          </div>
          <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 font-bold text-[10px] sm:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block">
            DRIVER PORTAL
          </span>
        </div>

        {/* Status Toggle Pill in Header Bar */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => handleToggleStatus(!isOnline)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold transition cursor-pointer shadow-sm ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="Click to toggle availability status"
          >
            <span>{isOnline ? '🟢 Online & Ready for Orders' : '🔴 Offline / On Break'}</span>
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
          </button>

          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl hidden sm:block">
              <NotificationBell />
            </div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer"
              title={user?.name || 'Driver Avatar'}
            >
              {getInitials(user?.name)}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-12 w-60 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl p-3 z-50 animate-fadeIn">
                <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name || 'Driver'}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
                  <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-wider">
                    DRIVER
                  </span>
                </div>
                <div className="pt-2 space-y-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/driver/profile');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600 transition-colors text-left cursor-pointer"
                  >
                    <span>👤</span> Profile & Vehicle Settings
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setActiveTab('active');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600 transition-colors text-left cursor-pointer"
                  >
                    <span>🚗</span> Active Deliveries
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      dispatch(logout());
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left cursor-pointer mt-1 border-t border-slate-100 dark:border-slate-800 pt-2.5"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/25 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Driver Portal 🛵
            </span>
            <span className="text-xs text-orange-100">Welcome, {user?.name || 'Driver'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2">Delivery Dashboard</h1>
          <p className="text-orange-100 text-xs mt-1">Accept incoming orders ready for delivery and update delivery statuses in real time.</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => refetch()}
            className="bg-white text-orange-600 font-bold px-4 py-3 min-h-[48px] rounded-xl text-xs hover:bg-orange-50 transition shadow-sm cursor-pointer flex items-center justify-center w-full md:w-auto"
          >
            🔄 Refresh Orders
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 p-4 rounded-xl text-sm flex justify-between items-center shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold min-h-[48px] px-3 flex items-center">&times;</button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 p-4 rounded-xl text-sm flex justify-between items-center shadow-sm">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="font-bold min-h-[48px] px-3 flex items-center">&times;</button>
        </div>
      )}

      {/* Mobile-First Navigation Tabs */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 min-w-[120px] py-3 px-4 min-h-[48px] rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeTab === 'available'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <span>📦 Available ({availableOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 min-w-[120px] py-3 px-4 min-h-[48px] rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeTab === 'active'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <span>🛵 Active ({activeDeliveries.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 min-w-[120px] py-3 px-4 min-h-[48px] rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeTab === 'completed'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <span>✨ Completed ({completedDeliveries.length})</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner fullScreen={false} message="Fetching latest data..." />
      ) : (
        <div className="space-y-4">
          {activeTab === 'available' && (
            <div>
              {!isOnline ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm space-y-4">
                  <span className="text-4xl">🔴</span>
                  <h3 className="text-base font-bold text-slate-700 dark:text-white">You Are Currently Offline</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    You are currently offline. Toggle your status to Online to accept new delivery orders.
                  </p>
                  <button
                    onClick={() => handleToggleStatus(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>🟢 Toggle to Online</span>
                  </button>
                </div>
              ) : availableOrders.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
                  <span className="text-4xl">🛵</span>
                  <h3 className="text-base font-bold text-slate-700 dark:text-white mt-3">No Available Deliveries</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Check back soon when kitchen prepares new orders for delivery.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {availableOrders.map(order => (
                    <div key={order._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded">
                            #{order._id.slice(-6)}
                          </span>
                          <span className="text-xs text-slate-400 block mt-1">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span className="font-mono text-base font-extrabold text-orange-600 dark:text-orange-400">
                          ₹{order.totalPrice}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm sm:text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p><strong className="text-slate-900 dark:text-white">Customer Name:</strong> {order.user?.name || order.deliveryAddress?.name || 'Customer'}</p>
                        <p className="flex items-center justify-between">
                          <span><strong className="text-slate-900 dark:text-white">Contact Phone:</strong></span>
                          <a href={`tel:${order.deliveryAddress?.phone}`} className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[48px] bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 rounded-xl font-bold text-sm underline">
                            <span>📞</span>
                            <span>{order.deliveryAddress?.phone || 'N/A'}</span>
                          </a>
                        </p>
                        <p><strong className="text-slate-900 dark:text-white">Delivery Address:</strong> {order.deliveryAddress?.street || order.deliveryAddress?.address}, {order.deliveryAddress?.city} ({order.deliveryAddress?.postalCode})</p>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-700 dark:text-slate-200">Items:</strong> {order.pizzas?.map(p => `${p.name || 'Pizza'} (x${p.quantity || 1})`).join(', ')}
                      </div>

                      {isMyPendingClaim(order) ? (
                        <div className="w-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold py-4 min-h-[48px] rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                          <span className="animate-spin">⏳</span>
                          <span>Awaiting Admin Approval...</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaimOrder(order._id)}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 min-h-[48px] rounded-xl text-base sm:text-sm uppercase tracking-wider transition shadow-lg shadow-orange-600/30 flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <span>Accept & Pickup Order</span>
                          <span>🛵</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'active' && (
            <div>
              {activeDeliveries.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
                  <span className="text-4xl">✨</span>
                  <h3 className="text-base font-bold text-slate-700 dark:text-white mt-3">No Active Deliveries</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Accept an available delivery from the 'Available' tab to start delivering.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {activeDeliveries.map(order => (
                    <div key={order._id} className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-orange-500 p-5 shadow-md space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-xs font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 px-2.5 py-1 rounded-full">
                            Active Delivery #{order._id.slice(-6)}
                          </span>
                        </div>
                        <span className="font-mono text-base font-extrabold text-orange-600 dark:text-orange-400">
                          ₹{order.totalPrice}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm sm:text-xs text-slate-700 dark:text-slate-300 bg-orange-50/50 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/40">
                        <p><strong className="text-slate-900 dark:text-white">Customer Name:</strong> {order.user?.name || order.deliveryAddress?.name || 'Customer'}</p>
                        <p className="flex items-center justify-between">
                          <span><strong className="text-slate-900 dark:text-white">Contact Phone:</strong></span>
                          <a href={`tel:${order.deliveryAddress?.phone}`} className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[48px] bg-orange-600 text-white rounded-xl font-bold text-sm shadow-md">
                            <span>📞 Call Customer</span>
                            <span>{order.deliveryAddress?.phone || 'N/A'}</span>
                          </a>
                        </p>
                        <p><strong className="text-slate-900 dark:text-white">Delivery Address:</strong> {order.deliveryAddress?.street || order.deliveryAddress?.address}, {order.deliveryAddress?.city} ({order.deliveryAddress?.postalCode})</p>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-700 dark:text-slate-200">Items:</strong> {order.pizzas?.map(p => `${p.name || 'Pizza'} (x${p.quantity || 1})`).join(', ')}
                      </div>

                      {completingOrderId === order._id ? (
                        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900 p-4 rounded-xl space-y-3">
                          <p className="text-xs font-bold text-amber-900 dark:text-amber-300">Enter Customer's 6-Digit Verification PIN:</p>
                          <input
                            type="text"
                            maxLength="6"
                            placeholder="e.g. 123456"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            className="w-full px-4 py-3.5 min-h-[48px] bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl text-center font-mono font-bold text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500 text-base sm:text-lg text-slate-900 dark:text-white"
                            autoFocus
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCompleteOrderWithCode(order._id)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 min-h-[48px] rounded-xl text-xs sm:text-sm uppercase tracking-wider transition shadow cursor-pointer flex items-center justify-center"
                            >
                              Verify & Deliver 🚀
                            </button>
                            <button
                              onClick={() => { setCompletingOrderId(null); setInputCode(''); }}
                              className="px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3.5 min-h-[48px] rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center justify-center"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setCompletingOrderId(order._id); setInputCode(''); setError(''); }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 min-h-[48px] rounded-xl text-lg uppercase tracking-wider transition shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <span>Verify & Deliver</span>
                          <span>🚀</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'completed' && (
            <div>
              {completedDeliveries.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
                  <span className="text-4xl">📜</span>
                  <h3 className="text-base font-bold text-slate-700 dark:text-white mt-3">No Delivery History Yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Completed deliveries will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {completedDeliveries.map(order => (
                    <div key={order._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 opacity-90">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                          Delivered #{order._id.slice(-6)}
                        </span>
                        <span className="font-mono text-sm font-extrabold text-slate-800 dark:text-white">₹{order.totalPrice}</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <p><strong>Customer:</strong> {order.user?.name || 'Customer'}</p>
                        <p><strong>Address:</strong> {order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Direct Assignment Job Request Modal */}
      {directAssignmentModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">🛵</span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Direct Job Assignment</h3>
              </div>
              <button onClick={() => setDirectAssignmentModalData(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl">&times;</button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 p-4 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-orange-900 dark:text-orange-300 uppercase tracking-wider">Order #{directAssignmentModalData.orderId?.slice(-6) || directAssignmentModalData.orderDetails?._id?.slice(-6)}</h4>
                <p><strong>Total Price:</strong> ₹{directAssignmentModalData.orderDetails?.totalPrice || directAssignmentModalData.order?.totalPrice || 0}</p>
                <p><strong>Delivery Address:</strong> {directAssignmentModalData.orderDetails?.deliveryAddress?.street || directAssignmentModalData.orderDetails?.deliveryAddress?.address}, {directAssignmentModalData.orderDetails?.deliveryAddress?.city}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleAcceptDirectAssignment(directAssignmentModalData.orderId || directAssignmentModalData.orderDetails?._id)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Accept Job</span>
                <span>🚀</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeclineDirectAssignment(directAssignmentModalData.orderId || directAssignmentModalData.orderDetails?._id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Decline</span>
                <span>❌</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
