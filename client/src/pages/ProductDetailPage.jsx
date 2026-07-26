import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Star, ShieldCheck, Truck, ArrowLeft, Check, Plus, Minus, Package, Trash2, Sparkles, ImageOff } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { showCartToast, showSuccessToast } from '../utils/toast';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, removeFromCart, cartItems } = useCart();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getProductById(id);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        } else {
          setSelectedImage(PLACEHOLDER_IMAGE);
        }

        // Fetch similar products in same category (with fallback to ensure 4 cards displayed)
        const allProds = await api.getProducts();
        let sameCatProds = allProds.filter((p) => p.category === data.category && p._id !== data._id);
        
        if (sameCatProds.length < 4) {
          const otherProds = allProds.filter(
            (p) => p._id !== data._id && !sameCatProds.some((cp) => cp._id === p._id)
          );
          sameCatProds = [...sameCatProds, ...otherProds];
        }
        
        setSimilarProducts(sameCatProds.slice(0, 4));
      } catch (err) {
        setError('Product not found or unavailable');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-sm font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-800">Product Not Found</h2>
        <p className="text-slate-500 text-sm">{error || 'The requested product is no longer available.'}</p>
        <Link to="/shop" className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md">
          Back to Shop Catalog
        </Link>
      </div>
    );
  }

  const isItemInCart = cartItems.some((item) => item.product === product._id);
  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const handleCartToggle = () => {
    if (product.stock <= 0) return;
    if (isItemInCart) {
      removeFromCart(product._id);
      showSuccessToast(`${product.name} removed from cart`);
    } else {
      addToCart(product, quantity);
      showCartToast(product.name, () => navigate('/cart'));
    }
  };

  const handleBuyNow = () => {
    if (!isItemInCart) {
      addToCart(product, quantity);
    }
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-8 sm:space-y-10 pb-28 md:pb-16">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </button>
      </div>

      {/* Main Balanced Split Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start bg-white rounded-3xl p-4 sm:p-8 lg:p-10 border border-slate-200/80 shadow-sm">
        {/* Left Column: Fixed Aspect Ratio Image & Thumbnails */}
        <div className="space-y-3 sm:space-y-4 w-full">
          <div className="w-full aspect-[4/5] sm:aspect-square bg-slate-50/80 rounded-2xl overflow-hidden border border-slate-200/80 relative group shadow-sm flex items-center justify-center">
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-accent-orange text-white text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            <img
              src={selectedImage || PLACEHOLDER_IMAGE}
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = PLACEHOLDER_IMAGE;
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Gallery Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-brand-600 scale-95 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Balanced Details & Actions */}
        <div className="space-y-4 sm:space-y-5 w-full flex flex-col justify-between">
          <div className="space-y-4 sm:space-y-5">
            {/* Title, Category Tag & Rating Box */}
            <div className="bg-slate-50/70 p-4 sm:p-6 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold text-brand-600 tracking-wider uppercase px-2.5 py-1 bg-brand-50 rounded-full border border-brand-100">
                  {product.category}
                </span>
                <span
                  className={`text-[10px] sm:text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                    product.stock > 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}
                >
                  {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-xs font-bold text-slate-800">{product.rating || 4.8}</span>
                <span className="text-xs text-slate-400">({product.reviewsCount || 12} Verified Reviews)</span>
              </div>
            </div>

            {/* Price & MRP Box */}
            <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Special Offer Price</span>
                <div className="flex items-baseline gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">₹{product.price}</span>
                  {product.mrp > product.price && (
                    <span className="text-xs sm:text-base text-slate-400 line-through font-medium">MRP ₹{product.mrp}</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 block">
                  Tax Incl.
                </span>
              </div>
            </div>

            {/* Product Description */}
            <div className="px-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Product Description</h4>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Key Highlights Box */}
            {product.features && product.features.length > 0 && (
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Key Features & Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {product.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity Selector & Action Buttons Box */}
          <div className="space-y-4 pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
              <span className="text-xs font-bold text-slate-800">Select Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 sm:py-2 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3.5 py-1.5 sm:py-2 text-xs font-extrabold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-1.5 sm:py-2 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Desktop Side-by-Side Prominent CTA Buttons */}
            <div className="hidden sm:flex items-center gap-4">
              <button
                onClick={handleCartToggle}
                disabled={product.stock <= 0}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  product.stock <= 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : isItemInCart
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-accent-orange hover:bg-orange-600 text-white'
                }`}
              >
                {isItemInCart ? (
                  <>
                    <Trash2 className="w-4 h-4" /> Remove from Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all active:scale-95 text-sm"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Assurances Card */}
            <div className="grid grid-cols-2 gap-2.5 text-[11px] sm:text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2 bg-teal-50/60 p-2.5 sm:p-3 rounded-xl border border-teal-100">
                <Package className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="truncate">Plain Unbranded Box</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50/60 p-2.5 sm:p-3 rounded-xl border border-emerald-100">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SIMILAR PRODUCTS SECTION (Mobile 2 columns grid) */}
      {similarProducts.length > 0 && (
        <section className="space-y-4 sm:space-y-6 pt-6 border-t border-slate-200/80">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] sm:text-[11px] font-extrabold text-brand-600 uppercase tracking-wider block mb-0.5">
                Category Recommendations
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Similar Products You May Like</h3>
            </div>
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="text-xs font-bold text-brand-600 hover:underline shrink-0">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 items-stretch">
            {similarProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Total Price</span>
          <span className="text-base font-black text-slate-900">₹{product.price * quantity}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCartToggle}
            disabled={product.stock <= 0}
            className={`py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-md ${
              isItemInCart ? 'bg-rose-500 text-white' : 'bg-accent-orange text-white'
            }`}
          >
            {isItemInCart ? <Trash2 className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            {isItemInCart ? 'Remove' : 'Add'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};
