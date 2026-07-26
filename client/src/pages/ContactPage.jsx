import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, ShieldCheck } from 'lucide-react';

export const ContactPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-teal-600 text-white rounded-3xl p-8 sm:p-12 text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Contact Janki Jiyana House</h1>
        <p className="text-brand-100 text-sm max-w-xl mx-auto">
          Need assistance selecting the right diaper size or sanitary product? Speak directly with our shop caregivers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Cards Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Direct WhatsApp Order</h3>
              <p className="text-xs text-slate-500 mt-1">Instant support and order booking via WhatsApp.</p>
              <a
                href="https://wa.me/919876543210?text=Hello%20Janki%20Jiyana%20House,%20I%20need%20product%20help"
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Chat on WhatsApp (+91 98765 43210)
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Phone Call Support</h3>
              <p className="text-xs text-slate-500 mt-1">Available 9:00 AM – 8:00 PM IST (Mon-Sat).</p>
              <a href="tel:+919876543210" className="inline-block mt-2 font-bold text-slate-900 text-sm hover:underline">
                +91 98765 43210
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Store Address</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Janki Jiyana House, 123 Care Street, Near Ring Road, Surat, Gujarat - 395003, India.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900">Send Us a Direct Message</h2>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully! We will contact you shortly.'); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Category of Interest</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500">
                <option>Sanitary Pads & Female Care</option>
                <option>Adult Care Diapers & Underwear</option>
                <option>Children Diaper Pants & Taped</option>
                <option>Baby Care & Pure Wipes</option>
                <option>Bulk Order Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Message or Inquiry</label>
              <textarea
                rows={4}
                required
                placeholder="Ask about size recommendations, delivery time, or discreet packaging..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all text-sm"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
