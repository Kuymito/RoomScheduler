const ClassDetailSkeleton = () => {

  // A small, reusable component for a single form field (label + input)
  const SkeletonFormField = () => (
    <div className="flex-1 min-w-[200px] space-y-2">
      <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/3"></div>
      <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
    </div>
  );

  return (
    <div className='p-6 animate-pulse'>
      {/* Page Header Skeleton */}
      <div className="h-7 w-32 bg-slate-300 dark:bg-slate-600 rounded"></div>
      <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-8" />

      {/* Main Details Card Skeleton */}
      <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
        {/* Card Header */}
        <div className="h-6 w-48 bg-slate-300 dark:bg-slate-600 rounded mb-5"></div>
        
        {/* Form Fields Skeleton */}
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <SkeletonFormField />
            <SkeletonFormField />
          </div>
          <div className="flex gap-3 flex-wrap">
            <SkeletonFormField />
            <SkeletonFormField />
          </div>
          <div className="flex gap-3 flex-wrap">
            <SkeletonFormField />
            <SkeletonFormField />
          </div>
           <div className="flex gap-3 flex-wrap">
            <SkeletonFormField />
            <SkeletonFormField />
          </div>
        </div>
        
        {/* Action Buttons Skeleton */}
        <div className="flex justify-end items-center gap-3 mt-6">
          <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
          <div className="h-8 w-28 bg-slate-400 dark:bg-slate-500 rounded-md"></div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailSkeleton;