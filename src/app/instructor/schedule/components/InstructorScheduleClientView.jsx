'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

// NOTE: jsPDF and html2canvas are now dynamically imported in the handleDownloadPdf function
// to reduce the initial bundle size.

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_HEADER_COLORS = {
    Monday: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    Tuesday: 'bg-purple-50 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    Wednesday: 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    Thursday: 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    Friday: 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    Saturday: 'bg-orange-50 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
    Sunday: 'bg-pink-50 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
};

const SCHEDULE_ITEM_BG_COLOR = 'bg-green-50 dark:bg-green-900/40';

const ScheduleItemCard = ({ item }) => (
  <div className={`${SCHEDULE_ITEM_BG_COLOR} p-2 h-full w-full flex flex-col text-xs rounded-md shadow-sm border border-green-200 dark:border-green-800/60`}>
    <div className="flex justify-between items-start mb-1">
      {/* Subject remains at the top */}
      <span className="font-semibold text-[13px] text-gray-800 dark:text-gray-200">{item.subject}</span>
    </div>
    <div className="text-gray-700 dark:text-gray-300 text-[11px]">{item.year}</div>
    <div className="mt-auto flex justify-between items-end">
      <span className="text-gray-500 dark:text-gray-400 text-[11px]">{item.semester}</span>
      <span className="text-gray-500 dark:text-gray-400 text-[10px]">{item.timeDisplay}</span>
    </div>
  </div>
);
export default function InstructorScheduleClientView({ initialScheduleData, instructorDetails, allShifts }) {
    const [scheduleData] = useState(initialScheduleData);
    const { instructorName, publicDate } = instructorDetails;
    const [classAssignCount, setClassAssignCount] = useState(0);
    const [availableShiftCount, setAvailableShiftCount] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false); // State for download process
    const scheduleRef = useRef(null);

    // Dynamically create the time slots and row config from the fetched shifts data.
    const { TIME_SLOTS, ROW_CONFIG } = useMemo(() => {
        if (!allShifts || allShifts.length === 0) {
            return { TIME_SLOTS: [], ROW_CONFIG: {} };
        }
        const sortedShifts = [...allShifts].sort((a, b) => a.startTime.localeCompare(b.startTime));
        const timeSlots = sortedShifts.map(shift => `${shift.startTime.slice(0, 5)} - ${shift.endTime.slice(0, 5)}`);
        
        const rowConfig = {};
        timeSlots.forEach(slot => {
            rowConfig[slot] = { heightClass: 'h-36' };
        });

        return { TIME_SLOTS: timeSlots, ROW_CONFIG: rowConfig };
    }, [allShifts]);

    useEffect(() => {
        let assigned = 0;
        Object.values(scheduleData).forEach(daySchedule => {
            assigned += Object.keys(daySchedule).length;
        });
        setClassAssignCount(assigned);
        const totalSlots = TIME_SLOTS.length * DAYS_OF_WEEK.length;
        setAvailableShiftCount(totalSlots - assigned);
    }, [scheduleData, TIME_SLOTS]); 

    const handleDownloadPdf = async () => {
        if (!scheduleRef.current || isDownloading) return;

        setIsDownloading(true);

        try {
            // Dynamically import the libraries when the function is called.
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');

            const canvas = await html2canvas(scheduleRef.current, {
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${instructorName}_Schedule.pdf`);

        } catch (err) {
            console.error("Error generating PDF:", err);
            // Optionally, show a toast notification for the error
        } finally {
            setIsDownloading(false);
        }
    };
    
    return (
    <div className='p-6 min-h-screen dark:bg-gray-900'>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Schedule</h1>
        <hr className="border-t border-gray-200 dark:border-gray-700 mt-3" />
      </div>

      <div ref={scheduleRef} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">{instructorName}</h2>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-[minmax(100px,1.5fr)_repeat(7,minmax(120px,2fr))] border border-gray-300 dark:border-gray-600 rounded-md min-w-[900px]">
            {/* Header Row */}
            <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 p-3 text-center border-r border-b border-gray-300 dark:border-gray-600 dark:bg-gray-700 sticky top-0 z-10">Time</div>
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className={`font-semibold text-sm p-3 text-center border-b border-gray-300 dark:border-gray-600 ${DAY_HEADER_COLORS[day]} ${day !== 'Sunday' ? 'border-r dark:border-r-gray-600' : ''} sticky top-0 z-10`}>
                {day}
              </div>
            ))}

            {/* Data Rows */}
            {TIME_SLOTS.map(timeSlot => (
              <React.Fragment key={timeSlot}>
                <div className={`p-3 text-sm font-medium text-gray-600 dark:text-gray-400 text-center border-r border-gray-300 dark:border-gray-600 ${timeSlot !== TIME_SLOTS[TIME_SLOTS.length - 1] ? 'border-b dark:border-b-gray-600' : ''} ${ROW_CONFIG[timeSlot].heightClass} flex items-center justify-center dark:bg-gray-700/50`}>
                  {timeSlot}
                </div>
                {DAYS_OF_WEEK.map(day => {
                  const item = scheduleData[day]?.[timeSlot];
                  return (
                    <div key={`${day}-${timeSlot}`} className={`p-1.5 border-gray-300 dark:border-gray-600 ${day !== 'Sunday' ? 'border-r dark:border-r-gray-600' : ''} ${timeSlot !== TIME_SLOTS[TIME_SLOTS.length - 1] ? 'border-b dark:border-b-gray-600' : ''} ${ROW_CONFIG[timeSlot].heightClass} flex items-stretch justify-stretch`}>
                      {item ? <ScheduleItemCard item={item} /> : <div className="w-full h-full"></div>}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <p>• Class assign <span className="font-semibold">: {classAssignCount}</span></p>
        <p>• Available shift <span className="font-semibold">: {availableShiftCount}</span></p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-sm order-1 sm:order-2 mb-4 sm:mb-0 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isDownloading ? 'Generating...' : 'Download PDF file'}
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
          Public Date : {publicDate}
        </p>
      </div>
    </div>
  );
};