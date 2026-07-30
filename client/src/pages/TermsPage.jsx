import React from 'react';
import { ShieldCheck, Truck, RefreshCcw, Info } from 'lucide-react';

export const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Terms & Policies</h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">
          Please read these terms carefully before using our services. By using our website and purchasing our products, you agree to these terms.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Return Policy Section */}
        <div className="bg-rose-50/50 p-6 sm:p-8 rounded-3xl border border-rose-100 space-y-4">
          <div className="flex items-center gap-3 text-rose-600 mb-4">
            <RefreshCcw className="w-8 h-8" />
            <h2 className="text-2xl font-black">Return & Refund Policy</h2>
          </div>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
            At Janki Jiyana House, we prioritize the health, safety, and hygiene of our customers above all else.
          </p>
          <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm">
            <p className="text-rose-700 font-bold text-sm sm:text-base">
              Strict No-Return Policy on Hygiene Products:
            </p>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Due to the intimate and sanitary nature of our core products—including <strong>Baby Diapers, Sanitary Pads, Adult Diapers, and Period Panties</strong>—we <span className="font-bold underline underline-offset-2">do not accept returns or exchanges</span> once the product has been dispatched or delivered. This ensures that every customer receives 100% brand-new, untouched, and uncontaminated hygiene products.
            </p>
          </div>
          <div className="space-y-2 mt-4">
            <h3 className="font-bold text-slate-800">Exceptions (Damaged or Wrong Items):</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              If you receive a damaged, defective, or incorrect product, please contact our support team via WhatsApp within <strong>24 hours</strong> of delivery with clear unboxing photos/videos. We will verify the issue and arrange a replacement at no extra cost.
            </p>
          </div>
        </div>

        {/* Shipping Policy */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-brand-600 mb-4">
            <Truck className="w-7 h-7" />
            <h2 className="text-2xl font-black">Shipping & Delivery</h2>
          </div>
          <ul className="space-y-3 text-sm sm:text-base text-slate-600 list-disc list-inside">
            <li><strong>Discreet Packaging:</strong> All orders are shipped in 100% plain, unmarked brown boxes to ensure your complete privacy.</li>
            <li><strong>Processing Time:</strong> Orders are typically processed and dispatched within 1-2 business days.</li>
            <li><strong>Delivery Time:</strong> Standard delivery takes 3-7 business days depending on your location.</li>
            <li><strong>Payment Options:</strong> Secure online payment options and direct WhatsApp ordering are available for convenience.</li>
          </ul>
        </div>

        {/* Terms of Service */}
        <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 space-y-4">
          <div className="flex items-center gap-3 text-slate-800 mb-4">
            <ShieldCheck className="w-7 h-7" />
            <h2 className="text-2xl font-black">Terms of Service</h2>
          </div>
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>
              By accessing the website at Janki Jiyana House, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
            <p>
              <strong>Product Information:</strong> While we strive to provide accurate product descriptions, images, and pricing, errors may occur. We reserve the right to correct any errors and to change or update information at any time without prior notice.
            </p>
            <p>
              <strong>Pricing & Modifications:</strong> Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
            </p>
            <p>
              <strong>User Account:</strong> You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 space-y-4">
          <div className="flex items-center gap-3 text-slate-800 mb-4">
            <Info className="w-7 h-7" />
            <h2 className="text-2xl font-black">Privacy Policy</h2>
          </div>
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>
              Your privacy is extremely important to us. This privacy policy document outlines the types of personal information that is received and collected by Janki Jiyana House and how it is used.
            </p>
            <p>
              <strong>Information Collection:</strong> We collect information from you when you register on our site, place an order, or subscribe to our newsletter. This includes your name, email address, mailing address, and phone number.
            </p>
            <p>
              <strong>Information Usage:</strong> Any of the information we collect from you may be used to personalize your experience, improve our website, process transactions, or send periodic emails regarding your order or other products.
            </p>
            <p>
              <strong>Data Protection:</strong> We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
