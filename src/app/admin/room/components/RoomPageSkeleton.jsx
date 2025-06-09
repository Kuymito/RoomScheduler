const RoomPageSkeleton = () => {
  // A small, reusable component for a single room card skeleton
  const SkeletonRoomCard = () => (
    <div className="h-[90px] sm:h-[100px] bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
  );

  // A reusable component for a single row in the details panel
  const SkeletonDetailRow = () => (
    <div className="flex flex-row items-center w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700/50">
      <div className="p-4 w-[120px]">
        <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
      </div>
      <div className="px-3 flex-1">
        <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
      </div>
    </div>
  );

  return (
    <div className='p-4 sm:p-6 min-h-full animate-pulse'>
      {/* Page Header Skeleton */}
      <div className="mb-4 w-full">
        <div className="h-7 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
        <div className="h-px bg-slate-300 dark:bg-slate-700 mt-3" />
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel (Room List) Skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
          </div>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => ( // Create 2 floor sections
              <div key={i} className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-16 bg-slate-300 dark:bg-slate-600 rounded"></div>
                  <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
                </div>
                <div className="grid xl:grid-cols-5 lg:grid-cols-2 md:grid-cols-2 gap-3">
                  {[...Array(5)].map((_, j) => ( // Create 5 room cards per floor
                    <SkeletonRoomCard key={j} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel (Details) Skeleton */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="h-6 w-20 bg-slate-300 dark:bg-slate-600 rounded"></div>
            <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
          </div>
          <div className="flex flex-col items-start gap-6 w-full min-h-[420px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
             <div className="w-full border border-slate-200 dark:border-slate-700/50 rounded-md flex-grow">
                <SkeletonDetailRow />
                <SkeletonDetailRow />
                <SkeletonDetailRow />
                <SkeletonDetailRow />
                <SkeletonDetailRow />
             </div>
             <div className="w-full h-[50px] bg-slate-300 dark:bg-slate-600 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPageSkeleton;