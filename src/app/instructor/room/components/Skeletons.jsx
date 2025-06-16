// A simple container for all skeleton components

const RoomDetailsSkeleton = () => (
    <div className="w-full animate-pulse">
        <div className="space-y-3">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        </div>
    </div>
);

const InstructorRoomPageSkeleton = () => (
    <div className="p-4 sm:p-6 min-h-full animate-pulse">
        <div className="mb-4">
            <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-1/4"></div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-3" />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
                {/* Skeleton for room grid */}
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full mb-4"></div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-[100px] bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                    ))}
                </div>
            </div>
            <div className="w-full lg:w-[320px] shrink-0">
                {/* Skeleton for details panel */}
                <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="p-4 rounded-lg shadow-lg bg-white dark:bg-slate-800 min-h-[420px]">
                    <RoomDetailsSkeleton />
                </div>
            </div>
        </div>
    </div>
);

// Add the named export
InstructorRoomPageSkeleton.RoomDetailsSkeleton = RoomDetailsSkeleton;

export default InstructorRoomPageSkeleton;