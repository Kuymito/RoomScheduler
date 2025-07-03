// A small, reusable component for a single room card skeleton
const SkeletonRoomCard = () => (
    <div className="h-[90px] sm:h-[100px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md animate-pulse">
        <div className="h-[30px] bg-slate-200 dark:bg-slate-700 rounded-t-md border-b border-slate-200 dark:border-slate-600"></div>
        <div className="p-2 flex flex-col justify-center items-center gap-2 mt-2">
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
        </div>
    </div>
);

// A reusable component for a single row in the details panel skeleton
const SkeletonDetailRow = () => (
    <div className="flex flex-row items-center w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700/50">
        <div className="p-4 w-[100px] sm:w-[120px]">
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
        </div>
        <div className="px-3 flex-1">
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
        </div>
    </div>
);

/**
 * A detailed skeleton loader that accurately mimics the RoomClientView layout.
 */
const RoomPageSkeleton = () => {
    return (
        <div className='p-4 sm:p-6 min-h-full animate-pulse'>
            {/* Page Header Skeleton */}
            <div className="mb-4 w-full">
                <div className="h-7 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
                <hr className="border-t border-slate-300/50 dark:border-slate-700/50 mt-3" />
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Panel (Room List) Skeleton */}
                <div className="flex-1 min-w-0">
                    {/* Controls Skeleton */}
                    <div className="flex flex-col sm:flex-row items-center justify-between border-b dark:border-gray-700/50 pb-3 gap-4 mb-4">
                        <div className="flex rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden w-full sm:w-auto h-9">
                            {/* Simulate 7 day buttons */}
                            {[...Array(7)].map((_, i) => <div key={i} className="w-12 h-full bg-slate-300 dark:bg-slate-600/50 border-r border-slate-200 dark:border-slate-700"></div>)}
                        </div>
                        <div className="h-9 w-full sm:w-48 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                    </div>

                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                        <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
                    </div>

                    {/* Room Grid Skeleton */}
                    <div className="space-y-4">
                        {[...Array(2)].map((_, i) => ( // Create 2 floor sections
                            <div key={i} className="space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                    <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
                                </div>
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 sm:gap-4">
                                    {[...Array(5)].map((_, j) => ( // 5 rooms per floor
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
                             {/* Simulate 6 detail rows */}
                            {[...Array(6)].map((_, i) => <SkeletonDetailRow key={i} />)}
                         </div>
                         <div className="w-full h-12 bg-slate-300 dark:bg-slate-600 rounded-md"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomPageSkeleton;