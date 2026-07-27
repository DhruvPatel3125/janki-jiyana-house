import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw, ShoppingBag, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeleton } from '../components/skeletons/ProductSkeleton';
import { useDebounce } from '../hooks/useDebounce';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  // Debounced search query (350ms) to eliminate unnecessary network requests while typing
  const debouncedSearch = useDebounce(searchQuery, 350);

  // Load dynamic categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catData = await api.getCategories();
        const names = ['All', ...catData.map((c) => c.name)];
        setCategories(names);
      } catch (err) {
        console.error('Failed to fetch dynamic categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products based on category, debounced search & sort
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, debouncedSearch, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (debouncedSearch) params.search = debouncedSearch;
      if (sortBy) params.sort = sortBy;

      const data = await api.getProducts(params);
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* High-Contrast Crisp Header Banner */}
      <div
        className="text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden border border-slate-700/50"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0d9488 100%)' }}
      >
        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full border border-teal-500/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Complete Catalog
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Baby Care & Personal Hygiene Store
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium">
            Browse premium sanitary pads, baby diapers, and discreet adult hygiene essentials.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Debounced Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Debounced search products..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-teal-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Dynamic Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 items-stretch">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <ProductSkeleton key={n} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4 max-w-md mx-auto">
          <p className="text-slate-800 font-bold text-base">No products match your filter.</p>
          <p className="text-slate-500 text-xs">Try clearing your search keyword or switching category filter.</p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 items-stretch">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
