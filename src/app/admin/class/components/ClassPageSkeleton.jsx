const ClassPageSkeleton = () => {
  // A reusable component for a single, pulsing table row
    const SkeletonTableRow = () => (
        <tr className="bg-white dark:bg-gray-800 animate-pulse w-full">
            {/* Action */}
            <td className="sm:px-4 px-2 sm:py-4 py-1">
                <div className="h-4 w-12 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Name */}
            <td className="sm:px-4 px-2 sm:py-4 py-1">
                <div className="h-4 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Generation */}
            <td className="sm:px-4 px-2 sm:py-4 py-1 sm:table-cell hidden">
                <div className="h-4 w-32 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Group */}
            <td className="sm:px-4 px-2 sm:py-4 py-1 lg:table-cell hidden">
                <div className="h-4 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Major */}
            <td className="sm:px-4 px-2 sm:py-4 py-1">
                <div className="h-4 w-20 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Degree */}
            <td className="sm:px-4 px-2 sm:py-4 py-1 sm:table-cell hidden">
                <div className="h-4 w-16 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Faculty */}
            <td className="sm:px-4 px-2 sm:py-4 py-1">
                <div className="h-5 w-12 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            </td>
            {/* Semester */}
            <td className="sm:px-4 px-2 sm:py-4 py-1 2xl:table-cell hidden">
                <div className="h-4 w-20 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Shift */}
            <td className="sm:px-4 px-2 sm:py-4 py-1 sm:table-cell hidden">
                <div className="h-4 w-20 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Status */}
            <td className="sm:px-4 px-2 sm:py-4 py-1 sm:table-cell hidden">
                <div className="h-4 w-20 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
        </tr>
    );

    return (
        <div className="p-6 animate-pulse">
        {/* Header */}
        <div className="h-7 w-36 bg-slate-300 dark:bg-slate-600 rounded"></div>
        <div className="h-px bg-slate-300 dark:bg-slate-700 mt-4 mb-4" />

        {/* Filter/Action Controls */}
        <div className="flex items-center justify-between mt-2 mb-4 gap-2">
            <div className="flex items-center gap-2">
            <div className="sm:h-9 h-6 sm:w-72 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="sm:h-9 h-6 sm:w-14 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
            <div className="sm:h-9 h-6 sm:w-24 w-12 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        </div>

        {/* Table Skeleton */}
        <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
            <table className="w-full text-xs text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="sm:text-xs text-[7px] text-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-700">
                    {/* You can keep the real header as it provides context, or skeletonize it too */}
                    <tr>
                    <th scope="col" className="sm:px-4 px-2 sm:py-4 py-1">Action</th>
                    <th scope="col" className="sm:px-4 px-2 sm:py-4 py-1">Name</th>
                    <th scope="col" className="sm:px-4 px-2 sm:py-4 py-1 sm:table-cell hidden">Generation</th>
                    <th scope="col" className="sm:px-4 px-2 sm:py-4 py-1 lg:table-cell hidden">Group</th>
                    <th scope="col" className="sm:px-4 px-2 sm:py-4 py-1">Major</th>
                    <th scope="col" className="sm:px-4 px-2 sm:py-4 py-1 sm:table-cell hidden">Degree</th>
                    <th scope="col" className="sm:px-4 px-2 sm:py-4 py-1 2xl:table-cell hidden"> Faculty </th>
                    <th scope="col" className="sm:px-4 px-2 sm:py-4 py-1 2xl:table-cell hidden"> Semester </th>
                    <th scope="col" className="sm:px-4 px-2 sm:py-4 py-1 sm:table-cell hidden"> Shift </th>
                <th scope="col" className="sm:px-4 px-2 sm:py-4 py-1">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Create several skeleton rows to fill the table */}
                    {[...Array(5)].map((_, i) => (
                    <SkeletonTableRow key={i} />
                    ))}
                </tbody>
            </table>
        </div>

        {/* Pagination Skeleton */}
        <nav className="flex items-center flex-wrap justify-between pt-4">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4 md:mb-0"></div>
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </nav>
        </div>
    );
};

export default ClassPageSkeleton;