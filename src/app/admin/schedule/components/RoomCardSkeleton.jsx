const RoomCardSkeleton = () => (
    <div className="rounded-lg border-2 border-gray-300 dark:border-gray-700 flex flex-col overflow-hidden">
        <div className="px-2 py-1 h-[33px] flex justify-between items-center border-b-2 bg-gray-200 dark:bg-gray-800 animate-pulse">
            <div className="h-4 w-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-3 w-3 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="flex-grow p-2 min-h-[100px] bg-white dark:bg-gray-900 animate-pulse"></div>
    </div>
);

export default RoomCardSkeleton;