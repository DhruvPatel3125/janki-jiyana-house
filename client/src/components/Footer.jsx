import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, Mail, MapPin, Heart, MessageCircle } from 'lucide-react';

export const Footer = () => {
  const storeAddress = "G-8-9 Apple Square, Near, Lajamni Chowk, Maruti Dham Society, Mota Varachha, Surat, Gujarat 394101, India.";
  const storePhone = "+91 98249 34361";
  const whatsappUrl = "https://wa.me/919824934361?text=Hello%20Janki%20Jiyana%20House,%20I%20have%20an%20inquiry";

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Janki Jiyana House"
                className="h-12 w-auto object-contain bg-white/90 p-1.5 rounded-xl shadow-md"
              />
              <span className="font-bold text-lg text-white tracking-tight">
                Janki Jiyana <span className="text-brand-400">House</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your trusted store for new born & kids wear, toys, baby care products, children diapers, adult diapers, and gentle sanitary pads.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" /> Order on WhatsApp
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Product Categories</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/shop?category=Kids Wear" className="hover:text-brand-400 transition-colors">
                  New Born & Kids Wear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Toys" className="hover:text-brand-400 transition-colors">
                  Kids Toys & Games
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Children Diapers" className="hover:text-brand-400 transition-colors">
                  Children Diapers & Pull-ups
                </Link>
              </li>
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
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
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
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{storeAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-400 shrink-0" />
                <a href="tel:+919824934361" className="hover:text-white font-semibold">
                  {storePhone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-400 shrink-0" />
                <a href="mailto:dhruvjpatel5@gmail.com" className="hover:text-white">
                  dhruvjpatel5@gmail.com
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

