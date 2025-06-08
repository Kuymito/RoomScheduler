'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import InstructorLayout from '@/components/InstructorLayout';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['07:00 - 10:00', '10:30 - 13:30', '14:00 - 17:00', '17:30 - 20:30'];

const DAY_HEADER_COLORS = {
    Monday: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    Tuesday: 'bg-purple-50 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    Wednesday: 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    Thursday: 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    Friday: 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    Saturday: 'bg-orange-50 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
    Sunday: 'bg-pink-50 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
};

const SCHEDULE_ITEM_BG_COLOR = 'bg-green-50 dark:bg-green-900/40';

// Mock data that would be fetched from an API
const fetchedScheduleData = {
    'Monday': {
        '07:00 - 10:00': { subject: '32/27 IT', year: 'Year 2', semester: 'Semester 1', timeDisplay: '07:00 - 10:00' },
        '17:30 - 20:30': { subject: '32/34 MG', year: 'Year 2', semester: 'Semester 1', timeDisplay: '17:30 - 20:30' },
    },
    'Tuesday': {},
    'Wednesday': {
        '10:30 - 13:30': { subject: '33/29 FA', year: 'Year 1', semester: 'Semester 1', timeDisplay: '10:30 - 13:30' },
    },
    'Thursday': {
        '14:00 - 17:00': { subject: '32/98 law', year: 'Year 2', semester: 'Semester 1', timeDisplay: '14:00 - 17:00' },
    },
    'Friday': {
        '07:00 - 10:00': { subject: '31/35 MG', year: 'Year 3', semester: 'Semester 1', timeDisplay: '07:00 - 10:00' },
        '17:30 - 20:30': { subject: '30/11 IT', year: 'Year 4', semester: 'Semester 2', timeDisplay: '17:30 - 20:30' },
    },
    'Saturday': {},
    'Sunday': {},
};

const ROW_CONFIG = {
  '07:00 - 10:00': { heightClass: 'h-36' },
  '10:30 - 13:30': { heightClass: 'h-28' },
  '14:00 - 17:00': { heightClass: 'h-28' },
  '17:30 - 20:30': { heightClass: 'h-36' },
};

// NEW: Skeleton Card Component
const SkeletonCard = () => (
    <div className="w-full h-full p-2 bg-gray-200 dark:bg-gray-700/50 rounded-md animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3 absolute bottom-2 right-2"></div>
    </div>
);

const ScheduleItemCard = ({ item }) => (
  <div className={`${SCHEDULE_ITEM_BG_COLOR} p-2 h-full flex flex-col text-xs rounded-md shadow-sm border border-green-200 dark:border-green-800/60`}>
    <div className="flex justify-between items-start mb-1">
      <span className="font-semibold text-[13px] text-gray-800 dark:text-gray-200">{item.subject}</span>
      <span className="text-gray-500 dark:text-gray-400 text-[10px] leading-tight pt-0.5">{item.timeDisplay}</span>
    </div>
    <div className="text-gray-700 dark:text-gray-300 text-[11px]">{item.year}</div>
    <div className="mt-auto text-right text-gray-500 dark:text-gray-400 text-[11px]">{item.semester}</div>
  </div>
);

const InstructorScheduleViewContent = () => {
    const [scheduleData, setScheduleData] = useState({});
    const [loading, setLoading] = useState(true); // Start in loading state
    const [roomName, setRoomName] = useState("Room A21");
    const [classAssignCount, setClassAssignCount] = useState(0);
    const [availableShiftCount, setAvailableShiftCount] = useState(0);
    const publicDate = "2025-06-22 13:11:46";
    const scheduleRef = useRef(null);

    useEffect(() => {
        // Simulate fetching data from an API
        const timer = setTimeout(() => {
            setScheduleData(fetchedScheduleData);
            setLoading(false);
        }, 2000); // 2-second delay

        return () => clearTimeout(timer); // Cleanup timer
    }, []);

    useEffect(() => {
        if (!loading) {
            let assigned = 0;
            Object.values(scheduleData).forEach(daySchedule => {
                assigned += Object.keys(daySchedule).length;
            });
            setClassAssignCount(assigned);
            const totalSlots = TIME_SLOTS.length * DAYS_OF_WEEK.length;
            setAvailableShiftCount(totalSlots - assigned);
        }
    }, [scheduleData, loading]);

    const handleDownloadPdf = () => {
        if (scheduleRef.current) {
            html2canvas(scheduleRef.current, {
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff', // Set background for PDF
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`${roomName}_Schedule.pdf`);
            }).catch(err => {
                console.error("Error generating PDF:", err);
            });
        }
    };
    
    return (
    <div className='p-6 bg-gray-50 min-h-screen dark:bg-gray-900'>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Schedule</h1>
        <hr className="border-t border-gray-200 dark:border-gray-700 mt-3" />
      </div>

      <div ref={scheduleRef} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">{roomName} Schedule</h2>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-[minmax(100px,1.5fr)_repeat(7,minmax(120px,2fr))] border border-gray-300 dark:border-gray-600 rounded-md min-w-[900px]">
            {/* Header Row (always visible) */}
            <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 p-3 text-center border-r border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">Time</div>
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className={`font-semibold text-sm p-3 text-center border-b border-gray-300 dark:border-gray-600 ${DAY_HEADER_COLORS[day]} ${day !== 'Sunday' ? 'border-r dark:border-r-gray-600' : ''} sticky top-0 z-10`}>
                {day}
              </div>
            ))}

            {/* Data Rows */}
            {TIME_SLOTS.map(timeSlot => (
              <React.Fragment key={timeSlot}>
                <div className={`p-3 text-sm font-medium text-gray-600 dark:text-gray-400 text-center border-r border-gray-300 dark:border-gray-600 ${timeSlot !== TIME_SLOTS[TIME_SLOTS.length - 1] ? 'border-b dark:border-b-gray-600' : ''} ${ROW_CONFIG[timeSlot].heightClass} flex items-center justify-center bg-gray-50 dark:bg-gray-700/50`}>
                  {timeSlot}
                </div>
                {DAYS_OF_WEEK.map(day => {
                  const item = !loading ? scheduleData[day]?.[timeSlot] : null;
                  return (
                    <div
                      key={`${day}-${timeSlot}`}
                      className={`p-1.5 border-gray-300 dark:border-gray-600 ${day !== 'Sunday' ? 'border-r dark:border-r-gray-600' : ''} ${timeSlot !== TIME_SLOTS[TIME_SLOTS.length - 1] ? 'border-b dark:border-b-gray-600' : ''} ${ROW_CONFIG[timeSlot].heightClass} flex items-stretch justify-stretch`}
                    >
                      {loading ? <SkeletonCard /> : (item ? <ScheduleItemCard item={item} /> : <div className="w-full h-full"></div>)}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-700 dark:text-gray-300 space-y-1">
        {loading ? (
            <>
                <p className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse"></p>
                <p className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-44 animate-pulse"></p>
            </>
        ) : (
            <>
                <p>• Class assign <span className="font-semibold">: {classAssignCount}</span></p>
                <p>• Available shift <span className="font-semibold">: {availableShiftCount}</span></p>
            </>
        )}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
        <button
          onClick={handleDownloadPdf}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-sm order-1 sm:order-2 mb-4 sm:mb-0 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Download PDF file
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
          Public Date : {publicDate}
        </p>
      </div>
    </div>
  );
};

export default function InstructorSchedulePage() {
  return (
      <InstructorLayout activeItem="schedule" pageTitle="Schedule">
          <InstructorScheduleViewContent />
      </InstructorLayout>
  );
}