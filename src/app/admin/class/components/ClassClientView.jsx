'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import ClassCreatePopup from './ClassCreatePopup';
import { useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { classService } from '@/services/class.service';
import { departmentService } from '@/services/department.service';
import ClassPageSkeleton from './ClassPageSkeleton';
import { Spinner, EditIcon, ArchiveIcon } from '@/components/IconComponents';

const fetcher = ([key, token]) => classService.getAllClasses(token);

export default function ClassClientView({ initialClasses }) {
    const router = useRouter();
    const { data: session } = useSession();
    const { mutate } = useSWRConfig();
    const [isLoading, setIsLoading] = useState(true);

    const swrKey = session?.accessToken ? ['/api/v1/class', session.accessToken] : null;

    const { data, error } = useSWR(
        swrKey,
        fetcher,
        {
            fallbackData: initialClasses,
            revalidateOnFocus: true,
            onSuccess: () => setIsLoading(false),
            onError: () => setIsLoading(false),
        }
    );
    
    
    // --- THIS IS THE FIX ---
    // Initialize state for the data needed by the popup.
    const [departments, setDepartments] = useState([]);
    const [shifts, setShifts] = useState([]);
    // ----------------------

    const [classData, setClassData] = useState([]);
    const [isPending, startTransition] = useTransition();
    const [rowLoadingId, setRowLoadingId] = useState(null);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPageOptions = [5, 10, 20, 50];
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
    const [statusFilter, setStatusFilter] = useState('active');
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [searchTexts, setSearchTexts] = useState({ name: '', generation: '', group: '', major: '', degrees: '', faculty: '', semester: '', shift: '' });

    useEffect(() => {
        if (data) {
            const formattedData = data.map(item => ({
                id: item.classId,
                name: item.className,
                generation: item.generation,
                group: item.groupName,
                major: item.majorName,
                degrees: item.degreeName,
                faculty: item.department?.name || 'N/A',
                semester: item.semester,
                shift: item.shift?.name || 'N/A',
                status: item.archived ? 'archived' : 'active',
            }));
            setClassData(formattedData);
        }
    }, [data]);

    // This useEffect fetches the necessary data for the create popup form.
    useEffect(() => {
        const fetchDataForPopup = async () => {
            if (session?.accessToken) {
                
                // We will fetch departments and shifts separately to debug.
                try {
                    console.log("Attempting to fetch departments...");
                    const deptsResponse = await departmentService.getAllDepartments(session.accessToken);
                    setDepartments(deptsResponse.payload || []);
                    console.log("Departments fetched successfully.");
                } catch (departmentError) {
                    console.error("🔴 FAILED TO FETCH DEPARTMENTS:", departmentError);
                    toast.error("Could not load department data.");
                }
    
                try {
                    console.log("Attempting to fetch shifts...");
                    const shiftsData = await classService.getAllShifts(session.accessToken);
                    setShifts(shiftsData || []); // The service should return the array directly
                    console.log("Shifts fetched successfully.");
                } catch (shiftError) {
                    console.error("🔴 FAILED TO FETCH SHIFTS:", shiftError);
                    toast.error("Could not load shift data.");
                }
            }
        };
    
        fetchDataForPopup();
    }, [session]);

    const handleSaveNewClass = async (newClassData) => {
        if (!session?.accessToken) {
            toast.error("Authentication session has expired.");
            throw new Error("Session expired.");
        }

        await toast.promise(
            classService.createClass(newClassData, session.accessToken),
            {
                loading: 'Creating new class...',
                success: () => {
                    mutate(swrKey); // Re-fetch the class list to show the new entry
                    return 'Class created successfully!';
                },
                error: (err) => {
                    return err.message || 'Failed to create class.';
                }
            }
        );
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

    const toggleClassStatus = (id) => {
        setClassData(prevData =>
            prevData.map(item => item.id === id ? { ...item, status: item.status === 'active' ? 'archived' : 'active' } : item)
        );
    };

    const filteredAndSortedData = useMemo(() => {
        let dataToProcess = [...classData];
        if (statusFilter !== 'all') {
            dataToProcess = dataToProcess.filter(item => item.status.toLowerCase() === statusFilter);
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
    }, [classData, statusFilter, searchTexts, sortColumn, sortDirection]);

    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
    const currentTableData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedData, currentPage, itemsPerPage]);

    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
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


    if (isLoading) {
        return <ClassPageSkeleton />;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500">Failed to load class data. Please try again.</div>
    }

    return (
        <div className="p-6 dark:text-white">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold">Class List</h1>
            </div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-4" />
            <div className="flex items-center justify-between mt-2 mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <input type="text" placeholder="Search by name..." value={searchTexts.name} onChange={(e) => handleSearchChange('name', e.target.value)} className="block w-72 p-2 text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700"/>
                    <div className="inline-flex rounded-md shadow-xs" role="group">
                        <button type="button" onClick={() => { setStatusFilter('active'); setCurrentPage(1); }} className={`px-4 py-2 text-xs font-medium rounded-s-lg border ${statusFilter === 'active' ? 'text-blue-700 bg-blue-50 border-blue-300 dark:bg-gray-700 dark:text-blue-300 dark:border-blue-600' : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700'}`}>Active</button>
                        <button type="button" onClick={() => { setStatusFilter('archived'); setCurrentPage(1); }} className={`px-4 py-2 text-xs font-medium border-t border-b ${statusFilter === 'archived' ? 'text-red-700 bg-red-50 border-red-300 dark:bg-gray-700 dark:text-red-300 dark:border-red-600' : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700'}`}>Archive</button>
                        <button type="button" onClick={() => { setStatusFilter('all'); setCurrentPage(1); }} className={`px-4 py-2 text-xs font-medium rounded-e-lg border ${statusFilter === 'all' ? 'text-purple-700 bg-purple-50 border-purple-300 dark:bg-gray-700 dark:text-purple-300 dark:border-purple-600' : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700'}`}>All</button>
                    </div>
                </div>
                <button type="button" onClick={() => setShowCreatePopup(true)} className="text-white bg-[#75B846] hover:bg-[#87D94D] focus:ring-2 focus:ring-green-600 font-medium rounded-md text-xs px-3 py-2 text-center inline-flex items-center dark:bg-[#75B846] me-2 mb-2 dark:hover:bg-[#79c344] dark:focus:ring-green-800 gap-1">
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
                    {getPageNumbers().map((pageNumber) => (<li key={pageNumber}><button onClick={() => {}} className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${currentPage === pageNumber ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'}`}>{pageNumber}</button></li>))}
                    <li><button onClick={goToNextPage} disabled={currentPage === totalPages} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50">Next</button></li>
                </ul>
            </nav>
            <ClassCreatePopup 
                isOpen={showCreatePopup} 
                onClose={() => setShowCreatePopup(false)} 
                onSave={handleSaveNewClass}
                departments={departments}
                shifts={shifts}
            />
        </div>
    );
}