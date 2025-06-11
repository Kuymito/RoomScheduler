const ClassListSkeleton = () => (
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

export default ClassListSkeleton;