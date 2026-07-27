import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '../utils/toast';

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      showSuccessToast('Internet connection restored! You are back online.');
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      showErrorToast('Internet connection lost. Please check your network.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300">
      {!isOnline ? (
        <div className="bg-rose-600 text-white text-xs font-bold py-2.5 px-4 shadow-lg flex items-center justify-center gap-2 animate-bounce">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You are currently offline. Please check your internet connection.</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-2 bg-white/20 hover:bg-white/30 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      ) : (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 shadow-lg flex items-center justify-center gap-2">
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Internet connection restored! Back online.</span>
        </div>
      )}
    </div>
  );
};

export default OfflineBanner;
