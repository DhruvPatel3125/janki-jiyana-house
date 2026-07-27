import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, ShieldCheck } from 'lucide-react';

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Cards Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Direct WhatsApp Order</h3>
              <p className="text-xs text-slate-500 mt-1">Instant support, product details & order booking on WhatsApp.</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Chat on WhatsApp ({storePhone})
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Customer Helpline</h3>
              <p className="text-xs text-slate-500 mt-1">Call us directly for orders, size inquiries, or bulk quotes.</p>
              <a href="tel:+919824934361" className="font-bold text-brand-600 text-sm mt-2 block hover:underline">
                {storePhone}
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Email Support</h3>
              <p className="text-xs text-slate-500 mt-1">Email our team for bulk quotes & distributor inquiries.</p>
              <a href="mailto:dhruvjpatel5@gmail.com" className="font-bold text-slate-800 text-sm mt-2 block hover:underline">
                dhruvjpatel5@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Operating Hours & Physical Store Location */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">Visit Our Store in Surat</h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              We offer premium kids wear, toys, baby care items (diaper pants, wet wipes), and personal hygiene products (sanitary napkins, adult pull-ups). Fast delivery and COD available!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" /> Physical Store Address
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                Janki Jiyana House<br />
                {storeAddress}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600 shrink-0" /> Store Operating Hours
              </h4>
              <div className="text-xs text-slate-600 space-y-1 font-medium">
                <p>Monday – Saturday: 9:00 AM – 9:00 PM</p>
                <p>Sunday: 10:00 AM – 6:00 PM</p>
                <p className="text-emerald-600 font-bold mt-2 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Online Store Open 24/7
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation & Refund Policy Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" /> Order Cancellation & Refund Policy
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Want to cancel an order or request a return? Simply click the <strong>"Cancel / Return"</strong> button on your <span className="font-bold text-brand-600">My Orders</span> page or message us on WhatsApp at <strong>{storePhone}</strong>.
            </p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              • <strong>COD Orders:</strong> Instantly cancelled with zero fees.<br />
              • <strong>Prepaid Orders (Razorpay):</strong> Cancelled immediately & refund credited back to your original bank/UPI account within 5–7 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

