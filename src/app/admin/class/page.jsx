'use client';

import { useState, useMemo, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ClassCreatePopup from './components/ClassCreatePopup';
import { useRouter } from 'next/navigation';
import ClassPageSkeleton from './components/ClassPageSkeleton';

// --- NEW: Spinner component ---
const Spinner = () => (
    <svg className="animate-spin h-6 w-6 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const fetchClassData = async () => {
    const initialClassData = [
        // Data is now inside the "API" function
        { id: 1, name: 'NUM30-01', generation: '30', group: '01', major: 'IT', degrees: 'Bachelor', faculty: 'Faculty of IT', semester: 'Semester 1', shift: '7:00 - 10:00', status: 'active' },
        { id: 2, name: 'NUM30-01', generation: '30', group: '01', major: 'IT', degrees: 'Bachelor', faculty: 'Faculty of IT', semester: 'Semester 1', shift: '7:00 - 10:00', status: 'active' },
        { id: 3, name: 'NUM30-02', generation: '30', group: '02', major: 'CS', degrees: 'Bachelor', faculty: 'Faculty of CS', semester: 'Semester 1', shift: '8:00 - 11:00', status: 'active' },
        { id: 4, name: 'NUM32-03', generation: '32', group: '03', major: 'IS', degrees: 'Bachelor', faculty: 'Faculty of IS', semester: 'Semester 2', shift: '9:00 - 12:00', status: 'active' },
        { id: 5, name: 'NUM32-04', generation: '32', group: '04', major: 'SE', degrees: 'Bachelor', faculty: 'Faculty of SE', semester: 'Semester 2', shift: '13:00 - 16:00', status: 'active' },
        { id: 6, name: 'NUM32-05', generation: '32', group: '05', major: 'AI', degrees: 'Bachelor', faculty: 'Faculty of AI', semester: 'Semester 2', shift: '15:00 PM - 18:00', status: 'active' },
        { id: 7, name: 'NUM33-06', generation: '33', group: '06', major: 'DS', degrees: 'Bachelor', faculty: 'Faculty of DS', semester: 'Semester 3', shift: '17:00 - 20:00', status: 'active' },
        { id: 8, name: 'NUM33-07', generation: '33', group: '07', major: 'ML', degrees: 'Bachelor', faculty: 'Faculty of ML', semester: '2Semester 3', shift: '18:00 - 21:00', status: 'active' },
        { id: 9, name: 'NUM33-08', generation: '33', group: '08', major: 'DA', degrees: 'Bachelor', faculty: 'Faculty of DA', semester: 'Semester 3', shift: '19:00 - 22:00', status: 'archived' },
        { id: 10, name: 'NUM33-09', generation: '33', group: '09', major: 'SE', degrees: 'Bachelor', faculty: 'Faculty of SE & R', semester: '2024-2025 S3', shift: '8:00 - 11:00', status: 'active' }
    ];
    // Simulate a network delay of 1 second
    return new Promise(resolve => setTimeout(() => resolve(initialClassData), 1000));
};

const ClassViewContent = () => {
    // State Variables
    const [classData, setClassData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPageOptions = [5, 10, 20, 50];
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
    // --- UPDATED: Renamed state for clarity ---
    const [rowLoadingId, setRowLoadingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('active');
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const router = useRouter();

    // Handle Function
    const handleCreateClick = () => {
        setShowCreatePopup(true);
    };

    const handleClosePopup = () => {
        setShowCreatePopup(false);
    };

    const handleSaveNewClass = (newClassData) => {
        const newId = classData.length > 0 ? Math.max(...classData.map(item => item.id)) + 1 : 1;
        const newClassWithStatus = {
            id: newId,
            ...newClassData, // newClassData now includes semester thanks to the fix in ClassCreatePopup
            status: 'active', // New classes default to active
        };

        setClassData(prevData => [...prevData, newClassWithStatus]);
        setCurrentPage(1); // Reset page after adding a new class
    };

    const handleSort = (column) => {
        setCurrentPage(1); // Reset to first page when sorting changes
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedClassData = useMemo(() => {
        if (!sortColumn) {
            return classData;
        }

        const sortableData = [...classData];

        sortableData.sort((a, b) => {
            if (sortColumn === 'generation' || sortColumn === 'group') {
                const aNum = parseInt(a[sortColumn], 10);
                const bNum = parseInt(b[sortColumn], 10);

                if (aNum < bNum) return sortDirection === 'asc' ? -1 : 1;
                if (aNum > bNum) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            } else {
                const aValue = String(a[sortColumn]).toLowerCase();
                const bValue = String(b[sortColumn]).toLowerCase();

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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                </svg>
                :
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>;
        }
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1 opacity-40">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>
        );
    };

    const [searchTexts, setSearchTexts] = useState({
        name: '',
        generation: '',
        group: '',
        major: '',
        degrees: '',
        faculty: '',
        semester: '',
        shift: '',
    });

    const handleSearchChange = (column, value) => {
        setSearchTexts(prev => ({
            ...prev,
            [column]: value,
        }));
        setCurrentPage(1); 
    };

    const filteredClassData = useMemo(() => {
        let currentFilteredData = [...sortedClassData];

        if (statusFilter !== 'all') {
            currentFilteredData = currentFilteredData.filter(item => item.status === statusFilter);
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
    }, [sortedClassData, searchTexts, statusFilter]);

    const totalPages = Math.ceil(filteredClassData.length / itemsPerPage);

    const currentTableData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredClassData.slice(startIndex, endIndex);
    }, [filteredClassData, currentPage, itemsPerPage]);

    const goToNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const goToPreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (event) => {
        const newItemsPerPage = parseInt(event.target.value, 10);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when items per page changes
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    const toggleClassStatus = (id) => {
        setClassData(prevData =>
            prevData.map(item =>
                item.id === id
                    ? { ...item, status: item.status === 'active' ? 'archived' : 'active' }
                    : item
            )
        );
        // This is a quick UI update. In a real app, you would likely not reset the page
        // to allow the user to see their change immediately without losing their view.
        // setCurrentPage(1); 
    };
    
    // --- UPDATED: handleRowClick with async behavior and row loading state ---
    const handleRowClick = async (classId) => {
        if (rowLoadingId) return; // Prevent clicking if a row is already loading

        setRowLoadingId(classId);

        // Simulate a network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        router.push(`/admin/class/${classId}`);
        
        // This might not be seen if the page navigates away, but it's good practice
        setRowLoadingId(null);
    };

    // --- Icons Components ---
    const EditIcon = ({ className = "w-[14px] h-[14px]" }) => (
        <svg className={className} width="14" height="14" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.06671 2.125H4.95837C3.00254 2.125 2.12504 3.0025 2.12504 4.95833V12.0417C2.12504 13.9975 3.00254 14.875 4.95837 14.875H12.0417C13.9975 14.875 14.875 13.9975 14.875 12.0417V8.93333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.6579 3.2658L6.28042 7.64327C6.10542 7.81827 5.93042 8.15055 5.89125 8.3928L5.64958 10.112C5.56625 10.7037 6.01958 11.157 6.61125 11.0737L8.33042 10.832C8.57292 10.7928 8.90542 10.6178 9.08042 10.4428L13.4579 6.0653C14.2662 5.25705 14.5796 4.26827 13.4579 3.14662C12.3362 2.03205 11.3479 2.45705 10.6579 3.2658Z" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.8999 4.02502C10.2716 5.66752 11.0583 6.45419 12.7008 6.82585" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    const ArchiveIcon = ({ className = "w-[14px] h-[14px]" }) => (
        <svg className={className} width="14" height="14" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.1667 5.66667V12.0417C14.1667 13.9975 13.2892 14.875 11.3334 14.875H5.66671C3.71087 14.875 2.83337 13.9975 2.83337 12.0417V5.66667" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.875 2.125H2.125L2.12504 5.66667H14.875V2.125Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.79163 8.5H9.20829" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
    
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const data = await fetchClassData();
                setClassData(data);
            } catch (error) {
                console.error("Failed to fetch class data:", error);
                // You could set an error state here to show an error message
            } finally {
                setIsLoading(false); // Set loading to false after data is fetched or if an error occurs
            }
        };

        loadInitialData();
    }, []);

    if (isLoading) {
        return <ClassPageSkeleton />;
    }

    return (
        <div className="p-6 dark:text-white">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold">
                    Class List
                </h1>
            </div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-4" />
            <div className="flex items-center justify-between mt-2 mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTexts.name}
                        onChange={(e) => handleSearchChange('name', e.target.value)}
                        className="block w-72 p-2 text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700"
                    />
                    <div className="inline-flex rounded-md shadow-xs" role="group">
                        <button
                            type="button"
                            onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
                            className={`px-4 py-2 text-xs font-medium rounded-s-lg border ${
                                statusFilter === 'active'
                                    ? 'text-blue-700 bg-blue-50 border-blue-300 dark:bg-gray-700 dark:text-blue-300 dark:border-blue-600'
                                    : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700'
                            }`}
                        >
                            Active
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStatusFilter('archived'); setCurrentPage(1); }}
                            className={`px-4 py-2 text-xs font-medium border-t border-b ${
                                statusFilter === 'archived'
                                    ? 'text-red-700 bg-red-50 border-red-300 dark:bg-gray-700 dark:text-red-300 dark:border-red-600'
                                    : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-red-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700'
                            }`}
                        >
                            Archive
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                            className={`px-4 py-2 text-xs font-medium rounded-e-lg border ${
                                statusFilter === 'all'
                                    ? 'text-purple-700 bg-purple-50 border-purple-300 dark:bg-gray-700 dark:text-purple-300 dark:border-purple-600'
                                    : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-purple-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700'
                            }`}
                        >
                            All
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleCreateClick}
                    className="text-white bg-green-700 hover:bg-green-800 focus:ring-2 focus:ring-green-600 font-medium rounded-md text-xs px-3 py-2 text-center inline-flex items-center dark:bg-green-600 me-2 mb-2 dark:hover:bg-green-700 dark:focus:ring-green-800 gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create
                </button>
            </div>
            <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                <table className="w-full rounded-lg text-xs text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 border-b border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-2.5 md:table-cell hidden"> Action </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('name')}>
                                    Name {getSortIndicator('name')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 lg:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('generation')}>
                                    Generation {getSortIndicator('generation')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 lg:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('group')}>
                                    Group {getSortIndicator('group')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('major')}>
                                    Major {getSortIndicator('major')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('degrees')}>
                                    Degrees {getSortIndicator('degrees')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 2xl:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('faculty')}>
                                    Faculty {getSortIndicator('faculty')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 2xl:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"> {/* New Semester Column */}
                                <div className="flex items-center" onClick={() => handleSort('semester')}>
                                    Semester {getSortIndicator('semester')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2 sm:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('shift')}>
                                    Shift {getSortIndicator('shift')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('status')}>
                                    Status {getSortIndicator('status')}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-normal text-gray-700 dark:text-gray-400">
                        {currentTableData.length > 0 ? (
                            currentTableData.map((data) => ( 
                                // --- UPDATED: Row with conditional rendering for loading state ---
                                <tr 
                                    key={data.id} 
                                    className={`bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${
                                        rowLoadingId === data.id 
                                        ? 'cursor-wait bg-gray-100 dark:bg-gray-700' 
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'
                                    }`}
                                    onClick={() => handleRowClick(data.id)}
                                >
                                    {rowLoadingId === data.id ? (
                                        // Loading state: Show spinner centered in the row
                                        <td colSpan={10} className="px-6 py-2.5 text-center">
                                            <div className="flex justify-center items-center">
                                                <Spinner />
                                            </div>
                                        </td>
                                    ) : (
                                        // Normal state: Show class data
                                        <>
                                            <th scope="row" className="px-6 py-2.5 font-medium text-gray-900 whitespace-nowrap dark:text-white md:table-cell hidden">
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRowClick(data.id);
                                                        }}
                                                        className={`p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300`} 
                                                    >
                                                        <EditIcon className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); 
                                                            toggleClassStatus(data.id);
                                                        }}
                                                        className={`p-1 ${data.status === 'active' ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'}`}
                                                        title={data.status === 'active' ? 'Archive Classroom' : 'Activate Classroom'}
                                                    >
                                                        <ArchiveIcon className="size-4" />
                                                    </button>
                                                </div>
                                            </th>
                                            <td className="px-6 py-2"> {data.name} </td>
                                            <td className="px-6 py-2 lg:table-cell hidden"> {data.generation} </td>
                                            <td className="px-6 py-2 lg:table-cell hidden"> {data.group} </td>
                                            <td className="px-6 py-2"> {data.major} </td>
                                            <td className="px-6 py-2"> {data.degrees} </td>
                                            <td className="px-6 py-2 2xl:table-cell hidden"> {data.faculty} </td>
                                            <td className="px-6 py-2 2xl:table-cell hidden"> {data.semester} </td>
                                            <td className="px-6 py-2 sm:table-cell hidden"> {data.shift} </td>
                                            <td className="px-6 py-2 capitalize">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    data.status === 'active'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                    {data.status}
                                                </span>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr className="bg-white dark:bg-gray-800">
                                <td colSpan={10} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    No matching results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="text-xs text-gray-700 border-t border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <td className="px-6 py-2.5 md:table-cell hidden"></td>
                            <td className="px-6 py-2.5">
                                <input
                                    type="text"
                                    placeholder="Search name..."
                                    value={searchTexts.name}
                                    onChange={(e) => handleSearchChange('name', e.target.value)}
                                    className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5 lg:table-cell hidden">
                                <input
                                    type="text"
                                    placeholder="Search gen..."
                                    value={searchTexts.generation}
                                    onChange={(e) => handleSearchChange('generation', e.target.value)}
                                    className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5 lg:table-cell hidden">
                                <input
                                    type="text"
                                    placeholder="Search group..."
                                    value={searchTexts.group}
                                    onChange={(e) => handleSearchChange('group', e.target.value)}
                                    className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5">
                                <input
                                    type="text"
                                    placeholder="Search major..."
                                    value={searchTexts.major}
                                    onChange={(e) => handleSearchChange('major', e.target.value)}
                                    className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5">
                                <input
                                    type="text"
                                    placeholder="Search degrees..."
                                    value={searchTexts.degrees}
                                    onChange={(e) => handleSearchChange('degrees', e.target.value)}
                                    className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5 2xl:table-cell hidden">
                                <input
                                    type="text"
                                    placeholder="Search faculty..."
                                    value={searchTexts.faculty}
                                    onChange={(e) => handleSearchChange('faculty', e.target.value)}
                                    className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5 2xl:table-cell hidden"> {/* New Semester Search */}
                                <input
                                    type="text"
                                    placeholder="Search sem..."
                                    value={searchTexts.semester}
                                    onChange={(e) => handleSearchChange('semester', e.target.value)}
                                    className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5 sm:table-cell hidden">
                                <input
                                    type="text"
                                    placeholder="Search shift..."
                                    value={searchTexts.shift}
                                    onChange={(e) => handleSearchChange('shift', e.target.value)}
                                    className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:w-auto">
                    Showing{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {(currentPage - 1) * itemsPerPage + 1}-
                        {Math.min(currentPage * itemsPerPage, filteredClassData.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {filteredClassData.length}
                    </span>
                </span>
                <div className="flex items-center gap-2">
                    <label htmlFor="items-per-page" className="text-xs font-normal text-gray-500 dark:text-gray-400">
                        Items per page:
                    </label>
                    <select
                        id="items-per-page"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-full focus:ring-blue-500 focus:border-blue-500 px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                    >
                        {itemsPerPageOptions.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <ul className="inline-flex -space-x-px rtl:space-x-reverse text-xs h-8">
                    <li>
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1 || rowLoadingId}
                            className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                    </li>
                    {getPageNumbers().map((pageNumber) => (
                        <li key={pageNumber}>
                            <button
                                onClick={() => goToPage(pageNumber)}
                                disabled={rowLoadingId}
                                className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${
                                    currentPage === pageNumber
                                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-white'
                                        : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {pageNumber}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages || rowLoadingId}
                            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Render the ClassCreatePopup component */}
            <ClassCreatePopup
                isOpen={showCreatePopup}
                onClose={handleClosePopup}
                onSave={handleSaveNewClass}
            />
        </div>
    );
};

export default function AdminDashboardPage() {
    return (
        <AdminLayout activeItem="class" pageTitle="Class Management">
            <ClassViewContent/>
        </AdminLayout>
    );
}