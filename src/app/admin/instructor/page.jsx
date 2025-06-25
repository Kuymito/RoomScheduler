'use client';

import { useState, useMemo, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import InstructorCreatePopup from './components/InstructorCreatePopup';
import { useRouter } from 'next/navigation';
import InstructorPageSkeleton from './components/InstructorPageSkeleton';

const API_BASE_URL = 'https://jaybird-new-previously.ngrok-free.app/api/v1';

const InstructorViewContent = () => {
    // --- State Variables ---
    const router = useRouter();
    const [instructorData, setInstructorData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [navigatingRowId, setNavigatingRowId] = useState(null);
    const [showCreateInstructorPopup, setShowCreateInstructorPopup] = useState(false);
    const [statusFilter, setStatusFilter] = useState('active');
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [departments, setDepartments] = useState([]);
    const [searchTexts, setSearchTexts] = useState({
        name: '',
        email: '',
        phone: '',
        major: '',
        degree: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPageOptions = [5, 10, 20, 50];
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
    const [error, setError] = useState(null);

    // Format API data to match table structure
    const formatInstructorData = (apiData) => {
        if (!apiData || !Array.isArray(apiData)) return [];
        
        return apiData.map(instructor => ({
            id: instructor.instructorId,
            instructorId: instructor.instructorId,
            firstName: instructor.firstName,
            lastName: instructor.lastName,
            name: `${instructor.firstName} ${instructor.lastName}`,
            email: instructor.email,
            phone: instructor.phone,
            degree: instructor.degree,
            major: instructor.major,
            majorStudied: instructor.major,
            qualifications: instructor.degree,
            profileImage: instructor.profile,
            archived: instructor.archived,
            status: instructor.archived ? 'archived' : 'active',
            departmentName: instructor.departmentName,
            address: instructor.address
        }));
    };

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            if (!token) return;
    
            const response = await fetch(`${API_BASE_URL}/department`, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
    
            if (response.ok) {
                const data = await response.json();
                setDepartments(data.payload || []);
            } else {
                console.error("Failed to fetch departments");
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    // Fetch instructors from API
    const fetchInstructors = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${API_BASE_URL}/instructors`, {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('jwtToken');
                    router.push('/login');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setInstructorData(formatInstructorData(data.payload));
        } catch (error) {
            setError(error.message || "Failed to fetch instructors");
            console.error("Error fetching instructors:", error);
            setInstructorData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Handlers ---
    const handleRowClick = (instructorId) => {
        if (navigatingRowId) return; // Prevent multiple clicks
        setNavigatingRowId(instructorId); // Set loading state for this row
        
        // Navigate to instructor details page
        router.push(`/admin/instructor/${instructorId}`);
        
        // Reset navigating state after a short delay
        setTimeout(() => {
            setNavigatingRowId(null);
        }, 500);
    };

    const handleCreateInstructorClick = () => {
        setShowCreateInstructorPopup(true);
    };

    const handleCloseInstructorPopup = () => {
        setShowCreateInstructorPopup(false);
    };

    const handleSaveNewInstructor = async (newInstructorData) => {
        // Find the corresponding department from the 'major' field.
        // This comparison is case-insensitive.
        const department = departments.find(
            (dept) => dept.name.toLowerCase() === newInstructorData.major?.toLowerCase()
        );
    
        // If no matching department is found, show an error and stop.
        if (!department) {
            setError(`The major "${newInstructorData.major}" is not a valid department. Please use a valid department name.`);
            return; // Stop the function execution
        }
    
        // Construct the final payload with the dynamically found departmentId
        const finalPayload = {
            ...newInstructorData,
            roleId: 2,
            departmentId: department.departmentId // Use the ID from the found department
        };
    
        try {
            setError(null); // Clear previous errors before a new attempt
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(`${API_BASE_URL}/instructors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(finalPayload)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create instructor');
            }
    
            await fetchInstructors();
            setCurrentPage(1);
            setShowCreateInstructorPopup(false);
        } catch (error) {
            setError(error.message || "Failed to create instructor");
            console.error("Error creating instructor:", error);
        }
    };

    const handleSort = (column) => {
        setCurrentPage(1);
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedInstructorData = useMemo(() => {
        if (!sortColumn) return instructorData;

        return [...instructorData].sort((a, b) => {
            const aValue = String(a[sortColumn]).toLowerCase();
            const bValue = String(b[sortColumn]).toLowerCase();
            return sortDirection === 'asc' 
                ? aValue.localeCompare(bValue) 
                : bValue.localeCompare(aValue);
        });
    }, [instructorData, sortColumn, sortDirection]);

    const getSortIndicator = (column) => {
        if (sortColumn !== column) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1 opacity-40">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
            );
        }
        return sortDirection === 'asc' ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
        );
    };

    const handleSearchChange = (column, value) => {
        setSearchTexts(prev => ({ ...prev, [column]: value }));
        setCurrentPage(1);
    };

    const filteredInstructorData = useMemo(() => {
        let result = [...sortedInstructorData];

        if (statusFilter !== 'all') {
            const filterArchived = statusFilter === 'archived';
            result = result.filter(item => item.archived === filterArchived);
        }

        Object.entries(searchTexts).forEach(([column, searchTerm]) => {
            if (searchTerm) {
                const term = searchTerm.toLowerCase().trim();
                result = result.filter(item => {
                    if (column === 'name') {
                        return `${item.firstName} ${item.lastName}`.toLowerCase().includes(term);
                    }
                    return String(item[column]).toLowerCase().includes(term);
                });
            }
        });

        return result;
    }, [sortedInstructorData, searchTexts, statusFilter]);

    const totalPages = Math.ceil(filteredInstructorData.length / itemsPerPage);
    const currentTableData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredInstructorData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredInstructorData, currentPage, itemsPerPage]);

    const toggleInstructorStatus = async (instructorId) => {
        try {
          // 1. Prepare the exact JSON structure
          const requestBody = {
            is_archived: !instructorData.find(i => i.instructorId === instructorId)?.archived
          };
      
          // 2. Make the API call
          const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/archive`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            },
            body: JSON.stringify(requestBody) // Must stringify the object
          });
      
          // 3. Handle response
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update status');
          }
      
          // 4. Update UI state
          const updatedData = await response.json();
          setInstructorData(prev => 
            prev.map(item => 
              item.instructorId === instructorId 
                ? { ...item, archived: updatedData.payload.archived }
                : item
            )
          );
      
        } catch (error) {
          console.error('Archive error:', error);
          setError(error.message);
        }
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

    const DefaultAvatarIcon = ({ className = "w-8 h-8" }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 border border-gray-300 rounded-full p-1 dark:border-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
    );

    // Initial data fetch
    useEffect(() => {
        fetchInstructors();
        fetchDepartments();
    }, []);

    if (isLoading) {
        return <InstructorPageSkeleton />;
    }

    return (
        <div className="p-6 dark:text-white">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <svg className="fill-current h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                        </svg>
                    </button>
                </div>
            )}

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
                    onClick={handleCreateInstructorClick}
                    className="text-white bg-green-700 hover:bg-green-800 focus:ring-2 focus:ring-green-600 font-medium rounded-md text-xs px-3 py-2 text-center inline-flex items-center dark:bg-green-600 me-2 mb-2 dark:hover:bg-green-700 dark:focus:ring-green-800 gap-1"
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
                            <th scope="col" className="px-6 py-2.5">Action</th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('name')}>
                                    Name {getSortIndicator('name')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 sm:table-cell hidden">
                                <div className="flex items-center" onClick={() => handleSort('email')}>
                                    Email {getSortIndicator('email')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 lg:table-cell hidden">
                                <div className="flex items-center" onClick={() => handleSort('phone')}>
                                    Phone {getSortIndicator('phone')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('major')}>
                                    Major {getSortIndicator('major')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 sm:table-cell hidden">
                                <div className="flex items-center" onClick={() => handleSort('degree')}>
                                    Degree {getSortIndicator('degree')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('status')}>
                                    Status {getSortIndicator('status')}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-normal text-gray-700 dark:text-gray-400">
                        {currentTableData.length > 0 ? (
                            currentTableData.map((data) => (
                                <tr 
                                    key={data.instructorId} 
                                    className={`bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700
                                        ${navigatingRowId === data.instructorId 
                                            ? 'opacity-60 bg-gray-100 dark:bg-gray-700'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'
                                        }
                                    `}
                                    onClick={() => !navigatingRowId && handleRowClick(data.instructorId)}
                                >
                                    <th scope="row" className="px-6 py-2.5 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRowClick(data.instructorId);
                                                }}
                                                className={`p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300`}
                                            >
                                                <EditIcon className="size-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleInstructorStatus(data.instructorId);
                                                }}
                                                className={`p-1 ${data.archived ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300' : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'}`}
                                                title={data.archived ? 'Activate Instructor' : 'Archive Instructor'}
                                            >
                                                <ArchiveIcon className="size-4" />
                                            </button>
                                        </div>
                                    </th>
                                    <td className="px-6 py-2">
                                        <div className="flex items-center gap-2">
                                            {data.profileImage ? (
                                                <img
                                                    src={data.profileImage}
                                                    alt={data.name}
                                                    className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                                />
                                            ) : (
                                                <DefaultAvatarIcon className="w-8 h-8 rounded-full text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500 p-1" />
                                            )}
                                            {data.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 sm:table-cell hidden">{data.email}</td>
                                    <td className="px-6 py-2 lg:table-cell hidden">{data.phone}</td>
                                    <td className="px-6 py-2">{data.major}</td>
                                    <td className="px-6 py-2 sm:table-cell hidden">{data.degree}</td>
                                    <td className="px-6 py-2 capitalize">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            !data.archived
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {data.archived ? 'archived' : 'active'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="bg-white dark:bg-gray-800">
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    No matching results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:w-auto">
                    Showing{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {(currentPage - 1) * itemsPerPage + 1}-
                        {Math.min(currentPage * itemsPerPage, filteredInstructorData.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {filteredInstructorData.length}
                    </span>
                </span>
                <div className="flex items-center gap-2 text-xs">
                    <label htmlFor="items-per-page" className="text-xs font-normal text-gray-500 dark:text-gray-400">
                        Items per page:
                    </label>
                    <select
                        id="items-per-page"
                        className="bg-gray-50 text-xs border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-blue-500 focus:border-blue-500 px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        {itemsPerPageOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <ul className="inline-flex -space-x-px rtl:space-x-reverse text-xs h-8">
                    <li>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                    </li>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }
                        return (
                            <li key={pageNum}>
                                <button
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${
                                        currentPage === pageNum
                                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-white'
                                            : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            </li>
                        );
                    })}
                    <li>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>

            <InstructorCreatePopup
                isOpen={showCreateInstructorPopup}
                onClose={handleCloseInstructorPopup}
                onSave={handleSaveNewInstructor}
                departments={departments} // Pass the departments list as a prop
            />
        </div>
    );
};

export default function AdminInstructorsPage() {
    return (
        <AdminLayout activeItem="instructor" pageTitle="Instructor Management">
            <InstructorViewContent/>
        </AdminLayout>
    );
}