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

  const getUniqueId = (productId, variant) => {
    if (!variant) return productId;
    return `${productId}_${variant.name}_${variant.value}`;
  };

  const addToCart = (product, quantity = 1, variant = null) => {
    const uniqueId = getUniqueId(product._id, variant);
    
    setCartItems((prev) => {
      const existing = prev.find((item) => item.uniqueId === uniqueId || (!item.uniqueId && item.product === product._id && !variant));
      if (existing) {
        return prev.map((item) =>
          (item.uniqueId === uniqueId || (!item.uniqueId && item.product === product._id && !variant))
            ? { ...item, quantity: Math.min(item.quantity + quantity, variant?.stock || product.stock) }
            : item
        );
      } else {
        return [
          ...prev,
          {
            uniqueId,
            product: product._id,
            name: product.name,
            image: variant?.image || (product.images && product.images.length > 0 ? product.images[0] : ''),
            price: variant?.price || product.price,
            stock: variant?.stock || product.stock,
            quantity,
            variant: variant ? { name: variant.name, value: variant.value } : null,
          },
        ];
      }
    });
  };

  const isMatch = (item, targetId) => {
    return (item.uniqueId || item.product) === targetId;
  };

  const removeFromCart = (uniqueId) => {
    setCartItems((prev) => prev.filter((item) => !isMatch(item, uniqueId)));
  };

  const updateQuantity = (uniqueId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(uniqueId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        isMatch(item, uniqueId)
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

