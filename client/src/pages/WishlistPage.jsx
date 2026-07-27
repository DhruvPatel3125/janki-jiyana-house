import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { showCartToast, showSuccessToast } from '../utils/toast';

export const WishlistPage = () => {
  const { user } = useAuth();
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart, cartItems, removeFromCart: removeFromCartState } = useCart();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Heart className="w-8 h-8 fill-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Please Log In</h2>
        <p className="text-slate-500 text-xs sm:text-sm">
          Log in to your account to view your saved Wishlist items across devices.
        </p>
        <Link
          to="/login"
          state={{ from: '/wishlist' }}
          className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-8 py-3 rounded-2xl shadow-md transition-all"
        >
          Login Now
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-sm mt-4 font-medium">Fetching your saved Wishlist ❤️...</p>
      </div>
    );
  }

  const handleAddToCart = (product) => {
    if (product.stock <= 0) return;
    addToCart(product, 1);
    showCartToast(product.name, () => navigate('/cart'));
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500 shrink-0" /> My Wishlist
          </h1>
          <p className="text-slate-500 text-xs mt-1">Your personal saved favorites for quick shopping.</p>
        </div>
        <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
          {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'} Saved
        </span>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white p-12 sm:p-16 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800">Your Wishlist is Empty</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Explore our collection and click the ❤️ icon on any product to save your favorite items here.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-md transition-all"
          >
            Explore All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map((item) => {
            const product = item._id ? item : null;
            if (!product) return null;

            const isItemInCart = cartItems.some((c) => c.product === product._id);

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group relative"
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  aria-label="Remove from Wishlist"
                  className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 backdrop-blur-md shadow-md text-slate-400 hover:text-rose-600 transition-all border border-slate-100"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div>
                  {/* Image */}
                  <Link
                    to={`/product/${product._id}`}
                    className="block aspect-square bg-slate-50/70 overflow-hidden border-b border-slate-100 relative"
                  >
                    <img
                      src={
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600'
                      }
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold text-brand-600 tracking-wider uppercase block">
                      {product.category}
                    </span>
                    <Link
                      to={`/product/${product._id}`}
                      className="font-bold text-slate-800 text-xs sm:text-sm hover:text-brand-600 line-clamp-2 transition-colors leading-snug"
                    >
                      {product.name}
                    </Link>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-base font-black text-slate-900">₹{product.price}</span>
                      {product.mrp > product.price && (
                        <span className="text-xs text-slate-400 line-through font-medium">₹{product.mrp}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add to Cart CTA */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${
                      product.stock <= 0
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : isItemInCart
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-accent-orange hover:bg-orange-600 text-white'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{product.stock <= 0 ? 'Out of Stock' : isItemInCart ? 'In Cart (Add More)' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
