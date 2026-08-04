import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Star, ShieldCheck, Truck, ArrowLeft, Check, Plus, Minus, Package, Trash2, Sparkles, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { showCartToast, showSuccessToast } from '../utils/toast';
import { SEO } from '../components/SEO';


const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, removeFromCart, updateQuantity, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch product
  useEffect(() => {
    window.scrollTo(0, 0);
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

        // Fetch similar products efficiently by passing limit to the backend
        const allProdsData = await api.getProducts({ category: data.category, limit: 5 });
        const allProds = allProdsData.products || [];
        let sameCatProds = allProds.filter((p) => p._id !== data._id);

        // If we don't have enough similar products in the same category, fetch some random ones
        if (sameCatProds.length < 4) {
          const otherProdsData = await api.getProducts({ limit: 5 });
          const otherProds = otherProdsData.products || [];
          const newProds = otherProds.filter((p) => p._id !== data._id && !sameCatProds.some((cp) => cp._id === p._id));
          sameCatProds = [...sameCatProds, ...newProds];
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

  const mediaItems = React.useMemo(() => {
    if (!product) return [];
    const items = [...(product.images || [])];
    if (product.videoUrl) {
      if (items.length > 0) {
        items.splice(1, 0, 'VIDEO');
      } else {
        items.push('VIDEO');
      }
    }
    return items;
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
    if (mediaItems.length <= 1) return;
    const currentIndex = mediaItems.indexOf(selectedImage);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : mediaItems.length - 1;
    setSelectedImage(mediaItems[prevIndex]);
  };

  const handleNextImage = () => {
    if (mediaItems.length <= 1) return;
    const currentIndex = mediaItems.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % mediaItems.length;
    setSelectedImage(mediaItems[nextIndex]);
  };

  const breadcrumbPaths = [
    { name: 'Categories', link: '/shop' },
    { name: product.category, link: `/shop?category=${encodeURIComponent(product.category)}` },
    { name: product.name }
  ];

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': product.name,
    'image': product.images && product.images.length > 0 ? product.images : [selectedImage],
    'description': product.description || `Buy ${product.name} at best price online from Janki Jiyana House.`,
    'sku': product._id,
    'category': product.category,
    'offers': {
      '@type': 'Offer',
      'url': typeof window !== 'undefined' ? window.location.href : '',
      'priceCurrency': 'INR',
      'price': currentPrice,
      'priceValidUntil': '2026-12-31',
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': currentStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'seller': {
        '@type': 'Organization',
        'name': 'Janki Jiyana House'
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 pb-28 md:pb-16">
      <SEO
        title={`${product.name} - Buy Online at Best Price`}
        description={`Buy ${product.name} (${product.category}) at ₹${currentPrice} in Surat. 100% genuine product, fast delivery & cash on delivery at Janki Jiyana House.`}
        keywords={`${product.name}, ${product.category}, buy ${product.name} online, Janki Jiyana House`}
        ogImage={selectedImage}
        ogType="product"
        schema={productSchema}
      />

      <Breadcrumbs paths={breadcrumbPaths} />


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Gallery Section */}
        <div className="space-y-4 lg:sticky lg:top-24 w-full">
          <div className="w-full aspect-square bg-white rounded-3xl overflow-hidden border border-slate-200/80 relative group shadow-sm flex items-center justify-center p-6">
            {selectedImage === 'VIDEO' ? (
              (() => {
                const url = product.videoUrl;
                let embedUrl = url;
                try {
                  if (url.includes('youtube.com/watch') || url.includes('m.youtube.com/watch')) {
                    const urlObj = new URL(url);
                    const videoId = urlObj.searchParams.get('v');
                    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
                  } else if (url.includes('youtu.be/')) {
                    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
                  } else if (url.includes('youtube.com/shorts/')) {
                    const videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
                    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
                  } else if (url.includes('vimeo.com/')) {
                    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
                    if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
                  }
                } catch (err) {
                  // ignore
                }
                const isMp4 = url.endsWith('.mp4');
                return (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    {isMp4 ? (
                      <video src={url} controls className="w-full h-full object-contain" />
                    ) : (
                      <iframe src={embedUrl} title="Product Video" className="w-full h-full border-0" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
                    )}
                  </div>
                );
              })()
            ) : (
              <>
                {discountPercent > 0 && (
                  <span className="absolute top-4 left-4 z-10 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-md">
                    {discountPercent}% OFF
                  </span>
                )}
                <img
                  src={selectedImage || PLACEHOLDER_IMAGE}
                  alt={product.name}
                  loading="lazy"
                  onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </>
            )}
            
            {mediaItems.length > 1 && (
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
          {mediaItems.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto py-2 scrollbar-none px-1">
              {mediaItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(item)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 shrink-0 bg-white ${selectedImage === item ? 'border-brand-600 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-95'}`}
                >
                  {item === 'VIDEO' ? (
                    (() => {
                      const url = product?.videoUrl || '';
                      let videoId = null;
                      let isYoutube = false;
                      try {
                        if (url.includes('youtube.com/watch') || url.includes('m.youtube.com/watch')) {
                          videoId = new URL(url).searchParams.get('v');
                          isYoutube = true;
                        } else if (url.includes('youtu.be/')) {
                          videoId = url.split('youtu.be/')[1]?.split('?')[0];
                          isYoutube = true;
                        } else if (url.includes('youtube.com/shorts/')) {
                          videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
                          isYoutube = true;
                        }
                      } catch(e) {}
                      
                      return (
                        <div className="w-full h-full relative flex items-center justify-center bg-slate-100 overflow-hidden">
                          {isYoutube && videoId ? (
                            <img src={`https://img.youtube.com/vi/${videoId}/0.jpg`} alt="Video Thumbnail" className="w-full h-full object-cover" />
                          ) : url.endsWith('.mp4') ? (
                            <video src={`${url}#t=0.1`} preload="metadata" className="w-full h-full object-cover" muted playsInline />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                             <div className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
                               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-brand-600 ml-0.5"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>
                             </div>
                          </div>
                        </div>
                      )
                    })()
                  ) : (
                    <img src={item} alt={`Thumb ${idx + 1}`} loading="lazy" className="w-full h-full object-contain p-1.5" />
                  )}
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
              {currentStock <= 0 && (
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                  Out of Stock
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
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${isSelected
                          ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-slate-50'
                        }`}
                    >
                      {variant.image && (
                        <img 
                          src={variant.image} 
                          alt={variant.value} 
                          className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <span>
                        <span className="text-slate-400 text-[10px] mr-1">{variant.name}:</span>
                        {variant.value}
                      </span>
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
                className={`h-14 px-6 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-sm active:scale-95 ${isInWishlist(id) ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
                className={`flex-1 h-14 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 ${currentStock <= 0
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

          {/* Description */}
          {product.description && (
            <div className="pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between cursor-pointer group">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Product Details :-
                </h2>
                <Minus className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors" />
              </div>
              <div className="mt-5 text-slate-600 text-sm sm:text-[15px] leading-relaxed font-medium space-y-4">
                {product.description?.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                  <p key={idx} className="text-justify">
                    {line.replace(/^[-\d.)]+\s*/, '')}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="pt-8">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-600 tracking-tight flex items-center gap-3 mb-5">
                <Sparkles className="w-7 h-7" /> Key Features:
              </h2>
              <ul className="space-y-3">
                {product.features.map((feat, idx) => {
                  let text = feat;
                  text = text.replace(/^[-\d.)]+\s*/, '');
                  return (
                    <li key={idx} className="flex items-start gap-3 text-sm sm:text-[15px] text-slate-700 font-semibold">
                      <div className="mt-1 shrink-0 text-blue-600">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
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
