'use client';

import { useState, useMemo, useEffect } from 'react';
import InstructorLayout from '@/components/InstructorLayout';
import { useRouter } from 'next/navigation';


// --- Data ---
const initialClassData = [
    { id: 1, name: "NUM33-09", generation: "33", group: "09", major: "SE", degrees: "Bachelor", faculty: "Faculty of SE & R", shift: "8:00 - 11:00" },
    { id: 2, name: "NUM32-01", generation: "32", group: "01", major: "IT", degrees: "Bachelor", faculty: "Faculty of IT", shift: "7:00 - 10:00" },
    { id: 3, name: "NUM31-05", generation: "31", group: "05", major: "CS", degrees: "Bachelor", faculty: "Faculty of CS", shift: "13:00 - 16:00" },
    { id: 4, name: "NUM33-10", generation: "33", group: "10", major: "AI", degrees: "Master", faculty: "Faculty of AI", shift: "18:00 - 21:00" },
    { id: 5, name: "NUM30-03", generation: "30", group: "03", major: "DS", degrees: "Bachelor", faculty: "Faculty of DS", shift: "9:00 - 12:00" },
    { id: 6, name: "NUM32-02", generation: "32", group: "02", major: "IT", degrees: "Bachelor", faculty: "Faculty of IT", shift: "8:00 - 11:00" },
];

