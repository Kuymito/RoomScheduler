<<<<<<< Updated upstream
import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import InstructorPageSkeleton from './components/InstructorPageSkeleton';
import InstructorClientView from './components/InstructorClientView'; // We will create this next

/**
 * Mock data fetching function. In a real app, this would fetch from your database.
 * Since this is a Server Component, this function runs on the server, not in the browser.
 */
const fetchInstructorData = async () => {
    const initialInstructorData = [
        { id: 1, name: 'Sok Mean', firstName: 'Sok', lastName: 'Mean', email: 'sok.mean@example.com', phone: '012345678', majorStudied: 'Computer Science', qualifications: 'PhD', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=68' },
        { id: 2, name: 'Sok Chan', firstName: 'Sok', lastName: 'Chan', email: 'sok.chan@example.com', phone: '012345679', majorStudied: 'Information Technology', qualifications: 'Master', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=52' },
        { id: 3, name: 'Dara Kim', firstName: 'Dara', lastName: 'Kim', email: 'dara.kim@example.com', phone: '012345680', majorStudied: 'Information Systems', qualifications: 'Professor', status: 'active', profileImage: null },
        { id: 4, name: 'Lina Heng', firstName: 'Lina', lastName: 'Heng', email: 'lina.heng@example.com', phone: '012345681', majorStudied: 'Artificial Intelligence', qualifications: 'PhD', status: 'archived', profileImage: 'https://i.pravatar.cc/150?img=25' },
        { id: 5, name: 'Virak Chea', firstName: 'Virak', lastName: 'Chea', email: 'virak.chea@example.com', phone: '012345682', majorStudied: 'Data Science', qualifications: 'Master', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=33' },
        { id: 6, name: 'Sophea Nov', firstName: 'Sophea', lastName: 'Nov', email: 'sophea.nov@example.com', phone: '012345683', majorStudied: 'Machine Learning', qualifications: 'Lecturer', status: 'active', profileImage: null },
        { id: 7, name: 'Chanthy Pen', firstName: 'Chanthy', lastName: 'Pen', email: 'chanthy.pen@example.com', phone: '012345684', majorStudied: 'Data Analytics', qualifications: 'Associate Professor', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=17' },
        { id: 8, name: 'Vicheka Sreng', firstName: 'Vicheka', lastName: 'Sreng', email: 'vicheka.sreng@example.com', phone: '012345685', majorStudied: 'Software Engineering', qualifications: 'PhD', status: 'archived', profileImage: 'https://i.pravatar.cc/150?img=41' },
    ];

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return initialInstructorData;
};


/**
 * The main page component is now an async Server Component.
 */
export default async function AdminInstructorsPage() {
    // Data is fetched on the server before the page is sent to the client.
    const initialInstructors = await fetchInstructorData();

=======
// /app/admin/instructor/page.jsx (or wherever InstructorViewContent is)
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout'; 
import InstructorCreatePopup from './components/InstructorCreatePopup'; 
import { useRouter } from 'next/navigation';

// Default Avatar Icon component
const DefaultAvatarIcon = ({ className = "w-8 h-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`border border-gray-300 rounded-full p-1 dark:border-gray-600 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const API_URL = 'http://localhost:8080/api/v1/instructors';
const API_ARCHIVE_URL = `${API_URL}/archive`; 

const InstructorViewContent = () => {
    const router = useRouter();
    const [instructorData, setInstructorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    const mapApiToComponentData = useCallback((apiInstructor) => {
        const firstName = apiInstructor.firstName || '';
        const lastName = apiInstructor.lastName || '';
        return {
            id: apiInstructor.instructorId,
            name: `${firstName} ${lastName}`.trim(),
            firstName: firstName,
            lastName: lastName,
            email: apiInstructor.email || '',
            phone: apiInstructor.phone || '',
            majorStudied: apiInstructor.major || '',
            qualifications: apiInstructor.degree || '',
            status: apiInstructor.is_archived ? 'archived' : 'active',
            profileImage: apiInstructor.profile || null,
            address: apiInstructor.address || '',
            roleId: apiInstructor.roleId,
            departmentId: apiInstructor.departmentId,
            is_archived: apiInstructor.is_archived 
        };
    }, []);
    
    const mapComponentToApiData = useCallback((componentInstructor, isNew = false) => {
        const apiData = {
            firstName: componentInstructor.firstName,
            lastName: componentInstructor.lastName,
            email: componentInstructor.email,
            phone: componentInstructor.phone,
            degree: componentInstructor.qualifications,
            major: componentInstructor.majorStudied,
            profile: componentInstructor.profileImage,
            address: componentInstructor.address || "",
            is_archived: componentInstructor.status === 'archived', // For general PUT to /instructor/{id} if used
            ...( !isNew && componentInstructor.id && { instructorId: componentInstructor.id }),
            ...( !isNew && { roleId: componentInstructor.roleId }),
            ...( !isNew && { departmentId: componentInstructor.departmentId }),
        };
        if (isNew) {
            delete apiData.instructorId;
        }
        return apiData;
    }, []);

    const fetchInstructors = useCallback(async () => {
        // ... (fetchInstructors logic - remains the same)
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.status === "OK" && Array.isArray(result.payload)) {
                setInstructorData(result.payload.map(mapApiToComponentData));
            } else {
                throw new Error(result.message || "Failed to fetch instructors: Invalid data format");
            }
        } catch (e) {
            console.error("Failed to fetch instructors:", e);
            setError(e.message);
            setInstructorData([]);
        } finally {
            setLoading(false);
        }
    }, [mapApiToComponentData]);

    useEffect(() => {
        fetchInstructors();
    }, [fetchInstructors]);

    const handleRowClick = (instructorId) => {
        // ... (handleRowClick logic - remains the same)
        if (instructorId === null || instructorId === undefined) {
            console.warn("Attempted to navigate with null/undefined instructorId.");
            setError("Cannot view details for this instructor: Invalid ID.");
            return;
        }
        router.push(`/admin/instructor/${instructorId}`);
    };

    const [showCreateInstructorPopup, setShowCreateInstructorPopup] = useState(false);
    const handleCreateInstructorClick = () => setShowCreateInstructorPopup(true);
    const handleCloseInstructorPopup = () => setShowCreateInstructorPopup(false);
    
    const handleSaveNewInstructor = async (newInstructorFormData) => {
        // ... (handleSaveNewInstructor logic - remains the same)
        const apiPayload = mapComponentToApiData({
            ...newInstructorFormData,
            status: 'active', 
        }, true);

        setActionLoading(true); 
        setError(null);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            await fetchInstructors(); 
            setCurrentPage(1);
            setShowCreateInstructorPopup(false);
        } catch (e) {
            console.error("Failed to save instructor:", e);
            setError(`Failed to save instructor: ${e.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const [statusFilter, setStatusFilter] = useState('active');
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (column) => {
        // ... (handleSort logic - remains the same)
        setCurrentPage(1);
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedInstructorData = useMemo(() => {
        // ... (sortedInstructorData logic - remains the same)
        if (!sortColumn) return instructorData;
        const sortableData = [...instructorData];
        sortableData.sort((a, b) => {
            const aValue = String(a[sortColumn] ?? '').toLowerCase();
            const bValue = String(b[sortColumn] ?? '').toLowerCase();
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return sortableData;
    }, [instructorData, sortColumn, sortDirection]);

    const getSortIndicator = (column) => { 
        // ... (getSortIndicator logic - remains the same) 
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
        name: '', email: '', phone: '', majorStudied: '', qualifications: '',
    });
    const handleSearchChange = (column, value) => {
        // ... (handleSearchChange logic - remains the same)
        setSearchTexts(prev => ({ ...prev, [column]: value }));
        setCurrentPage(1);
    };

    const filteredInstructorData = useMemo(() => {
        // ... (filteredInstructorData logic - remains the same)
        let currentFilteredData = [...sortedInstructorData];
        if (statusFilter !== 'all') {
            currentFilteredData = currentFilteredData.filter(item => item.status === statusFilter);
        }
        Object.keys(searchTexts).forEach(column => {
            const searchTerm = String(searchTexts[column]).toLowerCase().trim();
            if (searchTerm) {
                currentFilteredData = currentFilteredData.filter(item =>
                    String(item[column] ?? '').toLowerCase().includes(searchTerm)
                );
            }
        });
        return currentFilteredData;
    }, [sortedInstructorData, searchTexts, statusFilter]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPageOptions = [5, 10, 20, 50];
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
    const totalPages = Math.ceil(filteredInstructorData.length / itemsPerPage);

    const currentTableData = useMemo(() => {
        // ... (currentTableData logic - remains the same)
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredInstructorData.slice(startIndex, endIndex);
    }, [filteredInstructorData, currentPage, itemsPerPage]);

    const goToNextPage = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    const goToPage = (pageNumber) => setCurrentPage(pageNumber);
    const handleItemsPerPageChange = (event) => {
        // ... (handleItemsPerPageChange logic - remains the same)
        setItemsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };
    const getPageNumbers = () => { 
        // ... (getPageNumbers logic - remains the same) 
        const pageNumbers = []; const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        if (endPage - startPage + 1 < maxPagesToShow) startPage = Math.max(1, endPage - maxPagesToShow + 1);
        for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
        return pageNumbers;
    };

    // --- Active/Archive Logic (PUT Request to specific endpoint) ---
    const toggleInstructorStatus = async (instructorId) => {
        if (instructorId === null || instructorId === undefined) {
            console.error("Cannot toggle status: Instructor ID is null or undefined.");
            setError("Cannot update status: Invalid Instructor ID.");
            return;
        }

        const instructorToUpdate = instructorData.find(item => item.id === instructorId);
        if (!instructorToUpdate) {
            console.error("Instructor not found for status toggle:", instructorId);
            setError("Instructor not found.");
            return;
        }

        const newSetArchiveValue = instructorToUpdate.status === 'active'; 

        const newDisplayStatus = newSetArchiveValue ? 'archived' : 'active';
        const originalData = [...instructorData];
        setInstructorData(prevData =>
            prevData.map(item =>
                item.id === instructorId ? { ...item, status: newDisplayStatus, is_archived: newSetArchiveValue } : item
            )
        );
        
        setActionLoading(true);
        setError(null);

        try {
            const archivePayload = {
                instructorId: instructorId,
                setarchive: newSetArchiveValue 
            };

            console.log("Sending to archive endpoint:", API_ARCHIVE_URL, "Payload:", archivePayload);

            const response = await fetch(API_ARCHIVE_URL, { 
                method: 'PATCH', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(archivePayload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status} ${response.statusText}` }));
                setInstructorData(originalData); 
                throw new Error(errorData.message || `Failed to update status: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            if (result.status === "OK") {
                if (result.payload) {
                     setInstructorData(prevData =>
                         prevData.map(item =>
                             item.id === instructorId ? mapApiToComponentData(result.payload) : item
                         )
                     );
                } else {
                    console.log("Instructor status updated (optimistic). API returned OK without payload.");
                }
            } else {
                console.warn("Archive operation reported non-OK status from API:", result.message);
                setInstructorData(originalData); 
                setError(result.message || "Archive operation failed with non-OK status from API.");
            }

        } catch (e) {
            console.error("Failed to toggle instructor status:", e);
            setError(`Failed to update status: ${e.message}`);
            setInstructorData(originalData); 
        } finally {
            setActionLoading(false);
        }
    };
    

    const EditIcon = ({ className = "w-[17px] h-[17px]" }) => ( 
        <svg className={className} width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.06671 2.125H4.95837C3.00254 2.125 2.12504 3.0025 2.12504 4.95833V12.0417C2.12504 13.9975 3.00254 14.875 4.95837 14.875H12.0417C13.9975 14.875 14.875 13.9975 14.875 12.0417V8.93333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.6579 3.2658L6.28042 7.64327C6.10542 7.81827 5.93042 8.15055 5.89125 8.3928L5.64958 10.112C5.56625 10.7037 6.01958 11.157 6.61125 11.0737L8.33042 10.832C8.57292 10.7928 8.90542 10.6178 9.08042 10.4428L13.4579 6.0653C14.2662 5.25705 14.5796 4.26827 13.4579 3.14662C12.3362 2.03205 11.3479 2.45705 10.6579 3.2658Z" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.8999 4.02502C10.2716 5.66752 11.0583 6.45419 12.7008 6.82585" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    const ArchiveIcon = ({ className = "w-[17px] h-[17px]" }) => ( 
        <svg className={className} width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.1667 5.66667V12.0417C14.1667 13.9975 13.2892 14.875 11.3334 14.875H5.66671C3.71087 14.875 2.83337 13.9975 2.83337 12.0417V5.66667" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.875 2.125H2.125L2.12504 5.66667H14.875V2.125Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.79163 8.5H9.20829" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    if (loading && instructorData.length === 0) { 
        return (
            <div className="p-6 dark:text-white text-center">
                <div className="inline-flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading instructors...
                </div>
            </div>
        );
    }
    
    if (error && instructorData.length === 0 && !actionLoading) { 
        return (
            <div className="p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-700 dark:text-red-100 dark:border-red-600" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }


    return (
        <div className="p-6 dark:text-white">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold">Instructor List</h1>
            </div>
             {error && !actionLoading && (
                <div className="my-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative dark:bg-red-700 dark:text-red-100 dark:border-red-600" role="alert">
                    <span className="block sm:inline">Error: {error}</span>
                    <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-3 py-2 text-red-500 hover:text-red-700 dark:text-red-200 dark:hover:text-red-400">
                        <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </button>
                </div>
            )}
            <hr className="border-t border-gray-200 mt-4 mb-4 dark:border-gray-700" />
            <div className="flex items-center justify-between mt-2 mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTexts.name}
                        onChange={(e) => handleSearchChange('name', e.target.value)}
                        className="block w-72 p-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700"
                    />
                    <div className="inline-flex rounded-md shadow-xs" role="group">
                        <button
                            type="button"
                            onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
                            className={`px-4 py-2 text-sm font-medium rounded-s-lg border ${
                                statusFilter === 'active'
                                    ? 'text-blue-700 bg-blue-50 border-blue-300 dark:bg-gray-700 dark:text-blue-300 dark:border-blue-600'
                                    : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700'
                            }`}
                        > Active </button>
                        <button
                            type="button"
                            onClick={() => { setStatusFilter('archived'); setCurrentPage(1); }}
                            className={`px-4 py-2 text-sm font-medium border-t border-b ${
                                statusFilter === 'archived'
                                    ? 'text-red-700 bg-red-50 border-red-300 dark:bg-gray-700 dark:text-red-300 dark:border-red-600'
                                    : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-red-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700'
                            }`}
                        > Archive </button>
                        <button
                            type="button"
                            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                            className={`px-4 py-2 text-sm font-medium rounded-e-lg border ${
                                statusFilter === 'all'
                                    ? 'text-purple-700 bg-purple-50 border-purple-300 dark:bg-gray-700 dark:text-purple-300 dark:border-purple-600'
                                    : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-purple-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700'
                            }`}
                        > All </button>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleCreateInstructorClick}
                    disabled={loading || actionLoading}
                    className="text-white bg-green-700 hover:bg-green-800 focus:ring-2 focus:ring-green-600 font-medium rounded-md text-sm px-3 py-2 text-center inline-flex items-center dark:bg-green-600 me-2 mb-2 dark:hover:bg-green-700 dark:focus:ring-green-800 gap-1 disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create
                </button>
            </div>

            <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                <table className="w-full rounded-lg text-sm text-left rtl:text-right text-gray-500">
                     <thead className="text-xs text-gray-700 border-b border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-2.5"> Action </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('name')}> Name {getSortIndicator('name')} </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 sm:table-cell hidden">
                                <div className="flex items-center" onClick={() => handleSort('email')}> Email {getSortIndicator('email')} </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 lg:table-cell hidden">
                                <div className="flex items-center" onClick={() => handleSort('phone')}> Phone {getSortIndicator('phone')} </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('majorStudied')}> Major {getSortIndicator('majorStudied')} </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 sm:table-cell hidden">
                                <div className="flex items-center" onClick={() => handleSort('qualifications')}> Degree {getSortIndicator('qualifications')} </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('status')}> Status {getSortIndicator('status')} </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-normal text-gray-700 dark:text-gray-400">
                        {(loading && currentTableData.length === 0) && ( 
                             <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"><div className="inline-flex items-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Loading...</div></td></tr>
                        )}
                        {!loading && currentTableData.length > 0 ? (
                            currentTableData.map((data) => (
                                <tr key={data.id || `instructor-${Math.random()}`} 
                                    className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                                    onClick={() => data.id !== null && data.id !== undefined ? handleRowClick(data.id) : console.warn("Cannot navigate: Row data ID is null/undefined")}>
                                    <th scope="row" className="px-6 py-2.5 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    if (data.id !== null && data.id !== undefined) handleRowClick(data.id);
                                                    else {
                                                        console.warn("Edit action: Row data ID is null/undefined for data:", data);
                                                        setError("Cannot edit: Instructor ID is missing.");
                                                    }
                                                }}
                                                disabled={data.id === null || data.id === undefined || actionLoading}
                                                className={`p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed`} >
                                                <EditIcon className="size-5" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (data.id !== null && data.id !== undefined) toggleInstructorStatus(data.id);
                                                    else {
                                                        console.warn("Archive action: Row data ID is null/undefined for data:", data);
                                                        setError("Cannot change status: Instructor ID is missing.");
                                                    }
                                                }}
                                                disabled={data.id === null || data.id === undefined || actionLoading}
                                                className={`p-1 ${data.status === 'active' ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                title={data.status === 'active' ? 'Archive Instructor' : 'Activate Instructor'}
                                            >
                                                <ArchiveIcon className="size-5" />
                                            </button>
                                        </div>
                                    </th>
                                    <td className="px-6 py-2"> <div className="flex items-center gap-2"> {data.profileImage ? (<img src={data.profileImage} alt={data.name} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600" /> ) : ( <DefaultAvatarIcon className="w-8 h-8 rounded-full text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500 p-1" /> )} {data.name} </div> </td>
                                    <td className="px-6 py-2 sm:table-cell hidden"> {data.email} </td>
                                    <td className="px-6 py-2 lg:table-cell hidden"> {data.phone} </td>
                                    <td className="px-6 py-2"> {data.majorStudied} </td>
                                    <td className="px-6 py-2 sm:table-cell hidden"> {data.qualifications} </td>
                                    <td className="px-6 py-2 capitalize"> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ data.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }`}> {data.status} </span> </td>
                                </tr>
                            ))
                        ) : (
                            !loading && (
                                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">No matching results found.</td></tr>
                            )
                        )}
                    </tbody>
                     <tfoot className="text-xs text-gray-700 border-t border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <td className="px-6 py-2.5"></td>
                            <td className="px-6 py-2.5"> <input type="text" placeholder="Search name..." value={searchTexts.name} onChange={(e) => handleSearchChange('name', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" /> </td>
                            <td className="px-6 py-2.5 sm:table-cell hidden"> <input type="text" placeholder="Search email..." value={searchTexts.email} onChange={(e) => handleSearchChange('email', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" /> </td>
                            <td className="px-6 py-2.5 lg:table-cell hidden"> <input type="text" placeholder="Search phone..." value={searchTexts.phone} onChange={(e) => handleSearchChange('phone', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" /> </td>
                            <td className="px-6 py-2.5"> <input type="text" placeholder="Search major..." value={searchTexts.majorStudied} onChange={(e) => handleSearchChange('majorStudied', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" /> </td>
                            <td className="px-6 py-2.5 sm:table-cell hidden"> <input type="text" placeholder="Search qual..." value={searchTexts.qualifications} onChange={(e) => handleSearchChange('qualifications', e.target.value)} className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" /> </td>
                            <td className="px-6 py-2.5"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
                 <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:w-auto"> Showing{' '} <span className="font-semibold text-gray-900 dark:text-white"> {filteredInstructorData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredInstructorData.length)} </span>{' '} of{' '} <span className="font-semibold text-gray-900 dark:text-white"> {filteredInstructorData.length} </span> </span>
                 <div className="flex items-center gap-2"> <label htmlFor="items-per-page" className="text-sm font-normal text-gray-500 dark:text-gray-400"> Items per page: </label> <select id="items-per-page" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-blue-500 focus:border-blue-500 px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={itemsPerPage} onChange={handleItemsPerPageChange} > {itemsPerPageOptions.map(option => (<option key={option} value={option}> {option} </option>))} </select> </div>
                 <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8"> <li> <button onClick={goToPreviousPage} disabled={currentPage === 1 || totalPages === 0} className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" > Previous </button> </li> {getPageNumbers().map((pageNumber) => ( <li key={pageNumber}> <button onClick={() => goToPage(pageNumber)} className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${ currentPage === pageNumber ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white' }`} > {pageNumber} </button> </li> ))} <li> <button onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" > Next </button> </li> </ul>
            </nav>

            <InstructorCreatePopup
                isOpen={showCreateInstructorPopup}
                onClose={handleCloseInstructorPopup}
                onSave={handleSaveNewInstructor}
            />
        </div>
    );
};

export default function AdminInstructorsPage() {
>>>>>>> Stashed changes
    return (
        <AdminLayout activeItem="instructor" pageTitle="Instructor Management">
            <Suspense fallback={<InstructorPageSkeleton />}>
                 {/* We render the Client Component here, passing the server-fetched data as a prop.
                   The browser will receive the pre-rendered HTML for the table, making the initial
                   load appear instant. Then, the client-side JavaScript will load to make it interactive.
                 */}
                <InstructorClientView initialInstructors={initialInstructors} />
            </Suspense>
        </AdminLayout>
    );
}
