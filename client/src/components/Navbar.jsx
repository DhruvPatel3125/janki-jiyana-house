import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, ShieldCheck, PhoneCall, ChevronRight, MapPin, MessageCircle, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Navbar = () => {
  const { totalItemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const storeAddress = "G-8-9 Apple Square, Near, Lajamni Chowk, Maruti Dham Society, Mota Varachha, Surat, Gujarat 394101, India.";
  const shortAddress = "G-8-9 Apple Square, Near Lajamni Chowk, Mota Varachha, Surat - 394101";
  const storePhone = "+91 97374 74672";
  const whatsappUrl = "https://wa.me/919737474672?text=Hello%20Janki%20Jiyana%20House,%20I%20have%20an%20inquiry";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80">
      {/* Top Banner Announcement & Address Bar */}
      <div className="bg-slate-900 text-white text-[11px] sm:text-xs py-1.5 px-4 sm:px-8 lg:px-12 border-b border-slate-800">
        <div className="w-full mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Address */}
          <div className="flex items-center gap-1.5 text-slate-300 truncate max-w-full sm:max-w-2xl">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-brand-400" />
            <span className="truncate text-[11px] font-medium" title={storeAddress}>
              {shortAddress}
            </span>
          </div>

          {/* Contact Details & WhatsApp */}
          <div className="flex items-center gap-3 sm:gap-5 font-semibold text-[11px] shrink-0 ml-auto sm:ml-0">
            <a
              href="tel:+919737474672"
              className="flex items-center gap-1 hover:text-brand-300 transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-brand-400" /> Call: {storePhone}
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-0.5 rounded-full transition-colors font-bold"
            >
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </a>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Plain Discreet Shipping
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4 sm:gap-8">
          {/* Logo Only (Text removed as it's already inside logo graphic) */}
          <Link to="/" className="flex items-center group shrink-0 py-1">
            <img
              src="/logo.png"
              alt="Janki Jiyana House Logo"
              className="h-12 sm:h-16 lg:h-20 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl relative mx-2">
            <input
              type="text"
              placeholder="Search kids wear, toys, diapers, sanitary pads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/90 rounded-full py-2.5 pl-4 pr-10 text-xs font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 top-1.5 bg-brand-600 hover:bg-brand-700 text-white p-1.5 rounded-full transition-colors shadow-sm"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick Navigation Links */}
            <Link
              to="/shop"
              className="hidden lg:inline-flex text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors px-2.5 py-1"
            >
              All Products
            </Link>
            <Link
              to="/contact"
              className="hidden lg:inline-flex text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors px-2.5 py-1"
            >
              Contact Us
            </Link>

            {/* Direct WhatsApp CTA Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Order</span>
            </a>

            {/* Auth status / Profile Dropdown */}
            {user ? (
              <div className="relative group" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors text-xs font-bold"
                >
                  <User className="w-5 h-5 text-brand-600 shrink-0" />
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
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
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
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

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              aria-label="My Wishlist"
              title="My Wishlist"
              className="relative bg-rose-50 hover:bg-rose-100 p-2 sm:p-2.5 rounded-2xl text-rose-600 transition-colors flex items-center gap-1.5"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-rose-500 text-rose-500" />
              {wishlistCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] sm:text-xs font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

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
              placeholder="Search kids wear, toys, diapers, pads..."
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

      {/* Sub-Header Navigation Links for Desktop */}


      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-5 space-y-4 shadow-2xl">
          {/* Quick Contact Header in Drawer */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <p className="font-medium text-[11px] leading-tight">{storeAddress}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <a
                href="tel:+919737474672"
                className="flex items-center gap-1 text-slate-900 font-bold text-xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-brand-600" /> {storePhone}
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 bg-emerald-600 text-white font-bold text-[11px] px-3 py-1 rounded-full"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            </div>
          </div>

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

