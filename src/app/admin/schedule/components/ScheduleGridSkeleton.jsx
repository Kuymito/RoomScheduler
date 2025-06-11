const ScheduleGridSkeleton = () => (
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

export default ScheduleGridSkeleton;