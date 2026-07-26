import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, Mail, MapPin, Heart, MessageCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
                JJ
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Janki Jiyana <span className="text-brand-400">House</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your trusted shop for premium baby care products, children diapers, adult care diapers, and gentle sanitary pads. Quality hygiene delivered with 100% privacy.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/919876543210?text=Hello%20Janki%20Jiyana%20House,%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Order on WhatsApp
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Product Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/shop?category=Sanitary Pads" className="hover:text-brand-400 transition-colors">
                  Sanitary Pads & Hygiene
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Adult Diapers" className="hover:text-brand-400 transition-colors">
                  Adult Care Diapers & Pants
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Children Diapers" className="hover:text-brand-400 transition-colors">
                  Children Diapers & Pull-ups
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Baby Items" className="hover:text-brand-400 transition-colors">
                  Baby Care & Wipes
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/shop" className="hover:text-brand-400 transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-brand-400 transition-colors">
                  View Cart
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-400 transition-colors">
                  Contact Us & Store Location
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  Customer Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Get In Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <span>123 Care Street, Ring Road, Surat, Gujarat - 395003</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-400 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-400 shrink-0" />
                <a href="mailto:support@jankijiyana.com" className="hover:text-white">
                  support@jankijiyana.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Janki Jiyana House. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Secure Checkout
            </span>
            <span>Cash on Delivery Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
