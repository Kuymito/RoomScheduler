'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
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
 * It now receives initial data from its parent Server Component.
 */
export default function InstructorClassClientView({ initialClasses }) {
    const router = useRouter();
    const { data: session } = useSession();
    const token = session?.accessToken;

    // useSWR will use `initialClasses` as the initial data.
    // It will then revalidate in the background to keep the data fresh.
    const { data: apiData, error, isLoading } = useSWR(
        token ? ['assignedClasses', token] : null,
        assignedClassesFetcher,
        {
            fallbackData: initialClasses,
        }
    );

    const [classData, setClassData] = useState([]);
    const [rowLoading, setRowLoading] = useState(null);
    const [isPending, startTransition] = useTransition();
    
    // --- State with localStorage Initialization ---
    const [currentPage, setCurrentPage] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedPage = localStorage.getItem('instructorClassPage_currentPage');
            return savedPage ? parseInt(savedPage, 10) : 1;
        }
        return 1;
    });
    const itemsPerPageOptions = [5, 10, 20, 50];
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedSize = localStorage.getItem('instructorClassPage_itemsPerPage');
            return savedSize ? parseInt(savedSize, 10) : itemsPerPageOptions[0];
        }
        return itemsPerPageOptions[0];
    });
    const [sortColumn, setSortColumn] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('instructorClassPage_sortColumn') || null;
        return null;
    });
    const [sortDirection, setSortDirection] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('instructorClassPage_sortDirection') || 'asc';
        return 'asc';
    });
    const [searchTexts, setSearchTexts] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('instructorClassPage_searchTexts');
            return saved ? JSON.parse(saved) : { name: '', generation: '', group: '', major: '', degrees: '', faculty: '', shift: '' };
        }
        return { name: '', generation: '', group: '', major: '', degrees: '', faculty: '', shift: '' };
    });

    const [globalSearchTerm, setGlobalSearchTerm] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('instructorClassPage_globalSearch') || '';
        return '';
    });

    // --- useEffect hooks to persist state changes ---
    useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('instructorClassPage_currentPage', currentPage); }, [currentPage]);
    useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('instructorClassPage_itemsPerPage', itemsPerPage); }, [itemsPerPage]);
    useEffect(() => { if (typeof window !== 'undefined') { if (sortColumn) localStorage.setItem('instructorClassPage_sortColumn', sortColumn); else localStorage.removeItem('instructorClassPage_sortColumn'); } }, [sortColumn]);
    useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('instructorClassPage_sortDirection', sortDirection); }, [sortDirection]);
    useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('instructorClassPage_searchTexts', JSON.stringify(searchTexts)); }, [searchTexts]);
    useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('instructorClassPage_globalSearch', globalSearchTerm); }, [globalSearchTerm]);


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
        
        if (globalSearchTerm.trim()) {
            const lowercasedTerm = globalSearchTerm.toLowerCase().trim();
            currentFilteredData = currentFilteredData.filter(item => {
                return Object.values(item).some(value =>
                    String(value).toLowerCase().includes(lowercasedTerm)
                );
            });
        }

        Object.keys(searchTexts).forEach(column => {
            const searchTerm = String(searchTexts[column]).toLowerCase().trim();
            if (searchTerm) {
                currentFilteredData = currentFilteredData.filter(item =>
                    String(item[column]).toLowerCase().includes(searchTerm)
                );
            }
        });
        return currentFilteredData;
    }, [sortedClassData, searchTexts, globalSearchTerm]);

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
        const pageBuffer = 1;
    
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
    
            let start = Math.max(2, currentPage - pageBuffer);
            let end = Math.min(totalPages - 1, currentPage + pageBuffer);
    
            if (currentPage - pageBuffer <= 2) {
                end = maxPagesToShow - 2;
            }
    
            if (currentPage + pageBuffer >= totalPages - 1) {
                start = totalPages - maxPagesToShow + 3;
            }
    
            if (start > 2) {
                pageNumbers.push('...');
            }
    
            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }
    
            if (end < totalPages - 1) {
                pageNumbers.push('...');
            }
    
            pageNumbers.push(totalPages);
        }
    
        return pageNumbers;
    };

    const handleRowClick = (classId) => {
        setRowLoading(classId);
        startTransition(() => {
            router.push(`/instructor/class/${classId}`);
        });
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

    if (isLoading && !initialClasses.length) {
        return <InstructorClassPageSkeleton />;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500">Failed to load class data. Please try again.</div>;
    }

    return (
        <div className="sm:p-6 p-2 dark:text-white">
            <h1 className="sm:text-lg text-sm font-bold">Class List</h1>
            <hr className="border-t border-gray-200 dark:border-gray-700 sm:mt-4 mt-2 sm:mb-4 mb-2" />
            <div className="flex items-center justify-between mt-2 sm:mb-4 mb-2 sm:gap-2 gap-1">
                <input
                    type="text"
                    placeholder="Search ..."
                    value={globalSearchTerm}
                    onChange={(e) => {setGlobalSearchTerm(e.target.value); setCurrentPage(1);}}
                    className="block md:w-72 sm:w-52 w-32 sm:p-2 p-1.5 sm:text-xs text-[7px] font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:focus:ring-offset-gray-800"
                />
            </div>
            <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-600 sm:rounded-lg rounded-md">
                <table className="w-full rounded-lg sm:text-xs text-[7px] text-left rtl:text-right text-gray-500">
                    <thead className="sm:text-xs text-[7px] text-gray-700 border-b border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="sm:px-6 px-2 sm:py-2.5 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('name')}><div className="flex items-center">Name {getSortIndicator('name')}</div></th>
                            <th scope="col" className="sm:px-6 px-2 sm:py-2.5 py-1.5 lg:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('generation')}><div className="flex items-center">Generation {getSortIndicator('generation')}</div></th>
                            <th scope="col" className="sm:px-6 px-2 sm:py-2.5 py-1.5 lg:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('group')}><div className="flex items-center">Group {getSortIndicator('group')}</div></th>
                            <th scope="col" className="sm:px-6 px-2 sm:py-2.5 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('major')}><div className="flex items-center">Major {getSortIndicator('major')}</div></th>
                            <th scope="col" className="sm:px-6 px-2 sm:py-2.5 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('degrees')}><div className="flex items-center">Degrees {getSortIndicator('degrees')}</div></th>
                            <th scope="col" className="sm:px-6 px-2 sm:py-2.5 py-1.5 2xl:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('faculty')}><div className="flex items-center">Faculty {getSortIndicator('faculty')}</div></th>
                            <th scope="col" className="sm:px-6 px-2 sm:py-2.5 py-1.5 sm:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('shift')}><div className="flex items-center">Shift {getSortIndicator('shift')}</div></th>
                        </tr>
                    </thead>
                    <tbody className="sm:text-xs text-[7px] font-normal text-gray-700 dark:text-gray-400">
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
                                        <td className="sm:px-6 px-2 sm:py-2.5 py-1.5 font-medium text-gray-900 dark:text-white">
                                            <div className="max-w-[70px] truncate" title={data.name}>
                                                {data.name}
                                            </div>
                                        </td>
                                        <td className="sm:px-6 px-2 sm:py-2.5 py-1.5 lg:table-cell hidden">{data.generation}</td>
                                        <td className="sm:px-6 px-2 sm:py-2.5 py-1.5 lg:table-cell hidden">{data.group}</td>
                                        <td className="sm:px-6 px-2 sm:py-2.5 py-1.5">
                                            <div className="max-w-[120px] truncate" title={data.major}>
                                                {data.major}
                                            </div>
                                        </td>
                                        <td className="sm:px-6 px-2 sm:py-2.5 py-1.5">{data.degrees}</td>
                                        <td className="sm:px-6 px-2 sm:py-2.5 py-1.5 2xl:table-cell hidden">
                                            <div className="max-w-[120px] truncate" title={data.faculty}>
                                                {data.faculty}
                                            </div>
                                        </td>
                                        <td className="sm:px-6 px-2 sm:py-2.5 py-1.5 sm:table-cell hidden">
                                            <div className="max-w-[65px] truncate" title={data.shift}>
                                                {data.shift}
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        {currentTableData.length === 0 && (
                            <tr className="bg-white dark:bg-gray-800"><td colSpan={tableColumns.length} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No matching results found.</td></tr>
                        )}
                    </tbody>
                    <tfoot className="sm:text-xs text-[7px] text-gray-700 border-t border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <td className="sm:px-6 px-2 sm:py-2.5 py-1.5"><input type="text" placeholder="Search..." value={searchTexts.name} onChange={(e) => handleSearchChange('name', e.target.value)} className="block w-full p-1.5 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2" /></td>
                            <td className="sm:px-6 px-2 sm:py-2.5 py-1.5 lg:table-cell hidden"><input type="text" placeholder="Search..." value={searchTexts.generation} onChange={(e) => handleSearchChange('generation', e.target.value)} className="block w-full p-1.5 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2" /></td>
                            <td className="sm:px-6 px-2 sm:py-2.5 py-1.5 lg:table-cell hidden"><input type="text" placeholder="Search..." value={searchTexts.group} onChange={(e) => handleSearchChange('group', e.target.value)} className="block w-full p-1.5 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2" /></td>
                            <td className="sm:px-6 px-2 sm:py-2.5 py-1.5"><input type="text" placeholder="Search..." value={searchTexts.major} onChange={(e) => handleSearchChange('major', e.target.value)} className="block w-full p-1.5 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2" /></td>
                            <td className="sm:px-6 px-2 sm:py-2.5 py-1.5"><input type="text" placeholder="Search..." value={searchTexts.degrees} onChange={(e) => handleSearchChange('degrees', e.target.value)} className="block w-full p-1.5 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2" /></td>
                            <td className="sm:px-6 px-2 sm:py-2.5 py-1.5 2xl:table-cell hidden"><input type="text" placeholder="Search..." value={searchTexts.faculty} onChange={(e) => handleSearchChange('faculty', e.target.value)} className="block w-full p-1.5 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2" /></td>
                            <td className="sm:px-6 px-2 sm:py-2.5 py-1.5 sm:table-cell hidden"><input type="text" placeholder="Search..." value={searchTexts.shift} onChange={(e) => handleSearchChange('shift', e.target.value)} className="block w-full p-1.5 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2" /></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <nav className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-y-4" aria-label="Table navigation">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                    <span className="sm:text-xs text-[7px] font-normal text-gray-500 dark:text-gray-400">
                        Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredClassData.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredClassData.length}</span>
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                        <label htmlFor="items-per-page" className="sm:text-xs text-[7px] font-normal text-gray-500 dark:text-gray-400">Items per page:</label>
                        <select id="items-per-page" value={itemsPerPage} onChange={handleItemsPerPageChange} className="bg-gray-50 sm:text-xs text-[7px] border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block sm:p-1.5 p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                            {itemsPerPageOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                        </select>
                    </div>
                </div>
                <ul className="inline-flex -space-x-px rtl:space-x-reverse sm:text-xs text-[7px] sm:h-8 h-4">
                    <li><button onClick={goToPreviousPage} disabled={currentPage === 1 || isPending} className="flex items-center justify-center sm:px-3 px-1.5 sm:h-8 h-4 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">Previous</button></li>
                    {getPageNumbers().map((pageNumber, index) => (
                        <li key={index}>
                            {pageNumber === '...' ? (
                                <span className="flex items-center justify-center px-3 sm:h-8 h-4 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">...</span>
                            ) : (
                                <button onClick={() => goToPage(pageNumber)} disabled={isPending} className={`flex items-center justify-center sm:px-3 px-1.5 sm:h-8 h-4 leading-tight border border-gray-300 dark:border-gray-700 ${currentPage === pageNumber ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}>{pageNumber}</button>
                            )}
                        </li>
                    ))}
                    <li><button onClick={goToNextPage} disabled={currentPage === totalPages || isPending} className="flex items-center justify-center sm:px-3 px-1.5 sm:h-8 h-4 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">Next</button></li>
                </ul>
            </nav>
        </div>
    );
}