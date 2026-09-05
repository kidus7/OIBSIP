import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatCurrency';

export default function CartSummary() {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const tax = subtotal * 0.05; // 5% GST/Tax
  const grandTotal = subtotal > 0 ? subtotal + deliveryFee + tax : 0;

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-b from-orange-50/50 via-white to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-28 pb-20 flex items-center justify-center transition-colors duration-200">
        <div className="max-w-md w-full mx-4 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/60 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner animate-pulse">
            🛒
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Cart is Empty</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 mb-8">
            Looks like you haven't added any delicious pizzas or custom creations to your cart yet.
          </p>
          <div className="space-y-3">
            <Link
              to="/custom-builder"
              className="w-full block py-3.5 px-6 rounded-2xl font-extrabold text-sm bg-linear-to-r from-red-600 to-orange-500 text-white shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all text-center"
            >
              Build Custom Pizza 🍕
            </Link>
            <Link
              to="/dashboard"
              className="w-full block py-3.5 px-6 rounded-2xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center"
            >
              Browse Ready-Made Menu 📜
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50/50 via-white to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20 pb-32 sm:pb-20 overflow-x-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-100 dark:bg-orange-950/60 px-3.5 py-1.5 rounded-full">
              Your Order Basket 🛒
            </span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
              Cart Summary & Items
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="self-start md:self-auto px-4 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-900 flex items-center gap-2 shadow-sm"
          >
            <span>🗑️</span>
            <span>Clear Cart</span>
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item, index) => {
              const itemId = item.id || item._id || index;
              const itemPrice = item.price || item.totalPrice || 0;
              const itemQty = item.quantity || 1;
              const isCustom = item.isCustom || item.base || (item.veggies && Array.isArray(item.veggies));

              return (
                <div
                  key={itemId}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-2xl transition-shadow"
                >
                  <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl shadow-md shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-linear-to-br from-orange-100 to-amber-100 dark:from-orange-950/60 dark:to-amber-950/60 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0">
                        🍕
                      </div>
                    )}

                    <div className="space-y-1.5 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                          isCustom ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-400' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400'
                        }`}>
                          {isCustom ? 'Custom Crafted' : 'Menu Special'}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg truncate">
                        {item.name}
                      </h3>

                      {isCustom ? (
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5 pt-1">
                          <p><span className="font-bold text-slate-700 dark:text-slate-300">Crust:</span> {item.base}</p>
                          <p><span className="font-bold text-slate-700 dark:text-slate-300">Sauce:</span> {item.sauce}</p>
                          <p><span className="font-bold text-slate-700 dark:text-slate-300">Cheese:</span> {item.cheese}</p>
                          {item.veggies && item.veggies.length > 0 && (
                            <p><span className="font-bold text-slate-700 dark:text-slate-300">Veggies:</span> {item.veggies.join(', ')}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {item.description || 'Delicious gourmet ready-made pizza freshly baked.'}
                        </p>
                      )}

                      <div className="text-sm font-black text-orange-600 dark:text-orange-400 pt-1">
                        {formatPrice(itemPrice)} each
                      </div>
                    </div>
                  </div>

                  {/* Right side: Quantity Stepper & Subtotal */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 gap-3">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => updateQuantity(itemId, -1)}
                        className="w-7 h-7 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-700 hover:text-orange-600 flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <span className="font-black text-sm text-slate-900 dark:text-white w-6 text-center">
                        {itemQty}
                      </span>
                      <button
                        onClick={() => updateQuantity(itemId, 1)}
                        className="w-7 h-7 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-700 hover:text-orange-600 flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {formatPrice(itemPrice * itemQty)}
                      </span>
                      <button
                        onClick={() => removeFromCart(itemId)}
                        className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Order Summary Card (Desktop) & Sticky Mobile Bottom Bar */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-orange-100 dark:border-slate-800 space-y-6 mb-24 lg:mb-0">
            <h3 className="font-black text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
              <span>🧾</span>
              <span>Order Summary</span>
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal ({cart.reduce((s, i) => s + (i.quantity || 1), 0)} items)</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>GST / Tax (5%)</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatPrice(tax)}</span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-base font-black text-slate-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-orange-600 dark:text-orange-400">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 hidden lg:block">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 min-h-[48px] rounded-2xl font-black text-sm bg-linear-to-r from-red-600 to-orange-500 text-white shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout 🚀</span>
              </button>

              <Link
                to="/dashboard"
                className="w-full block py-3.5 min-h-[48px] rounded-2xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center"
              >
                ← Continue Shopping
              </Link>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/40 rounded-2xl p-4 border border-orange-200 dark:border-orange-900/50 text-center hidden lg:block">
              <span className="text-xs font-bold text-orange-800 dark:text-orange-300 block">⚡ Blazing Fast 30-Min Delivery</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-1">Guaranteed hot & fresh pizza delivered to your doorstep.</span>
            </div>
          </div>

          {/* Sticky Mobile Checkout Bar */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-50 lg:hidden flex items-center justify-between gap-4 shadow-2xl">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
              <span className="text-xl font-black text-orange-400">{formatPrice(grandTotal)}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="flex-1 py-3.5 min-h-[48px] rounded-2xl font-black text-sm bg-linear-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-orange-500/30 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
            >
              <span>Checkout 🚀</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
