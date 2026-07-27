import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageCircle, ChevronLeft, ChevronRight, ShieldCheck, Heart, Flame, Sparkle } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { TrustBadges } from '../components/TrustBadges';

export const HomePage = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
        'Fast Cash On Delivery (COD)'
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

  return (
    <div className="space-y-10 sm:space-y-16 pb-16">
      {/* Hero Carousel Section - Mobile Optimized */}
      <section className="relative mx-3 sm:mx-6 lg:mx-8 mt-3 sm:mt-4">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 shadow-md min-h-[480px] sm:min-h-[540px] lg:min-h-[580px]">
          {/* Carousel Track Slider */}
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {heroSlides.map((slide) => (
              <div
                key={slide.id}
                className={`w-full flex-shrink-0 bg-gradient-to-br ${slide.bgGradient} py-8 sm:py-12 lg:py-14 px-4 sm:px-8 lg:px-14 flex items-center justify-center`}
              >
                <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12 items-center">
                  {/* Left Slide Details (7 Columns) */}
                  <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
                    <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-full text-brand-700 text-[10px] sm:text-xs font-bold shadow-sm border border-brand-100 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {slide.tag}
                    </span>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                      {slide.title}
                    </h1>

                    <p className="text-slate-600 text-xs sm:text-sm lg:text-base max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                      {slide.subtitle}
                    </p>

                    {/* Bullet Highlights in Simple English */}
                    {slide.highlights && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto lg:mx-0 pt-1 text-left">
                        {slide.highlights.map((highlight, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-white/85 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-slate-200/70 shadow-2xs"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-xs font-bold text-slate-800">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-3">
                      <Link
                        to={slide.link}
                        className="w-full sm:w-auto bg-accent-orange hover:bg-orange-600 text-white px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        {slide.btnText} <ArrowRight className="w-4 h-4" />
                      </Link>
                      <a
                        href="https://wa.me/919824934361?text=Hello%20Janki%20Jiyana%20House,%20I%20want%20to%20order"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl font-bold text-xs sm:text-sm border border-slate-200 shadow-sm flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Order
                      </a>
                    </div>
                  </div>

                  {/* Right Image Showcase (5 Columns) - High-Res Full Poster Display */}
                  <div className="lg:col-span-5 relative flex justify-center w-full mt-4 lg:mt-0">
                    <div className="w-full max-w-sm sm:max-w-md lg:max-w-full h-[340px] sm:h-[440px] lg:h-[480px] xl:h-[520px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative group bg-white flex items-center justify-center p-2.5 sm:p-4">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-2xl drop-shadow-md"
                      />
                      <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-slate-100 shadow-lg flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">OFFICIAL BRAND</p>
                          <p className="text-xs sm:text-sm font-extrabold text-slate-800">{slide.badge}</p>
                        </div>
                        <div className="flex items-center text-amber-400 gap-0.5 text-xs sm:text-sm font-bold">
                          ★★★★★
                        </div>
                      </div>
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
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2 sm:p-2.5 rounded-full shadow-md border border-slate-100 backdrop-blur-sm transition-all z-20"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2 sm:p-2.5 rounded-full shadow-md border border-slate-100 backdrop-blur-sm transition-all z-20"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? 'w-6 bg-brand-600 shadow-sm'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
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
          {categories.map((cat, idx) => (
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
              <div key={n} className="w-64 sm:w-80 h-72 sm:h-80 bg-slate-100 animate-pulse rounded-2xl shrink-0"></div>
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
              <div key={n} className="w-64 sm:w-80 h-72 sm:h-80 bg-slate-100 animate-pulse rounded-2xl shrink-0"></div>
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
