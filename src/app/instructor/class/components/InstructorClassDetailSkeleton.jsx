// src/app/instructor/class/components/InstructorClassDetailSkeleton.jsx
const SkeletonFormField = () => (
    <div className="flex-1 min-w-[200px] space-y-2">
      <div className="h-4 bg-slate-300 dark:bg-slate-700/60 rounded w-1/3"></div>
      <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
    </div>
  );

const InstructorClassDetailSkeleton = () => {
  return (
    <div className='p-4 sm:p-6 space-y-6 dark:bg-slate-900 animate-pulse'>
        {/* Class Information Section Skeleton */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="h-6 w-1/2 bg-slate-300 dark:bg-slate-700 rounded-md mb-5"></div>
            <div className="space-y-4">
                <div className="grid grid-cols-1">
                    <SkeletonFormField />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SkeletonFormField />
                    <SkeletonFormField />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SkeletonFormField />
                    <SkeletonFormField />
                    <SkeletonFormField />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SkeletonFormField />
                    <SkeletonFormField />
                    <SkeletonFormField />
                </div>
            </div>
        </div>

        {/* Schedule Class Section Skeleton */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="h-6 w-1/3 bg-slate-300 dark:bg-slate-700 rounded-md mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
                        <div className="h-40 bg-gray-100 dark:bg-slate-700/50 rounded-xl"></div>
                    </div>
                ))}
            </div>
            <div className="mt-8 pt-5 border-t border-gray-200 dark:border-slate-700 flex flex-wrap justify-between items-end gap-4">
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
                    <div className="h-4 w-28 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
                    <div className="h-4 w-36 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
                    <div className="h-4 w-24 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
                </div>
                <div className="text-right">
                    <div className="h-10 w-40 bg-blue-300 dark:bg-blue-800 rounded-lg"></div>
                    <div className="h-3 w-48 bg-slate-300 dark:bg-slate-700 rounded-md mt-2"></div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default InstructorClassDetailSkeleton;