// NEW: Skeleton component for the table
const TableSkeleton = ({ columns, rows = 5 }) => (
    <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 border-b border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                <tr>
                    {columns.map((col) => (
                        <th key={col.key} scope="col" className={`px-6 py-2.5 ${col.className || ''}`}>
                            <div className="flex items-center">{col.label}</div>
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


const InstructorClassViewContent = () => {
    const [classData, setClassData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPageOptions = [5, 10, 20, 50];
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);

    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    // Simulate data fetching
    useEffect(() => {
        const timer = setTimeout(() => {
            setClassData(initialClassData);
            setLoading(false);
        }, 2000); // 2-second delay
        return () => clearTimeout(timer);
    }, []);

    const handleSort = (column) => {
        setCurrentPage(1);
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedClassData = useMemo(() => {
        if (!sortColumn) return classData;
        const sortableData = [...classData];
        sortableData.sort((a, b) => {
            if (sortColumn === 'generation' || sortColumn === 'group') {
                const aNum = parseInt(a[sortColumn], 10);
                const bNum = parseInt(b[sortColumn], 10);
                if (aNum < bNum) return sortDirection === 'asc' ? -1 : 1;
                if (aNum > bNum) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            } else {
                const aValue = String(a[sortColumn] || '').toLowerCase();
                const bValue = String(b[sortColumn] || '').toLowerCase();
                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            }
        });
        return sortableData;
    }, [classData, sortColumn, sortDirection]);

    const getSortIndicator = (column) => {
        if (sortColumn === column) {
            return sortDirection === 'asc' ?
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1"> <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /> </svg> :
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1"> <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /> </svg>;
        }
        return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1 opacity-40"> <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /> </svg>;
    };

    const [searchTexts, setSearchTexts] = useState({ name: '', generation: '', group: '', major: '', degrees: '', faculty: '', shift: '' });

    const handleSearchChange = (column, value) => {
        setSearchTexts(prev => ({ ...prev, [column]: value }));
        setCurrentPage(1);
    };

    const filteredClassData = useMemo(() => {
        let currentFilteredData = [...sortedClassData];
        Object.keys(searchTexts).forEach(column => {
            const searchTerm = String(searchTexts[column]).toLowerCase().trim();
            if (searchTerm) {
                currentFilteredData = currentFilteredData.filter(item =>
                    String(item[column]).toLowerCase().includes(searchTerm)
                );
            }
        });
        return currentFilteredData;
    }, [sortedClassData, searchTexts]);

    const totalPages = Math.ceil(filteredClassData.length / itemsPerPage);

    const currentTableData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredClassData.slice(startIndex, endIndex);
    }, [filteredClassData, currentPage, itemsPerPage]);

    const goToNextPage = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    const goToPage = (pageNumber) => setCurrentPage(pageNumber);
    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
        return pageNumbers;
    };

    const router = useRouter();
    const handleRowClick = (classId) => {
        if (!loading) {
            router.push(`/instructor/class/${classId}`);
        }
    };

    // Define columns for the skeleton
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
        <div className="p-6 dark:text-white">
            <h1 className="text-lg font-bold">Class List</h1>
            <hr className="border-t border-gray-200 dark:border-gray-700 mt-4 mb-4" />

            <div className="flex items-center justify-between mt-2 mb-4 gap-2">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTexts.name}
                    onChange={(e) => handleSearchChange('name', e.target.value)}
                    disabled={loading}
                    className="block w-72 p-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>

            {loading ? (
                <TableSkeleton columns={tableColumns} rows={itemsPerPage} />
            ) : (
                <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                    <table className="w-full rounded-lg text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-gray-700 border-b border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('name')}><div className="flex items-center">Name {getSortIndicator('name')}</div></th>
                                <th scope="col" className="px-6 py-2.5 lg:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('generation')}><div className="flex items-center">Generation {getSortIndicator('generation')}</div></th>
                                <th scope="col" className="px-6 py-2.5 lg:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('group')}><div className="flex items-center">Group {getSortIndicator('group')}</div></th>
                                <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('major')}><div className="flex items-center">Major {getSortIndicator('major')}</div></th>
                                <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('degrees')}><div className="flex items-center">Degrees {getSortIndicator('degrees')}</div></th>
                                <th scope="col" className="px-6 py-2.5 2xl:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('faculty')}><div className="flex items-center">Faculty {getSortIndicator('faculty')}</div></th>
                                <th scope="col" className="px-6 py-2.5 sm:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('shift')}><div className="flex items-center">Shift {getSortIndicator('shift')}</div></th>
                            </tr>
                        </thead>
                        <tbody className="text-xs font-normal text-gray-700 dark:text-gray-400">
                            {currentTableData.length > 0 ? (
                                currentTableData.map((data) => (
                                    <tr key={data.id} className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer" onClick={() => handleRowClick(data.id)}>
                                        <td className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{data.name}</td>
                                        <td className="px-6 py-2 lg:table-cell hidden">{data.generation}</td>
                                        <td className="px-6 py-2 lg:table-cell hidden">{data.group}</td>
                                        <td className="px-6 py-2">{data.major}</td>
                                        <td className="px-6 py-2">{data.degrees}</td>
                                        <td className="px-6 py-2 2xl:table-cell hidden">{data.faculty}</td>
                                        <td className="px-6 py-2 sm:table-cell hidden">{data.shift}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="bg-white dark:bg-gray-800"><td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No matching results found.</td></tr>
                            )}
                        </tbody>
                        <tfoot className="text-xs text-gray-700 border-t border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                            <tr>
                                <td className="px-6 py-2.5"><input type="text" placeholder="Search name..." value={searchTexts.name} onChange={(e) => handleSearchChange('name', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /></td>
                                <td className="px-6 py-2.5 lg:table-cell hidden"><input type="text" placeholder="Search gen..." value={searchTexts.generation} onChange={(e) => handleSearchChange('generation', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /></td>
                                <td className="px-6 py-2.5 lg:table-cell hidden"><input type="text" placeholder="Search group..." value={searchTexts.group} onChange={(e) => handleSearchChange('group', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /></td>
                                <td className="px-6 py-2.5"><input type="text" placeholder="Search major..." value={searchTexts.major} onChange={(e) => handleSearchChange('major', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /></td>
                                <td className="px-6 py-2.5"><input type="text" placeholder="Search degrees..." value={searchTexts.degrees} onChange={(e) => handleSearchChange('degrees', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /></td>
                                <td className="px-6 py-2.5 2xl:table-cell hidden"><input type="text" placeholder="Search faculty..." value={searchTexts.faculty} onChange={(e) => handleSearchChange('faculty', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /></td>
                                <td className="px-6 py-2.5 sm:table-cell hidden"><input type="text" placeholder="Search shift..." value={searchTexts.shift} onChange={(e) => handleSearchChange('shift', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}


            <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:w-auto">
                    {loading ? (
                        <div className="h-5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 animate-pulse"></div>
                    ) : (
                        <>
                            Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredClassData.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredClassData.length}</span>
                        </>
                    )}
                </span>
                <div className="flex items-center gap-2">
                    <label htmlFor="items-per-page" className="text-sm font-normal text-gray-500 dark:text-gray-400">Items per page:</label>
                    <select id="items-per-page" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-blue-500 focus:border-blue-500 px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white disabled:opacity-50" value={itemsPerPage} onChange={handleItemsPerPageChange} disabled={loading}>
                        {itemsPerPageOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                    </select>
                </div>
                <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
                    <li><button onClick={goToPreviousPage} disabled={currentPage === 1 || loading} className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">Previous</button></li>
                    {getPageNumbers().map((pageNumber) => (<li key={pageNumber}><button onClick={() => goToPage(pageNumber)} disabled={loading} className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${currentPage === pageNumber ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`}>{pageNumber}</button></li>))}
                    <li><button onClick={goToNextPage} disabled={currentPage === totalPages || loading} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">Next</button></li>
                </ul>
            </nav>
        </div>
    );
};

export default function InstructorClassPage() {
    return (
        <InstructorLayout activeItem="class" pageTitle="Class Management">
            <InstructorClassViewContent />
        </InstructorLayout>
    );
}