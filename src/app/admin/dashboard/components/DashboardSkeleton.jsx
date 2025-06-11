const DashboardSkeleton = () => {
    
  // A small, reusable component for a single stat card skeleton
  const SkeletonStatCard = () => (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow animate-pulse">
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
      <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
    </div>
  );

  return (
    // We don't need the DashboardLayout here, as the skeleton will be placed inside it.
    // The main page component will handle the layout.
    <>
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <div className="flex justify-between items-start bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow mb-6">
            <div className="w-2/3">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-5/6"></div>
            </div>
            <div className="w-1/4 flex flex-col items-end gap-2">
                 <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                 <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            </div>
        </div>
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
      
      {/* Chart Section Skeleton */}
      <div className="mt-6 grid grid-cols-1 gap-6 animate-pulse">
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-9 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          </div>
          <div className="h-64 sm:h-72 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        </div>
      </div>
    </>
  );
};

export default DashboardSkeleton;