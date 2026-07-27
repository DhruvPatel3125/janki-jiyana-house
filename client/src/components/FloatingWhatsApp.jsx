import React from 'react';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp = () => {
  const storePhone = "9824934361";
  const whatsappUrl = `https://wa.me/91${storePhone}?text=Hello%20Janki%20Jiyana%20House,%20I%20want%20to%20inquire%20about%20products`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white"
    >
      <MessageCircle className="w-6 h-6 shrink-0 text-white animate-bounce" />
      <span className="hidden sm:inline font-bold text-xs pr-1">
        Need Help? Chat on WhatsApp
      </span>
      <span className="absolute -top-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        WhatsApp: +91 98249 34361
      </span>
    </a>
  );
};
