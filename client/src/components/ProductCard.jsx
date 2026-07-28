import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, Trash2, Heart, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { showCartToast, showSuccessToast } from '../utils/toast';

export const ProductCard = ({ product }) => {
  const { addToCart, removeFromCart, updateQuantity, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const cartItem = cartItems.find((item) => item.product === product._id);
  const isItemInCart = !!cartItem;
  const isWishlisted = isInWishlist(product._id);

  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    showCartToast(product.name, () => navigate('/cart'));
  };

  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    if (cartItem.quantity <= 1) {
      removeFromCart(product._id);
      showSuccessToast(`${product.name} removed from cart`);
    } else {
      updateQuantity(product._id, cartItem.quantity - 1);
    }
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem || cartItem.quantity >= product.stock) return;
    updateQuantity(product._id, cartItem.quantity + 1);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full overflow-hidden relative">
      {/* Discount Pill Badge */}
      {discountPercent > 0 && (
        <span className="absolute top-2.5 left-2.5 z-10 bg-accent-orange text-white text-[10px] sm:text-[11px] font-extrabold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm">
          {discountPercent}% OFF
        </span>
      )}

      {/* Wishlist Heart Button */}
      <button
        onClick={handleWishlistToggle}
        aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 backdrop-blur-md shadow-md hover:scale-110 active:scale-95 transition-all border border-slate-100"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'
            }`}
        />
      </button>

      {/* Stock Status Badge */}
      {product.stock <= 0 && (
        <span className="absolute top-10 right-2.5 z-10 bg-slate-900/85 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full">
          Out of Stock
        </span>
      )}

      {/* Image Container */}
      <Link to={`/product/${product._id}`} className="relative block aspect-square bg-slate-50/70 overflow-hidden border-b border-slate-100">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Content Container */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-brand-600 tracking-wider uppercase block">
            {product.category}
          </span>
          <Link
            to={`/product/${product._id}`}
            className="font-bold text-slate-800 text-xs sm:text-sm hover:text-brand-600 line-clamp-2 transition-colors leading-snug"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 pt-0.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700">{product.rating || 4.8}</span>
            <span className="text-[10px] sm:text-xs text-slate-400">({product.reviewsCount || 12})</span>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          {/* Price Box */}
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg font-black text-slate-900">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through font-medium">₹{product.mrp}</span>
            )}
          </div>

          {/* Interactive Bestzone-style Cart Quantity Pill Button */}
          {product.stock <= 0 ? (
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            >
              Out of Stock
            </button>
          ) : isItemInCart ? (
            <div className="w-full h-10 bg-brand-600 text-white rounded-xl flex items-center justify-between px-1.5 font-bold shadow-md transition-all">
              <button
                onClick={handleDecrease}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-700 active:scale-90 transition-all text-white"
                title={cartItem.quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
              >
                {cartItem.quantity === 1 ? (
                  <Trash2 className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <Minus className="w-4 h-4 text-white shrink-0" />
                )}
              </button>

              <span className="text-sm font-black px-2 select-none text-white">
                {cartItem.quantity}
              </span>

              <button
                onClick={handleIncrease}
                disabled={cartItem.quantity >= product.stock}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-white ${cartItem.quantity >= product.stock
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-brand-700 active:scale-90'
                  }`}
                title="Increase quantity"
              >
                <Plus className="w-4 h-4 text-white shrink-0" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add to cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
