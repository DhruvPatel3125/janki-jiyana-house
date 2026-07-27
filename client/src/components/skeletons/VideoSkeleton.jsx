import React from 'react';

export const VideoSkeleton = () => {
  return (
    <div className="flex-shrink-0 w-[240px] sm:w-[270px] aspect-[9/16] rounded-3xl overflow-hidden shadow-xl border-4 border-white relative bg-slate-900 flex flex-col justify-between p-3">
      {/* Top Header Pill Shimmer */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-800/80 border border-slate-700/50">
        <div className="w-7 h-7 rounded-xl shimmer-dark shrink-0"></div>
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-3/4 shimmer-dark rounded-md"></div>
          <div className="h-2 w-1/2 shimmer-dark rounded-md"></div>
        </div>
      </div>

      {/* Center Play Icon Shimmer */}
      <div className="self-center w-12 h-12 rounded-full shimmer-dark"></div>

      {/* Bottom Title Bar Shimmer */}
      <div className="space-y-1.5 p-2 bg-slate-800/80 rounded-2xl border border-slate-700/50">
        <div className="h-3 w-full shimmer-dark rounded-md"></div>
        <div className="h-3 w-2/3 shimmer-dark rounded-md"></div>
      </div>
    </div>
  );
};
