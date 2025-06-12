// instructor/class/page.jsx
'use client';

import InstructorLayout from '@/components/InstructorLayout';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

const InstructorClassViewContent = () => {
    const router = useRouter(); // Initialize useRouter hook

    // Dummy data for the table (added 'degree', 'semester', 'status' for detail page demonstration)
    const [classes, setClasses] = useState([
        { name: 'NUM34/27', generation: '34', group: '27', major: 'IT', faculty: 'Faculty of IT', shift: '07:00-10:00', degree: 'Bachelor', semester: '1', status: 'Active' },
        { name: 'NUM32/12', generation: '32', group: '12', major: 'IT', faculty: 'Faculty of MG', shift: '10:30-13:30', degree: 'Master', semester: '3', status: 'Inactive' },
        { name: 'NUM31/21', generation: '31', group: '21', major: 'MG', faculty: 'Faculty of IT', shift: '10:30-13:30', degree: 'PhD', semester: '5', status: 'Active' },
        { name: 'NUM32/15', generation: '32', group: '15', major: 'IT', faculty: 'Faculty of IT', shift: '10:30-13:30', degree: 'Bachelor', semester: '2', status: 'Active' },
        { name: 'NUM32/49', generation: '32', group: '49', major: 'IT', faculty: 'Faculty of IT', shift: '10:30-13:30', degree: 'Master', semester: '4', status: 'Inactive' },
        { name: 'NUM31/17', generation: '31', group: '17', major: 'BIT', faculty: 'Faculty of IT', shift: '10:30-13:30', degree: 'Bachelor', semester: '1', status: 'Active' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(20);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const filteredClasses = classes.filter(cls =>
        Object.values(cls).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const sortedClasses = useMemo(() => {
        let sortableItems = [...filteredClasses];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredClasses, sortConfig]);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = sortedClasses.slice(indexOfFirstRecord, indexOfLastRecord);
    const nPages = Math.ceil(sortedClasses.length / recordsPerPage);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleRecordsPerPageChange = (event) => {
        setRecordsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    const goToNextPage = () => {
        if (currentPage < nPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const headerKeyMap = {
        'Name': 'name',
        'Generation': 'generation',
        'Group': 'group',
        'Major': 'major',
        'Faculty': 'faculty',
        'Shift': 'shift',
    };

    const requestSort = (headerTitle) => {
        const key = headerKeyMap[headerTitle];
        if (!key) return;

        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Component for the custom sort icon
    const SortIconSVG = () => (
        <svg
            className="w-3 h-3 ml-1 text-gray-400"
            viewBox="0 0 10 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M5 0.5L0.5 4.5L1.5 5.5L5 2L8.5 5.5L9.5 4.5L5 0.5Z"/>
            <path d="M5 15.5L9.5 11.5L8.5 10.5L5 14L1.5 10.5L0.5 11.5L5 15.5Z"/>
        </svg>
    );

    // Component for the dropdown caret icon
    const DropdownCaretSVG = () => (
        <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            strokeWidth="0"
        >
            <path d="M7 10l5 5 5-5z"/>
        </svg>
    );

    // Handler for row click to navigate to detail page
    const handleRowClick = (classItem) => {
        // Navigates to a dynamic route like /instructor/class/detail/NUM34%2F27
        router.push(`/instructor/class/detail/${encodeURIComponent(classItem.name)}`);
    };

    return (
        <div className="p-6 dark:text-white">
            <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Class List</h2>

            {/* Search Bar */}
            <div className="mb-6 w-full max-w-[600px] flex items-center border border-gray-200 dark:border-gray-700 rounded-md py-2 px-4 bg-white dark:bg-gray-800 shadow-sm">
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                    type="text"
                    placeholder="Search"
                    className="flex-grow bg-transparent outline-none text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            {/* Class List Table */}
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            {['Name', 'Generation', 'Group', 'Major', 'Faculty', 'Shift'].map((header) => (
                                <th
                                    key={header}
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                    onClick={() => requestSort(header)}
                                >
                                    <div className="flex items-center">
                                        <span className="font-bold">{header}</span>
                                        <SortIconSVG />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {currentRecords.length > 0 ? (
                            currentRecords.map((cls, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" // Added cursor-pointer for visual feedback
                                    onClick={() => handleRowClick(cls)} // Click handler for navigation
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{cls.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{cls.generation}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{cls.group}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{cls.major}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{cls.faculty}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{cls.shift}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No classes found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex justify-between items-center text-sm">
                <div className="text-gray-600 dark:text-gray-300">
                    {currentPage}/{nPages}
                </div>
                <div className="flex items-center">
                    <span className="mr-2 text-gray-600 dark:text-gray-300">Records per page</span>
                    <div className="relative inline-block border border-gray-300 dark:border-gray-600 rounded-md">
                        <select
                            className="block appearance-none bg-white dark:bg-gray-800 px-3 py-1.5 pr-8 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-0 cursor-pointer text-center"
                            value={recordsPerPage}
                            onChange={handleRecordsPerPageChange}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <DropdownCaretSVG />
                        </div>
                    </div>
                    {/* Pagination buttons within a single rounded container */}
                    <div className="ml-4 flex items-center rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 text-gray-500 dark:text-gray-400 ${currentPage === 1 ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === nPages}
                            className={`px-4 py-2 text-gray-500 dark:text-gray-400 ${currentPage === nPages ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function InstructorClassPage() {
    return (
        <InstructorLayout activeItem="class" pageTitle="Class">
            <InstructorClassViewContent />
        </InstructorLayout>
    );
}