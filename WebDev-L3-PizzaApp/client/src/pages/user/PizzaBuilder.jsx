import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useGetInventoryQuery } from '../../store/api/inventoryApi';
import { useCart } from '../../hooks/useCart';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatPrice } from '../../utils/formatCurrency';

export default function PizzaBuilder() {
  const [step, setStep] = useState(1); // 1: Base, 2: Sauce, 3: Cheese, 4: Veggies
  const { data: inventoryData, isLoading: loading } = useGetInventoryQuery();
  const [notification, setNotification] = useState(null);

  // Selection state
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedCheese, setSelectedCheese] = useState(null);
  const [selectedVeggies, setSelectedVeggies] = useState([]);

  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Fallback inventory in case API is offline or empty
  const fallbackInventory = [
    // Bases (5)
    { _id: 'b1', name: 'Thin Crust', category: 'base', price: 3.50, stock: 50 },
    { _id: 'b2', name: 'Thick Crust', category: 'base', price: 4.00, stock: 50 },
    { _id: 'b3', name: 'Cheese Burst', category: 'base', price: 5.50, stock: 40 },
    { _id: 'b4', name: 'Wheat Crust', category: 'base', price: 4.50, stock: 35 },
    { _id: 'b5', name: 'Gluten Free', category: 'base', price: 6.00, stock: 20 },

    // Sauces (5)
    { _id: 's1', name: 'Classic Tomato', category: 'sauce', price: 1.50, stock: 60 },
    { _id: 's2', name: 'Spicy Schezwan', category: 'sauce', price: 1.75, stock: 45 },
    { _id: 's3', name: 'Barbeque', category: 'sauce', price: 2.00, stock: 50 },
    { _id: 's4', name: 'Creamy Garlic', category: 'sauce', price: 2.00, stock: 30 },
    { _id: 's5', name: 'Pesto', category: 'sauce', price: 2.50, stock: 25 },

    // Cheeses (3+)
    { _id: 'c1', name: 'Mozzarella', category: 'cheese', price: 2.50, stock: 80 },
    { _id: 'c2', name: 'Cheddar', category: 'cheese', price: 2.75, stock: 40 },
    { _id: 'c3', name: 'Parmesan', category: 'cheese', price: 3.00, stock: 25 },
    { _id: 'c4', name: 'Vegan Cheese', category: 'cheese', price: 3.50, stock: 15 },

    // Veggies (5+)
    { _id: 'v1', name: 'Onions', category: 'veggie', price: 1.00, stock: 90 },
    { _id: 'v2', name: 'Bell Peppers', category: 'veggie', price: 1.25, stock: 70 },
    { _id: 'v3', name: 'Mushrooms', category: 'veggie', price: 1.50, stock: 40 },
    { _id: 'v4', name: 'Olives', category: 'veggie', price: 1.50, stock: 55 },
    { _id: 'v5', name: 'Jalapenos', category: 'veggie', price: 1.25, stock: 65 },
    { _id: 'v6', name: 'Sweet Corn', category: 'veggie', price: 1.00, stock: 50 }
  ];

  const items = inventoryData?.data || inventoryData || [];
  const categorized = {
    base: items.filter(i => i.category === 'base'),
    sauce: items.filter(i => i.category === 'sauce'),
    cheese: items.filter(i => i.category === 'cheese'),
    veggie: items.filter(i => i.category === 'veggie')
  };

  if (categorized.base.length === 0) categorized.base = fallbackInventory.filter(i => i.category === 'base');
  if (categorized.sauce.length === 0) categorized.sauce = fallbackInventory.filter(i => i.category === 'sauce');
  if (categorized.cheese.length === 0) categorized.cheese = fallbackInventory.filter(i => i.category === 'cheese');
  if (categorized.veggie.length === 0) categorized.veggie = fallbackInventory.filter(i => i.category === 'veggie');

  const ingredients = categorized;

  useEffect(() => {
    // Pre-select ingredients if modified from a ready-made pizza
    const pizzaToModify = location.state?.pizza;
    if (pizzaToModify && items.length > 0) {
      const desc = (pizzaToModify.description || '').toLowerCase();
      const name = (pizzaToModify.name || '').toLowerCase();
      const combinedText = `${name} ${desc}`;

      const matchedBase = categorized.base.find(b => combinedText.includes(b.name.toLowerCase()));
      if (matchedBase) setSelectedBase(matchedBase);

      const matchedSauce = categorized.sauce.find(s => combinedText.includes(s.name.toLowerCase()));
      if (matchedSauce) setSelectedSauce(matchedSauce);

      const matchedCheese = categorized.cheese.find(c => combinedText.includes(c.name.toLowerCase()));
      if (matchedCheese) setSelectedCheese(matchedCheese);

      const matchedVeggies = categorized.veggie.filter(v => combinedText.includes(v.name.toLowerCase()));
      if (matchedVeggies.length > 0) setSelectedVeggies(matchedVeggies);
    }
  }, [inventoryData]);

  // Calculate real-time price
  const totalPrice = 
    (selectedBase ? selectedBase.price || 0 : 0) +
    (selectedSauce ? selectedSauce.price || 0 : 0) +
    (selectedCheese ? selectedCheese.price || 0 : 0) +
    selectedVeggies.reduce((sum, v) => sum + (v.price || 0), 0);

  const handleVeggieToggle = (veggie) => {
    if ((veggie.stock !== undefined ? veggie.stock : 10) === 0) return;
    setSelectedVeggies(prev => {
      const exists = prev.some(v => v._id === veggie._id || v.name === veggie.name);
      if (exists) {
        return prev.filter(v => v._id !== veggie._id && v.name !== veggie.name);
      } else {
        return [...prev, veggie];
      }
    });
  };

  const handleAddToCart = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) {
      setNotification('Please complete Base, Sauce, and Cheese selections!');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const customPizza = {
      id: `custom-${Date.now()}`,
      name: 'Custom Crafted Pizza 🍕',
      base: selectedBase.name,
      sauce: selectedSauce.name,
      cheese: selectedCheese.name,
      veggies: selectedVeggies.map(v => v.name),
      price: totalPrice,
      totalPrice: totalPrice,
      quantity: 1,
      isCustom: true,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'
    };

    addToCart(customPizza);
    setNotification('Custom Pizza added to cart successfully! 🛒✨');
    setTimeout(() => {
      navigate('/cart');
    }, 1200);
  };

  const stepsMeta = [
    { num: 1, label: 'Base', desc: 'Choose your crust' },
    { num: 2, label: 'Sauce', desc: 'Select base spread' },
    { num: 3, label: 'Cheese', desc: 'Pick your melt' },
    { num: 4, label: 'Veggies', desc: 'Add fresh toppings' }
  ];

  const isStepComplete = (n) => {
    if (n === 1) return selectedBase !== null;
    if (n === 2) return selectedSauce !== null;
    if (n === 3) return selectedCheese !== null;
    if (n === 4) return selectedVeggies.length > 0;
    return false;
  };

  const canProceed = () => {
    if (step === 1) return selectedBase !== null;
    if (step === 2) return selectedSauce !== null;
    if (step === 3) return selectedCheese !== null;
    return true;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50/50 via-white to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20 pb-28 sm:pb-20 overflow-x-hidden transition-colors duration-200">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-orange-500/40 animate-bounce">
          <span className="text-xl">✨</span>
          <p className="text-xs font-semibold">{notification}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-100 dark:bg-orange-950/60 px-3.5 py-1.5 rounded-full">
            Interactive Builder 🛠️
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
            Design Your Custom Masterpiece
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
            Step-by-step artisan pizza crafting with fresh ingredients, real-time pricing, and instant cart integration.
          </p>
        </div>

        {/* Visual Progress Bar Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-100 dark:border-slate-800 mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stepsMeta.map((s) => {
              const active = step === s.num;
              const completed = isStepComplete(s.num) || step > s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-3 p-3.5 min-h-[48px] rounded-xl border text-left transition-all ${
                    active
                      ? 'border-orange-500 bg-orange-50/80 dark:bg-orange-950/30 shadow-md ring-2 ring-orange-500/20'
                      : completed
                      ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-400 dark:hover:border-emerald-700'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
                    active
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                      : completed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {completed && !active ? '✓' : s.num}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Step {s.num}
                    </span>
                    <span className={`text-xs sm:text-sm font-extrabold truncate block ${
                      active ? 'text-orange-600 dark:text-orange-400' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Builder Options (Left) & Sticky Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Step Options Selection Cards */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800">
            
            {loading ? (
              <LoadingSpinner fullScreen={false} message="Fetching latest data..." />
            ) : (
              <div>
                
                {/* STEP 1: BASE */}
                {step === 1 && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        Choose Your Pizza Crust (Base) 🍕
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Select one freshly kneaded crust option. Single choice.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ingredients.base.map(item => {
                        const isSelected = selectedBase?._id === item._id || selectedBase?.name === item.name;
                        const isOutOfStock = (item.stock !== undefined ? item.stock : 10) === 0;

                        return (
                          <div
                            key={item._id || item.name}
                            onClick={() => !isOutOfStock && setSelectedBase(item)}
                            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                              isOutOfStock
                                ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                : isSelected
                                ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-md ring-2 ring-orange-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 dark:border-slate-700'
                              }`}>
                                {isSelected && <span className="text-xs font-bold">✓</span>}
                              </div>
                              <div>
                                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                  {item.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    (item.stock !== undefined ? item.stock : 10) > 10
                                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400'
                                      : (item.stock !== undefined ? item.stock : 10) > 0
                                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400'
                                      : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-400'
                                  }`}>
                                    {(item.stock !== undefined ? item.stock : 10) > 10 ? 'In Stock' : (item.stock !== undefined ? item.stock : 10) > 0 ? 'Low Stock' : 'Out of Stock'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="font-black text-orange-600 dark:text-orange-400 text-sm sm:text-base">
                              +{formatPrice(item.price || 0)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 2: SAUCE */}
                {step === 2 && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        Choose Your Signature Sauce 🍅
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Select one rich spread for your base. Single choice.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ingredients.sauce.map(item => {
                        const isSelected = selectedSauce?._id === item._id || selectedSauce?.name === item.name;
                        const isOutOfStock = (item.stock !== undefined ? item.stock : 10) === 0;

                        return (
                          <div
                            key={item._id || item.name}
                            onClick={() => !isOutOfStock && setSelectedSauce(item)}
                            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                              isOutOfStock
                                ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                : isSelected
                                ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-md ring-2 ring-orange-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 dark:border-slate-700'
                              }`}>
                                {isSelected && <span className="text-xs font-bold">✓</span>}
                              </div>
                              <div>
                                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                  {item.name}
                                </h3>
                                <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  (item.stock !== undefined ? item.stock : 10) > 10
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400'
                                    : (item.stock !== undefined ? item.stock : 10) > 0
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400'
                                    : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-400'
                                }`}>
                                  {(item.stock !== undefined ? item.stock : 10) > 10 ? 'In Stock' : (item.stock !== undefined ? item.stock : 10) > 0 ? 'Low Stock' : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                            <span className="font-black text-orange-600 dark:text-orange-400 text-sm sm:text-base">
                              +{formatPrice(item.price || 0)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3: CHEESE */}
                {step === 3 && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        Choose Your Melt (Cheese) 🧀
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Select your favorite cheese variety. Single choice.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ingredients.cheese.map(item => {
                        const isSelected = selectedCheese?._id === item._id || selectedCheese?.name === item.name;
                        const isOutOfStock = (item.stock !== undefined ? item.stock : 10) === 0;

                        return (
                          <div
                            key={item._id || item.name}
                            onClick={() => !isOutOfStock && setSelectedCheese(item)}
                            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                              isOutOfStock
                                ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                : isSelected
                                ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-md ring-2 ring-orange-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 dark:border-slate-700'
                              }`}>
                                {isSelected && <span className="text-xs font-bold">✓</span>}
                              </div>
                              <div>
                                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                  {item.name}
                                </h3>
                                <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  (item.stock !== undefined ? item.stock : 10) > 10
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400'
                                    : (item.stock !== undefined ? item.stock : 10) > 0
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400'
                                    : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-400'
                                }`}>
                                  {(item.stock !== undefined ? item.stock : 10) > 10 ? 'In Stock' : (item.stock !== undefined ? item.stock : 10) > 0 ? 'Low Stock' : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                            <span className="font-black text-orange-600 dark:text-orange-400 text-sm sm:text-base">
                              +{formatPrice(item.price || 0)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 4: VEGGIES */}
                {step === 4 && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        Select Farm-Fresh Veggies 🫑
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Select multiple vegetable toppings as you prefer. Checkbox style.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ingredients.veggie.map(item => {
                        const isSelected = selectedVeggies.some(v => v._id === item._id || v.name === item.name);
                        const isOutOfStock = (item.stock !== undefined ? item.stock : 10) === 0;

                        return (
                          <div
                            key={item._id || item.name}
                            onClick={() => handleVeggieToggle(item)}
                            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                              isOutOfStock
                                ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                : isSelected
                                ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-md ring-2 ring-orange-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                                isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 dark:border-slate-700'
                              }`}>
                                {isSelected && <span className="text-xs font-bold">✓</span>}
                              </div>
                              <div>
                                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                  {item.name}
                                </h3>
                                <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  (item.stock !== undefined ? item.stock : 10) > 10
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400'
                                    : (item.stock !== undefined ? item.stock : 10) > 0
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400'
                                    : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-400'
                                }`}>
                                  {(item.stock !== undefined ? item.stock : 10) > 10 ? 'In Stock' : (item.stock !== undefined ? item.stock : 10) > 0 ? 'Low Stock' : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                            <span className="font-black text-orange-600 dark:text-orange-400 text-sm sm:text-base">
                              +{formatPrice(item.price || 0)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setStep(prev => Math.max(1, prev - 1))}
                    disabled={step === 1}
                    className={`px-6 py-3.5 min-h-[48px] rounded-xl font-bold text-xs sm:text-sm transition-all border flex items-center justify-center ${
                      step === 1
                        ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50 dark:bg-slate-800'
                        : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 shadow-sm'
                    }`}
                  >
                    ← Back Step
                  </button>

                  {step < 4 ? (
                    <button
                      onClick={() => {
                        if (!canProceed()) {
                          setNotification(`Please select a ${step === 1 ? 'Base' : step === 2 ? 'Sauce' : 'Cheese'} to continue.`);
                          setTimeout(() => setNotification(null), 3000);
                          return;
                        }
                        setStep(prev => Math.min(4, prev + 1));
                      }}
                      className="px-8 py-3.5 min-h-[48px] rounded-xl font-bold text-xs sm:text-sm bg-linear-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Next Step</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="px-8 py-3.5 min-h-[48px] rounded-xl font-extrabold text-xs sm:text-sm bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Add Custom Pizza to Cart 🛒</span>
                    </button>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Right Column: Sticky Live Order Summary Panel */}
          <div className="lg:col-span-4 sticky top-28 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-orange-100 dark:border-slate-800 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <span>🍕</span>
                <span>Live Order Summary</span>
              </h3>
              <span className="bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                Custom Craft
              </span>
            </div>

            {/* Selected Components Breakdown */}
            <div className="space-y-4 text-xs">
              
              {/* Base */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">1. Base (Crust):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedBase ? `${selectedBase.name} (+${formatPrice(selectedBase.price)})` : <span className="text-slate-400 dark:text-slate-600 italic">Not selected</span>}
                </span>
              </div>

              {/* Sauce */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">2. Sauce:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedSauce ? `${selectedSauce.name} (+${formatPrice(selectedSauce.price)})` : <span className="text-slate-400 dark:text-slate-600 italic">Not selected</span>}
                </span>
              </div>

              {/* Cheese */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">3. Cheese:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedCheese ? `${selectedCheese.name} (+${formatPrice(selectedCheese.price)})` : <span className="text-slate-400 dark:text-slate-600 italic">Not selected</span>}
                </span>
              </div>

              {/* Veggies */}
              <div className="py-2 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">4. Veggies ({selectedVeggies.length}):</span>
                  {selectedVeggies.length > 0 && (
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      +{formatPrice(selectedVeggies.reduce((s, v) => s + (v.price || 0), 0))}
                    </span>
                  )}
                </div>
                {selectedVeggies.length === 0 ? (
                  <span className="text-slate-400 dark:text-slate-600 italic block">No vegetables added yet</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedVeggies.map(v => (
                      <span
                        key={v._id || v.name}
                        className="bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 text-[10px] font-bold px-2 py-1 rounded-lg border border-orange-200 dark:border-orange-900/50 flex items-center gap-1"
                      >
                        <span>{v.name}</span>
                        <span className="text-orange-600 dark:text-orange-400 font-extrabold">+{formatPrice(v.price || 0)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Total Price Calculator */}
            <div className="bg-linear-to-r from-orange-500/10 to-red-500/10 dark:from-orange-950/30 dark:to-red-950/30 p-4 rounded-2xl border border-orange-200 dark:border-orange-900/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Total Price</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{formatPrice(totalPrice)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                  Free 30-min Delivery
                </span>
              </div>
            </div>

            {/* Quick Action in Summary */}
            {step === 4 ? (
              <button
                onClick={handleAddToCart}
                className="w-full py-4 min-h-[48px] rounded-2xl font-extrabold text-sm bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Add Custom Pizza to Cart 🛒</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!canProceed()) {
                    setNotification(`Please select a ${step === 1 ? 'Base' : step === 2 ? 'Sauce' : 'Cheese'} to continue.`);
                    setTimeout(() => setNotification(null), 3000);
                    return;
                  }
                  setStep(prev => Math.min(4, prev + 1));
                }}
                className="w-full py-4 min-h-[48px] rounded-2xl font-extrabold text-sm bg-linear-to-r from-red-600 to-orange-500 text-white shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Next Step ➔</span>
              </button>
            )}

            <div className="text-center pt-2">
              <Link to="/dashboard" className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                ← Browse Ready-Made Menu Instead
              </Link>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
