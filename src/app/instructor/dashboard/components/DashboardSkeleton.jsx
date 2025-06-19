// src/app/instructor/dashboard/components/DashboardSkeleton.jsx

const HeaderSkeleton = () => (
    <div className="animate-pulse flex justify-between items-start p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-72 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-96 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-80"></div>
        </div>
        <div className="text-right">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-40"></div>
        </div>
    </div>
);

const CardSkeleton = () => (
    <div className="animate-pulse p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-24 mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
    </div>
);

const TableSkeleton = ({ rows = 6 }) => (
    <div className="animate-pulse mt-6 overflow-x-auto relative p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="w-full">
            {/* Table Header */}
            <div className="flex bg-gray-50 dark:bg-gray-700/50 p-4">
                <div className="w-1/6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="w-1/6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full ml-4"></div>
                <div className="w-1/6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full ml-4"></div>
                <div className="w-1/6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full ml-4"></div>
                <div className="w-1/6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full ml-4"></div>
                <div className="w-1/6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full ml-4"></div>
            </div>
            {/* Table Body */}
            <div className="p-4 space-y-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center">
                        <div className="w-1/6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="w-1/6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full ml-4"></div>
                        <div className="w-1/6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full ml-4"></div>
                        <div className="w-1/6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full ml-4"></div>
                        <div className="w-1/6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full ml-4"></div>
                        <div className="w-1/6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full ml-4"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// This component assembles all the skeleton parts into the page layout
export default function DashboardSkeleton() {
    return (
        <>
            <HeaderSkeleton />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
            <TableSkeleton />
        </>
    );
}
