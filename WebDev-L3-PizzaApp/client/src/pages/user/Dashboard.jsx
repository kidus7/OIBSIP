import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { useCart } from '../../hooks/useCart';

export default function Dashboard() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [notification, setNotification] = useState(null);
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Fallback curated showcase pizzas
  const fallbackPizzas = [
    {
      _id: 'c1',
      name: 'Ultimate Pepperoni Feast',
      category: 'pre-made',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80',
      description: 'Double pepperoni, extra mozzarella, signature tomato basil sauce on hand-tossed crust.',
      stock: 25
    },
    {
      _id: 'c2',
      name: 'Truffle Mushroom Artisan',
      category: 'pre-made',
      price: 16.50,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      description: 'Wild forest mushrooms, truffle oil drizzle, creamy garlic white sauce and fresh thyme.',
      stock: 18
    },
    {
      _id: 'c3',
      name: 'Spicy BBQ Chicken Supreme',
      category: 'pre-made',
      price: 15.99,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
      description: 'Grilled chicken breast, tangy hickory BBQ sauce, red onions, cilantro and smoked gouda.',
      stock: 30
    },
    {
      _id: 'c4',
      name: 'Classic Margherita Fresh',
      category: 'pre-made',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80',
      description: 'San Marzano tomatoes, fresh buffalo mozzarella, basil leaves and cold-pressed extra virgin olive oil.',
      stock: 40
    },
    {
      _id: 'c5',
      name: 'Loaded Garden Veggie',
      category: 'pre-made',
      price: 13.50,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
      description: 'Bell peppers, sweet corn, black olives, red onions, mushrooms, and fresh vine tomatoes.',
      stock: 22
    },
    {
      _id: 'c6',
      name: 'Inferno Spicy Diavola',
      category: 'pre-made',
      price: 15.50,
      image: 'https://images.unsplash.com/photo-1595730339077-83c3167f651c?auto=format&fit=crop&w=600&q=80',
      description: 'Spicy Italian salami, hot calabrian chili peppers, fresh garlic and crushed chili flakes.',
      stock: 15
    }
  ];

  useEffect(() => {
    const fetchPreMadePizzas = async () => {
      try {
        const response = await API.get('/inventory');
        const items = response.data?.data || response.data || [];
        // Filter for pre-made pizzas
        const preMade = items.filter(item => item.category === 'pre-made');
        if (preMade.length > 0) {
          const formatted = preMade.map(item => ({
            ...item,
            image: item.imageURL || item.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'
          }));
          setPizzas(formatted);
        } else {
          setPizzas(fallbackPizzas);
        }
      } catch (err) {
        console.error('Failed to fetch inventory from API, using fallback pizzas:', err);
        setPizzas(fallbackPizzas);
      } finally {
        setLoading(false);
      }
    };
    fetchPreMadePizzas();
  }, []);

  const isVeg = (pizza) => {
    const text = (pizza.name + ' ' + (pizza.description || '')).toLowerCase();
    if (text.includes('chicken') || text.includes('pepperoni') || text.includes('salami') || text.includes('meat') || text.includes('bacon') || text.includes('beef')) {
      return false;
    }
    return true;
  };

  const handleTabClick = (tab) => {
    if (tab === 'Custom Builder') {
      navigate('/custom-builder');
      return;
    }
    setActiveTab(tab);
  };

  const filteredPizzas = pizzas.filter(pizza => {
    const veg = isVeg(pizza);
    if (activeTab === 'Veg' && !veg) return false;
    if (activeTab === 'Non-Veg' && veg) return false;

    const query = searchQuery || urlSearch;
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const name = (pizza.name || '').toLowerCase();
      const category = (pizza.category || '').toLowerCase();
      const desc = (pizza.description || '').toLowerCase();
      if (!name.includes(q) && !category.includes(q) && !desc.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleAddToCart = (pizzaItem) => {
    addToCart(pizzaItem);
    setNotification('Added to Cart! 🛒');
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50/40 via-white to-orange-50/20 pt-20 pb-16 overflow-x-hidden">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-orange-500/30 animate-bounce">
          <span className="text-xl">✨</span>
          <p className="text-xs font-semibold">{notification}</p>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-100/80 border border-orange-200/60 px-4 py-1.5 rounded-full shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
              <span className="text-xs font-bold text-orange-800 tracking-wide uppercase">
                Fastest Pizza Delivery 🍕
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Fastest Delivery & <br className="hidden sm:inline" />
              <span className="bg-linear-to-r from-red-600 via-orange-600 to-amber-500 bg-clip-text text-transparent">
                Ready-Made Pizzas
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Experience artisan ready-made pizzas crafted with premium farm-fresh ingredients, wood-fired perfection, and delivered piping hot to your doorstep in 30 minutes or less.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                to="/custom-builder"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm bg-linear-to-r from-red-600 via-orange-600 to-amber-600 text-white shadow-xl shadow-orange-600/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Build Custom Pizza 🍕</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0">
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-slate-900">30 Min</span>
                <span className="text-xs text-slate-500 font-medium">Fast Delivery</span>
              </div>
              <div className="flex flex-col border-x border-slate-200 px-4">
                <span className="text-2xl font-extrabold text-slate-900">4.9 ⭐</span>
                <span className="text-xs text-slate-500 font-medium">Customer Rating</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-slate-900">100%</span>
                <span className="text-xs text-slate-500 font-medium">Fresh Ingredients</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-4 bg-linear-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-2xl -z-10"></div>
            <div className="relative space-y-6">
              <div className="bg-white rounded-2xl p-4 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-orange-100 relative group">
                <div className="absolute top-6 right-6 z-10 bg-linear-to-r from-red-600 to-orange-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <span>🔥</span>
                  <span>Bestseller</span>
                </div>
                <div className="h-64 rounded-2xl overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
                    alt="Artisan Truffle Pizza"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                    <div>
                      <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Chef's Special
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1">Truffle Mushroom Artisan</h3>
                      <p className="text-xs text-slate-200 mt-0.5">$16.50 • Wood-Fired Crust</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Menu Section with Filter Tabs */}
      <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-100 px-3 py-1 rounded-full">
              Our Menu
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Ready-Made Pizzas
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Freshly baked artisan pizzas ready to be added to your cart instantly.
            </p>
          </div>

          {/* Search Input & Filter Tabs */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center mt-6 md:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search pizzas by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-9 pr-4 py-3.5 min-h-[48px] bg-white border border-slate-200 rounded-2xl text-base sm:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
              <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Tab Pills: [ All | Veg | Non-Veg | Custom Builder ] */}
            <div className="flex flex-wrap gap-2">
              {['All', 'Veg', 'Non-Veg', 'Custom Builder'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`px-5 py-3 min-h-[48px] rounded-2xl text-xs font-bold transition-all flex items-center justify-center ${
                    activeTab === tab && tab !== 'Custom Builder'
                      ? 'bg-linear-to-r from-red-600 to-orange-500 text-white shadow-xl shadow-orange-500/30 scale-105'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-500 hover:text-orange-600 shadow-sm'
                  }`}
                >
                  {tab === 'Veg' && '🌱 '}
                  {tab === 'Non-Veg' && '🔥 '}
                  {tab === 'Custom Builder' && '🛠️ '}
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse h-96">
                <div className="bg-slate-200 h-52 rounded-xl mb-4"></div>
                <div className="bg-slate-200 h-6 w-3/4 rounded mb-2"></div>
                <div className="bg-slate-200 h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredPizzas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xl">
            <span className="text-4xl">🍕</span>
            <h3 className="text-lg font-bold text-slate-800 mt-4">No pizzas found in this category</h3>
            <p className="text-xs text-slate-500 mt-1">Try selecting another filter or build your custom pizza.</p>
            <Link
              to="/custom-builder"
              className="inline-block mt-6 px-6 py-3 bg-orange-600 text-white text-xs font-bold rounded-2xl shadow-md hover:bg-red-600 transition-colors"
            >
              Open Pizza Builder 🛠️
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPizzas.map((pizza, idx) => {
              const veg = isVeg(pizza);
              return (
                <div
                  key={pizza._id || idx}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col group relative"
                >
                  {/* Floating Rating/Badge Overlay */}
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg backdrop-blur-md ${
                      veg ? 'bg-emerald-500/90 text-white' : 'bg-red-600/90 text-white'
                    }`}>
                      {veg ? '🌱 Veg Choice' : '🔥 Bestseller'}
                    </span>
                  </div>

                  {/* Stock Counter Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md ${
                      (pizza.stock !== undefined ? pizza.stock : 10) > 0 ? 'bg-white/90 text-slate-800' : 'bg-red-500 text-white'
                    }`}>
                      {(pizza.stock !== undefined ? pizza.stock : 10) > 0 ? `${pizza.stock !== undefined ? pizza.stock : 10} in stock` : 'Out of Stock'}
                    </span>
                  </div>

                  {/* High-res Pizza Image */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={pizza.image || pizza.imageURL}
                      alt={pizza.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-orange-600 transition-colors leading-snug">
                          {pizza.name}
                        </h3>
                        <span className="font-black text-lg text-orange-600 whitespace-nowrap">
                          ${(pizza.price || 0).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed font-medium">
                        {pizza.description || 'Artisan pizza prepared with farm-fresh ingredients and premium mozzarella cheese.'}
                      </p>
                    </div>

                    {/* Actions: Add to Cart & Modify Ingredients */}
                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        onClick={() => handleAddToCart(pizza)}
                        disabled={pizza.stock === 0}
                        className={`flex-1 py-3.5 min-h-[48px] rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1.5 ${
                          pizza.stock === 0
                            ? 'bg-slate-300 cursor-not-allowed shadow-none'
                            : 'bg-linear-to-r from-red-600 to-orange-500 hover:shadow-xl hover:scale-105 active:scale-95'
                        }`}
                      >
                        <span>Add to Cart</span>
                      </button>
                      <button
                        onClick={() => navigate('/custom-builder', { state: { pizza } })}
                        className="flex-1 text-center py-3.5 min-h-[48px] rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors border border-slate-200 flex items-center justify-center"
                      >
                        Modify Ingredients 🛠️
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* Promotional Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 hidden lg:block pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
              alt="Background Pizza"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Special Offer
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Build Your Dream Pizza Today & Get 20% Off!
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Use our interactive custom pizza builder to select your favorite crust, rich sauces, premium cheeses, and fresh toppings.
            </p>
            <div className="pt-2">
              <Link
                to="/custom-builder"
                className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-red-600 to-orange-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-orange-500/30 hover:scale-105 transition-all"
              >
                <span>Start Building Now</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
