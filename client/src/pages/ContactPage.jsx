import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, ShieldCheck } from 'lucide-react';

export const ContactPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* High-Contrast Header */}
      <div
        className="text-white rounded-3xl p-8 sm:p-12 text-center space-y-3 shadow-xl border border-slate-700/50"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0d9488 100%)' }}
      >
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Contact Janki Jiyana House</h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-medium">
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
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Customer Helpline</h3>
              <p className="text-xs text-slate-500 mt-1">Call us directly for order tracking or wholesale bulk inquiry.</p>
              <p className="font-bold text-slate-800 text-sm mt-2">+91 98765 43210</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Email Support</h3>
              <p className="text-xs text-slate-500 mt-1">Email our support team for bulk quotes & distributor inquiries.</p>
              <p className="font-bold text-slate-800 text-sm mt-2">dhruvjpatel5@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Operating Hours & Physical Store Location */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">Visit Our Store or Reach Out</h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              We specialize in premium baby care (diaper pants, wet wipes) and personal hygiene products (sanitary napkins, adult pull-ups). All orders are packed in 100% plain, unbranded boxes for total privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" /> Physical Store Address
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Janki Jiyana House<br />
                Near Main Market,<br />
                Gujarat, India - 380001
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" /> Store Operating Hours
              </h4>
              <div className="text-xs text-slate-600 space-y-1 font-medium">
                <p>Monday – Saturday: 9:00 AM – 8:00 PM</p>
                <p>Sunday: 10:00 AM – 4:00 PM</p>
                <p className="text-emerald-600 font-bold mt-2 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Online Website Open 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
