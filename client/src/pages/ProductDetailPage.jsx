import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Star, ShieldCheck, Truck, ArrowLeft, Check, Plus, Minus, Package, Trash2, Sparkles, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { showCartToast, showSuccessToast } from '../utils/toast';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, removeFromCart, updateQuantity, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch product
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
        
        // Auto-select first variant if available
        if (data.variants && data.variants.length > 0) {
          const firstVariant = data.variants[0];
          const firstValue = firstVariant.value.split(',')[0].trim();
          setSelectedVariant({ ...firstVariant, value: firstValue });
        }

        // Fetch similar products
        const allProds = await api.getProducts();
        let sameCatProds = allProds.filter((p) => p.category === data.category && p._id !== data._id);
        if (sameCatProds.length < 4) {
          const otherProds = allProds.filter((p) => p._id !== data._id && !sameCatProds.some((cp) => cp._id === p._id));
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

  // Derived state from variant or product
  const currentPrice = selectedVariant?.price || product?.price || 0;
  const currentMrp = selectedVariant?.mrp || product?.mrp || 0;
  const currentStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : (product?.stock || 0);
  const currentSku = selectedVariant?.sku || 'N/A';
  const cartUniqueId = selectedVariant ? `${product?._id}_${selectedVariant.name}_${selectedVariant.value}` : product?._id;
  
  const isItemInCart = cartItems.some((item) => item.uniqueId === cartUniqueId || (!item.uniqueId && item.product === product?._id));
  
  useEffect(() => {
    if (isItemInCart) {
      const item = cartItems.find((i) => i.uniqueId === cartUniqueId || (!i.uniqueId && i.product === product?._id));
      if (item && item.quantity !== quantity) {
        setQuantity(item.quantity);
      }
    } else {
      setQuantity(1);
    }
  }, [cartItems, cartUniqueId, isItemInCart]);

  const parsedVariants = React.useMemo(() => {
    if (!product?.variants) return [];
    const flattened = [];
    product.variants.forEach(variant => {
      const values = variant.value.split(',').map(v => v.trim()).filter(Boolean);
      values.forEach(v => {
        flattened.push({
          ...variant,
          value: v,
        });
      });
    });
    return flattened;
  }, [product]);

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

  const discountPercent = currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    if (variant.image) {
      setSelectedImage(variant.image);
    }
  };

  const handleCartToggle = () => {
    if (currentStock <= 0) return;
    if (isItemInCart) {
      removeFromCart(cartUniqueId);
      showSuccessToast(`${product.name} removed from cart`);
    } else {
      addToCart(product, quantity, selectedVariant);
      showCartToast(product.name, () => navigate('/cart'));
    }
  };

  const handleBuyNow = () => {
    if (!isItemInCart) {
      addToCart(product, quantity, selectedVariant);
    } else {
      updateQuantity(cartUniqueId, quantity);
    }
    navigate('/cart');
  };

  const handleQuantityChange = (newQty) => {
    setQuantity(newQty);
    if (isItemInCart) {
      updateQuantity(cartUniqueId, newQty);
    }
  };

  const handlePrevImage = () => {
    if (!product.images || product.images.length <= 1) return;
    const currentIndex = product.images.indexOf(selectedImage);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : product.images.length - 1;
    setSelectedImage(product.images[prevIndex]);
  };

  const handleNextImage = () => {
    if (!product.images || product.images.length <= 1) return;
    const currentIndex = product.images.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % product.images.length;
    setSelectedImage(product.images[nextIndex]);
  };

  const breadcrumbPaths = [
    { name: 'Categories', link: '/shop' },
    { name: product.category, link: `/shop?category=${encodeURIComponent(product.category)}` },
    { name: product.name }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 pb-28 md:pb-16">
      
      <Breadcrumbs paths={breadcrumbPaths} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Gallery Section */}
        <div className="space-y-4 lg:sticky lg:top-24 w-full">
          <div className="w-full aspect-square bg-white rounded-3xl overflow-hidden border border-slate-200/80 relative group shadow-sm flex items-center justify-center p-6">
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            <img
              src={selectedImage || PLACEHOLDER_IMAGE}
              alt={product.name}
              onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {product.images && product.images.length > 1 && (
              <>
                <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-110 active:scale-95 z-10">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-110 active:scale-95 z-10">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto py-2 scrollbar-none px-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 shrink-0 bg-white ${selectedImage === img ? 'border-brand-600 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-95'}`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain p-1.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full flex flex-col space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold text-brand-700 uppercase tracking-wider px-3 py-1 bg-brand-50 rounded-full border border-brand-100">
                {product.category}
              </span>
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${currentStock > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                {currentStock > 0 ? `In Stock (${currentStock})` : 'Out of Stock'}
              </span>
              {currentSku !== 'N/A' && (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  SKU: {currentSku}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-end gap-3 sm:gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">₹{currentPrice}</span>
                {currentMrp > currentPrice && (
                  <span className="text-base sm:text-lg text-slate-400 line-through font-bold decoration-slate-300">₹{currentMrp}</span>
                )}
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-1.5">
                Taxes Included
              </span>
            </div>
          </div>

          {/* Variants Selector */}
          {parsedVariants && parsedVariants.length > 0 && (
            <div className="space-y-3 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Select Option</h4>
              <div className="flex flex-wrap gap-2">
                {parsedVariants.map((variant, idx) => {
                  const isSelected = selectedVariant?.name === variant.name && selectedVariant?.value === variant.value;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleVariantSelect(variant)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                        isSelected 
                          ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-slate-400 text-[10px] mr-1">{variant.name}:</span>
                      {variant.value}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm h-14 w-36">
                <button onClick={() => handleQuantityChange(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50">
                  <Minus className="w-4 h-4 stroke-[3]" />
                </button>
                <span className="flex-1 h-full flex items-center justify-center text-sm font-black text-slate-900 bg-slate-50/50">{quantity}</span>
                <button onClick={() => handleQuantityChange(Math.min(currentStock, quantity + 1))} className="w-12 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
              <button
                onClick={() => toggleWishlist(product)}
                className={`h-14 px-6 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-sm active:scale-95 ${
                  isInWishlist(id) ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(id) ? 'fill-rose-500' : ''}`} />
                <span className="hidden sm:inline">{isInWishlist(id) ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-4 w-full">
              <button
                onClick={handleCartToggle}
                disabled={currentStock <= 0}
                className={`flex-1 h-14 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 ${
                  currentStock <= 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border-0'
                    : isItemInCart
                      ? 'bg-rose-600 text-white shadow-rose-600/20'
                      : 'bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {isItemInCart ? <><Trash2 className="w-4 h-4" /> Remove from Cart</> : <><ShoppingBag className="w-4 h-4" /> Add to Cart</>}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="flex-1 h-14 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-2xl shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Buy it Now
              </button>
            </div>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Key Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                    <div className="w-4 h-4 mt-0.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-0.5 bg-brand-600 rounded-full"></span> Description
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="space-y-4 sm:space-y-6 pt-10 border-t border-slate-100">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-brand-600 uppercase tracking-wider block mb-1">Related</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">You May Also Like</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {similarProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* Mobile Sticky CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Total</span>
          <span className="text-base font-black text-slate-900">₹{currentPrice * quantity}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCartToggle} disabled={currentStock <= 0} className={`py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-md ${isItemInCart ? 'bg-rose-500 text-white' : 'bg-brand-100 text-brand-700'}`}>
            {isItemInCart ? <Trash2 className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            {isItemInCart ? 'Drop' : 'Add'}
          </button>
          <button onClick={handleBuyNow} disabled={currentStock <= 0} className="bg-brand-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};
