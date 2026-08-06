import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageCircle, ChevronLeft, ChevronRight, ShieldCheck, Heart, Flame, Sparkle, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { TrustBadges } from '../components/TrustBadges';
import { TrendingVideosSection } from '../components/TrendingVideosSection';
import { ProductSkeleton } from '../components/skeletons/ProductSkeleton';
import { SEO } from '../components/SEO';



export const HomePage = () => {

  const [newProducts, setNewProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [discountBanners, setDiscountBanners] = useState([]);
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
      tag: 'CIAZA HYGIENE & MINT FRESHNESS',
      title: '320mm Mint Cooling Sanitary Pads',
      subtitle: 'Extra long 320mm sanitary pads with cooling mint freshness. Provides 100% leak protection, odour control, and soft cotton feel for heavy flow days.',
      highlights: [
        'Cooling Mint Effect',
        '320mm Extra Long Coverage',
        'Anion Odour Control Chip',
        '100% Soft & Rash-Free Cotton'
      ],
      btnText: 'Shop Sanitary Pads',
      link: '/shop?category=Sanitary+Pads',
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
      link: '/shop?category=Adult+Diapers',
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
        const [prodsData, featuredProdsData, catsData, bannersData] = await Promise.all([
          api.getProducts({ limit: 20 }),
          api.getProducts({ limit: 20, isFeatured: true }),
          api.getCategories(),
          api.getBanners().catch(() => []),
        ]);
        setNewProducts(prodsData.products || []);
        setFeaturedProducts(featuredProdsData.products || []);
        setCategories(catsData || []);
        setDiscountBanners(bannersData || []);
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

  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.jankijiyanahouse.com/#organization',
        'name': 'Janki Jiyana House',
        'url': 'https://www.jankijiyanahouse.com',
        'logo': 'https://www.jankijiyanahouse.com/logo.png',
        'description': 'Leading Baby Care, Adult Care Diapers and Personal Hygiene Store in Surat, Gujarat.',
        'telephone': '+919737474672'
      },
      {
        '@type': 'LocalBusiness',
        'name': 'Janki Jiyana House',
        'image': 'https://www.jankijiyanahouse.com/logo.png',

        'telephone': '+919737474672',
        'priceRange': '₹',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Surat',
          'addressLocality': 'Surat',
          'addressRegion': 'Gujarat',
          'postalCode': '395003',
          'addressCountry': 'IN'
        }
      }
    ]
  };

  return (
    <div className="space-y-10 sm:space-y-16 pb-16">
      <SEO
        title="Baby Care, Adult Diapers & Personal Hygiene Store Surat"
        description="Shop premium baby diaper pants, adult pull-up diapers, 320mm cooling mint sanitary pads & kids wear at Janki Jiyana House Surat. Fast cash on delivery & discreet packaging."
        keywords="Janki Jiyana House, baby diapers Surat, adult diapers Surat, sanitary pads, pull up diapers, baby care Surat, kids clothing"
        schema={homeSchema}
      />

      {/* ════════ HERO SECTION — D2C Reference Image Style ════════ */}
      <section className="relative">
        {/* Main Hero Container */}
        <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50/40 to-sky-50 min-h-[520px] sm:min-h-[560px] lg:min-h-[580px]">
          {/* Carousel Track */}
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {heroSlides.map((slide, idx) => (
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
                        href="https://wa.me/919737474672?text=Hello%20Janki%20Jiyana%20House,%20I%20want%20to%20order"
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
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        fetchpriority={idx === 0 ? 'high' : 'auto'}
                        decoding="async"
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
        <div className="flex items-center gap-6 sm:gap-10 overflow-x-auto pb-4 pt-2 scrollbar-none justify-start md:justify-center">
          {categories.filter(cat => !cat.parentCategory).map((cat, idx) => (
            <Link
              key={cat._id || idx}
              to={`/shop?category=${encodeURIComponent(cat.name).replace(/%20/g, '+')}`}
              className="flex flex-col items-center text-center space-y-3 group shrink-0"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full p-1.5 bg-gradient-to-tr from-brand-300 via-orange-200 to-teal-300 shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 border-4 border-white relative overflow-hidden">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500'}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover rounded-full group-hover:rotate-3 transition-transform duration-500"
                />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800 group-hover:text-brand-600 transition-colors max-w-[120px] sm:max-w-[150px] leading-tight line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 🎁 DISCOUNT BANNERS SECTION — Big Discount, Big Saving */}
      {discountBanners.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-4xl font-black text-rose-500 tracking-tight">
              Big Discount, Big Saving
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold tracking-wide">
              Today's Best Deals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {discountBanners.map((banner) => (
              <Link
                key={banner._id}
                to={`/shop?category=${encodeURIComponent(banner.category).replace(/%20/g, '+')}`}
                className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border border-slate-200/80 bg-white w-full flex items-center justify-center"
              >
                <img
                  src={banner.image}
                  alt={banner.title || banner.category}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-700 rounded-3xl"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

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

      {/* 🏪 Physical Store Showcase Section */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-700/60 shadow-2xl overflow-hidden relative group">
          {/* Subtle Glow background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 blur-3xl rounded-full pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
            {/* Storefront Image with Frame */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/40 group-hover:border-amber-400 transition-all duration-500 aspect-[4/3] bg-slate-950 flex items-center justify-center">
              <img
                src="/shop-storefront.jpg"
                alt="Janki Jiyana House Physical Store Surat"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4 sm:p-6">
                <span className="bg-amber-500 text-slate-950 text-[11px] sm:text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" /> Janki Jiyana House Outlet
                </span>
              </div>
            </div>

            {/* Store Info & Details */}
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-amber-400 text-xs font-black uppercase tracking-widest bg-amber-400/10 px-3.5 py-1 rounded-full border border-amber-400/20 inline-block">
                  Visit Our Physical Store
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  Experience Trust & Quality In-Person 🏪
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                  Welcome to <strong className="text-amber-400">Janki Jiyana House</strong>! Visit our retail store in Surat for New Born Baby Care, Kids Wear, Toys, Sanitary Pads, Adult Diapers & Personal Hygiene products with expert guidance.
                </p>
              </div>

              {/* Info Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 flex items-start gap-3">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Ladva Aanana Specialist</h4>
                    <p className="text-[11px] text-slate-400">New Born & Kids Wear, Baby Accessories</p>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 flex items-start gap-3">
                  <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Contact / Helpline</h4>
                    <p className="text-[11px] text-slate-400 font-mono">+91 97374 74672 (Jignaben Vekariya)</p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <a
                  href="https://wa.me/919737474672?text=Hello%20Janki%20Jiyana%20House,%20I%20want%20to%20visit%20your%20store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
                <Link
                  to="/shop"
                  className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                >
                  Browse Catalog Online <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discreet Packaging Banner */}
     
    </div>
  );
};
