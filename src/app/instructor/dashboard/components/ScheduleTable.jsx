"use client";
import React from 'react';
const SortableHeader = ({ children, sortable = true }) => {
  return (
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap">
      <div className="flex items-center">
        {children}
      </div>
    </th>
  );
};

const ScheduleTable = ({ scheduleItems }) => {
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
                <SortableHeader>Class</SortableHeader>
                <SortableHeader>Major</SortableHeader>
                <SortableHeader>Date</SortableHeader>
                <SortableHeader>Session</SortableHeader>
                <SortableHeader>Shift</SortableHeader>
                <SortableHeader>Room</SortableHeader>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {scheduleItems.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
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