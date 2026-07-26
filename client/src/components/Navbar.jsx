import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, ShieldCheck, PhoneCall, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Navbar = () => {
  const { totalItemsCount } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories in navbar', err);
      }
    };
    fetchCats();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80">
      {/* Top Banner Announcement Bar */}
      <div className="bg-brand-600 text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-center font-medium">
          <p className="flex items-center justify-center gap-1 mx-auto sm:mx-0 truncate">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-teal-300" />
            <span className="truncate">100% Plain Discreet Box & Fast COD Shipping</span>
          </p>
          <div className="hidden sm:flex items-center gap-4 font-semibold shrink-0">
            <a href="tel:+919876543210" className="flex items-center gap-1 hover:underline">
              <PhoneCall className="w-3 h-3" /> Call: +91 98765 43210
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white font-black text-base sm:text-xl shadow-md group-hover:scale-105 transition-transform">
              JJ
            </div>
            <div>
              <span className="font-black text-lg sm:text-2xl text-slate-900 tracking-tight block leading-tight">
                Janki Jiyana <span className="text-brand-600">House</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold tracking-wider uppercase block -mt-0.5">
                Baby Care & Hygiene Store
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Search diapers, sanitary pads, baby wipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-full py-2.5 pl-4 pr-10 text-xs focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 top-1.5 bg-brand-600 hover:bg-brand-700 text-white p-1.5 rounded-full transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/shop"
              className="hidden lg:inline-flex text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors px-2 py-1"
            >
              All Products
            </Link>
            <Link
              to="/contact"
              className="hidden lg:inline-flex text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors px-2 py-1"
            >
              Contact Us
            </Link>

            {/* Auth status / Profile Dropdown */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 p-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors text-xs font-bold">
                  <User className="w-5 h-5 text-brand-600 shrink-0" />
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 hidden group-hover:block z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Signed in as</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-xs font-bold text-brand-600 hover:bg-brand-50 border-b border-slate-100"
                    >
                      ⚡ Admin Dashboard
                    </Link>
                  )}
                  <Link to="/orders" className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    My Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-brand-600 px-2.5 py-2 rounded-xl transition-colors"
              >
                <User className="w-5 h-5 text-slate-600" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="relative bg-brand-50 hover:bg-brand-100 p-2 sm:p-2.5 rounded-2xl text-brand-700 transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {totalItemsCount > 0 && (
                <span className="bg-accent-orange text-white text-[10px] sm:text-xs font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search sanitary pads, diapers, wipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/80 rounded-full py-2 pl-4 pr-10 text-xs focus:outline-none focus:bg-white border border-slate-200"
            />
            <button type="submit" aria-label="Search" className="absolute right-2.5 top-2 text-slate-500">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-5 space-y-4 shadow-2xl">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-slate-900 font-bold text-sm py-2.5 px-3 rounded-xl hover:bg-slate-50"
            >
              <span>Home</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-slate-900 font-bold text-sm py-2.5 px-3 rounded-xl hover:bg-slate-50"
            >
              <span>All Shop Products</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Dynamic Categories List in Mobile Drawer */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1">
              Product Categories
            </span>
            {categories.map((cat) => (
              <Link
                key={cat._id || cat.name}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-600 font-semibold text-xs py-2 px-3 pl-6 rounded-lg hover:bg-slate-50 hover:text-brand-600 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-slate-900 font-bold text-sm py-2.5 px-3 rounded-xl hover:bg-slate-50"
            >
              <span>Contact Us & Store Location</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            {user && user.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-brand-600 font-bold text-sm py-2.5 px-3 rounded-xl bg-brand-50"
              >
                <span>⚡ Admin Dashboard</span>
                <ChevronRight className="w-4 h-4 text-brand-600" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
