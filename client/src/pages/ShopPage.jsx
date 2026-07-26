import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';

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

  // Fetch products based on category, search & sort
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        category: selectedCategory,
        search: searchQuery,
        sort: sortBy,
      });
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch shop products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat) => {
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
      {/* Shop Header Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-teal-600 to-emerald-600 text-white rounded-3xl p-6 sm:p-10 shadow-md">
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Shop All Hygiene Essentials</h1>
        <p className="text-brand-100 text-xs sm:text-sm mt-1.5 max-w-2xl font-normal leading-relaxed">
          Browse our complete catalog of certified skin-friendly sanitary pads, adult care diapers, baby diapers, and gentle wipes.
        </p>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search & Sorting Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Search product by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200/80 rounded-full py-2 sm:py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-500"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>

            {(selectedCategory !== 'All' || searchQuery !== '') && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 font-bold flex items-center gap-1 hover:underline shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid (Mobile 2 columns) */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-64 sm:h-80 bg-slate-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 items-stretch">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-3 shadow-sm">
          <p className="text-4xl">🔍</p>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">No products match your search</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            We couldn't find any hygiene products matching your search query or selected category filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="bg-brand-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
