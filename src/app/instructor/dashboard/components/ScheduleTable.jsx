"use client";
import React from 'react';

/**
 * A component to display a sort direction indicator (arrow).
 * @param {{direction: 'asc' | 'desc' | null}} props
 */
const SortIndicator = ({ direction }) => {
    if (!direction) {
        // Default icon when column is not sorted
        return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1 opacity-40"> <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /> </svg>;
    }
    return direction === 'asc' ? 
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1"> <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /> </svg> :
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1"> <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /> </svg>;
};

/**
 * A clickable table header component for sorting.
 * @param {{children: React.ReactNode, columnId: string, onSort: Function, sortColumn: string, sortDirection: string}} props
 */
const SortableHeader = ({ children, columnId, onSort, sortColumn, sortDirection }) => {
  return (
    <th 
        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={() => onSort(columnId)}
    >
      <div className="flex items-center">
        {children}
        {/* Show indicator based on whether this column is the one being sorted */}
        <SortIndicator direction={sortColumn === columnId ? sortDirection : null} />
      </div>
    </th>
  );
};

/**
 * The main table component for displaying the instructor's schedule.
 * @param {{scheduleItems: Array, onSort: Function, sortColumn: string, sortDirection: string}} props
 */
const ScheduleTable = ({ scheduleItems, onSort, sortColumn, sortDirection }) => {
  if (!scheduleItems || scheduleItems.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
        No schedule items to display.
      </p>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow">
      <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Schedule
      </h3>
      <div className="overflow-x-auto">
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <SortableHeader columnId="classNum" onSort={onSort} sortColumn={sortColumn} sortDirection={sortDirection}>Class</SortableHeader>
                <SortableHeader columnId="major" onSort={onSort} sortColumn={sortColumn} sortDirection={sortDirection}>Major</SortableHeader>
                <SortableHeader columnId="date" onSort={onSort} sortColumn={sortColumn} sortDirection={sortDirection}>Date</SortableHeader>
                <SortableHeader columnId="session" onSort={onSort} sortColumn={sortColumn} sortDirection={sortDirection}>Session</SortableHeader>
                <SortableHeader columnId="shift" onSort={onSort} sortColumn={sortColumn} sortDirection={sortDirection}>Shift</SortableHeader>
                <SortableHeader columnId="room" onSort={onSort} sortColumn={sortColumn} sortDirection={sortDirection}>Room</SortableHeader>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {scheduleItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <td className="max-w-[100px] px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={item.classNum}>
                    {item.classNum}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.major}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.date}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.session}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.shift}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                      item.room === "Unavailable"
                        ? "text-gray-500 dark:text-gray-400"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {item.room}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTable;