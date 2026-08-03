import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, Mail, MapPin, Heart, MessageCircle, Instagram, Facebook, Youtube, AtSign } from 'lucide-react';

export const Footer = () => {
  const storeAddress = "G-8-9 Apple Square, Near, Lajamni Chowk, Maruti Dham Society, Mota Varachha, Surat, Gujarat 394101, India.";
  const storePhone = "+91 97374 74672";
  const whatsappUrl = "https://wa.me/919737474672?text=Hello%20Janki%20Jiyana%20House,%20I%20have%20an%20inquiry";

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-slate-800">
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
                <Link to="/shop?category=Kids Wear" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-brand-400 transition-colors">
                  New Born & Kids Wear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Toys" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-brand-400 transition-colors">
                  Kids Toys & Games
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Children Diapers" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-brand-400 transition-colors">
                  Children Diapers & Pull-ups
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Sanitary Pads" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-brand-400 transition-colors">
                  Sanitary Pads & Hygiene
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Adult Diapers" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-brand-400 transition-colors">
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
                <Link to="/shop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-brand-400 transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link to="/cart" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-brand-400 transition-colors">
                  View Cart
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-brand-400 transition-colors">
                  Contact Us & Store Location
                </Link>
              </li>
              <li>
                <Link to="/login" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-brand-400 transition-colors">
                  Customer Login
                </Link>
              </li>
              <li>
                <Link to="/terms" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-brand-400 transition-colors">
                  Terms & Return Policy
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
                <div className="flex flex-col gap-1.5">
                  <a href="https://maps.app.goo.gl/sSd4z5fBGNXG1VFX9" target="_blank" rel="noreferrer" className="leading-relaxed hover:text-white transition-colors">
                    {storeAddress}
                  </a>
                  <a href="https://maps.app.goo.gl/sSd4z5fBGNXG1VFX9" target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-2 w-max inline-flex items-center gap-1">
                    View on Map
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-400 shrink-0" />
                <a href="tel:+919737474672" className="hover:text-white font-semibold">
                  {storePhone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-400 shrink-0" />
                <a href="mailto:jdvekariya717@gmail.com" className="hover:text-white">
                  jdvekariya717@gmail.com
                </a>
              </li>
            </ul>
          </div>

        {/* Connect With Us Section */}
        <div className="py-8 border-b border-slate-800 col-span-full">
          <h4 className="text-white font-semibold text-base mb-5">Connect With Us</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <a 
              href="https://www.facebook.com/share/18xWrU44Zw/" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white py-2.5 px-4 rounded-lg font-medium transition-transform hover:-translate-y-1 shadow-sm text-sm"
            >
              <Facebook className="w-5 h-5" /> Facebook
            </a>
            
            <a 
              href="https://www.instagram.com/janki_jiyana_house_?igsh=MnA0amg3eDRod2R4" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-90 text-white py-2.5 px-4 rounded-lg font-medium transition-transform hover:-translate-y-1 shadow-sm text-sm"
            >
              <Instagram className="w-5 h-5" /> Instagram
            </a>
<a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white py-2.5 px-4 rounded-lg font-medium transition-transform hover:-translate-y-1 shadow-sm text-sm"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </a>
            <a 
              href="https://youtube.com/@jankijiyanahouse?si=Vi_756cIXjOy9I1c" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#FF0000]/90 text-white py-2.5 px-4 rounded-lg font-medium transition-transform hover:-translate-y-1 shadow-sm text-sm"
            >
              <Youtube className="w-5 h-5" /> YouTube
            </a>

            <a 
              href="https://www.threads.com/@janki_jiyana_house_" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#222222] border border-slate-700 text-white py-2.5 px-4 rounded-lg font-medium transition-transform hover:-translate-y-1 shadow-sm text-sm"
            >
              <AtSign className="w-5 h-5" /> Threads
            </a>

            
          </div>
        </div>
        </div>

        {/* Footer bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Janki Jiyana House. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <p className='text-slate-500 font-bold font-inter justify-center'>Develop by DJ PATEL</p>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Secure Checkout
            </span>
            <span>WhatsApp Orders Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

