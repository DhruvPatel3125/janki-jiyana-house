import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  // Helper to generate user-scoped localStorage key
  const getCartKey = (u) => (u && u._id ? `cartItems_${u._id}` : 'cartItems_guest');

  // Initialize cart state for current logged-in user or guest
  const [cartItems, setCartItems] = useState(() => {
    // Remove legacy un-scoped key if present
    const legacySaved = localStorage.getItem('cartItems');
    if (legacySaved) {
      localStorage.removeItem('cartItems');
    }
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || 'null');
    const key = currentUser && currentUser._id ? `cartItems_${currentUser._id}` : 'cartItems_guest';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  const prevUserIdRef = useRef(user?._id);

  // Sync and isolate cart items whenever active user changes (Login / Logout / Switch User)
  useEffect(() => {
    const currentUserId = user?._id;
    if (prevUserIdRef.current !== currentUserId) {
      prevUserIdRef.current = currentUserId;
      const key = getCartKey(user);
      const saved = localStorage.getItem(key);
      setCartItems(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  // Persist active cart items under current user's scoped key
  useEffect(() => {
    const key = getCartKey(user);
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, user]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product === product._id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      } else {
        return [
          ...prev,
          {
            product: product._id,
            name: product.name,
            image: product.images && product.images.length > 0 ? product.images[0] : '',
            price: product.price,
            stock: product.stock,
            quantity,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product === productId
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    const key = getCartKey(user);
    localStorage.removeItem(key);
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

