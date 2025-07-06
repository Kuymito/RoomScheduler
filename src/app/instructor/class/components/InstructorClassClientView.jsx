'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { classService } from '@/services/class.service';
import InstructorClassPageSkeleton from './InstructorClassPageSkeleton';

// --- Reusable Icon and Spinner Components ---
const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// SWR fetcher function for assigned classes
const assignedClassesFetcher = ([, token]) => classService.getAssignedClasses(token);

// Mapping from shiftId to the full descriptive name used in the UI.
const shiftIdToFullNameMap = {
    1: 'Morning Shift',
    2: 'Noon Shift',
    3: 'Afternoon Shift',
    4: 'Evening Shift',
    5: 'Weekend Shift'
};

/**
 * This is the Client Component for the Instructor Class page.
 * It now handles its own data fetching using useSWR.
 */
export default function InstructorClassClientView() {
    const router = useRouter();
    const { data: session } = useSession();
    const token = session?.accessToken;

    const { data: apiData, error, isLoading } = useSWR(
        token ? ['assignedClasses', token] : null,
        assignedClassesFetcher
    );

    const [classData, setClassData] = useState([]);
    const [rowLoading, setRowLoading] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPageOptions = [5, 10, 20, 50];
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [searchTexts, setSearchTexts] = useState({ name: '', generation: '', group: '', major: '', degrees: '', faculty: '', shift: '' });

    useEffect(() => {
        if (apiData) {
            const formattedData = apiData.map(item => ({
                id: item.classId,
                name: item.className,
                generation: item.generation,
                group: item.groupName,
                major: item.majorName,
                degrees: item.degreeName,
                faculty: item.department?.name || 'N/A',
                semester: item.semester,
                shift: item.shift ? shiftIdToFullNameMap[item.shift.shiftId] || 'N/A' : 'N/A',
                status: item.archived ? 'archived' : 'active',
            }));
            setClassData(formattedData);
        }
    }, [apiData]);

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

    const handleRowClick = async (classId) => {
        if (rowLoading) return;
        setRowLoading(classId);
        await new Promise(resolve => setTimeout(resolve, 500)); 
        router.push(`/instructor/class/${classId}`);
    };

    const tableColumns = [
        { key: 'name', label: 'Name' },
        { key: 'generation', label: 'Generation', className: 'lg:table-cell hidden' },
        { key: 'group', label: 'Group', className: 'lg:table-cell hidden' },
        { key: 'major', label: 'Major' },
        { key: 'degrees', label: 'Degrees' },
        { key: 'faculty', label: 'Faculty', className: '2xl:table-cell hidden' },
        { key: 'shift', label: 'Shift', className: 'sm:table-cell hidden' },
    ];

    if (isLoading) {
        return <InstructorClassPageSkeleton />;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500">Failed to load class data. Please try again.</div>;
    }

    return (
        <div className="p-6 dark:text-white">
            <h1 className="text-lg font-bold">Class List</h1>
            <hr className="border-t border-gray-200 dark:border-gray-700 mt-4 mb-4" />
            <div className="flex items-center justify-between mt-2 mb-4 gap-2">
                <input type="text" placeholder="Search by name..." value={searchTexts.name} onChange={(e) => handleSearchChange('name', e.target.value)} className="block w-72 p-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700" />
            </div>
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
                        {currentTableData.map((data) => (
                            <tr key={data.id} className={`bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${rowLoading === data.id ? 'cursor-wait bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'}`} onClick={() => handleRowClick(data.id)}>
                                {rowLoading === data.id ? (
                                    <td colSpan={tableColumns.length} className="px-6 py-2 text-center">
                                        <div className="flex justify-center items-center">
                                            <Spinner />
                                        </div>
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-6 py-2.5 font-medium text-gray-900 whitespace-nowrap dark:text-white">{data.name}</td>
                                        <td className="px-6 py-2.5 lg:table-cell hidden">{data.generation}</td>
                                        <td className="px-6 py-2.5 lg:table-cell hidden">{data.group}</td>
                                        <td className="px-6 py-2.5">{data.major}</td>
                                        <td className="px-6 py-2.5">{data.degrees}</td>
                                        <td className="px-6 py-2.5 2xl:table-cell hidden">{data.faculty}</td>
                                        <td className="px-6 py-2.5 sm:table-cell hidden">{data.shift}</td>
                                    </>
                                )}
                            </tr>
                        ))}
                        {currentTableData.length === 0 && (
                            <tr className="bg-white dark:bg-gray-800"><td colSpan={tableColumns.length} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No matching results found.</td></tr>
                        )}
                    </tbody>
                    <tfoot className="text-xs text-gray-700 border-t border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <td className="px-6 py-2.5"><input type="text" placeholder="Search..." value={searchTexts.name} onChange={(e) => handleSearchChange('name', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /></td>
                            <td className="px-6 py-2.5 lg:table-cell hidden"><input type="text" placeholder="Search..." value={searchTexts.generation} onChange={(e) => handleSearchChange('generation', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /></td>
                            <td className="px-6 py-2.5 lg:table-cell hidden"><input type="text" placeholder="Search..." value={searchTexts.group} onChange={(e) => handleSearchChange('group', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /></td>
                            <td className="px-6 py-2.5"><input type="text" placeholder="Search..." value={searchTexts.major} onChange={(e) => handleSearchChange('major', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /></td>
                            <td className="px-6 py-2.5"><input type="text" placeholder="Search..." value={searchTexts.degrees} onChange={(e) => handleSearchChange('degrees', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /></td>
                            <td className="px-6 py-2.5 2xl:table-cell hidden"><input type="text" placeholder="Search..." value={searchTexts.faculty} onChange={(e) => handleSearchChange('faculty', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /></td>
                            <td className="px-6 py-2.5 sm:table-cell hidden"><input type="text" placeholder="Search..." value={searchTexts.shift} onChange={(e) => handleSearchChange('shift', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" /></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:w-auto">Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredClassData.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredClassData.length}</span></span>
                <div className="flex items-center gap-2">
                    <label htmlFor="items-per-page" className="text-sm font-normal text-gray-500 dark:text-gray-400">Items per page:</label>
                    <select id="items-per-page" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-blue-500 focus:border-blue-500 px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                        {itemsPerPageOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                    </select>
                </div>
                <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
                    <li><button onClick={goToPreviousPage} disabled={currentPage === 1} className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50">Previous</button></li>
                    {getPageNumbers().map((pageNumber) => (<li key={pageNumber}><button onClick={() => goToPage(pageNumber)} className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${currentPage === pageNumber ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'} disabled:opacity-50`}>{pageNumber}</button></li>))}
                    <li><button onClick={goToNextPage} disabled={currentPage === totalPages} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50">Next</button></li>
                </ul>
            </nav>
        </div>
    );
}