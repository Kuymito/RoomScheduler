import React from 'react'; // FIX: Added missing React import

const SkeletonCard = () => (
    <div className="w-full h-full p-2 bg-gray-200 dark:bg-gray-700/50 rounded-md animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3 absolute bottom-2 right-2"></div>
    </div>
);

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['07:00 - 10:00', '10:30 - 13:30', '14:00 - 17:00', '17:30 - 20:30'];

export default function SchedulePageSkeleton() {
    return (
        <div className='p-6 min-h-screen'>
            <div className="mb-6 animate-pulse">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-md w-32 mb-3"></div>
                <hr className="border-t border-gray-200 dark:border-gray-700" />
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-7 bg-gray-300 dark:bg-gray-600 rounded-md w-48 mb-4"></div>
                <div className="overflow-x-auto">
                    <div className="grid grid-cols-[minmax(100px,1.5fr)_repeat(7,minmax(120px,2fr))] border border-gray-300 dark:border-gray-600 rounded-md min-w-[900px]">
                        {/* Header Row */}
                        <div className="font-semibold text-sm p-3 text-center border-r border-b border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700"></div>
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="font-semibold text-sm p-3 text-center border-b border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700">
                                <div className="h-5 w-20 mx-auto bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                            </div>
                        ))}
                        {/* Data Rows */}
                        {TIME_SLOTS.map(timeSlot => (
                            <React.Fragment key={timeSlot}>
                                <div className="p-3 border-r border-gray-300 dark:border-gray-600 border-b flex items-center justify-center bg-gray-200 dark:bg-gray-700/50">
                                    <div className="h-5 w-24 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                                </div>
                                {DAYS_OF_WEEK.map(day => (
                                    <div key={`${day}-${timeSlot}`} className="p-1.5 border-r border-b border-gray-300 dark:border-gray-600">
                                        <SkeletonCard />
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 space-y-2 animate-pulse">
                <p className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-48"></p>
                <p className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-44"></p>
            </div>
        </div>
    );
}