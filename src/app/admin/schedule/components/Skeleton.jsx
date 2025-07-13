// src/app/admin/schedule/components/ClassListSkeleton.jsx
export const ClassListSkeleton = () => (
    <div className='w-full lg:w-[260px] xl:w-[300px] flex-shrink-0 p-4 bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-lg rounded-xl flex flex-col'>
        <div className="h-7 w-3/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-4 pb-2"></div>
        <div className="space-y-3 flex-grow overflow-y-auto pr-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
                    <div className="flex-grow space-y-2">
                        <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


// src/app/admin/schedule/components/RoomCardSkeleton.jsx
export const RoomCardSkeleton = () => (
    <div className="rounded-lg border-2 border-gray-300 dark:border-gray-700 flex flex-col overflow-hidden">
        <div className="px-2 py-1 h-[33px] flex justify-between items-center border-b-2 bg-gray-200 dark:bg-gray-800 animate-pulse">
            <div className="h-4 w-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-3 w-3 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="flex-grow p-2 min-h-[100px] bg-white dark:bg-gray-900 animate-pulse"></div>
    </div>
);


// src/app/admin/schedule/components/ScheduleGridSkeleton.jsx
export const ScheduleGridSkeleton = ({ gridDimensions = { rows: 4, cols: 6 } }) => (
     <div className='flex-1 p-4 sm:p-6 bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-xl rounded-xl flex flex-col overflow-y-auto'>
         {/* Header Skeleton */}
         <div className="flex flex-row items-center justify-between mb-4 border-b dark:border-gray-600 pb-3 animate-pulse">
             <div className="h-7 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
             <div className="flex gap-2">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-9 w-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>)}</div>
         </div>
         {/* Controls Skeleton */}
         <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 animate-pulse">
             <div className="h-6 w-56 bg-gray-300 dark:bg-gray-700 rounded"></div>
             <div className="flex items-center gap-4">
                 <div className="h-10 w-48 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                 <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
             </div>
         </div>
         {/* Grid Skeleton */}
         <div className="flex-grow flex flex-col gap-y-4">
             {Array.from({ length: gridDimensions.rows }).map((_, floorIndex) => (
                 <div key={floorIndex}>
                     <div className="flex items-center gap-2 mb-2 animate-pulse"><div className="h-5 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div><div className="h-px flex-1 bg-gray-300 dark:bg-gray-700"></div></div>
                     <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${gridDimensions.cols}, 1fr)`}}>
                         {Array.from({ length: gridDimensions.cols }).map((_, roomIndex) => <RoomCardSkeleton key={roomIndex} />)}
                     </div>
                 </div>
             ))}
         </div>
     </div>
);

// To use these, you would import them in your page.jsx like so:
// import { ClassListSkeleton, ScheduleGridSkeleton } from './components/skeletons';