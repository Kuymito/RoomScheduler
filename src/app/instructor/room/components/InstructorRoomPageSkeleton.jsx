// src/app/instructor/room/components/InstructorRoomPageSkeleton.jsx

const RoomCardSkeleton = () => (
    <div className="h-[90px] sm:h-[100px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md animate-pulse">
        <div className="h-[30px] bg-slate-100 dark:bg-slate-700 rounded-t-md border-b border-slate-200 dark:border-slate-600"></div>
        <div className="p-2 flex flex-col justify-center items-center gap-2">
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
        </div>
    </div>
);

const RoomDetailsSkeleton = () => (
    <div className="flex flex-col items-start gap-6 w-full animate-pulse">
        <div className="flex flex-col items-start self-stretch w-full flex-grow">
            <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md">
                {/* 5 detail rows */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`flex flex-row items-center self-stretch w-full min-h-[56px] ${i < 4 ? 'border-b border-slate-200 dark:border-slate-700' : ''}`}>
                        <div className="p-3 sm:p-4 w-[100px] sm:w-[120px]">
                            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        </div>
                        <div className="px-2 sm:px-3 flex-1 py-2">
                            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="h-[48px] sm:h-[50px] w-full bg-slate-300 dark:bg-slate-700 rounded-md"></div>
    </div>
);


const InstructorRoomPageSkeleton = () => {
    return (
        <div className="p-4 sm:p-6 min-h-full animate-pulse">
            {/* Page Header Skeleton */}
            <div className="mb-4 w-full">
                <div className="h-7 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
                <hr className="border-t border-slate-300 dark:border-slate-700 mt-3" />
            </div>

            {/* Main Controls Skeleton */}
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row items-center justify-between border-b dark:border-gray-600 pb-3 gap-4">
                    <div className="h-10 w-full sm:w-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex-grow sm:flex-grow-0" style={{minWidth: '300px'}}></div>
                    <div className="h-10 w-full sm:w-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                    <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Panel (Room List) Skeleton */}
                <div className="flex-1 min-w-0">
                    <div className="space-y-4">
                        {[...Array(2)].map((_, i) => ( // Create 2 floor sections
                            <div key={i} className="space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                    <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                                </div>
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 sm:gap-4">
                                    {[...Array(4)].map((_, j) => ( // 4 rooms per floor
                                        <RoomCardSkeleton key={j} />
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
                        <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                    </div>
                    <div className="flex flex-col items-start gap-6 w-full min-h-[420px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
                        <RoomDetailsSkeleton />
                    </div>
                </div>
            </div>
        </div>
    );
};
// Add a static property to the skeleton component to namespace the sub-components
InstructorRoomPageSkeleton.RoomDetailsSkeleton = RoomDetailsSkeleton;

export default InstructorRoomPageSkeleton;