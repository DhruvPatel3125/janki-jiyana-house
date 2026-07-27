import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, ShieldAlert } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md mx-auto">
        {/* Large 404 Number */}
        <div className="relative">
          <h1 className="text-[120px] sm:text-[160px] font-black text-slate-200 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-brand-50 border-2 border-brand-200 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 text-brand-600" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Page Not Found
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
            The page you are looking for doesn't exist or has been moved. Please check the URL and try again.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Home className="w-4 h-4" /> Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-2xl font-bold text-sm border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
