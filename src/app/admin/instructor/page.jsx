'use client';

import { useState, useMemo, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import InstructorCreatePopup from './components/InstructorCreatePopup';
import { useRouter } from 'next/navigation';

const fetchInstructorData = async () => {
    const initialInstructorData = [
        { id: 1, name: 'PhySOM', firstName: 'Phy', lastName: 'SOM', email: 'physom@gmail.com', phone: '012345678', majorStudied: 'Research Methodology', qualifications: 'PhD', status: 'active', profileImage: 'https://media.licdn.com/dms/image/v2/C5603AQFztJoAXb0vTQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1616584101352?e=2147483647&v=beta&t=LTffaDKSkt4qCR2VgtDbeRkKF8Trhm_pqe-T7tlvbXk' },
        { id: 2, name: 'Sam Vicheka', firstName: 'Sam', lastName: 'Vicheka', email: 'Sam Vicheka.com', phone: '093956789', majorStudied: 'Network', qualifications: 'Master', status: 'active', profileImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_UOl581yD7ebvnmXxGNIZiqRT4NTHD33igA&s' },
        { id: 3, name: 'Sreng Vichet', firstName: 'Sreng', lastName: 'Vichet', email: 'srengvichet@gmail.com', phone: '012345680', majorStudied: 'Information Technology', qualifications: 'Professor', status: 'active', profileImage: 'data:image/jpeg;base64,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' }, // No image
        { id: 4, name: 'Kang Sovannara', firstName: 'Kang', lastName: 'Sovannara', email: 'kangsovvanara@gmail.com', phone: '012345681', majorStudied: 'Management of Change / Business / Investment Management', qualifications: 'PhD', status: 'archived', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/DrKang-Sovannara-e1693628853981.png' },
        { id: 5, name: 'Sok Seang', firstName: 'Sok', lastName: 'Seang', email: 'sokseang@gmail.com', phone: '012345682', majorStudied: 'Entrepreneurship', qualifications: 'PhD', status: 'active', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/DrSok-Seang-e1693629096526.png' },
        { id: 6, name: 'Phim Runsinarith', firstName: 'Phim', lastName: 'Runsinarith', email: 'phimrunsinarith@gamil.com', phone: '012345683', majorStudied: 'Research / Economics', qualifications: 'PhD', status: 'active', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/DrPhim-Runsinarith-1-e1693629343364.png' }, // No image
        { id: 7, name: 'Ly Sok Heng', firstName: 'Ly', lastName: 'Sok Heng', email: 'sokheng@gamil.com', phone: '012345684', majorStudied: 'Economics/ Finance', qualifications: 'PhD', status: 'active', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/Dr-Ly-Sok-Heng-e1693626068844.png' },
        { id: 8, name: 'Heng Dyna', firstName: 'Heng', lastName: 'Dyna', email: 'hengdyna@gamil.com', phone: '012345684', majorStudied: 'Economics/ Finance', qualifications: 'PhD', status: 'active', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/Dr-Heng-Dyna.png' },
        
    ];

    return new Promise(resolve => setTimeout(() => resolve(initialInstructorData), 1000));
};

// --- Skeleton Loader for Instructor Page ---
const InstructorPageSkeleton = () => {
    
  // A reusable component for a single, pulsing table row
  const SkeletonTableRow = () => (
    <tr className="bg-white dark:bg-gray-800 animate-pulse">
      {/* Action */}
      <td className="px-4 py-4">
        <div className="h-4 w-12 bg-slate-300 dark:bg-slate-600 rounded"></div>
      </td>
      {/* Name with Avatar */}
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
          <div className="h-4 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
        </div>
      </td>
      {/* Email */}
      <td className="px-4 py-2 sm:table-cell hidden">
        <div className="h-4 w-32 bg-slate-300 dark:bg-slate-600 rounded"></div>
      </td>
      {/* Phone */}
      <td className="px-4 py-2 lg:table-cell hidden">
        <div className="h-4 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
      </td>
      {/* Major */}
      <td className="px-4 py-2">
        <div className="h-4 w-20 bg-slate-300 dark:bg-slate-600 rounded"></div>
      </td>
      {/* Degree */}
      <td className="px-4 py-2 sm:table-cell hidden">
        <div className="h-4 w-16 bg-slate-300 dark:bg-slate-600 rounded"></div>
      </td>
      {/* Status */}
      <td className="px-4 py-2">
        <div className="h-5 w-12 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
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
               <th scope="col" className="px-4 py-2">Action</th>
               <th scope="col" className="px-4 py-2">Name</th>
               <th scope="col" className="px-4 py-2 sm:table-cell hidden">Email</th>
               <th scope="col" className="px-4 py-2 lg:table-cell hidden">Phone</th>
               <th scope="col" className="px-4 py-2">Major</th>
               <th scope="col" className="px-4 py-2 sm:table-cell hidden">Degree</th>
               <th scope="col" className="px-4 py-2">Status</th>
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
    const [searchTexts, setSearchTexts] = useState({
        name: '',
        email: '',
        phone: '',
        majorStudied: '', // Changed from 'department'
        qualifications: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPageOptions = [5, 10, 20, 50];
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);

    //  --- Handlers ---
    const handleRowClick = (instructorId) => {
        // Prevent another navigation if one is already in progress
        if (navigatingRowId) return;

        // Set the ID of the row we are navigating from
        setNavigatingRowId(instructorId);

        // Proceed with the navigation
        router.push(`/admin/instructor/${instructorId}`);
    };

    const handleCreateInstructorClick = () => {
        setShowCreateInstructorPopup(true);
    };

    const handleCloseInstructorPopup = () => {
        setShowCreateInstructorPopup(false);
    };

    const handleSaveNewInstructor = (newInstructorData) => {
        const newId = instructorData.length > 0 ? Math.max(...instructorData.map(item => item.id)) + 1 : 1;
        const newInstructorWithStatus = {
            id: newId,
            ...newInstructorData,
            status: 'active', // New instructors default to active
        };

        setInstructorData(prevData => [...prevData, newInstructorWithStatus]);
        setCurrentPage(1); // Reset page after adding a new instructor
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

    const sortedInstructorData = useMemo(() => {
        if (!sortColumn) {
            return instructorData;
        }

        const sortableData = [...instructorData];

        sortableData.sort((a, b) => {
            const aValue = String(a[sortColumn]).toLowerCase();
            const bValue = String(b[sortColumn]).toLowerCase();

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return sortableData;
    }, [instructorData, sortColumn, sortDirection]);

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

    const handleSearchChange = (column, value) => {
        setSearchTexts(prev => ({
            ...prev,
            [column]: value,
        }));
        setCurrentPage(1); // Reset to first page on search
    };

    const filteredInstructorData = useMemo(() => {
        let currentFilteredData = [...sortedInstructorData];

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
    }, [sortedInstructorData, searchTexts, statusFilter]);


    const totalPages = Math.ceil(filteredInstructorData.length / itemsPerPage);

    const currentTableData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredInstructorData.slice(startIndex, endIndex);
    }, [filteredInstructorData, currentPage, itemsPerPage]);

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

    const toggleInstructorStatus = (id) => {
        setInstructorData(prevData =>
            prevData.map(item =>
                item.id === id
                    ? { ...item, status: item.status === 'active' ? 'archived' : 'active' }
                    : item
            )
        );
        setCurrentPage(1); // Reset page after status change
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

    // --- Hook ---
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const data = await fetchInstructorData();
                setInstructorData(data);
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
        return <InstructorPageSkeleton />;
    }

    return (
        <div className="p-6 dark:text-white">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold">
                    Instructor List
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
                            <th scope="col" className="px-6 py-2.5"> Action </th>
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
                                <div className="flex items-center" onClick={() => handleSort('majorStudied')}> {/* Changed to majorStudied */}
                                    Major {getSortIndicator('majorStudied')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 sm:table-cell hidden">
                                <div className="flex items-center" onClick={() => handleSort('qualifications')}>
                                    Degree {getSortIndicator('qualifications')}
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
                                    key={data.id} 
                                    className={`bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700
                                        ${navigatingRowId === data.id 
                                            ? 'opacity-60 bg-gray-100 dark:bg-gray-700' // Style for the loading row
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer' // Normal hover style
                                        }
                                    `}
                                    onClick={() => !navigatingRowId && handleRowClick(data.id)}
                                >
                                    <th scope="row" className="px-6 py-2.5 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRowClick(data.id);
                                                }}
                                                className={`p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300`} >
                                                <EditIcon className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => toggleInstructorStatus(data.id)}
                                                className={`p-1 ${data.status === 'active' ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'}`}
                                                title={data.status === 'active' ? 'Archive Instructor' : 'Activate Instructor'}
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
                                    <td className="px-6 py-2 sm:table-cell hidden"> {data.email} </td>
                                    <td className="px-6 py-2 lg:table-cell hidden"> {data.phone} </td>
                                    <td className="px-6 py-2"> {data.majorStudied} </td> {/* Changed to majorStudied */}
                                    <td className="px-6 py-2 sm:table-cell hidden"> {data.qualifications} </td>
                                    <td className="px-6 py-2 capitalize">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            data.status === 'active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {data.status}
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
                    <tfoot className="text-xs text-gray-700 border-t border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <td className="px-6 py-2.5"></td>
                            <td className="px-6 py-2.5">
                                <input
                                    type="text"
                                    placeholder="Search name..."
                                    value={searchTexts.name}
                                    onChange={(e) => handleSearchChange('name', e.target.value)}
                                    className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5 sm:table-cell hidden">
                                <input
                                    type="text"
                                    placeholder="Search email..."
                                    value={searchTexts.email}
                                    onChange={(e) => handleSearchChange('email', e.target.value)}
                                    className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5 lg:table-cell hidden">
                                <input
                                    type="text"
                                    placeholder="Search phone..."
                                    value={searchTexts.phone}
                                    onChange={(e) => handleSearchChange('phone', e.target.value)}
                                    className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5">
                                <input
                                    type="text"
                                    placeholder="Search major..."
                                    value={searchTexts.majorStudied} // Changed to majorStudied
                                    onChange={(e) => handleSearchChange('majorStudied', e.target.value)}
                                    className="block w-full p-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5 sm:table-cell hidden">
                                <input
                                    type="text"
                                    placeholder="Search qual..."
                                    value={searchTexts.qualifications}
                                    onChange={(e) => handleSearchChange('qualifications', e.target.value)}
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
                            disabled={currentPage === 1}
                            className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                    </li>
                    {getPageNumbers().map((pageNumber) => (
                        <li key={pageNumber}>
                            <button
                                onClick={() => goToPage(pageNumber)}
                                className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${
                                    currentPage === pageNumber
                                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-white'
                                        : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                                }`}
                            >
                                {pageNumber}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Render the InstructorCreatePopup component */}
            <InstructorCreatePopup
                isOpen={showCreateInstructorPopup}
                onClose={handleCloseInstructorPopup}
                onSave={handleSaveNewInstructor}
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