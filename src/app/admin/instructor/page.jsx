'use client';

import { useState, useMemo } from 'react'; // Removed useEffect
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';

const InstructorViewContent = () => {
    // --- Initial Data (only used if no data in local storage) ---
    const defaultInstructorData = [
        { id: 1, name: 'John Doe', phone: '012345678', degrees: 'Ph.D. Computer Science', major: 'IT', status: 'active', imageSrc: '/images/admin.jpg' },
        { id: 2, name: 'Korng Sovanreach', phone: '098765432', degrees: 'M.Sc. Data Science', major: 'CS', status: 'active', imageSrc: '/images/reach.jpg' },
        { id: 3, name: 'Uy Chakriya', phone: '077123456', degrees: 'B.Eng. Software Engineering', major: 'SE', status: 'archived', imageSrc: '/images/chakriya.png' },
        { id: 4, name: 'Touch Vengkorng', phone: '010987654', degrees: 'Ph.D. Artificial Intelligence', major: 'AI', status: 'active', imageSrc: '/images/vengkorng.png' },
        { id: 5, name: 'Bun Menghong', phone: '088112233', degrees: 'M.B.A. Information Systems', major: 'IS', status: 'active', imageSrc: '/images/menghong.png' },
        { id: 6, name: 'seang Hai', phone: '066223344', degrees: 'Ph.D. Cybersecurity', major: 'Cybersecurity', status: 'active', imageSrc: '/images/hai.png' },
        { id: 7, name: 'P A N H A', phone: '055334455', degrees: 'M.Sc. Cloud Computing', major: 'Cloud', status: 'archived', imageSrc: '/images/panha.png' },
    ];

    // Initialize state directly with default data, no longer checking Local Storage
    const [instructorData, setInstructorData] = useState(defaultInstructorData);

    // Removed useEffect that saved instructorData to Local Storage

    // --- Status Filter State ---
    const [statusFilter, setStatusFilter] = useState('active');

    // --- Sorting State and Logic ---
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

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

    // --- Search State and Logic ---
    const [searchTexts, setSearchTexts] = useState({
        name: '',
        phone: '',
        degrees: '',
        major: '',
        status: '',
    });

    const handleSearchChange = (column, value) => {
        setSearchTexts(prev => ({
            ...prev,
            [column]: value,
        }));
        setCurrentPage(1);
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

    // --- Pagination State and Logic ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPageOptions = [5, 10, 20, 50];
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);

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

    // --- Active/Archive Logic ---
    const toggleInstructorStatus = (id) => {
        setInstructorData(prevData =>
            prevData.map(item =>
                item.id === id
                    ? { ...item, status: item.status === 'active' ? 'archived' : 'active' }
                    : item
            )
        );
        setCurrentPage(1);
    };

    // SVG icon for archive/activate - using the same one for consistency
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

    const DefaultUserIcon = (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
    );

    const InstructorAvatar = ({ imageSrc, name }) => (
        <div className="size-7 border border-gray-500 rounded-full overflow-hidden flex items-center justify-center mr-2 flex-shrink-0">
            {imageSrc ? (
                <Image
                    src={imageSrc}
                    alt={`${name}'s avatar`}
                    width={28}
                    height={28}
                    className="w-full h-full object-cover"
                />
            ) : (
                <DefaultUserIcon className="size-6 text-gray-500 dark:text-gray-400" />
            )}
        </div>
    );

    return (
        <div className="p-6 dark:text-white">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold">
                    Instructor List
                </h1>
            </div>
            <hr className="border-t border-gray-200 mt-4 mb-4" />
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
                        >
                            Active
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStatusFilter('archived'); setCurrentPage(1); }}
                            className={`px-4 py-2 text-sm font-medium border-t border-b ${
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
                            className={`px-4 py-2 text-sm font-medium rounded-e-lg border ${
                                statusFilter === 'all'
                                    ? 'text-purple-700 bg-purple-50 border-purple-300 dark:bg-gray-700 dark:text-purple-300 dark:border-purple-600'
                                    : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-purple-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700'
                            }`}
                        >
                            All
                        </button>
                    </div>
                </div>

                <button type="button" className="text-white bg-green-700 hover:bg-green-800 focus:ring-2 focus:ring-green-600 font-medium rounded-md text-sm px-3 py-2 text-center inline-flex items-center dark:bg-green-600 me-2 mb-2 dark:hover:bg-green-700 dark:focus:ring-green-800 gap-1">
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
                            <th scope="col" className="px-6 py-2.5 md:table-cell hidden"> Action </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('name')}>
                                    Name {getSortIndicator('name')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('phone')}>
                                    Phone Number {getSortIndicator('phone')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('degrees')}>
                                    Degrees {getSortIndicator('degrees')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('major')}>
                                    Major {getSortIndicator('major')}
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
                                <tr key={data.id} className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                    <th scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white md:table-cell hidden">
                                        <div className="flex gap-2">
                                            <button className={`p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300`} >
                                                <EditIcon className="size-5" />
                                            </button>
                                            <button
                                                onClick={() => toggleInstructorStatus(data.id)}
                                                className={`p-1 ${data.status === 'active' ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'}`}
                                                title={data.status === 'active' ? 'Archive Instructor' : 'Activate Instructor'}
                                            >
                                                <ArchiveIcon className="size-5" />
                                            </button>
                                        </div>
                                    </th>
                                    <td className="px-6 py-2.5">
                                        <div className="flex items-center">
                                            <InstructorAvatar imageSrc={data.imageSrc} name={data.name} />
                                            {data.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-2.5"> {data.phone} </td>
                                    <td className="px-6 py-2.5"> {data.degrees} </td>
                                    <td className="px-6 py-2.5"> {data.major} </td>
                                    <td className="px-6 py-2.5 capitalize">
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
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
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
                                    className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5">
                                <input
                                    type="text"
                                    placeholder="Search phone..."
                                    value={searchTexts.phone}
                                    onChange={(e) => handleSearchChange('phone', e.target.value)}
                                    className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5">
                                <input
                                    type="text"
                                    placeholder="Search degrees..."
                                    value={searchTexts.degrees}
                                    onChange={(e) => handleSearchChange('degrees', e.target.value)}
                                    className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5">
                                <input
                                    type="text"
                                    placeholder="Search major..."
                                    value={searchTexts.major}
                                    onChange={(e) => handleSearchChange('major', e.target.value)}
                                    className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5">
                                <input
                                    type="text"
                                    placeholder="Search status..."
                                    value={searchTexts.status}
                                    onChange={(e) => handleSearchChange('status', e.target.value)}
                                    className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {filteredInstructorData.length > 0 && (
                <nav className="flex flex-col md:flex-row items-center justify-between pt-4 gap-4" aria-label="Table navigation">
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        Showing{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.min((currentPage - 1) * itemsPerPage + 1, filteredInstructorData.length)}
                        </span>{' '}
                        to{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.min(currentPage * itemsPerPage, filteredInstructorData.length)}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {filteredInstructorData.length}
                        </span>
                    </span>

                    <div className="flex items-center gap-2">
                        <label htmlFor="items-per-page" className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            Items per page:
                        </label>
                        <select
                            id="items-per-page"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-blue-500 focus:border-blue-500 px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            {itemsPerPageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <ul className="inline-flex -space-x-px text-sm h-8">
                        <li>
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                        </li>
                        {totalPages > 1 && getPageNumbers().map((pageNumber) => (
                            <li key={pageNumber}>
                                <button
                                    onClick={() => goToPage(pageNumber)}
                                    className={`flex items-center justify-center px-3 h-8 leading-tight ${
                                        currentPage === pageNumber
                                            ? 'text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
                                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
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
            )}
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