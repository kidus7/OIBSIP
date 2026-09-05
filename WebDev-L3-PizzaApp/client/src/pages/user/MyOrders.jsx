import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetOrdersQuery } from '../../store/api/orderApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatCurrency';

export default function MyOrders() {
  const { data: ordersData, isLoading: loading, error: queryError } = useGetOrdersQuery('/orders/my-orders');
  const orders = ordersData?.data || ordersData || [];
  const error = queryError ? (queryError.data?.error || queryError.message || 'Failed to fetch order history') : '';
  const { reorder } = useCart();
  const navigate = useNavigate();

  const handleReorder = (order) => {
    const items = order.pizzas || order.items || [];
    reorder(items);
    toast.success('Order items added to your cart!');
    navigate('/cart');
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Order Received':
      case 'Order Placed':
      case 'Order Accepted':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'In Kitchen':
      case 'Baked':
        return 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-400 dark:border-orange-800 shadow-lg shadow-orange-500/20 animate-pulse';
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
    <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 sm:py-8 py-20 min-h-screen overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-100 dark:bg-orange-950/60 px-3 py-1 rounded-full">
            Order History
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">My Orders</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Track your active pizza deliveries and review past orders.</p>
        </div>
        <Link
          to="/dashboard"
          className="px-6 py-3.5 min-h-[48px] bg-linear-to-r from-red-600 to-orange-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center"
        >
          Order Another Pizza 🍕
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 p-4 rounded-xl mb-6">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <LoadingSpinner fullScreen={false} message="Fetching latest data..." />
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
          <span className="text-5xl">📦</span>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-4">No orders placed yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your ordered custom and ready-made pizzas will appear here.</p>
          <Link
            to="/dashboard"
            className="inline-block mt-6 px-6 py-3 bg-red-600 text-white text-xs font-bold rounded-xl shadow hover:bg-red-700 transition"
          >
            Explore Menu & Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => {
            const displayStatus = order.status === 'Order Placed' || order.status === 'Order Accepted' ? 'Order Received' :
                                  order.status === 'Baked' ? 'In Kitchen' :
                                  order.status === 'Out for Delivery' ? 'Sent to Delivery' : order.status;

            return (
              <div
                key={order._id}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition"
              >
                {/* Header bar */}
                <div className="bg-slate-900 dark:bg-slate-950 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
                        ID: {order._id}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full font-extrabold uppercase border ${getStatusBadgeStyle(displayStatus)}`}>
                        {displayStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Placed on: {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-orange-400 font-mono">{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>

                {/* Body: Item Breakdown */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-2 space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm flex items-center space-x-2">
                      <span>🍕</span>
                      <span>Item Breakdown ({order.pizzas?.length || 0})</span>
                    </h4>
                    <div className="space-y-2">
                      {order.pizzas?.map((pizza, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-red-600 dark:text-red-400 uppercase">{pizza.name || `Pizza #${idx + 1}`} (Qty: {pizza.quantity || 1})</span>
                            <div className="text-slate-600 dark:text-slate-300 mt-0.5 space-x-2">
                              {pizza.base && <span><strong className="text-slate-700 dark:text-slate-200">Base:</strong> {pizza.base}</span>}
                              {pizza.sauce && <span>• <strong className="text-slate-700 dark:text-slate-200">Sauce:</strong> {pizza.sauce}</span>}
                              {pizza.cheese && <span>• <strong className="text-slate-700 dark:text-slate-200">Cheese:</strong> {pizza.cheese}</span>}
                              {pizza.veggies && pizza.veggies.length > 0 && <span>• <strong className="text-slate-700 dark:text-slate-200">Veggies:</strong> {pizza.veggies.join(', ')}</span>}
                            </div>
                          </div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {formatPrice(pizza.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-center items-stretch md:items-end space-y-3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Payment: <span className={`font-semibold ${order.paymentInfo?.status === 'Paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{order.paymentInfo?.status || 'Pending'}</span>
                    </div>
                    <button
                      onClick={() => handleReorder(order)}
                      className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm hover:scale-105 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Order Again 🔄</span>
                    </button>
                    <Link
                      to={`/order-tracking/${order._id}`}
                      className="w-full text-center px-6 py-3.5 min-h-[48px] bg-linear-to-r from-red-600 to-orange-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition flex items-center justify-center gap-2"
                    >
                      <span>Track Live Status 🛵</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
