'use client';

import { useState, useMemo, useTransition, useEffect, useRef } from 'react';
import InstructorCreatePopup from './InstructorCreatePopup';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { instructorService } from '@/services/instructor.service';
import InstructorPageSkeleton from './InstructorPageSkeleton';
import Toast from '@/components/Toast'; // Import the new Toast component

// --- Reusable Icon and Spinner Components ---
const Spinner = () => ( <svg className="animate-spin h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> );
const EditIcon = ({ className = "w-[14px] h-[14px]" }) => ( <svg className={className} viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.06671 2.125H4.95837C3.00254 2.125 2.12504 3.0025 2.12504 4.95833V12.0417C2.12504 13.9975 3.00254 14.875 4.95837 14.875H12.0417C13.9975 14.875 14.875 13.9975 14.875 12.0417V8.93333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.6579 3.2658L6.28042 7.64327C6.10542 7.81827 5.93042 8.15055 5.89125 8.3928L5.64958 10.112C5.56625 10.7037 6.01958 11.157 6.61125 11.0737L8.33042 10.832C8.57292 10.7928 8.90542 10.6178 9.08042 10.4428L13.4579 6.0653C14.2662 5.25705 14.5796 4.26827 13.4579 3.14662C12.3362 2.03205 11.3479 2.45705 10.6579 3.2658Z" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.8999 4.02502C10.2716 5.66752 11.0583 6.45419 12.7008 6.82585" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const ArchiveIcon = ({ className = "w-[14px] h-[14px]" }) => ( <svg className={className} viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.1667 5.66667V12.0417C14.1667 13.9975 13.2892 14.875 11.3334 14.875H5.66671C3.71087 14.875 2.83337 13.9975 2.83337 12.0417V5.66667" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.875 2.125H2.125L2.12504 5.66667H14.875V2.125Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.79163 8.5H9.20829" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const DefaultAvatarIcon = ({ className = "w-12 h-12" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className={className}>
<path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg> );

const instructorFetcher = ([key, token]) => instructorService.getAllInstructors(token);

// Helper function to format phone numbers
const formatPhoneNumber = (phone) => {
    if (!phone || typeof phone !== 'string') return phone;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 10) return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    return phone;
};

export default function InstructorClientView({ initialInstructors, initialDepartments }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const filterMenuRef = useRef(null);

    const { data: instructors, error: instructorsError, mutate: mutateInstructors } = useSWR(
        session?.accessToken ? ['/api/v1/instructors', session.accessToken] : null,
        instructorFetcher,
        {
            fallbackData: initialInstructors,
            revalidateOnFocus: true,
            onSuccess: () => setIsLoading(false),
            onError: () => setIsLoading(false),
        }
    );

    const departments = initialDepartments;
    const departmentsError = !initialDepartments;

    const [instructorData, setInstructorData] = useState([]);
    const [isPending, startTransition] = useTransition();
    const [rowLoadingId, setRowLoadingId] = useState(null);
    const [showCreateInstructorPopup, setShowCreateInstructorPopup] = useState(false);
    const [statusFilter, setStatusFilter] = useState('active');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [searchTexts, setSearchTexts] = useState({ name: '', email: '', phone: '', majorStudied: '', qualifications: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPageOptions = [5, 10, 20, 50];
    
    // State for items per page, initialized from localStorage or default
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedSize = localStorage.getItem('instructorItemsPerPage');
            const savedValue = savedSize ? parseInt(savedSize, 10) : itemsPerPageOptions[0];
            return itemsPerPageOptions.includes(savedValue) ? savedValue : itemsPerPageOptions[0];
        }
        return itemsPerPageOptions[0];
    });

    // Effect to save itemsPerPage to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('instructorItemsPerPage', itemsPerPage);
        }
    }, [itemsPerPage]);

    useEffect(() => {
        if (instructors) {
            const formattedData = instructors.map(item => ({
                id: item.instructorId,
                name: `${item.firstName} ${item.lastName}`,
                email: item.email,
                phone: item.phone,
                majorStudied: item.major,
                qualifications: item.degree,
                status: item.archived ? 'archived' : 'active',
                profileImage: item.profile || null,
            }));
            setInstructorData(formattedData);
        }
    }, [instructors]);

    const handleRowClick = (instructorId) => {
        setRowLoadingId(instructorId);
        startTransition(() => {
            router.push(`/admin/instructor/${instructorId}`);
        });
    };
    
    const handleSaveNewInstructor = async (newInstructorData) => {
        if (!session?.accessToken) {
            console.error("Cannot create instructor: not authenticated.");
            return;
        }
        try {
            await instructorService.createInstructor(newInstructorData, session.accessToken);
            mutateInstructors();
            setToast({ show: true, message: `Instructor "${newInstructorData.firstName} ${newInstructorData.lastName}" created successfully.`, type: 'success' });
        } catch (error) {
            console.error("Failed to create instructor:", error);
            setToast({ show: true, message: `Failed to create instructor: ${error.message}`, type: 'error' });
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
    
    const toggleInstructorStatus = async (id) => {
        const instructorToUpdate = instructorData.find(item => item.id === id);
        if (!instructorToUpdate) return;

        // If instructor is active, check schedule before archiving
        if (instructorToUpdate.status === 'active') {
            try {
                const schedule = await instructorService.getInstructorSchedule(id, session.accessToken);
                if (schedule && schedule.length > 0) {
                    setToast({ show: true, message: "Cannot archive instructor with an active schedule.", type: 'error' });
                    return; // Stop the archiving process
                }
            } catch (error) {
                setToast({ show: true, message: `Error checking schedule: ${error.message}`, type: 'error' });
                return;
            }
        }

        // Optimistic UI update
        const originalData = [...instructorData];
        const updatedData = instructorData.map(item =>
            item.id === id ? { ...item, status: item.status === 'active' ? 'archived' : 'active' } : item
        );
        setInstructorData(updatedData);

        const isArchiving = instructorToUpdate.status === 'active';

        try {
            if (!session?.accessToken) {
                throw new Error("Authentication token not found.");
            }
            // Call the new service function
            await instructorService.archiveInstructor(id, isArchiving, session.accessToken);
            // Re-fetch the data to ensure consistency with the server
            mutateInstructors();
        } catch (error) {
            console.error("Failed to update instructor status:", error);
            // Revert the UI change if the API call fails
            setInstructorData(originalData);
            setToast({ show: true, message: `Failed to update status: ${error.message}`, type: 'error' });
        }
    };

    const filteredInstructorData = useMemo(() => {
        let data = [...instructorData];
        if (statusFilter !== 'all') {
            data = data.filter(item => item.status === statusFilter);
        }
        Object.entries(searchTexts).forEach(([column, searchTerm]) => {
            if (searchTerm) {
                data = data.filter(item => String(item[column] || '').toLowerCase().includes(String(searchTerm).toLowerCase().trim()));
            }
        });
        if (sortColumn) {
            data.sort((a, b) => {
                const aValue = String(a[sortColumn] || '').toLowerCase();
                const bValue = String(b[sortColumn] || '').toLowerCase();
                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [instructorData, statusFilter, searchTexts, sortColumn, sortDirection]);

    const totalPages = Math.ceil(filteredInstructorData.length / itemsPerPage);
    const currentTableData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredInstructorData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredInstructorData, currentPage, itemsPerPage]);

    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const goToPage = (page) => setCurrentPage(page);
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
        return <InstructorPageSkeleton />;
    }
    
    if (instructorsError) {
        return <div className="p-6 text-center text-red-500">Failed to load instructor data. Please try again.</div>;
    }

    return (
        <div className="p-6 dark:text-white">
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold">Instructor List</h1>
            </div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-4" />
            <div className="flex items-center justify-between mt-2 mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTexts.name}
                        onChange={(e) => handleSearchChange('name', e.target.value)}
                        className="block md:w-72 sm:w-52 w-32 p-2 text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:focus:ring-offset-gray-800"
                    />
                     <div ref={filterMenuRef} className="relative inline-block text-left">
                        <div>
                            <button type="button" onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="inline-flex justify-center w-full rounded-lg border border-gray-300 shadow-sm px-4 py-1.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800" id="menu-button" aria-expanded="true" aria-haspopup="true">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                                </svg>
                            </button>
                        </div>
                        {isFilterMenuOpen && (
                        <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 z-10" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="-1">
                            <div className="py-1" role="none">
                                <div className="px-4 py-2 text-xs text-gray-400">Status</div>
                                <button onClick={() => setStatusFilter('active')} className={`${statusFilter === 'active' ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-200 hover:dark:bg-gray-600 block w-full text-left px-4 py-2 text-sm`} role="menuitem" tabIndex="-1">Active</button>
                                <button onClick={() => setStatusFilter('archived')} className={`${statusFilter === 'archived' ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-200 hover:dark:bg-gray-600 block w-full text-left px-4 py-2 text-sm`} role="menuitem" tabIndex="-1">Archived</button>
                                <button onClick={() => setStatusFilter('all')} className={`${statusFilter === 'all' ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-200 hover:dark:bg-gray-600 block w-full text-left px-4 py-2 text-sm`} role="menuitem" tabIndex="-1">All</button>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
                <button type="button" onClick={() => setShowCreateInstructorPopup(true)} className="text-white bg-[#75B846] hover:bg-[#87D94D] focus:ring-2 focus:ring-green-600 font-medium rounded-md text-xs px-3 py-2 text-center inline-flex items-center dark:bg-[#75B846] me-2 dark:hover:bg-[#79c344] dark:focus:ring-green-800 gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Create
                </button>
            </div>
             <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                <table className="w-full rounded-lg text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 border-b border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-2.5"> Action </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('name')}> Name {getSortIndicator('name')}</div> 
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 sm:table-cell hidden">
                                <div className="flex items-center" onClick={() => handleSort('email')}> Email {getSortIndicator('email')}</div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 lg:table-cell hidden">
                                <div className="flex items-center" onClick={() => handleSort('phone')}> Phone {getSortIndicator('phone')}</div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('majorStudied')}> Major {getSortIndicator('majorStudied')}</div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 sm:table-cell hidden">
                                <div className="flex items-center" onClick={() => handleSort('qualifications')}> Degree {getSortIndicator('qualifications')}</div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('status')}> Status {getSortIndicator('status')}</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-normal text-gray-700 dark:text-gray-400">
                        {currentTableData.length > 0 ? (
                            currentTableData.map((data) => (
                                <tr key={data.id} className={`bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${ (isPending && rowLoadingId === data.id) ? 'cursor-wait bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'}`} onClick={() => handleRowClick(data.id)}>
                                    {(isPending && rowLoadingId === data.id) ? (
                                        <td colSpan={7} className="px-6 py-1 text-center"><div className="flex justify-center items-center h-10"><Spinner /></div></td>
                                    ) : (
                                        <>
                                            <td scope="row" className="px-6 py-2.5 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                <div className="flex gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleRowClick(data.id); }} className={`p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300`}><EditIcon className="size-4" /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); toggleInstructorStatus(data.id); }} className={`p-1 ${data.status === 'active' ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'}`} title={data.status === 'active' ? 'Archive Instructor' : 'Activate Instructor'}><ArchiveIcon className="size-4" /></button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2"><div className="flex items-center gap-2">{data.profileImage ? <img src={data.profileImage} alt={data.name} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"/> : <DefaultAvatarIcon className="size-8 rounded-full text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500" />} {data.name}</div></td>
                                            <td className="px-6 py-2 sm:table-cell hidden"> {data.email} </td>
                                            <td className="px-6 py-2 lg:table-cell hidden"> {formatPhoneNumber(data.phone)} </td>
                                            <td className="px-6 py-2"> {data.majorStudied} </td>
                                            <td className="px-6 py-2 sm:table-cell hidden"> {data.qualifications} </td>
                                            <td className="px-6 py-2 capitalize"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ data.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }`}>{data.status}</span></td>
                                        </>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr className="bg-white dark:bg-gray-800"><td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No matching results found.</td></tr>
                        )}
                    </tbody>
                    <tfoot className="text-xs text-gray-700 border-t border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <td className="px-6 py-2.5"></td>
                            <td className="px-6 py-2.5"><input type="text" placeholder="Search name..." value={searchTexts.name} onChange={(e) => handleSearchChange('name', e.target.value)} className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" /></td>
                            <td className="px-6 py-2.5 sm:table-cell hidden"><input type="text" placeholder="Search email..." value={searchTexts.email} onChange={(e) => handleSearchChange('email', e.target.value)} className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" /></td>
                            <td className="px-6 py-2.5 lg:table-cell hidden"><input type="text" placeholder="Search phone..." value={searchTexts.phone} onChange={(e) => handleSearchChange('phone', e.target.value)} className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" /></td>
                            <td className="px-6 py-2.5"><input type="text" placeholder="Search major..." value={searchTexts.majorStudied} onChange={(e) => handleSearchChange('majorStudied', e.target.value)} className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" /></td>
                            <td className="px-6 py-2.5 sm:table-cell hidden"><input type="text" placeholder="Search qual..." value={searchTexts.qualifications} onChange={(e) => handleSearchChange('qualifications', e.target.value)} className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" /></td>
                            <td className="px-6 py-2.5"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:w-auto">
                    Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredInstructorData.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredInstructorData.length}</span>
                </span>
                <div className="flex items-center gap-2 text-xs">
                    <label htmlFor="items-per-page" className="text-xs font-normal text-gray-500 dark:text-gray-400">Items per page:</label>
                    <select id="items-per-page" className="bg-gray-50 text-xs border border-gray-300 text-gray-900 rounded-full focus:ring-blue-500 focus:border-blue-500 px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                        {itemsPerPageOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                    </select>
                </div>
                <ul className="inline-flex -space-x-px rtl:space-x-reverse text-xs h-8">
                    <li><button onClick={goToPreviousPage} disabled={currentPage === 1 || isPending} className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">Previous</button></li>
                    {getPageNumbers().map((pageNumber) => (
                        <li key={pageNumber}><button onClick={() => goToPage(pageNumber)} disabled={isPending} className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${currentPage === pageNumber ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`}>{pageNumber}</button></li>
                    ))}
                    <li><button onClick={goToNextPage} disabled={currentPage === totalPages || isPending} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">Next</button></li>
                </ul>
            </nav>

            <InstructorCreatePopup 
                isOpen={showCreateInstructorPopup} 
                onClose={() => setShowCreateInstructorPopup(false)} 
                onSave={handleSaveNewInstructor}
                departments={departments || []}
                departmentsError={departmentsError}
                existingInstructors={instructorData}
            />
        </div>
    );
}