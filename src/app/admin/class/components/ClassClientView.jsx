'use client';

import { useState, useMemo, useTransition, useEffect, useRef } from 'react';
import ClassCreatePopup from './ClassCreatePopup';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { classService } from '@/services/class.service';
import ClassPageSkeleton from './ClassPageSkeleton';
import SuccessPopup from '../../profile/components/SuccessPopup';

// --- Reusable Icon and Spinner Components ---
const Spinner = () => ( <svg className="animate-spin h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> );
const EditIcon = ({ className = "w-[14px] h-[14px]" }) => ( <svg className={className} width="14" height="14" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.06671 2.125H4.95837C3.00254 2.125 2.12504 3.0025 2.12504 4.95833V12.0417C2.12504 13.9975 3.00254 14.875 4.95837 14.875H12.0417C13.9975 14.875 14.875 13.9975 14.875 12.0417V8.93333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.6579 3.2658L6.28042 7.64327C6.10542 7.81827 5.93042 8.15055 5.89125 8.3928L5.64958 10.112C5.56625 10.7037 6.01958 11.157 6.61125 11.0737L8.33042 10.832C8.57292 10.7928 8.90542 10.6178 9.08042 10.4428L13.4579 6.0653C14.2662 5.25705 14.5796 4.26827 13.4579 3.14662C12.3362 2.03205 11.3479 2.45705 10.6579 3.2658Z" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.8999 4.02502C10.2716 5.66752 11.0583 6.45419 12.7008 6.82585" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const ArchiveIcon = ({ className = "w-[14px] h-[14px]" }) => ( <svg className={className} width="14" height="14" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.1667 5.66667V12.0417C14.1667 13.9975 13.2892 14.875 11.3334 14.875H5.66671C3.71087 14.875 2.83337 13.9975 2.83337 12.0417V5.66667" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.875 2.125H2.125L2.12504 5.66667H14.875V2.125Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.79163 8.5H9.20829" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> );

// Define fetcher for SWR
const classFetcher = ([key, token]) => classService.getAllClasses(token);

// Mapping from shiftId to the full descriptive name used in the UI.
const shiftIdToFullNameMap = {
    1: 'Morning Shift',
    2: 'Noon Shift',
    3: 'Afternoon Shift',
    4: 'Evening Shift',
    5: 'Weekend Shift'
};

export default function ClassClientView({ initialClasses, initialDepartments }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const filterMenuRef = useRef(null);

    const { data: classes, error: classesError, mutate: mutateClasses } = useSWR(
        session?.accessToken ? ['/api/v1/class', session.accessToken] : null,
        classFetcher,
        {
            fallbackData: initialClasses,
            revalidateOnFocus: true,
            onSuccess: () => setIsLoading(false),
            onError: () => setIsLoading(false),
        }
    );

    const departments = initialDepartments;
    const departmentsError = !initialDepartments;

    const [classData, setClassData] = useState([]);
    const [isPending, startTransition] = useTransition();
    const [rowLoadingId, setRowLoadingId] = useState(null);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successPopupMessage, setSuccessPopupMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPageOptions = [5, 10, 20, 50];
    
    // State for items per page, initialized from localStorage or default
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedSize = localStorage.getItem('classItemsPerPage');
            const savedValue = savedSize ? parseInt(savedSize, 10) : itemsPerPageOptions[0];
            return itemsPerPageOptions.includes(savedValue) ? savedValue : itemsPerPageOptions[0];
        }
        return itemsPerPageOptions[0];
    });
    
    // --- Filter States ---
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('active');
    const [onlineClassFilter, setOnlineClassFilter] = useState(false);
    const [expiredClassFilter, setExpiredClassFilter] = useState(false);
    const [unassignedClassFilter, setUnassignedClassFilter] = useState(false);

    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [searchTexts, setSearchTexts] = useState({ name: '', generation: '', group: '', major: '', degrees: '', faculty: '', semester: '', shift: '' });

    // Effect to save itemsPerPage to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('classItemsPerPage', itemsPerPage);
        }
    }, [itemsPerPage]);

    useEffect(() => {
        if (classes) {
            const fourYearsAgo = new Date();
            fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);
            const expiryThreshold = new Date(fourYearsAgo);
            expiryThreshold.setMonth(expiryThreshold.getMonth() - 2);

            const formattedData = classes.map(item => {
                // Determine if the class is online
                let isOnline = false;
                if (item.dailySchedule && typeof item.dailySchedule === 'object') {
                    for (const day in item.dailySchedule) {
                        if (item.dailySchedule[day] && item.dailySchedule[day].online === true) {
                            isOnline = true;
                            break;
                        }
                    }
                }

                // Determine if the class is unassigned
                const isUnassigned = !item.dailySchedule || typeof item.dailySchedule !== 'object' || Object.keys(item.dailySchedule).length === 0;

                return {
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
                    online: isOnline,
                    unassigned: isUnassigned,
                    expired: item.createdAt && new Date(item.createdAt) < expiryThreshold,
                    createdAt: item.createdAt,
                };
            });
            setClassData(formattedData);
        }
    }, [classes]);

    const handleSaveNewClass = async (newClassPayload) => {
        if (!session?.accessToken) {
            console.error("Cannot create class: not authenticated.");
            return;
        }
        try {
            await classService.createClass(newClassPayload, session.accessToken);
            mutateClasses(); 
            setSuccessPopupMessage(`Class "${newClassPayload.className}" has been created successfully.`);
            setShowSuccessPopup(true);
        } catch (error) {
            console.error("Failed to create class:", error);
        }
    };

    const handleSort = (column) => {
        setCurrentPage(1);
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const getSortIndicator = (column) => {
        if (sortColumn === column) {
            return sortDirection === 'asc' ?
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg> :
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>;
        }
        return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1 opacity-40"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /></svg>;
    };
    
    const handleSearchChange = (column, value) => {
        setSearchTexts(prev => ({ ...prev, [column]: value }));
        setCurrentPage(1);
    };

    const handleRowClick = (classId) => {
        setRowLoadingId(classId);
        startTransition(() => {
            router.push(`/admin/class/${classId}`);
        });
    };

    const toggleClassStatus = async (id) => {
        const classToUpdate = classData.find(item => item.id === id);
        if (!classToUpdate) return;

        // Optimistic UI update
        const originalData = [...classData];
        const updatedData = classData.map(item =>
            item.id === id ? { ...item, status: item.status === 'active' ? 'archived' : 'active' } : item
        );
        setClassData(updatedData);

        const isArchived = classToUpdate.status === 'active';

        try {
            await classService.patchClass(id, { isArchived }, session.accessToken);
            // Re-fetch the data to ensure consistency with the server
            mutateClasses();
        } catch (error) {
            console.error("Failed to update class status:", error);
            // Revert the UI change if the API call fails
            setClassData(originalData);
            // Optionally, show an error message to the user
        }
    };

    const filteredAndSortedData = useMemo(() => {
        let dataToProcess = [...classData];
        if (statusFilter !== 'all') {
            dataToProcess = dataToProcess.filter(item => item.status.toLowerCase() === statusFilter);
        }
        if (onlineClassFilter) {
            dataToProcess = dataToProcess.filter(item => item.online);
        }
        if (expiredClassFilter) {
            dataToProcess = dataToProcess.filter(item => item.expired);
        }
        if (unassignedClassFilter) {
            dataToProcess = dataToProcess.filter(item => item.unassigned);
        }
        Object.entries(searchTexts).forEach(([column, searchTerm]) => {
            if (searchTerm) {
                dataToProcess = dataToProcess.filter(item => String(item[column] || '').toLowerCase().includes(String(searchTerm).toLowerCase().trim()));
            }
        });
        if (sortColumn) {
            dataToProcess.sort((a, b) => {
                const aVal = a[sortColumn];
                const bVal = b[sortColumn];
                const aStr = String(aVal).toLowerCase();
                const bStr = String(bVal).toLowerCase();
                if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
                if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return dataToProcess;
    }, [classData, statusFilter, onlineClassFilter, expiredClassFilter, unassignedClassFilter, searchTexts, sortColumn, sortDirection]);

    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
    const currentTableData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedData, currentPage, itemsPerPage]);

    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const goToPage = (pageNumber) => setCurrentPage(pageNumber);
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
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
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setIsFilterMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [filterMenuRef]);


    if (isLoading) {
        return <ClassPageSkeleton />;
    }

     if (classesError) {
        return <div className="p-6 text-center text-red-500">Failed to load class data. Please try again.</div>
    }

    return (
        <div className="p-6 dark:text-white">
            <SuccessPopup
                show={showSuccessPopup}
                onClose={() => setShowSuccessPopup(false)}
                title="Class Created"
                message={successPopupMessage}
            />
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold">Class List</h1>
            </div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-4" />
            <div className="flex items-center justify-between mt-2 mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <input type="text" placeholder="Search by name..." value={searchTexts.name} onChange={(e) => handleSearchChange('name', e.target.value)} className="block md:w-72 sm:w-52 w-32 p-2 text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:focus:ring-offset-gray-800"/>
                    <div ref={filterMenuRef} className="relative inline-block text-left">
                        <div>
                            <button type="button" onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="inline-flex justify-center w-full rounded-lg border border-gray-300 shadow-sm px-4 py-1.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800" id="menu-button" aria-expanded="true" aria-haspopup="true">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                                </svg>
                            </button>
                        </div>
                        {isFilterMenuOpen && (
                        <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 z-10" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="-1">
                            <div className="py-1" role="none">
                                <div className="px-4 py-2 text-xs text-gray-400">Status</div>
                                <button onClick={() => setStatusFilter('active')} className={`${statusFilter === 'active' ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-200 hover:dark:bg-gray-600  block w-full text-left px-4 py-2 text-sm`} role="menuitem" tabIndex="-1">Active</button>
                                <button onClick={() => setStatusFilter('archived')} className={`${statusFilter === 'archived' ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-200 hover:dark:bg-gray-600 block w-full text-left px-4 py-2 text-sm`} role="menuitem" tabIndex="-1">Archived</button>
                                <button onClick={() => setStatusFilter('all')} className={`${statusFilter === 'all' ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-200 hover:dark:bg-gray-600 block w-full text-left px-4 py-2 text-sm`} role="menuitem" tabIndex="-1">All</button>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                <div className="px-4 py-2 text-xs text-gray-400">Class Type</div>
                                <button onClick={() => setOnlineClassFilter(!onlineClassFilter)} className={`${onlineClassFilter ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-200 hover:dark:bg-gray-600 block w-full text-left px-4 py-2 text-sm`} role="menuitem" tabIndex="-1">Online Class</button>
                                <button onClick={() => setExpiredClassFilter(!expiredClassFilter)} className={`${expiredClassFilter ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-200 hover:dark:bg-gray-600 block w-full text-left px-4 py-2 text-sm`} role="menuitem" tabIndex="-1">Expired Class</button>
                                <button onClick={() => setUnassignedClassFilter(!unassignedClassFilter)} className={`${unassignedClassFilter ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-200 hover:dark:bg-gray-600 block w-full text-left px-4 py-2 text-sm`} role="menuitem" tabIndex="-1">Unassigned Class</button>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
                <button type="button" onClick={() => setShowCreatePopup(true)} className="text-white bg-[#75B846] hover:bg-[#87D94D] focus:ring-2 focus:ring-green-600 font-medium rounded-md text-xs px-3 py-2 text-center inline-flex items-center dark:bg-[#75B846] me-2 dark:hover:bg-[#79c344] dark:focus:ring-green-800 gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Create
                </button>
            </div>
            
            <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                <table className="w-full rounded-lg text-xs text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 border-b border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-2.5 md:table-cell hidden">Action</th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('name')}>
                                <div className="flex items-center">Name {getSortIndicator('name')}</div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer lg:table-cell hidden hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('generation')}>
                                <div className="flex items-center">Gen {getSortIndicator('generation')}</div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer lg:table-cell hidden hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('group')}>
                                <div className="flex items-center">Group {getSortIndicator('group')}</div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('major')}>
                                <div className="flex items-center">Major {getSortIndicator('major')}</div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('degrees')}>
                                <div className="flex items-center">Degree {getSortIndicator('degrees')}</div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer 2xl:table-cell hidden hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('faculty')}>
                                <div className="flex items-center">Faculty {getSortIndicator('faculty')}</div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer 2xl:table-cell hidden hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('semester')}>
                                <div className="flex items-center">Semester {getSortIndicator('semester')}</div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer sm:table-cell hidden hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('shift')}>
                                <div className="flex items-center">Shift {getSortIndicator('shift')}</div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('status')}>
                                <div className="flex items-center">Status {getSortIndicator('status')}</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-normal text-gray-700 dark:text-gray-400">
                        {currentTableData.length > 0 ? currentTableData.map((data) => ( 
                            <tr key={data.id} className={`bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${(isPending && rowLoadingId === data.id) ? 'cursor-wait bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'}`} onClick={() => handleRowClick(data.id)}>
                                {isPending && rowLoadingId === data.id ? (
                                    <td colSpan={10} className="px-6 py-3 text-center"><div className="flex justify-center items-center h-6"><Spinner /></div></td>
                                ) : (
                                    <>
                                        <td className="px-6 py-2.5 font-medium text-gray-900 whitespace-nowrap dark:text-white md:table-cell hidden">
                                            <div className="flex gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); handleRowClick(data.id); }} className={`p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300`}><EditIcon className="size-4" /></button>
                                                <button onClick={(e) => { e.stopPropagation(); toggleClassStatus(data.id); }} className={`p-1 ${data.status.toLowerCase() === 'active' ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'}`} title={data.status.toLowerCase() === 'active' ? 'Archive Classroom' : 'Activate Classroom'}><ArchiveIcon className="size-4" /></button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2"> {data.name} </td>
                                        <td className="px-6 py-2 lg:table-cell hidden"> {data.generation} </td>
                                        <td className="px-6 py-2 lg:table-cell hidden"> {data.group} </td>
                                        <td className="px-6 py-2"> {data.major} </td>
                                        <td className="px-6 py-2"> {data.degrees} </td>
                                        <td className="px-6 py-2 2xl:table-cell hidden"> {data.faculty} </td>
                                        <td className="px-6 py-2 2xl:table-cell hidden"> {data.semester} </td>
                                        <td className="px-6 py-2 sm:table-cell hidden"> {data.shift} </td>
                                        <td className="px-6 py-2 capitalize"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${data.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{data.status}</span></td>
                                    </>
                                )}
                            </tr>
                        )) : (
                            <tr className="bg-white dark:bg-gray-800"><td colSpan={10} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No matching results found.</td></tr>
                        )}
                    </tbody>
                    <tfoot className="text-xs text-gray-700 border-t border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <td className="px-6 py-2.5 md:table-cell hidden"></td>
                            <td className="px-6 py-2.5">
                                <input type="text" placeholder="Search name..." value={searchTexts.name} onChange={(e) => handleSearchChange('name', e.target.value)} className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                            </td>
                            <td className="px-6 py-2.5 lg:table-cell hidden">
                                <input type="text" placeholder="Search gen..." value={searchTexts.generation} onChange={(e) => handleSearchChange('generation', e.target.value)} className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                            </td>
                            <td className="px-6 py-2.5 lg:table-cell hidden">
                                <input type="text" placeholder="Search group..." value={searchTexts.group} onChange={(e) => handleSearchChange('group', e.target.value)} className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                            </td>
                            <td className="px-6 py-2.5">
                                <input type="text" placeholder="Search major..." value={searchTexts.major} onChange={(e) => handleSearchChange('major', e.target.value)} className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                            </td>
                            <td className="px-6 py-2.5">
                                <input type="text" placeholder="Search degrees..." value={searchTexts.degrees} onChange={(e) => handleSearchChange('degrees', e.target.value)} className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                            </td>
                            <td className="px-6 py-2.5 2xl:table-cell hidden">
                                <input type="text" placeholder="Search faculty..." value={searchTexts.faculty} onChange={(e) => handleSearchChange('faculty', e.target.value)} className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                            </td>
                            <td className="px-6 py-2.5 2xl:table-cell hidden">
                                <input type="text" placeholder="Search sem..." value={searchTexts.semester} onChange={(e) => handleSearchChange('semester', e.target.value)} className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                            </td>
                            <td className="px-6 py-2.5 sm:table-cell hidden">
                                <input type="text" placeholder="Search shift..." value={searchTexts.shift} onChange={(e) => handleSearchChange('shift', e.target.value)} className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                            </td>
                            <td className="px-6 py-2.5"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:w-auto">
                    Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredAndSortedData.length}</span>
                </span>
                <div className="flex items-center gap-2">
                    <label htmlFor="items-per-page" className="text-xs font-normal text-gray-500 dark:text-gray-400">Items per page:</label>
                    <select id="items-per-page" value={itemsPerPage} onChange={handleItemsPerPageChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                        {itemsPerPageOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                    </select>
                </div>
                <ul className="inline-flex -space-x-px rtl:space-x-reverse text-xs h-8">
                    <li><button onClick={goToPreviousPage} disabled={currentPage === 1} className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50">Previous</button></li>
                    {getPageNumbers().map((pageNumber) => (<li key={pageNumber}><button onClick={() => goToPage(pageNumber)} className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${currentPage === pageNumber ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'}`}>{pageNumber}</button></li>))}
                    <li><button onClick={goToNextPage} disabled={currentPage === totalPages} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50">Next</button></li>
                </ul>
            </nav>
            <ClassCreatePopup 
                isOpen={showCreatePopup} 
                onClose={() => setShowCreatePopup(false)} 
                onSave={handleSaveNewClass}
                departments={departments || []}
                departmentsError={departmentsError}
                existingClasses={classData}
            />
        </div>
    );
}