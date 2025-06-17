import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ClassCreatePopup from './components/ClassCreatePopup'; // Ensure this popup also aligns with new DTO fields
import { useRouter } from 'next/navigation';

// Define the base URL for your API (adjust if needed)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// --- API Helper Functions ---
const fetchClassesFromAPI = async (isArchivedQueryParam) => {
    let url = `${API_BASE_URL}/class`; // Endpoint for classes
    if (isArchivedQueryParam !== null && isArchivedQueryParam !== undefined) {
        url += `?isArchived=${isArchivedQueryParam}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch classes. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch classes. Status: ${response.status}`);
    }
    const apiResponse = await response.json();
    if (apiResponse.status !== 'OK' && apiResponse.status !== 200 && apiResponse.status !== 201) { // Check for your API's success status
        throw new Error(apiResponse.message || 'API returned an error');
    }
    return apiResponse.payload; // The 'payload' array from your API response
};

const createClassAPI = async (classCreateDto) => {
    const response = await fetch(`${API_BASE_URL}/class`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classCreateDto),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to create class. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to create class. Status: ${response.status}`);
    }
    const apiResponse = await response.json();
     if (apiResponse.status !== 'CREATED' && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'API returned an error on create');
    }
    return apiResponse.payload;
};

const archiveClassAPI = async (classId, archiveStatus) => {
    const response = await fetch(`${API_BASE_URL}/class/${classId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: archiveStatus }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to archive class. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to archive class. Status: ${response.status}`);
    }
    const apiResponse = await response.json();
    if (apiResponse.status !== 'OK' && apiResponse.status !== 200) {
        throw new Error(apiResponse.message || 'API returned an error on archive');
    }
    return apiResponse.payload;
};

// Placeholder for delete if you implement it
// const deleteClassAPI = async (classId) => { ... };


const ClassPageSkeleton = () => {
  // A reusable component for a single, pulsing table row
    const SkeletonTableRow = () => (
        <tr className="bg-white dark:bg-gray-800 animate-pulse w-full">
            {/* Action */}
            <td className="px-4 py-4">
                <div className="h-4 w-12 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Name */}
            <td className="px-4 py-4">
                <div className="h-4 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Generation */}
            <td className="px-4 py-4 sm:table-cell hidden">
                <div className="h-4 w-32 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Group */}
            <td className="px-4 py-4 lg:table-cell hidden">
                <div className="h-4 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Major */}
            <td className="px-4 py-4">
                <div className="h-4 w-20 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Degree */}
            <td className="px-4 py-4 sm:table-cell hidden">
                <div className="h-4 w-16 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Faculty */}
            <td className="px-4 py-4">
                <div className="h-5 w-12 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            </td>
            {/* Semester */}
            <td className="px-4 py-4 2xl:table-cell hidden">
                <div className="h-4 w-20 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Shift */}
            <td className="px-4 py-4 sm:table-cell hidden">
                <div className="h-4 w-20 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </td>
            {/* Status */}
            <td className="px-4 py-4 sm:table-cell hidden">
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
            <div className="h-9 w-72 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-9 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
            <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        </div>

        {/* Table Skeleton */}
        <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
            <table className="w-full text-xs text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-700">
                    {/* You can keep the real header as it provides context, or skeletonize it too */}
                    <tr>
                    <th scope="col" className="px-4 py-4">Action</th>
                    <th scope="col" className="px-4 py-4">Name</th>
                    <th scope="col" className="px-4 py-4 sm:table-cell hidden">Generation</th>
                    <th scope="col" className="px-4 py-4 lg:table-cell hidden">Group</th>
                    <th scope="col" className="px-4 py-4">Major</th>
                    <th scope="col" className="px-4 py-4 sm:table-cell hidden">Degree</th>
                    <th scope="col" className="px-4 py-4 2xl:table-cell hidden"> Faculty </th>
                    <th scope="col" className="px-4 py-4 2xl:table-cell hidden"> Semester </th>
                    <th scope="col" className="px-4 py-4 sm:table-cell hidden"> Shift </th>
                <th scope="col" className="px-6 py-3">Status</th>
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

const ClassViewContent = () => {
    const [classData, setClassData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPageOptions = [5, 10, 20, 50];
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
    const [navigatingRowId, setNavigatingRowId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('active'); // Default to 'active', API will translate this
    const [sortColumn, setSortColumn] = useState(null); // Stores the key used for sorting (e.g., 'name', 'generation')
    const [sortDirection, setSortDirection] = useState('asc');
    const router = useRouter();
    const [apiError, setApiError] = useState(null);

    // Transformation function: API response item to frontend table item
    const transformApiToFrontend = (apiItem) => {
        // Your current table expects: id, name, generation, group, major, degrees, faculty, semester, shift, status
        // API provides: classId, className, generation, groupName, majorName, degreeName, isArchived, instructor, department, shift (object)
        return {
            id: apiItem.classId,
            name: apiItem.className,
            generation: apiItem.generation,
            group: apiItem.groupName,
            major: apiItem.majorName,
            degrees: apiItem.degreeName,
            // faculty: apiItem.department?.name || 'N/A', // Or derive from instructor if applicable
            // For faculty, your API gives department name. If faculty is different, adjust DTO.
            // Using department name as faculty for now.
            faculty: apiItem.department?.name || (apiItem.instructor?.departmentName) || 'N/A', 
            semester: apiItem.semester || 'N/A', // API response DTO doesn't have semester currently
            shift: apiItem.shift ? `${apiItem.shift.startTime} - ${apiItem.shift.endTime}` : 'N/A',
            status: apiItem.archived ? 'archived' : 'active', // 'archived' in API DTO
            // Keep original API item if needed for updates or detailed views
            _originalApiData: apiItem
        };
    };
    
    // Transformation function: Frontend popup data to ClassCreateDto for API
    const transformPopupToApiDto = (popupData) => {
        // ClassCreateDto expects: className, credits, generation, groupName, majorName, degreeName, facultyName, semester, shift (String for now based on DTO)
        // Your frontend state for popup might have different keys. Adjust mapping here.
        // This is a placeholder, assuming popupData keys match DTO fields.
        return {
            className: popupData.name, // Example: popup uses 'name'
            generation: popupData.generation,
            groupName: popupData.group,     // Example: popup uses 'group'
            majorName: popupData.major,     // Example: popup uses 'major'
            degreeName: popupData.degrees,   // Example: popup uses 'degrees'
            facultyName: popupData.faculty, // This field is not in your current ClassResponseDto from API
            semester: popupData.semester,   // This field is not in your current ClassResponseDto from API
            shift: popupData.shift,         // This is a string in frontend; ClassCreateDto expects string for now
            // credits: popupData.credits,  // If you have credits
            // instructorId, departmentId, shiftId might be needed if ClassCreateDto is updated
        };
    };


    const loadInitialData = async () => {
        setIsLoading(true);
        setApiError(null);
        let queryArchived = null;
        if (statusFilter === 'active') queryArchived = false;
        else if (statusFilter === 'archived') queryArchived = true;
        // If statusFilter is 'all', queryArchived remains null (or undefined)

        try {
            const apiPayload = await fetchClassesFromAPI(queryArchived);
            setClassData(apiPayload.map(transformApiToFrontend));
        } catch (error) {
            console.error("Failed to fetch class data:", error);
            setApiError(error.message || "Could not load data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, [statusFilter]); // Reload when status filter changes

    const handleCreateClick = () => setShowCreatePopup(true);
    const handleClosePopup = () => setShowCreatePopup(false);

    const handleSaveNewClass = async (newClassPopupData) => {
        // newClassPopupData is the object from your ClassCreatePopup
        // It should have fields like: name, generation, group, major, degrees, faculty, semester, shift
        const classCreateDto = transformPopupToApiDto(newClassPopupData);

        // TODO: Your ClassCreateDto currently has fields like facultyName, semester, credits
        // which are not in your API's ClassResponseDto or latest Class entity.
        // Also, shift is a string. Your backend Class entity expects a Shift object.
        // You'll need to align the DTO used for creation with what your backend service can handle.
        // For example, ClassCreateDto might need to take shiftId (Long) instead of shift (String).
        // The DTOs I provided previously (ClassCreateDto) were based on your earlier service implementation.
        // Make sure ClassCreateDto on backend matches what you send here.

        try {
            const createdApiClass = await createClassAPI(classCreateDto);
            const newFrontendClass = transformApiToFrontend(createdApiClass);
            setClassData(prevData => [newFrontendClass, ...prevData]); // Add to top
            setShowCreatePopup(false);
            setCurrentPage(1);
            // Optionally: loadInitialData(); // To ensure full refresh if backend has side effects
        } catch (error) {
            console.error("Failed to save new class:", error);
            setApiError(error.message || "Could not save class.");
            // You might want to display this error in the popup or as a toast.
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

    const sortedClassData = useMemo(() => {
        if (!sortColumn) return classData;
        const sortableData = [...classData];
        sortableData.sort((a, b) => {
            let aValue = a[sortColumn];
            let bValue = b[sortColumn];
            if (sortColumn === 'generation' || sortColumn === 'group') {
                const aNum = parseInt(aValue, 10) || 0;
                const bNum = parseInt(bValue, 10) || 0;
                if (aNum < bNum) return sortDirection === 'asc' ? -1 : 1;
                if (aNum > bNum) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            } else {
                aValue = String(aValue || "").toLowerCase();
                bValue = String(bValue || "").toLowerCase();
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
        name: '', generation: '', group: '', major: '', degrees: '', faculty: '', semester: '', shift: '',
    });

    const handleSearchChange = (column, value) => {
        setSearchTexts(prev => ({ ...prev, [column]: value }));
        setCurrentPage(1);
    };

    const filteredClassData = useMemo(() => {
        let currentFilteredData = [...sortedClassData];
        // Status filter is applied by API now, so no need to filter by item.status here
        // if (statusFilter !== 'all') {
        //     currentFilteredData = currentFilteredData.filter(item => item.status === statusFilter);
        // }

        Object.keys(searchTexts).forEach(column => {
            const searchTerm = String(searchTexts[column]).toLowerCase().trim();
            if (searchTerm) {
                currentFilteredData = currentFilteredData.filter(item =>
                    String(item[column] || "").toLowerCase().includes(searchTerm)
                );
            }
        });
        return currentFilteredData;
    }, [sortedClassData, searchTexts /* removed statusFilter as it's handled by API fetch */]);

    const totalPages = Math.ceil(filteredClassData.length / itemsPerPage);
    const currentTableData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredClassData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredClassData, currentPage, itemsPerPage]);

    const goToNextPage = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages || 1));
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
        let endPage = Math.min(totalPages || 1, startPage + maxPagesToShow - 1);
        if (endPage - startPage + 1 < maxPagesToShow && totalPages >= maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        } else if (totalPages < maxPagesToShow) {
            startPage = 1; endPage = totalPages || 1;
        }
        for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
        return pageNumbers;
    };

    const toggleClassStatus = async (classId, currentFrontendStatus) => {
        const newArchiveBackendStatus = currentFrontendStatus === 'active'; // if 'active', we want to archive (true for backend)
        try {
            const updatedApiClass = await archiveClassAPI(classId, newArchiveBackendStatus);
            const updatedFrontendClass = transformApiToFrontend(updatedApiClass);
            setClassData(prevData =>
                prevData.map(item => (item.id === classId ? updatedFrontendClass : item))
            );
            // No need to setCurrentPage(1) if status filter is handled by API reload
            // If the item should "disappear" because of the statusFilter, it will on the next API call triggered by setStatusFilter
        } catch (error) {
            console.error("Failed to toggle class status:", error);
            setApiError(error.message || "Could not update status.");
        }
    };
    
    const handleRowClick = (classId) => {
        if (navigatingRowId) return;
        setNavigatingRowId(classId);
        router.push(`/admin/class/${classId}`); // Make sure this route exists and can handle the classId
    };

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
    
    if (isLoading) return <ClassPageSkeleton />;

    return (
        <div className="p-6 dark:text-white">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold">Class List</h1>
            </div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-4" />

            {apiError && (
                <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
                    <span className="font-medium">Error:</span> {apiError}
                </div>
            )}

            <div className="flex items-center justify-between mt-2 mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <input
                        type="text" placeholder="Search by name..."
                        value={searchTexts.name} onChange={(e) => handleSearchChange('name', e.target.value)}
                        className="block w-72 p-2 text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700"
                    />
                    <div className="inline-flex rounded-md shadow-xs" role="group">
                        {['active', 'archived', 'all'].map(filter => (
                            <button
                                key={filter} type="button"
                                onClick={() => { setStatusFilter(filter); /* loadInitialData will be triggered by useEffect */ }}
                                className={`px-4 py-2 text-xs font-medium border 
                                    ${filter === 'active' ? 'rounded-s-lg' : ''} 
                                    ${filter === 'all' ? 'rounded-e-lg' : ''} 
                                    ${ statusFilter === filter
                                        ? (filter === 'active' ? 'text-blue-700 bg-blue-50 border-blue-300 dark:bg-gray-700 dark:text-blue-300 dark:border-blue-600'
                                        : filter === 'archived' ? 'text-red-700 bg-red-50 border-red-300 dark:bg-gray-700 dark:text-red-300 dark:border-red-600'
                                        : 'text-purple-700 bg-purple-50 border-purple-300 dark:bg-gray-700 dark:text-purple-300 dark:border-purple-600')
                                        : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700'
                                    }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    type="button" onClick={handleCreateClick}
                    className="text-white bg-green-700 hover:bg-green-800 focus:ring-2 focus:ring-green-600 font-medium rounded-md text-xs px-3 py-2 text-center inline-flex items-center dark:bg-green-600 me-2 mb-2 dark:hover:bg-green-700 dark:focus:ring-green-800 gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Create
                </button>
            </div>

            <div className="relative overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                <table className="w-full rounded-lg text-xs text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 border-b border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-2.5 md:table-cell hidden">Action</th>
                            {/* Column Headers for frontend data keys */}
                            {['name', 'generation', 'group', 'major', 'degrees', 'faculty', 'semester', 'shift', 'status'].map(colKey => (
                                <th key={colKey} scope="col" className={`px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 
                                    ${['generation', 'group', 'degrees', 'faculty', 'semester', 'shift'].includes(colKey) ? 'lg:table-cell hidden' : ''}
                                    ${['faculty', 'semester'].includes(colKey) ? '2xl:table-cell' : ''}
                                    ${['shift', 'status'].includes(colKey) && !['lg:table-cell hidden'].includes(colKey) ? 'sm:table-cell hidden' : ''}
                                    ${colKey === 'status' ? '' : 'sm:table-cell'}
                                `}>
                                    <div className="flex items-center" onClick={() => handleSort(colKey)}>
                                        {colKey.charAt(0).toUpperCase() + colKey.slice(1)} {getSortIndicator(colKey)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-xs font-normal text-gray-700 dark:text-gray-400">
                        {currentTableData.length > 0 ? (
                            currentTableData.map((data) => (
                                <tr key={data.id}
                                    className={`bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${navigatingRowId === data.id ? 'opacity-60 bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'}`}
                                    onClick={() => !navigatingRowId && handleRowClick(data.id)} >
                                    <td scope="row" className="px-6 py-2.5 font-medium text-gray-900 whitespace-nowrap dark:text-white md:table-cell hidden">
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleRowClick(data.id); }}
                                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="Edit Class">
                                                <EditIcon className="size-4" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); toggleClassStatus(data.id, data.status);}}
                                                className={`p-1 ${data.status === 'active' ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'}`}
                                                title={data.status === 'active' ? 'Archive Class' : 'Activate Class'}>
                                                <ArchiveIcon className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                    {/* Data cells corresponding to frontend data keys */}
                                    <td className="px-6 py-2">{data.name}</td>
                                    <td className="px-6 py-2 lg:table-cell hidden">{data.generation}</td>
                                    <td className="px-6 py-2 lg:table-cell hidden">{data.group}</td>
                                    <td className="px-6 py-2">{data.major}</td>
                                    <td className="px-6 py-2 lg:table-cell hidden">{data.degrees}</td>
                                    <td className="px-6 py-2 2xl:table-cell hidden">{data.faculty}</td>
                                    <td className="px-6 py-2 2xl:table-cell hidden">{data.semester}</td>
                                    <td className="px-6 py-2 sm:table-cell hidden">{data.shift}</td>
                                    <td className="px-6 py-2 capitalize">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${data.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                            {data.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="10" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No matching results found.</td></tr>
                        )}
                    </tbody>
                     <tfoot className="text-xs text-gray-700 border-t border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <td className="px-6 py-2.5 md:table-cell hidden"></td>
                            {/* Search input for each searchable column, ensure 'key' in searchTexts matches displayed column key */}
                            {['name', 'generation', 'group', 'major', 'degrees', 'faculty', 'semester', 'shift'].map(key => (
                                <td key={`search-${key}`} className={`px-6 py-2.5 
                                    ${['generation', 'group', 'degrees', 'faculty', 'semester', 'shift'].includes(key) ? 'lg:table-cell hidden' : ''}
                                    ${['faculty', 'semester'].includes(key) ? '2xl:table-cell' : ''}
                                    ${key === 'shift' && !['lg:table-cell hidden'].includes(key) ? 'sm:table-cell hidden' : ''}
                                `}>
                                    <input type="text" placeholder={`Search ${key}...`} value={searchTexts[key]} onChange={(e) => handleSearchChange(key, e.target.value)}
                                        className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    />
                                </td>
                            ))}
                            <td className="px-6 py-2.5"></td> {/* For Status column, no search input */}
                        </tr>
                    </tfoot>
                </table>
            </div>
             <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:w-auto">
                    Showing <span className="font-semibold text-gray-900 dark:text-white">
                        {filteredClassData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                        {Math.min(currentPage * itemsPerPage, filteredClassData.length)}
                    </span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredClassData.length}</span>
                </span>
                <div className="flex items-center gap-2">
                    <label htmlFor="items-per-page" className="text-xs font-normal text-gray-500 dark:text-gray-400">Items per page:</label>
                    <select id="items-per-page" value={itemsPerPage} onChange={handleItemsPerPageChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-full focus:ring-blue-500 focus:border-blue-500 px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        {itemsPerPageOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                    </select>
                </div>
                <ul className="inline-flex -space-x-px rtl:space-x-reverse text-xs h-8">
                    <li><button onClick={goToPreviousPage} disabled={currentPage === 1} className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">Previous</button></li>
                    {getPageNumbers().map(pageNumber => (<li key={pageNumber}><button onClick={() => goToPage(pageNumber)} className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${currentPage === pageNumber ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}>{pageNumber}</button></li>))}
                    <li><button onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">Next</button></li>
                </ul>
            </nav>
            <ClassCreatePopup isOpen={showCreatePopup} onClose={handleClosePopup} onSave={handleSaveNewClass} />
        </div>
    );
};

export default function AdminDashboardPage() {
    return (
        <AdminLayout activeItem="class" pageTitle="Class Management">
            <Suspense fallback={<ClassPageSkeleton />}>
                {/* The Client Component is rendered here, receiving the server-fetched data as a prop.
                  The browser gets the pre-rendered HTML for the table, making the initial
                  load appear instant. Then, the client-side JavaScript loads to enable interactivity.
                */}
                <ClassClientView initialClasses={initialClasses} />
            </Suspense>
        </AdminLayout>
    );
}
