import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { showCartToast, showSuccessToast } from '../utils/toast';

export const ProductCard = ({ product }) => {
  const { addToCart, removeFromCart, cartItems } = useCart();
  const navigate = useNavigate();

  const isItemInCart = cartItems.some((item) => item.product === product._id);
  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const handleCartToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    if (isItemInCart) {
      removeFromCart(product._id);
      showSuccessToast(`${product.name} removed from cart`);
    } else {
      addToCart(product, 1);
      showCartToast(product.name, () => navigate('/cart'));
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full overflow-hidden relative">
      {/* Discount Pill Badge */}
      {discountPercent > 0 && (
        <span className="absolute top-2.5 left-2.5 z-10 bg-accent-orange text-white text-[10px] sm:text-[11px] font-extrabold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm">
          {discountPercent}% OFF
        </span>
      )}

      {/* Stock Status Badge */}
      {product.stock <= 0 && (
        <span className="absolute top-2.5 right-2.5 z-10 bg-slate-900/85 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full">
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

          {/* Toggle Add / Remove Button */}
          <button
            onClick={handleCartToggle}
            disabled={product.stock <= 0}
            className={`w-full py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-all duration-200 active:scale-95 ${
              product.stock <= 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : isItemInCart
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-accent-orange hover:bg-orange-600 text-white'
            }`}
          >
            {isItemInCart ? (
              <>
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Remove</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
