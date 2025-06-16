const TableSkeleton = ({ columns, rows = 5 }) => (
    <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 border-b border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                <tr>
                    {columns.map((col) => (
                        <th key={col.key} scope="col" className={`px-6 py-2.5 ${col.className || ''}`}>
                            <div className="h-4 bg-gray-300 rounded-full dark:bg-gray-600 w-3/4"></div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="text-xs animate-pulse">
                {Array.from({ length: rows }).map((_, index) => (
                    <tr key={index} className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        {columns.map((col) => (
                            <td key={col.key} className={`px-6 py-4 ${col.className || ''}`}>
                                <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-full"></div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default function InstructorClassPageSkeleton() {
    const tableColumns = [
        { key: 'name', label: 'Name' },
        { key: 'generation', label: 'Generation', className: 'lg:table-cell hidden' },
        { key: 'group', label: 'Group', className: 'lg:table-cell hidden' },
        { key: 'major', label: 'Major' },
        { key: 'degrees', label: 'Degrees' },
        { key: 'faculty', label: 'Faculty', className: '2xl:table-cell hidden' },
        { key: 'shift', label: 'Shift', className: 'sm:table-cell hidden' },
    ];
    return (
        <div className="p-6">
             <div className="animate-pulse">
                <div className="h-7 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-4"></div>
                <div className="h-1 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-4"></div>
                <div className="flex items-center justify-between mb-4">
                    <div className="h-9 bg-gray-200 rounded-lg dark:bg-gray-700 w-72"></div>
                </div>
                <TableSkeleton columns={tableColumns} rows={10} />
             </div>
        </div>
    )
}
