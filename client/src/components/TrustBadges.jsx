import React from 'react';
import { Package, Truck, Banknote, ShieldCheck } from 'lucide-react';

export const TrustBadges = () => {
  const badges = [
    {
      icon: Package,
      title: '100% Discreet Packaging',
      description: 'Plain, unbranded boxes for maximum privacy & dignity.',
      bg: 'bg-teal-50 text-teal-600 border-teal-100',
    },
    {
      icon: Truck,
      title: 'Fast Doorstep Delivery',
      description: 'Quick shipping across India with order tracking.',
      bg: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      icon: Banknote,
      title: 'WhatsApp Ordering',
      description: 'Order directly and easily via WhatsApp.',
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Quality',
      description: 'Dermatologically tested & skin-friendly products.',
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
    },
  ];

  return (
    <section className="py-8 bg-white/60 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className={`p-3.5 rounded-2xl ${badge.bg} border shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{badge.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-normal">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
