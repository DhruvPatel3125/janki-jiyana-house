import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';

export const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  const faqs = [
    {
      category: 'quality',
      question: 'Are CIAZA sanitary pads & baby diapers 100% rash-free for sensitive skin?',
      answer: 'Yes! All CIAZA personal hygiene products are crafted with ultra-soft breathable cotton topsheets, anion chips for odour control, and dermatologically tested rash-free materials. They keep your skin dry, fresh, and comfortable even during heavy flow or full-day usage.'
    },
    {
      category: 'ordering',
      question: 'Can I order directly on WhatsApp or Call?',
      answer: 'Yes, absolutely! You can place orders directly on WhatsApp by clicking the WhatsApp Order button or calling us at +91 97374 74672. Our Surat team will quickly assist you with product selection and order placement.'
    },
    {
      category: 'sizing',
      question: 'How do I choose the right size for Baby Diapers or Adult Pull-Up Pants?',
      answer: 'Every product page has a detailed size & weight recommendation table (e.g., NB, Small, Medium, Large, XL, XXL). If you are between two size ranges, we recommend picking the larger size for extra stretch comfort and leak prevention.'
    },
    {
      category: 'returns',
      question: 'What is your return & replacement policy?',
      answer: 'Due to strict personal hygiene and health safety standards, general returns are not accepted. However, if you receive a damaged, defective, or wrong item, we provide a 100% free replacement! Please inform us within 48 hours of delivery with photos/unboxing video on WhatsApp (+91 97374 74672).'
    },
    {
      category: 'payment',
      question: 'What payment options are available? Is Cash on Delivery (COD) available?',
      answer: 'We accept 100% secure online payments via UPI (Google Pay, PhonePe, Paytm, QR Code scan), Debit/Credit Cards, and Net Banking. Please note that Cash on Delivery (COD) is not supported; all orders are fulfilled via fast 100% secure online prepaid payments.'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'quality', label: 'Quality & Safety' },
    { id: 'returns', label: 'Returns & Policy' },
    { id: 'ordering', label: 'Ordering & Support' }
  ];

  const filteredFaqs = activeTab === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeTab);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-[1600px] mx-auto px-3 sm:px-8 lg:px-12 py-4 sm:py-6">
      <div className="bg-gradient-to-b from-slate-50/90 via-white to-slate-50/60 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 border border-slate-200/80 shadow-xs relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3 mb-6 sm:mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border border-brand-100/60">
            <HelpCircle className="w-3.5 h-3.5 text-brand-600 shrink-0" /> Got Questions?
          </span>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium px-2">
            Everything you need to know about our hygiene products, rash-free quality, returns & sizing.
          </p>
        </div>

        {/* Category Filter Pills (Scrollable on Mobile) */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 pb-2 mb-6 sm:mb-8 -mx-2 px-2 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                setOpenIndex(0);
              }}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border shrink-0 ${
                activeTab === cat.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto space-y-2.5 sm:space-y-3.5">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-brand-400/70 shadow-sm ring-1 ring-brand-100'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-4 py-3.5 sm:px-6 sm:py-4.5 text-left flex items-center justify-between gap-3 sm:gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-slate-900 text-xs sm:text-sm lg:text-base leading-snug pr-1">
                    {faq.question}
                  </span>
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? 'bg-brand-600 text-white rotate-180 shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-6 sm:pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-2.5 sm:pt-3">
                    <p className="font-medium text-slate-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Responsive Help Banner Box below FAQs */}
        <div className="mt-8 sm:mt-10 max-w-3xl mx-auto bg-gradient-to-r from-brand-600 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-0.5 sm:space-y-1 text-center sm:text-left">
            <h3 className="font-extrabold text-xs sm:text-sm lg:text-base flex items-center justify-center sm:justify-start gap-2">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" /> Have more questions?
            </h3>
            <p className="text-[11px] sm:text-xs text-brand-100 font-medium">
              Our Surat customer care team is available to assist you on WhatsApp.
            </p>
          </div>
          <a
            href="https://wa.me/919737474672?text=Hello%20Janki%20Jiyana%20House,%20I%20have%20a%20question"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-brand-700 font-extrabold text-xs px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl shadow-xs transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};
