import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageCircle, ChevronLeft, ChevronRight, ShieldCheck, Heart, Flame, Sparkle, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { TrustBadges } from '../components/TrustBadges';
import { TrendingVideosSection } from '../components/TrendingVideosSection';
import { ProductSkeleton } from '../components/skeletons/ProductSkeleton';

export const HomePage = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Carousel Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Scroll Container References
  const newProdsRef = useRef(null);
  const featuredProdsRef = useRef(null);

  const heroSlides = [
    {
      id: 1,
      tag: 'FEMININE HYGIENE & MINT FRESHNESS',
      title: '320mm Mint Cooling Sanitary Pads',
      subtitle: 'Extra long 320mm sanitary pads with cooling mint freshness. Provides 100% leak protection, odour control, and soft cotton feel for heavy flow days.',
      highlights: [
        'Cooling Mint Effect',
        '320mm Extra Long Coverage',
        'Anion Odour Control Chip',
        '100% Soft & Rash-Free Cotton'
      ],
      btnText: 'Shop Sanitary Pads',
      link: '/shop?category=Sanitary%20Pads',
      image: '/hero/slide_1.jpg',
      badge: '100% Rash-Free & Mint Fresh',
      bgGradient: 'from-pink-50 via-rose-50/60 to-purple-50',
    },
    {
      id: 2,
      tag: 'ADULT CARE & COMFORT PANTS',
      title: 'Super Absorbent Adult Diapers & Pants',
      subtitle: 'Premium adult diapers designed for high absorption, 360° stretch fit comfort, and skin-friendly day & night leak protection.',
      highlights: [
        'Super Rapid Dry Core',
        'Soft & Breathable Fabric',
        'Pant & Tape Style Options',
        '12-Hour Day & Night Protection'
      ],
      btnText: 'Shop Adult Care',
      link: '/shop?category=Adult%20Diapers',
      image: '/hero/slide_2.jpg',
      badge: '100% Plain Discreet Box Delivery',
      bgGradient: 'from-sky-50 via-blue-50/60 to-teal-50',
    },
    {
      id: 3,
      tag: 'HYGIENE & HEALTHCARE BRAND - CIAZA',
      title: 'Complete Hygiene Care For Entire Family',
      subtitle: 'One trusted brand for Baby Diapers, Sanitary Pads, Adult Diapers, and Disposable Period Panties with 100% leak-proof quality.',
      highlights: [
        'Soft Baby Diaper Pants',
        'Sanitary & Period Panties',
        'Dignified Adult Diapers',
        'WhatsApp Orders Available'
      ],
      btnText: 'Explore All Products',
      link: '/shop',
      image: '/hero/slide_3.jpg',
      badge: 'Quality & Trust Guaranteed',
      bgGradient: 'from-emerald-50 via-teal-50/60 to-sky-50',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodsData, catsData] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
        ]);
        setNewProducts(prodsData.slice(0, 6));
        setFeaturedProducts(prodsData.slice().reverse().slice(0, 6));
        setCategories(catsData);
      } catch (err) {
        console.error('Failed to load homepage data', err);
        setError('Unable to connect to the server. Please check your internet connection or try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-play Carousel Slider (5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  // Horizontal Scroll Helper
  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Oops! Something went wrong</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 mt-2"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 sm:space-y-16 pb-16">
      {/* ════════ HERO SECTION — D2C Reference Image Style ════════ */}
      <section className="relative">
        {/* Main Hero Container */}
        <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50/40 to-sky-50 min-h-[520px] sm:min-h-[560px] lg:min-h-[580px]">
          {/* Carousel Track */}
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {heroSlides.map((slide) => (
              <div
                key={slide.id}
                className={`w-full flex-shrink-0 bg-gradient-to-br ${slide.bgGradient} py-10 sm:py-14 lg:py-16 px-6 sm:px-10 lg:px-16 xl:px-24 flex items-center`}
              >
                <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* ─── LEFT COLUMN: Text Content ─── */}
                  <div className="space-y-5 sm:space-y-6 text-center lg:text-left order-2 lg:order-1">
                    {/* Tag Badge */}
                    <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-brand-700 text-[10px] sm:text-xs font-extrabold shadow-xs border border-brand-100 uppercase tracking-wider">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" /> {slide.tag}
                    </span>

                    {/* Two-Tone Headline */}
                    <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-5xl font-black text-slate-900 leading-[1.15] tracking-tight">
                      {slide.title.split(' ').slice(0, -2).join(' ')}{' '}
                      <span className="text-brand-600 italic">
                        {slide.title.split(' ').slice(-2).join(' ')}
                      </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-slate-600 text-xs sm:text-sm lg:text-[15px] max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
                      {slide.subtitle}
                    </p>

                    {/* Feature Badges Row (4 Icons) */}
                    {slide.highlights && (
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-3 pt-1">
                        {slide.highlights.map((text, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-sm border border-slate-200/80 flex items-center justify-center shrink-0">
                              {idx === 0 && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                              {idx === 1 && <Sparkle className="w-4 h-4 text-amber-500 fill-amber-500" />}
                              {idx === 2 && <Heart className="w-4 h-4 text-rose-500" />}
                              {idx === 3 && <ShieldCheck className="w-4 h-4 text-teal-600" />}
                            </div>
                            <span className="text-[11px] sm:text-xs font-bold text-slate-700 leading-tight max-w-[100px]">
                              {text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                      <Link
                        to={slide.link}
                        className="w-full sm:w-auto bg-accent-orange hover:bg-orange-600 text-white px-7 py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        {slide.btnText} <ArrowRight className="w-4 h-4" />
                      </Link>
                      <a
                        href="https://wa.me/919824934361?text=Hello%20Janki%20Jiyana%20House,%20I%20want%20to%20order"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm border border-slate-200 shadow-sm flex items-center justify-center gap-2 active:scale-95"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Order
                      </a>
                    </div>

                    {/* Trust Avatars + Rating Bar */}
                    <div className="flex items-center justify-center lg:justify-start gap-3 pt-1">
                      <div className="flex -space-x-2">
                        {['🧑', '👩', '👨', '👧'].map((emoji, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-100 to-teal-100 border-2 border-white flex items-center justify-center text-sm shadow-xs">
                            {emoji}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="flex items-center text-amber-400 gap-0.5 text-sm font-bold">★★★★★</div>
                        <p className="text-[10px] sm:text-[11px] font-bold text-slate-600">
                          Trusted by <span className="text-brand-700">10,000+</span> Happy Families
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ─── RIGHT COLUMN: Product Poster Image ─── */}
                  <div className="flex justify-center lg:justify-end w-full order-1 lg:order-2">
                    <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg h-[280px] sm:h-[380px] lg:h-[440px] flex items-center justify-center">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="h-full w-full object-contain drop-shadow-2xl hover:scale-[1.03] transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 p-2.5 sm:p-3 rounded-full shadow-lg border border-slate-200/80 backdrop-blur-md transition-all z-20 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 p-2.5 sm:p-3 rounded-full shadow-lg border border-slate-200/80 backdrop-blur-md transition-all z-20 active:scale-95"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${currentSlide === idx
                    ? 'w-7 sm:w-8 h-2.5 bg-brand-600 shadow-sm'
                    : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Round Circular Category Section ("Shop by Category") */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-4 sm:space-y-6">
        <div className="flex items-end justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Shop by Category</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Select a hygiene category tailored to your family's personal needs.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 shrink-0"
          >
            All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Circular Round Category Cards Row (Touch Horizontal Scrollable) */}
        <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto pb-4 pt-1 scrollbar-none justify-start md:justify-center">
          {categories.filter(cat => !cat.parentCategory).map((cat, idx) => (
            <Link
              key={cat._id || idx}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center text-center space-y-2 group shrink-0"
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-brand-200 via-orange-100 to-teal-200 shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 border-2 border-white relative overflow-hidden">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500'}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:rotate-3 transition-transform duration-500"
                />
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-brand-600 transition-colors max-w-[95px] sm:max-w-[110px] leading-tight line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* OUR TRENDING VIDEO SHORTS SECTION */}
      <div className="max-w-[1600px] mx-auto">
        <TrendingVideosSection />
      </div>

      {/* NEW PRODUCTS SECTION (Horizontally Scrollable) */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-4 sm:space-y-6">
        <div className="flex items-end justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
              <Sparkle className="w-3 h-3 fill-amber-500" /> New Arrivals
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Newly Launched Products</h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scrollContainer(newProdsRef, 'left')}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollContainer(newProdsRef, 'right')}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="w-64 sm:w-80 shrink-0">
                <ProductSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={newProdsRef}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x"
          >
            {newProducts.map((product) => (
              <div key={product._id} className="w-64 sm:w-80 shrink-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BEST-SELLING PRODUCTS SECTION (Horizontally Scrollable) */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-4 sm:space-y-6">
        <div className="flex items-end justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
              <Flame className="w-3 h-3 fill-rose-500" /> Popular Choices
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Best-Selling Hygiene Care</h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scrollContainer(featuredProdsRef, 'left')}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollContainer(featuredProdsRef, 'right')}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="w-64 sm:w-80 shrink-0">
                <ProductSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={featuredProdsRef}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x"
          >
            {featuredProducts.map((product) => (
              <div key={product._id} className="w-64 sm:w-80 shrink-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust Badges Bar */}
      <TrustBadges />

      {/* Discreet Packaging Banner */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left z-10">
            <span className="bg-brand-500/20 text-brand-300 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Privacy First Promise
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
              100% Plain & Unbranded Packaging
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              We understand privacy matters. All orders for sanitary pads and adult diapers are shipped in plain brown boxes with zero product names or logos on the outer box.
            </p>
          </div>
          <div className="shrink-0 z-10 w-full sm:w-auto">
            <Link
              to="/shop"
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-colors text-center inline-block"
            >
              Shop Privately Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
