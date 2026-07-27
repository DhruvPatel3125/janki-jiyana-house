import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDanger: true,
  });

  const [resolver, setResolver] = useState({ resolve: null });

  const confirm = useCallback((config = {}) => {
    return new Promise((resolve) => {
      setOptions((prev) => ({ ...prev, ...config }));
      setResolver({ resolve });
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver.resolve) resolver.resolve(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver.resolve) resolver.resolve(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Tailwind CSS Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Modal Container */}
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header / Icon */}
            <div className="p-6 pb-2 text-center">
              <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 shadow-inner ${
                options.isDanger ? 'bg-rose-50 text-rose-500' : 'bg-brand-50 text-brand-500'
              }`}>
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                {options.title}
              </h3>
            </div>

            {/* Body */}
            <div className="px-6 text-center">
              <p className="text-sm font-medium text-slate-500">
                {options.message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="p-6 flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors active:scale-95"
              >
                {options.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-3 text-white font-bold text-sm rounded-xl transition-colors shadow-md active:scale-95 ${
                  options.isDanger 
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' 
                    : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/20'
                }`}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);
