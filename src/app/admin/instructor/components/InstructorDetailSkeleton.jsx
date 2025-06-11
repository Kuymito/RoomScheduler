const InstructorDetailSkeleton = () => {

  // A reusable component for a single form field (label + input)
  // This is very useful for form-heavy pages like this one.
  const SkeletonFormField = () => (
    <div className="flex-1 min-w-[200px] space-y-2">
      <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/3"></div>
      <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
    </div>
  );

  return (
    <div className='p-6 animate-pulse'>
      {/* Page Header Skeleton */}
      <div className="h-7 w-40 bg-slate-300 dark:bg-slate-600 rounded"></div>
      <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-8" />

      <div className="profile-section flex gap-8 flex-wrap">
        {/* Left Column: Avatar Card Skeleton */}
        <div className="avatar-card w-[220px] h-[130px] p-3 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg flex-shrink-0">
            <div className="flex">
                <div className="w-14 h-14 rounded-full bg-slate-300 dark:bg-slate-600 mr-3"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-5 bg-slate-300 dark:bg-slate-600 rounded"></div>
                    <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
                </div>
            </div>
            <div className="h-9 mt-3 bg-slate-300 dark:bg-slate-600 rounded-md"></div>
        </div>

        {/* Right Column: Info Cards Skeleton */}
        <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
          {/* General Info Card Skeleton */}
          <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
            <div className="h-6 w-48 bg-slate-300 dark:bg-slate-600 rounded mb-5"></div>
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap"><SkeletonFormField /><SkeletonFormField /></div>
              <div className="flex gap-3 flex-wrap"><SkeletonFormField /><SkeletonFormField /></div>
              <div className="flex gap-3 flex-wrap"><SkeletonFormField /><SkeletonFormField /></div>
              <div className="flex gap-3 flex-wrap"><SkeletonFormField /><SkeletonFormField /></div>
            </div>
            <div className="flex justify-end items-center gap-3 mt-6">
              <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
              <div className="h-8 w-28 bg-slate-400 dark:bg-slate-500 rounded-md"></div>
            </div>
          </div>
          
          {/* Password Card Skeleton */}
           <div className="info-card-password p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
             <div className="h-6 w-52 bg-slate-300 dark:bg-slate-600 rounded mb-5"></div>
             <div className="space-y-4">
                <div className="flex gap-3 flex-wrap"><SkeletonFormField /><SkeletonFormField /></div>
                <div className="flex gap-3 flex-wrap"><SkeletonFormField /></div>
             </div>
             <div className="flex justify-end items-center gap-3 mt-6">
                <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                <div className="h-8 w-36 bg-slate-400 dark:bg-slate-500 rounded-md"></div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetailSkeleton;