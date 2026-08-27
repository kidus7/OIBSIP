import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import API from '../../services/api';

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user: reqUser } = useAuth();
  const navigate = useNavigate();

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const tax = subtotal * 0.05;
  const grandTotal = subtotal > 0 ? subtotal + deliveryFee + tax : 0;

  // Dynamically load Razorpay script on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK script');
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    setError(null);

    if (!street || !city || !postalCode || !phone) {
      setError('Please fill in all delivery address and contact fields.');
      return;
    }

    if (!cart || cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);

    try {
      const deliveryAddress = { street, city, postalCode, phone };

      const res = await API.post('/orders/create-razorpay-order', {
        subtotal: grandTotal
      });
      const data = res.data.data || res.data;
console.log('Razorpay order creation response:', data);
      const options = {
        key: res.data.key_id || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mockkey',
        amount: data.amount,
        currency: data.currency,
        name: 'OIBSIP PizzaApp',
        description: 'Test Transaction',
        order_id: data.id,
        handler: async (response) => {
          try {
            const verifyRes = await API.post('/orders/verify-payment', {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              address: deliveryAddress,
              deliveryAddress: deliveryAddress,
              cartItems: cart,
              subtotal: grandTotal
            });
            if (verifyRes.data.message === 'Payment verified successfully') {
              clearCart();
              const targetId = verifyRes.data.order?._id || verifyRes.data.order?.id || data.id;
              navigate(`/order-tracking/${targetId}`);
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setError('Payment verification failed.');
            setLoading(false);
          }
        },
        theme: { color: '#3399cc' }
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your network connection.');
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to complete checkout process.');
      setLoading(false);
    }
  };

  const handlePayAndPlaceOrder = handlePayment;

  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50/50 via-white to-orange-50/30 pt-20 pb-32 sm:pb-20 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-100 px-3.5 py-1.5 rounded-full">
            Secure Checkout 🔒
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
            Complete Your Order
          </h1>
          <p className="text-slate-600 text-sm mt-2">
            Enter your delivery address and pay securely using Razorpay gateway.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm font-bold shadow-sm flex items-center gap-3">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: Delivery Address Form */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <span>📍</span>
              <span>Delivery Details</span>
            </h2>

            <form onSubmit={handlePayAndPlaceOrder} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="123 Artisan Pizza Lane, Suite 4B"
                  className="w-full px-4 py-3.5 min-h-[48px] rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-base sm:text-sm font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New Delhi / Mumbai"
                    className="w-full px-4 py-3.5 min-h-[48px] rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-base sm:text-sm font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Postal Code / Zip
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="110001"
                    className="w-full px-4 py-3.5 min-h-[48px] rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-base sm:text-sm font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3.5 min-h-[48px] rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-base sm:text-sm font-medium text-slate-800"
                />
              </div>

              {/* Desktop Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 min-h-[48px] rounded-2xl font-black text-sm bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all text-center hidden sm:flex items-center justify-center gap-2 ${
                  loading ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                <span>{loading ? 'Processing Payment...' : `Pay ₹${(grandTotal * 80).toFixed(0)} / $${grandTotal.toFixed(2)} & Place Order 🚀`}</span>
              </button>

              {/* Sticky Mobile Checkout Bar */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-50 sm:hidden flex items-center justify-between gap-4 shadow-2xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
                  <span className="text-xl font-black text-orange-400">${grandTotal.toFixed(2)}</span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 min-h-[48px] rounded-2xl font-black text-sm bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Processing...' : `Pay & Order 🚀`}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Order Summary Preview */}
          <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-orange-100 space-y-6">
            <h3 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-4 flex items-center gap-2">
              <span>🧾</span>
              <span>Cart Overview</span>
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-50">
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-800 block truncate">{item.name}</span>
                    <span className="text-slate-400">Qty: {item.quantity || 1}</span>
                  </div>
                  <span className="font-black text-orange-600 shrink-0">
                    ${((item.price || item.totalPrice || 0) * (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-900">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax / GST (5%)</span>
                <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-orange-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/cart"
                className="w-full block py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all text-center"
              >
                ← Edit Cart
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
