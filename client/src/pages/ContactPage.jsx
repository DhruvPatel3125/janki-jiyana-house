import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, ShieldCheck, Instagram, Facebook, Youtube, Share2 } from 'lucide-react';

export const ContactPage = () => {
  const storeAddress = "G-8-9 Apple Square, Near, Lajamni Chowk, Maruti Dham Society, Mota Varachha, Surat, Gujarat 394101, India.";
  const storePhone = "+91 98249 34361";
  const whatsappUrl = "https://wa.me/919824934361?text=Hello%20Janki%20Jiyana%20House,%20I%20need%20product%20help";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* High-Contrast Header */}
      <div
        className="text-white rounded-3xl p-8 sm:p-12 text-center space-y-3 shadow-xl border border-slate-700/50"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0d9488 100%)' }}
      >
        <div className="flex justify-center mb-2">
          <img
            src="/logo.png"
            alt="Janki Jiyana House"
            className="h-16 w-auto object-contain bg-white/95 p-2 rounded-2xl shadow-lg"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Contact Janki Jiyana House</h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-medium">
          New Born & Kids Wear, Toys, Diapers & Hygiene Store in Surat. Speak directly with us or chat on WhatsApp!
        </p>
      </div>

      <div className="space-y-8">
        {/* Top Row: Quick Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Direct WhatsApp Order */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">WhatsApp Order</h3>
              <p className="text-xs text-slate-500 mt-1">Instant support & booking.</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Chat Now
              </a>
            </div>
          </div>

          {/* Customer Helpline */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Customer Helpline</h3>
              <p className="text-xs text-slate-500 mt-1">Call for orders & inquiries.</p>
              <a href="tel:+919824934361" className="font-bold text-brand-600 text-sm mt-3 block hover:underline">
                {storePhone}
              </a>
            </div>
          </div>

          {/* Email Support */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Email Support</h3>
              <p className="text-xs text-slate-500 mt-1">For bulk quotes & distributors.</p>
              <a href="mailto:dhruvjpatel5@gmail.com" className="font-bold text-slate-800 text-sm mt-3 block hover:underline">
                dhruvjpatel5@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Row: Location & Policies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Middle: Store Visit */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-slate-900">Visit Our Store in Surat</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                We offer premium kids wear, toys, baby care items (diaper pants, wet wipes), and personal hygiene products (sanitary napkins, adult pull-ups). Fast delivery and WhatsApp Orders available!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600 shrink-0" /> Physical Store Address
                </h4>
                <a href="https://maps.app.goo.gl/sSd4z5fBGNXG1VFX9" target="_blank" rel="noreferrer" className="block text-sm text-slate-700 leading-relaxed font-semibold hover:text-teal-600 transition-colors">
                  Janki Jiyana House<br />
                  {storeAddress}
                </a>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600 shrink-0" /> Store Operating Hours
                </h4>
                <div className="text-sm text-slate-600 space-y-1.5 font-medium">
                  <p>Mon – Sat: <span className="text-slate-800">9:00 AM – 9:00 PM</span></p>
                  <p>Sunday: <span className="text-slate-800">10:00 AM – 6:00 PM</span></p>
                  <p className="text-emerald-600 font-bold mt-3 flex items-center gap-1.5 bg-emerald-50 w-fit px-3 py-1 rounded-lg">
                    <ShieldCheck className="w-4 h-4" /> Online Store Open 24/7
                  </p>
                </div>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200">
              <iframe
                src="https://maps.google.com/maps?q=Janki%20Jiyana%20House,%20Mota%20Varachha,%20Surat&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store Location Map"
              ></iframe>
            </div>
          </div>

          {/* Right: Social & Policy */}
          <div className="space-y-6">
            {/* Social Media Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Connect With Us</h3>
              </div>
              <p className="text-xs text-slate-500 mb-5">Follow us on social media for the latest updates, new arrivals, and special offers.</p>
              <div className="flex items-center gap-4">
                <a href="https://www.instagram.com/reel/DXyJh7DsEbN/?igsh=NDQ3Z2xoN2V4Z2o5" target="_blank" rel="noreferrer" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-white hover:bg-pink-600 hover:shadow-lg hover:shadow-pink-600/20 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.facebook.com/share/16p98Xcoiy/" target="_blank" rel="noreferrer" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/20 transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://youtube.com/@jankijiyanahouse?si=_FMqOxSHBMzx5PgJ" target="_blank" rel="noreferrer" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-600/20 transition-all">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Cancellation & Refund Policy Card */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-3xl border border-slate-200/60 shadow-sm text-xs">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" /> Order Policy
              </h4>
              <p className="text-slate-600 leading-relaxed mb-3">
                Want to cancel an order or request a return? Use the <strong>"Cancel / Return"</strong> button on <span className="font-bold text-brand-600">My Orders</span> page.
              </p>
              <ul className="text-slate-500 space-y-2">
                <li className="flex gap-2">
                  <span className="text-slate-300">•</span>
                  <span><strong>WhatsApp Orders:</strong> Instantly cancelled with zero fees via message.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-300">•</span>
                  <span><strong>Prepaid Orders:</strong> Refund credited back within 5–7 business days.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

