import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeleton } from '../components/skeletons/ProductSkeleton';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useDebounce } from '../hooks/useDebounce';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('newest');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 350);

  // 1. Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catData = await api.getCategories();
        setAllCategories(catData);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('category') || 'All';
    setSelectedCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  // Determine what we are displaying: 
  // Root level (parentCategory == null)
  // Parent level (children of selected category)
  // Product level (if it's a leaf node / child category)

  const isRootLevel = !selectedCategory || selectedCategory === 'All';
  
  let currentCategoryObj = null;
  let childrenCategories = [];
  let displayMode = 'products'; // 'categories' or 'products'

  if (isRootLevel) {
    // Show only root categories
    displayMode = 'categories';
    childrenCategories = allCategories.filter(c => !c.parentCategory);
  } else {
    currentCategoryObj = allCategories.find(c => c.name === selectedCategory);
    
    // Check if this category has children
    const children = allCategories.filter(c => c.parentCategory && (c.parentCategory._id === currentCategoryObj?._id || c.parentCategory.name === currentCategoryObj?.name));
    
    if (children.length > 0) {
      // It's a parent category! Show its children
      displayMode = 'categories';
      childrenCategories = children;
    } else {
      // It's a child category (leaf node), show products
      displayMode = 'products';
    }
  }

  // Fetch products ONLY when in product display mode or searching
  useEffect(() => {
    if (displayMode === 'categories' && !debouncedSearch) {
      // No need to fetch products if we are just showing categories and there is no search query
      setLoading(false);
      return;
    }
    
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (debouncedSearch) params.search = debouncedSearch;
        if (sortBy) params.sort = sortBy;

        const data = await api.getProducts(params);
        setProducts(data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch products', err);
        setError('Unable to fetch products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, debouncedSearch, sortBy, displayMode]);

  // Handle category navigation
  const navigateToCategory = (catName) => {
    setSearchParams({ category: catName });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSortBy('newest');
    setSearchParams({}); // Go to root categories
  };

  // Generate Breadcrumbs
  const breadcrumbPaths = [{ name: 'Categories', link: '/shop' }];
  if (currentCategoryObj) {
    if (currentCategoryObj.parentCategory) {
      breadcrumbPaths.push({ name: currentCategoryObj.parentCategory.name, link: `/shop?category=${encodeURIComponent(currentCategoryObj.parentCategory.name)}` });
      breadcrumbPaths.push({ name: currentCategoryObj.name });
    } else {
      breadcrumbPaths.push({ name: currentCategoryObj.name });
    }
  }

  // If there's a search query, it overrides the category view to show product search results globally
  const isSearching = debouncedSearch.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      <Breadcrumbs paths={breadcrumbPaths} />

      {/* Header Banner */}
      <div
        className="text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden border border-slate-700/50"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0d9488 100%)' }}
      >
        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full border border-teal-500/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Complete Catalog
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {currentCategoryObj ? currentCategoryObj.name : "Baby Care & Hygiene"}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium">
            {currentCategoryObj?.description || "Browse premium sanitary pads, baby diapers, and discreet adult hygiene essentials."}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products globally..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-teal-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {(displayMode === 'products' || isSearching) && (
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
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {error ? (
        <div className="bg-rose-50 rounded-3xl p-12 text-center border border-rose-200 shadow-sm space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-white text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <p className="text-slate-900 font-black text-xl">Something went wrong</p>
          <p className="text-slate-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 items-stretch">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <ProductSkeleton key={n} />
          ))}
        </div>
      ) : isSearching || displayMode === 'products' ? (
        // Render Products
        products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4 max-w-md mx-auto">
            <p className="text-slate-800 font-bold text-base">No products found.</p>
            <p className="text-slate-500 text-xs">Try searching for something else or clearing filters.</p>
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
        )
      ) : (
        // Render Categories Hierarchy
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {childrenCategories.map(cat => (
            <div 
              key={cat._id}
              onClick={() => navigateToCategory(cat.name)}
              className="cursor-pointer group relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-teal-500/30 transition-all bg-white flex flex-col h-full"
            >
              <div className="w-full aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden flex items-center justify-center p-6 border-b border-slate-100">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col">
                <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-teal-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {cat.description || `Explore our ${cat.name} collection`}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-2.5 py-1 rounded-md">View Details</span>
                  <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
