import React from 'react';

export const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 space-y-4 shadow-sm flex flex-col justify-between h-full overflow-hidden">
      {/* Image Skeleton */}
      <div className="w-full aspect-square rounded-xl shimmer-effect border border-slate-100"></div>

      {/* Text Lines Skeletons */}
      <div className="space-y-2.5">
        <div className="h-3 w-1/3 shimmer-effect rounded-full"></div>
        <div className="h-4 w-full shimmer-effect rounded-md"></div>
        <div className="h-4 w-2/3 shimmer-effect rounded-md"></div>

        {/* Rating Line */}
        <div className="h-3 w-1/4 shimmer-effect rounded-full mt-2"></div>
      </div>

      {/* Price & CTA Button Skeletons */}
      <div className="space-y-3 pt-2">
        <div className="h-6 w-1/2 shimmer-effect rounded-md"></div>
        <div className="h-10 w-full shimmer-effect rounded-xl"></div>
      </div>
    </div>
  );
};
