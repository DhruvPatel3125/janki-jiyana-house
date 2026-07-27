import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist whenever logged in user changes
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([]);
        return;
      }

      setLoading(true);
      try {
        const data = await api.getWishlist();
        setWishlist(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load user wishlist', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user?._id]);

  // Check if a product ID is in the wishlist
  const isInWishlist = (productId) => {
    if (!productId || !wishlist || wishlist.length === 0) return false;
    return wishlist.some((item) => {
      const id = item._id || item;
      return id.toString() === productId.toString();
    });
  };

  // Toggle a product in/out of wishlist
  const toggleWishlist = async (product) => {
    if (!user) {
      showErrorToast('Please log in to add items to your Wishlist ❤️');
      return false;
    }

    const productId = product._id || product;

    try {
      const res = await api.toggleWishlist(productId);
      setWishlist(res.wishlist || []);
      if (res.added) {
        showSuccessToast('Added to Wishlist ❤️');
      } else {
        showSuccessToast('Removed from Wishlist');
      }
      return res.added;
    } catch (err) {
      const msg = err.message || 'Failed to update wishlist';
      showErrorToast(msg);
      return false;
    }
  };

  // Explicit remove from wishlist
  const removeFromWishlist = async (productId) => {
    if (!user) return;
    try {
      const res = await api.removeFromWishlist(productId);
      setWishlist(res.wishlist || []);
      showSuccessToast('Removed from Wishlist');
    } catch (err) {
      showErrorToast(err.message || 'Failed to remove from wishlist');
    }
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
