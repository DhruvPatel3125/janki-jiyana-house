import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { showErrorToast } from '../utils/toast';

export const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    if (!user) {
      showErrorToast('Please log in or verify your email to proceed to checkout');
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 sm:py-24 text-center space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto border border-brand-100 shadow-sm">
          <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800">Your Cart is Empty</h2>
        <p className="text-slate-500 text-xs leading-relaxed">
          Looks like you haven't added any baby diapers, sanitary pads, or adult hygiene items to your cart yet.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-accent-orange hover:bg-orange-600 text-white font-bold text-xs px-7 py-3 rounded-2xl shadow-md transition-all active:scale-95"
        >
          Explore Shop Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <h1 className="text-xl sm:text-3xl font-black text-slate-900">Your Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.product}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between"
            >
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300'}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-slate-50 border border-slate-200 shrink-0"
                />
                <div className="space-y-1">
                  <Link
                    to={`/product/${item.product}`}
                    className="font-bold text-slate-900 text-xs sm:text-sm hover:text-brand-600 line-clamp-2 transition-colors"
                  >
                    {item.name}
                  </Link>
                  <p className="text-[11px] text-slate-400 font-medium">Unit Price: ₹{item.price}</p>
                </div>
              </div>

              {/* Quantity Controls & Total */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => updateQuantity(item.product, item.quantity - 1)}
                    className="p-1.5 sm:p-2 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product, item.quantity + 1)}
                    className="p-1.5 sm:p-2 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="font-black text-slate-900 text-sm sm:text-base block">₹{item.price * item.quantity}</span>
                </div>

                <button
                  onClick={() => removeFromCart(item.product)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 sm:space-y-6 h-fit">
          <h3 className="font-black text-slate-900 text-base sm:text-lg border-b border-slate-100 pb-3">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Subtotal ({cartItems.length} items)</span>
              <span className="font-bold text-slate-900">₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Estimated Delivery</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium items-center">
              <span>Packaging Type</span>
              <span className="font-bold text-teal-700 text-[10px] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                100% Plain Box
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
              <span className="font-black text-slate-900 text-sm">Total Amount</span>
              <span className="font-black text-slate-900 text-xl sm:text-2xl">₹{cartSubtotal}</span>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="w-full bg-accent-orange hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500 justify-center font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> Cash on Delivery available at checkout
          </div>
        </div>
      </div>
    </div>
  );
};
