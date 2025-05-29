'use client';

import { useState, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';

const ClassViewContent = () => {
    // --- Data ---
    const initialClassData = [
        { id: 1, name: 'NUM30-01', generation: '30', group: '01', major: 'IT', degrees: 'Bachelor', faculty: 'Faculty of IT', shift: '7:00 AM - 10:00 AM' },
        { id: 2, name: 'NUM30-01', generation: '30', group: '01', major: 'IT', degrees: 'Bachelor', faculty: 'Faculty of IT', shift: '7:00 AM - 10:00 AM' },
        { id: 3, name: 'NUM30-02', generation: '30', group: '02', major: 'CS', degrees: 'Bachelor', faculty: 'Faculty of CS', shift: '8:00 AM - 11:00 AM' },
        { id: 4, name: 'NUM32-03', generation: '32', group: '03', major: 'IS', degrees: 'Bachelor', faculty: 'Faculty of IS', shift: '9:00 AM - 12:00 PM' },
        { id: 5, name: 'NUM32-04', generation: '32', group: '04', major: 'SE', degrees: 'Bachelor', faculty: 'Faculty of SE', shift: '1:00 PM - 4:00 PM' },
        { id: 6, name: 'NUM32-05', generation: '32', group: '05', major: 'AI', degrees: 'Bachelor', faculty: 'Faculty of AI & R', shift: '3:00 PM - 6:00 PM' },
        { id: 7, name: 'NUM33-06', generation: '33', group: '06', major: 'DS', degrees: 'Bachelor', faculty: 'Faculty of DS', shift: '5:00 PM - 8:00 PM' },
        { id: 8, name: 'NUM33-07', generation: '33', group: '07', major: 'ML', degrees: 'Bachelor', faculty: 'Faculty of ML', shift: '6:00 PM - 9:00 PM' },
        { id: 9, name: 'NUM33-08', generation: '33', group: '08', major: 'DA', degrees: 'Bachelor', faculty: 'Faculty of DA', shift: '7:00 PM - 10:00 PM' },
        { id: 10, name: 'NUM33-09', generation: '33', group: '09', major: 'SE', degrees: 'Bachelor', faculty: 'Faculty of SE & R', shift: '8:00 PM - 11:00 PM' },
        { id: 11, name: 'NUM34-10', generation: '34', group: '10', major: 'AI', degrees: 'Bachelor', faculty: 'Faculty of AI', shift: '9:00 PM - 12:00 AM' },
        { id: 12, name: 'NUM34-11', generation: '34', group: '11', major: 'DS', degrees: 'Bachelor', faculty: 'Faculty of DS & R', shift: '10:00 PM - 1:00 AM' },
        { id: 13, name: 'NUM34-12', generation: '34', group: '12', major: 'ML', degrees: 'Bachelor', faculty: 'Faculty of ML & R', shift: '11:00 PM - 2:00 AM' },
        { id: 14, name: 'NUM35-13', generation: '35', group: '13', major: 'DA', degrees: 'Bachelor', faculty: 'Faculty of DA & R', shift: '12:00 AM - 3:00 AM' },
        { id: 15, name: 'NUM35-14', generation: '35', group: '14', major: 'SE', degrees: 'Bachelor', faculty: 'Faculty of SE & R', shift: '1:00 AM - 4:00 AM' },
        { id: 16, name: 'NUM35-15', generation: '35', group: '15', major: 'AI', degrees: 'Bachelor', faculty: 'Faculty of AI & R', shift: '2:00 AM - 5:00 AM' },
        { id: 17, name: 'NUM36-16', generation: '36', group: '16', major: 'DS', degrees: 'Bachelor', faculty: 'Faculty of DS & R', shift: '3:00 AM - 6:00 AM' },
        { id: 18, name: 'NUM36-17', generation: '36', group: '17', major: 'ML', degrees: 'Bachelor', faculty: 'Faculty of ML & R', shift: '4:00 AM - 7:00 AM' },
        { id: 19, name: 'NUM36-18', generation: '36', group: '18', major: 'DA', degrees: 'Bachelor', faculty: 'Faculty of DA & R', shift: '5:00 AM - 8:00 AM' },
    ];

    // --- Sorting State and Logic ---
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

    const handleSort = (column) => {
        // Reset to first page when sorting changes
        setCurrentPage(1);
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedClassData = useMemo(() => {
        if (!sortColumn) {
            return initialClassData;
        }

        const sortableData = [...initialClassData];

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
    }, [initialClassData, sortColumn, sortDirection]);

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
    // State to hold search text for each column
    const [searchTexts, setSearchTexts] = useState({
        name: '',
        generation: '',
        group: '',
        major: '',
        degrees: '',
        faculty: '',
        shift: '',
    });

    const handleSearchChange = (column, value) => {
        setSearchTexts(prev => ({
            ...prev,
            [column]: value,
        }));
        setCurrentPage(1); // Reset to first page on search
    };

    const filteredClassData = useMemo(() => {
        let filteredData = [...sortedClassData]; // Start with the sorted data

        // Apply filters for each column that has a search term
        Object.keys(searchTexts).forEach(column => {
            const searchTerm = String(searchTexts[column]).toLowerCase().trim();
            if (searchTerm) {
                filteredData = filteredData.filter(item =>
                    String(item[column]).toLowerCase().includes(searchTerm)
                );
            }
        });
        return filteredData;
    }, [sortedClassData, searchTexts]); // Re-filter when sorted data or search texts change


    // --- Pagination State and Logic ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPageOptions = [5, 10, 20, 50];
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);

    // Calculate total pages based on FILTERED data
    const totalPages = Math.ceil(filteredClassData.length / itemsPerPage);

    // Get data for the current page from FILTERED data
    const currentTableData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredClassData.slice(startIndex, endIndex);
    }, [filteredClassData, currentPage, itemsPerPage]); // Depends on filtered data

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

    return (
        <div className="p-6 dark:text-white">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold">
                    Class List
                </h1>
                <button type="button" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Create</button>
            </div>
            <hr className="border-t border-gray-200 mt-4 mb-6" />

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
                            <th scope="col" className="px-6 py-2.5 lg:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('faculty')}>
                                    Faculty {getSortIndicator('faculty')}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-2.5 sm:table-cell hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center" onClick={() => handleSort('shift')}>
                                    Shift {getSortIndicator('shift')}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-normal text-gray-700 dark:text-gray-400">
                        {currentTableData.length > 0 ? (
                            currentTableData.map((data) => (
                                <tr key={data.id} className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white md:table-cell hidden">
                                        <div className="flex gap-2">
                                            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Edit</button>
                                            <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                        </div>
                                    </th>
                                    <td className="px-6 py-2.5"> {data.name} </td>
                                    <td className="px-6 py-2.5 lg:table-cell hidden"> {data.generation} </td>
                                    <td className="px-6 py-2.5 lg:table-cell hidden"> {data.group} </td>
                                    <td className="px-6 py-2.5"> {data.major} </td>
                                    <td className="px-6 py-2.5"> {data.degrees} </td>
                                    <td className="px-6 py-2.5 lg:table-cell hidden"> {data.faculty} </td>
                                    <td className="px-6 py-2.5 sm:table-cell hidden"> {data.shift} </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="bg-white dark:bg-gray-800">
                                <td colSpan="9" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    No matching results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {/* --- Search Inputs in Footer --- */}
                    <tfoot className="text-xs text-gray-700 border-t border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                        <tr>
                            <td className="px-6 py-2.5 md:table-cell hidden"></td> {/* Empty cell for Action column */}
                            <td className="px-6 py-2.5">
                                <input
                                    type="text"
                                    placeholder="Search name..."
                                    value={searchTexts.name}
                                    onChange={(e) => handleSearchChange('name', e.target.value)}
                                    className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5 lg:table-cell hidden">
                                <input
                                    type="text"
                                    placeholder="Search gen..."
                                    value={searchTexts.generation}
                                    onChange={(e) => handleSearchChange('generation', e.target.value)}
                                    className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5 lg:table-cell hidden">
                                <input
                                    type="text"
                                    placeholder="Search group..."
                                    value={searchTexts.group}
                                    onChange={(e) => handleSearchChange('group', e.target.value)}
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
                                    placeholder="Search degrees..."
                                    value={searchTexts.degrees}
                                    onChange={(e) => handleSearchChange('degrees', e.target.value)}
                                    className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5 lg:table-cell hidden">
                                <input
                                    type="text"
                                    placeholder="Search faculty..."
                                    value={searchTexts.faculty}
                                    onChange={(e) => handleSearchChange('faculty', e.target.value)}
                                    className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                            <td className="px-6 py-2.5 sm:table-cell hidden">
                                <input
                                    type="text"
                                    placeholder="Search shift..."
                                    value={searchTexts.shift}
                                    onChange={(e) => handleSearchChange('shift', e.target.value)}
                                    className="block w-full p-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Pagination Controls */}
            {filteredClassData.length > 0 && (
                <nav className="flex flex-col md:flex-row items-center justify-between pt-4 gap-4" aria-label="Table navigation">
                    <div className="flex items-center gap-2">
                        <label htmlFor="items-per-page" className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            Items per page:
                        </label>
                        <select
                            id="items-per-page"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            {itemsPerPageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        Showing{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.min((currentPage - 1) * itemsPerPage + 1, filteredClassData.length)}
                        </span>{' '}
                        to{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.min(currentPage * itemsPerPage, filteredClassData.length)}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {filteredClassData.length}
                        </span>
                    </span>
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

export default function AdminDashboardPage() {
    return (
        <AdminLayout activeItem="class" pageTitle="Class Management">
            <ClassViewContent/>
        </AdminLayout>
    );
}