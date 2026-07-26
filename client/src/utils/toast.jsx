import React from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';

/**
 * Custom Toast matching modern D2C e-commerce design (like QuickMart demo screenshot)
 */
export const showCartToast = (productName, onNavigateCart) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-in fade-in slide-in-from-top-5 duration-300' : 'animate-out fade-out slide-out-to-top-5 duration-200'
        } max-w-md w-full bg-white shadow-2xl rounded-3xl pointer-events-auto flex items-center justify-between p-4 border border-slate-200/80 gap-3 z-50`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-xs font-black text-slate-900 truncate">
              {productName} added to cart!
            </p>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              Tap the cart icon to view your bag
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            toast.dismiss(t.id);
            if (onNavigateCart) onNavigateCart();
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shrink-0 flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" /> View Cart
        </button>
      </div>
    ),
    { duration: 4000 }
  );
};

export const showSuccessToast = (message) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-in fade-in slide-in-from-top-5 duration-300' : 'animate-out fade-out slide-out-to-top-5 duration-200'
        } bg-white shadow-2xl rounded-2xl p-4 border border-emerald-100 flex items-center gap-3 max-w-md w-full z-50`}
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-slate-800 leading-snug flex-1">{message}</p>
      </div>
    ),
    { duration: 3500 }
  );
};

export const showErrorToast = (message) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-in fade-in slide-in-from-top-5 duration-300' : 'animate-out fade-out slide-out-to-top-5 duration-200'
        } bg-white shadow-2xl rounded-2xl p-4 border border-rose-100 flex items-center gap-3 max-w-md w-full z-50`}
      >
        <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-slate-800 leading-snug flex-1">{message}</p>
      </div>
    ),
    { duration: 4000 }
  );
};
