'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { scheduleService } from '@/services/schedule.service';
import { authService } from '@/services/auth.service';
import SchedulePageSkeleton from './SchedulePageSkeleton';

// --- CONSTANTS ---
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['07:00 - 10:00', '10:30 - 13:30', '14:00 - 17:00', '17:30 - 20:30'];
const DAY_HEADER_COLORS = {
    Monday: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    Tuesday: 'bg-purple-50 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    Wednesday: 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    Thursday: 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    Friday: 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    Saturday: 'bg-orange-50 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
    Sunday: 'bg-pink-50 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
};
const ROW_CONFIG = {
  '07:00 - 10:00': { heightClass: 'h-36' },
  '10:30 - 13:30': { heightClass: 'h-28' },
  '14:00 - 17:00': { heightClass: 'h-28' },
  '17:30 - 20:30': { heightClass: 'h-36' },
};
const SCHEDULE_ITEM_BG_COLOR = 'bg-green-50 dark:bg-green-900/40';

// --- SWR Fetcher functions ---
const scheduleFetcher = ([, token]) => scheduleService.getMySchedule(token);
const profileFetcher = ([, token]) => authService.getProfile(token);


// --- UI COMPONENTS ---
const ScheduleItemCard = ({ item }) => (
  <div className={`${SCHEDULE_ITEM_BG_COLOR} p-2.5 h-full w-full flex flex-col text-xs rounded-lg shadow-sm border border-green-200 dark:border-green-800/60 hover:shadow-md hover:border-green-300 dark:hover:border-green-700 transition-all duration-200`}>
    <div className="flex justify-between items-start mb-2">
      <span className="font-semibold text-[13px] text-gray-800 dark:text-gray-200 truncate pr-2">{item.subject}</span>
    </div>
    <div className="text-gray-600 dark:text-gray-300 text-[11px] truncate mb-2">{item.generation}</div>
    
    <div className="mt-auto space-y-1">
        <div className="flex items-center justify-end text-gray-500 dark:text-gray-400 text-[11px]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>{item.timeDisplay}</span>
        </div>
        <div className="text-right text-gray-500 dark:text-gray-400 text-[11px]">{item.semester}</div>
    </div>
  </div>
);

/**
 * This is the Client Component for the Instructor Schedule page.
 * It now handles its own data fetching using useSWR.
 */
export default function InstructorScheduleClientView() {
    const { data: session } = useSession();
    const token = session?.accessToken;

    // Fetch schedule and profile data using useSWR
    const { data: scheduleResponse, error: scheduleError, isLoading: isScheduleLoading } = useSWR(
        token ? ['mySchedule', token] : null,
        scheduleFetcher
    );
    const { data: profileResponse, error: profileError, isLoading: isProfileLoading } = useSWR(
        token ? ['profile', token] : null,
        profileFetcher
    );

    const [classAssignCount, setClassAssignCount] = useState(0);
    const [availableShiftCount, setAvailableShiftCount] = useState(0);
    const scheduleRef = useRef(null);

    // Process the fetched data into the format needed by the component
    const { scheduleData, instructorDetails } = useMemo(() => {
        const scheduleData = {};
        DAYS_OF_WEEK.forEach(day => scheduleData[day] = {});

        if (scheduleResponse) {
            scheduleResponse.forEach(item => {
                // FIX: Use the new `dayDetails` array structure
                if (item && item.dayDetails && Array.isArray(item.dayDetails) && item.shift) {
                    const timeSlot = `${item.shift.startTime.substring(0, 5)} - ${item.shift.endTime.substring(0, 5)}`;
                    
                    item.dayDetails.forEach(dayDetail => {
                        const dayName = dayDetail.dayOfWeek.charAt(0).toUpperCase() + dayDetail.dayOfWeek.slice(1).toLowerCase();
                        if (scheduleData[dayName]) {
                            scheduleData[dayName][timeSlot] = {
                                subject: item.className,
                                generation: `Generation ${item.year}`,
                                semester: item.semester,
                                timeDisplay: timeSlot
                            };
                        }
                    });
                }
            });
        }

        const instructorDetails = {
            instructorName: profileResponse ? `${profileResponse.firstName} ${profileResponse.lastName}` : "Instructor",
            publicDate: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };

        return { scheduleData, instructorDetails };
    }, [scheduleResponse, profileResponse]);

    useEffect(() => {
        let assigned = 0;
        Object.values(scheduleData).forEach(daySchedule => {
            assigned += Object.keys(daySchedule).length;
        });
        setClassAssignCount(assigned);
        const totalSlots = TIME_SLOTS.length * DAYS_OF_WEEK.length;
        setAvailableShiftCount(totalSlots - assigned);
    }, [scheduleData]);

    const handleDownloadPdf = () => {
        if (scheduleRef.current) {
            html2canvas(scheduleRef.current, {
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`${instructorDetails.instructorName}_Schedule.pdf`);
            }).catch(err => {
                console.error("Error generating PDF:", err);
            });
        }
    };

    if (isScheduleLoading || isProfileLoading) {
        return <SchedulePageSkeleton />;
    }

    if (scheduleError || profileError) {
        return <div className="p-6 text-center text-red-500">Failed to load schedule data. Please refresh the page.</div>
    }
    
    return (
    <div className='p-6 min-h-screen dark:bg-gray-900'>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Schedule</h1>
        <hr className="border-t border-gray-200 dark:border-gray-700 mt-3" />
      </div>

      <div ref={scheduleRef} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">{instructorDetails.instructorName}</h2>

        <div className="overflow-x-auto">
          {/* FIX: Adjusted grid columns for better responsiveness and added min-w */}
          <div className="grid grid-cols-[minmax(140px,1fr)_repeat(7,minmax(120px,2fr))] border border-gray-300 dark:border-gray-600 rounded-md min-w-[1200px]">
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
                {/* FIX: Added whitespace-nowrap to prevent time from wrapping */}
                <div className={`p-3 text-sm font-medium text-gray-600 dark:text-gray-400 text-center border-r border-gray-300 dark:border-gray-600 ${timeSlot !== TIME_SLOTS[TIME_SLOTS.length - 1] ? 'border-b dark:border-b-gray-600' : ''} ${ROW_CONFIG[timeSlot].heightClass} flex items-center justify-center dark:bg-gray-700/50 whitespace-nowrap`}>
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-sm order-1 sm:order-2 mb-4 sm:mb-0"
        >
          Download PDF file
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
          Public Date : {instructorDetails.publicDate}
        </p>
      </div>
    </div>
  );
};