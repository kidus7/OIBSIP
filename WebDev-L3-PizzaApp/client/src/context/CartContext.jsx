import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('pizza_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pizza_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const itemKey = item.id || item._id || JSON.stringify({
        base: item.base,
        sauce: item.sauce,
        cheese: item.cheese,
        veggies: item.veggies,
        name: item.name
      });

      const existingIndex = prevCart.findIndex((cartItem) => {
        const k = cartItem.id || cartItem._id || JSON.stringify({
          base: cartItem.base,
          sauce: cartItem.sauce,
          cheese: cartItem.cheese,
          veggies: cartItem.veggies,
          name: cartItem.name
        });
        return k === itemKey;
      });

      const qtyToAdd = item.quantity || 1;

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const currentQty = updated[existingIndex].quantity || 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + qtyToAdd
        };
        return updated;
      } else {
        return [...prevCart, { ...item, quantity: qtyToAdd }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => {
      // id can be index (number) or item id/key (string)
      if (typeof id === 'number') {
        return prevCart.filter((_, i) => i !== id);
      }
      return prevCart.filter((item, index) => {
        const itemId = item.id || item._id || index;
        return itemId !== id && index !== id;
      });
    });
  };

  const updateQuantity = (id, amount) => {
    setCart((prevCart) => {
      return prevCart.map((item, index) => {
        const itemId = item.id || item._id || index;
        if (itemId === id || index === id) {
          const currentQty = item.quantity || 1;
          const newQty = currentQty + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('pizza_cart');
    } catch (error) {
      console.error('Failed to remove pizza_cart from localStorage:', error);
    }
  };

  const reorder = (items) => {
    if (!items || !Array.isArray(items)) return;
    setCart((prevCart) => {
      let updatedCart = [...prevCart];
      items.forEach((item) => {
        const cleanedItem = {
          ...item,
          id: item.id || item._id || Math.random().toString(36).substring(2, 9),
          quantity: item.quantity || 1,
          base: item.base,
          size: item.size,
          crust: item.crust,
          sauce: item.sauce,
          cheese: item.cheese,
          veggies: item.veggies,
          name: item.name,
          price: item.price
        };

        const itemKey = cleanedItem.id || JSON.stringify({
          base: cleanedItem.base,
          sauce: cleanedItem.sauce,
          cheese: cleanedItem.cheese,
          veggies: cleanedItem.veggies,
          name: cleanedItem.name,
          size: cleanedItem.size,
          crust: cleanedItem.crust
        });

        const existingIndex = updatedCart.findIndex((cartItem) => {
          const k = cartItem.id || cartItem._id || JSON.stringify({
            base: cartItem.base,
            sauce: cartItem.sauce,
            cheese: cartItem.cheese,
            veggies: cartItem.veggies,
            name: cartItem.name,
            size: cartItem.size,
            crust: cartItem.crust
          });
          return k === itemKey;
        });

        const qtyToAdd = cleanedItem.quantity || 1;

        if (existingIndex > -1) {
          const currentQty = updatedCart[existingIndex].quantity || 1;
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: currentQty + qtyToAdd
          };
        } else {
          updatedCart.push(cleanedItem);
        }
      });
      return updatedCart;
    });
  };

  const addMultipleToCart = reorder;

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.price || item.totalPrice || 0;
      const qty = item.quantity || 1;
      return total + (price * qty);
    }, 0);
  };

  const getTotalPrice = getCartTotal;

  const getCartCount = () => {
    return cart.reduce((count, item) => count + (item.quantity || 1), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        reorder,
        addMultipleToCart,
        getCartTotal,
        getTotalPrice,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
