import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../../services/api';
import MyOrders from './MyOrders';

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes default in seconds

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    fetchOrderDetails();

    // Socket.io real-time synchronization replacing interval polling
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
    const socket = io(socketUrl);

    socket.on('connect', () => {
      socket.emit('join_order', orderId);
    });

    socket.on('order_updated', (updatedOrder) => {
      if (!orderId || updatedOrder._id === orderId || updatedOrder.orderId === orderId) {
        fetchOrderDetails(true); // silent fetch on socket update event
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  useEffect(() => {
    if (!order) return;
    const targetTime = order.estimatedDeliveryTime 
      ? new Date(order.estimatedDeliveryTime).getTime() 
      : new Date(order.createdAt).getTime() + 30 * 60 * 1000;

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = Math.floor((targetTime - now) / 1000);
      setTimeLeft(difference > 0 ? difference : 0);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [order]);

  const fetchOrderDetails = async (isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      const res = await API.get(`/orders/${orderId}`);
      setOrder(res.data.data || res.data);
      setError('');
    } catch (err) {
      if (!isPoll) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch order details');
      }
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'Order Placed':
      case 'Order Accepted':
      case 'Order Received':
        return 0;
      case 'In Kitchen':
      case 'Baked':
        return 1;
      case 'Sent to Delivery':
      case 'Out for Delivery':
        return 2;
      case 'Delivered':
        return 3;
      case 'Cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const steps = [
    { title: 'Order Received', icon: '📦', desc: 'Order placed & confirmed' },
    { title: 'In Kitchen', icon: '🍕', desc: 'Crafting & baking your pizza' },
    { title: 'Out for Delivery', icon: '🛵', desc: 'Out for delivery' },
    { title: 'Delivered', icon: '✨', desc: 'Delivered to your doorstep' }
  ];

  const currentStep = order ? getStepIndex(order.status) : 0;
  const isCancelled = order?.status === 'Cancelled';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div>
        <MyOrders />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
          <p className="font-bold text-lg mb-2">Error Loading Order</p>
          <p>{error}</p>
          <button
            onClick={() => fetchOrderDetails()}
            className="mt-4 bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-8 space-y-6 min-h-screen overflow-x-hidden">
      {/* Header & Estimated Time Banner */}
      <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Live Tracking (Socket.io)
            </span>
            <span className="font-mono text-xs text-slate-400">ID: {order?._id}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2">
            Order Status: <span className={isCancelled ? 'text-red-400' : 'text-orange-400'}>{order?.status}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Placed on {new Date(order?.createdAt).toLocaleString()}</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 px-6 py-4 rounded-xl text-center backdrop-blur">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Estimated Delivery</p>
          <p className="text-3xl font-extrabold text-orange-400 font-mono mt-1">
            {isCancelled ? 'Cancelled' : timeLeft > 0 ? formatTime(timeLeft) : 'Arriving Now!'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Approx. 30 mins</p>
        </div>
      </div>

      {/* Cancelled Alert Card */}
      {isCancelled && (
        <div className="bg-red-50 border-2 border-red-500 text-red-800 p-6 rounded-2xl shadow-lg flex items-center space-x-4">
          <span className="text-3xl">⚠️</span>
          <div>
            <h3 className="font-extrabold text-lg text-red-900">Order Cancelled</h3>
            <p className="text-xs text-red-700 mt-1">This order has been cancelled. If you have any questions or require a refund, please contact customer support.</p>
          </div>
        </div>
      )}

      {/* Zero State Arrival Banner */}
      {timeLeft === 0 && order?.status !== 'Delivered' && !isCancelled && (
        <div className="bg-orange-50 border-2 border-orange-400 text-orange-900 p-6 rounded-2xl shadow-lg flex items-center space-x-4 animate-pulse">
          <span className="text-3xl">🍕</span>
          <div>
            <h3 className="font-extrabold text-lg text-orange-900">Driver arriving any minute now! 🍕</h3>
            <p className="text-xs text-orange-700 mt-1">Your delicious pizza is on its way to your doorstep. Keep your phone handy!</p>
          </div>
        </div>
      )}

      {/* Delivery Verification Code Banner */}
      {order?.status === 'Out for Delivery' && order?.deliveryCode && (
        <div className="bg-amber-50 border-2 border-amber-400 text-amber-900 p-6 sm:p-8 rounded-3xl shadow-xl text-center space-y-4">
          <div className="text-4xl animate-bounce">🔐</div>
          <div>
            <h3 className="font-extrabold text-xl text-amber-950">Delivery Verification PIN</h3>
            <p className="text-xs sm:text-sm text-amber-900 mt-1 max-w-md mx-auto">
              Show this 6-digit verification PIN to your driver upon arrival to securely confirm and complete delivery:
            </p>
            <div className="mt-4 inline-block bg-white border-2 border-amber-400 font-mono text-2xl sm:text-4xl font-black text-amber-950 px-8 py-3.5 rounded-2xl tracking-[0.25em] shadow-lg">
              {order.deliveryCode}
            </div>
          </div>
        </div>
      )}

      {/* Visual Vertical/Horizontal Timeline Tracker */}
      {!isCancelled && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <h3 className="text-lg font-black text-slate-800 mb-8 text-center md:text-left">Fulfillment Timeline</h3>

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center max-w-3xl mx-auto space-y-6 md:space-y-0">
            {/* Connecting Lines: Vertical on mobile, Horizontal on desktop */}
            <div className="md:hidden absolute left-7 top-7 bottom-7 w-1 bg-slate-200 z-0"></div>
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>

            {steps.map((step, idx) => {
              const isCompleted = currentStep > idx || currentStep === 3;
              const isActive = currentStep === idx && currentStep !== 3;

              return (
                <div key={idx} className="relative z-10 flex flex-row md:flex-col items-center md:text-center w-full md:w-auto gap-4 md:gap-0">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 transition-all duration-500 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : isActive
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50 ring-4 ring-orange-400 animate-pulse'
                        : 'bg-slate-100 text-slate-400 border border-slate-300'
                    }`}
                  >
                    {isCompleted ? '✓' : step.icon}
                  </div>
                  <div className="text-left md:text-center md:mt-3">
                    <p className={`font-bold text-sm sm:text-base ${isActive ? 'text-orange-600' : isCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-400 max-w-40">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Details & Delivery Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Delivery Address & Driver Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h4 className="font-bold text-slate-800 text-base flex items-center space-x-2">
              <span>📍</span>
              <span>Delivery Details</span>
            </h4>
            <div className="text-sm text-slate-600 space-y-2">
              <p><span className="font-semibold text-slate-700">Phone:</span> {order?.deliveryAddress?.phone || 'N/A'}</p>
              <p><span className="font-semibold text-slate-700">Street:</span> {order?.deliveryAddress?.street || 'N/A'}</p>
              <p><span className="font-semibold text-slate-700">City / Postal:</span> {order?.deliveryAddress?.city} - {order?.deliveryAddress?.postalCode}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                order?.paymentInfo?.status === 'Paid' || order?.paymentInfo?.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                Payment: {order?.paymentInfo?.status || 'Pending'}
              </span>
              <Link to="/my-orders" className="text-xs font-bold text-red-600 hover:underline">
                ← Back to My Orders
              </Link>
            </div>
          </div>

          {/* Your Delivery Driver Card */}
          {order?.driver && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="font-bold text-orange-900 text-base flex items-center space-x-2">
                <span>🛵</span>
                <span>Your Delivery Driver</span>
              </h4>
              <div className="text-sm text-slate-700 space-y-1">
                <p><span className="font-semibold text-slate-800">Name:</span> {order.driver.name}</p>
                <p><span className="font-semibold text-slate-800">Contact:</span> <a href={`tel:${order.driver.phone || order.driver.email}`} className="text-orange-600 font-bold underline">{order.driver.phone || order.driver.email}</a></p>
              </div>
            </div>
          )}
        </div>

        {/* Custom Pizza Summary */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h4 className="font-bold text-slate-800 text-base flex items-center space-x-2">
            <span>🍕</span>
            <span>Custom Pizza Summary ({order?.pizzas?.length || 0})</span>
          </h4>

          <div className="space-y-3">
            {order?.pizzas?.map((pizza, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-red-600 uppercase">{pizza.name || `Pizza #${idx + 1}`} (Qty: {pizza.quantity || 1})</span>
                  <div className="text-xs text-slate-600 grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                    {pizza.base && <p><span className="font-semibold">Base:</span> {pizza.base}</p>}
                    {pizza.sauce && <p><span className="font-semibold">Sauce:</span> {pizza.sauce}</p>}
                    {pizza.cheese && <p><span className="font-semibold">Cheese:</span> {pizza.cheese}</p>}
                    {pizza.veggies && pizza.veggies.length > 0 && <p><span className="font-semibold">Veggies:</span> {pizza.veggies.join(', ')}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-800">₹{pizza.price}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <span className="font-bold text-slate-700">Total Price:</span>
            <span className="text-xl font-extrabold text-red-600 font-mono">₹{order?.totalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
