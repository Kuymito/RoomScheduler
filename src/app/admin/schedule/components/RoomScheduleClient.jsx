'use client';

import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Constants ---
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['07:00 - 10:00', '10:30 - 13:30', '14:00 - 17:00', '17:30 - 20:30'];

const DAY_HEADER_COLORS = {
    Monday: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    Tuesday: 'bg-purple-50 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    Wednesday: 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    Thursday: 'bg-orange-50 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
    Friday: 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    Saturday: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
    Sunday: 'bg-pink-50 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
};

const SCHEDULE_ITEM_BG_COLOR = 'bg-green-50 dark:bg-green-900/40';

// --- Responsive Hook ---
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};

// --- Helper Components ---
const SkeletonCard = () => (
    <div className="w-full h-full p-2 bg-gray-200 dark:bg-gray-700/50 rounded-md animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3 absolute bottom-2 right-2"></div>
    </div>
);

const ScheduleItemCard = React.memo(({ item }) => (
    <div
        className={`p-2 h-full w-full flex flex-col text-xs rounded-md shadow-sm border border-green-200 dark:border-green-800/60 ${SCHEDULE_ITEM_BG_COLOR}`}
    >
        <div className="flex justify-between items-start mb-1">
            <span className="font-semibold text-[13px] text-gray-800 dark:text-gray-200">{item.subject}</span>
            <span className="text-gray-500 dark:text-gray-400 text-[10px] leading-tight pt-0.5">{item.timeDisplay}</span>
        </div>
        <div className="text-gray-700 dark:text-gray-300 text-[11px]">{item.year}</div>
        <div className="mt-auto text-right text-gray-500 dark:text-gray-400 text-[11px]">{item.semester}</div>
    </div>
));
ScheduleItemCard.displayName = 'ScheduleItemCard';

const ScheduleGrid = ({ scheduleData, loading }) => (
    <div className="overflow-x-auto">
        <div className="grid grid-cols-[minmax(120px,1fr)_repeat(7,minmax(150px,1.5fr))] border-t border-l border-gray-300 dark:border-gray-600 min-w-[1024px]">
            <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 p-3 text-center border-r border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 sticky top-0 z-10">Time</div>
            {DAYS_OF_WEEK.map(day => (
                <div key={day} className={`font-semibold text-sm p-3 text-center border-b border-r border-gray-300 dark:border-gray-600 ${DAY_HEADER_COLORS[day]} sticky top-0 z-10`}>{day}</div>
            ))}
            {TIME_SLOTS.map(timeSlot => (
                <React.Fragment key={timeSlot}>
                    <div className="p-3 h-36 text-sm font-medium text-gray-600 dark:text-gray-400 text-center border-r border-b border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">{timeSlot}</div>
                    {DAYS_OF_WEEK.map(day => {
                        const item = !loading ? (scheduleData[day]?.[timeSlot] || null) : null;
                        return (
                            <div
                                key={`${day}-${timeSlot}`}
                                className={`p-1.5 h-36 border-r border-b border-gray-300 dark:border-gray-600 flex items-stretch justify-stretch relative`}
                            >
                                {loading ? <SkeletonCard /> : (item ?
                                    <ScheduleItemCard item={item} />
                                    : <div className="w-full h-full"></div>)}
                            </div>
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
    </div>
);

const ScheduleList = ({ scheduleData, loading }) => (
    <div className="space-y-4">
        {DAYS_OF_WEEK.map(day => (
            <div key={day} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className={`p-3 font-semibold text-center ${DAY_HEADER_COLORS[day]}`}>{day}</div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {TIME_SLOTS.map(timeSlot => {
                        const item = !loading ? (scheduleData[day]?.[timeSlot] || null) : null;
                        return (
                            <div
                                key={`${day}-${timeSlot}`}
                                className={`flex items-center p-2 min-h-[80px] bg-white dark:bg-gray-800`}
                            >
                                <div className="w-28 text-center text-xs text-gray-500 dark:text-gray-400">{timeSlot}</div>
                                <div className={`flex-1 h-full p-1 rounded-md`}>
                                    {loading ? <SkeletonCard /> : (item ?
                                        <ScheduleItemCard item={item} />
                                        : <div className="w-full h-full"></div>)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
    </div>
);


// --- Main Client Component ---
const RoomScheduleClient = ({ initialScheduleData, roomId, roomName }) => {
    const [scheduleData] = useState(initialScheduleData);
    const [loading] = useState(false);
    const publicDate = "2025-06-09 14:31:43";
    const scheduleRef = useRef(null);
    const [classAssignCount, setClassAssignCount] = useState(0);
    const [availableShiftCount, setAvailableShiftCount] = useState(0);
    const [hasMounted, setHasMounted] = useState(false);

    const isDesktop = useMediaQuery('(min-width: 1024px)');

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        const assignedCount = Object.values(scheduleData).reduce(
            (count, daySchedule) => count + Object.keys(daySchedule || {}).length,
            0
        );
        const totalSlots = DAYS_OF_WEEK.length * TIME_SLOTS.length;

        setClassAssignCount(assignedCount);
        setAvailableShiftCount(totalSlots - assignedCount);
    }, [scheduleData]);

    const handleDownloadPdf = () => {
        if (scheduleRef.current) {
            html2canvas(scheduleRef.current, {
                scale: 2, useCORS: true, logging: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`Room_${roomName}_Schedule.pdf`);
            });
        }
    };

    const renderSchedule = () => {
        if (!hasMounted) {
            return <ScheduleGrid scheduleData={{}} loading={true} />;
        }
        if (isDesktop) {
            return <ScheduleGrid scheduleData={scheduleData} loading={loading} />;
        }
        return <ScheduleList scheduleData={scheduleData} loading={loading} />;
    };

    return (
        <div className='p-4 sm:p-6'>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Weekly Room Schedule</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">A view of all scheduled classes for room <span className="font-medium text-gray-700 dark:text-gray-300">{roomName}</span>.</p>
            </div>

            <div ref={scheduleRef} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">Room {roomName} Schedule</h2>
                {renderSchedule()}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
                 <div className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1 mt-4 sm:mt-0">
                    <ul>
                        <li>Assigned Classes: <span className="font-medium text-gray-700 dark:text-gray-300">{classAssignCount}</span></li>
                        <li>Available Shifts: <span className="font-medium text-gray-700 dark:text-gray-300">{availableShiftCount}</span></li>
                        <li>Total Shifts: <span className="font-medium text-gray-700 dark:text-gray-300">{DAYS_OF_WEEK.length * TIME_SLOTS.length}</span></li>
                    </ul>
                    <p className="mt-2">Public Date: {publicDate}</p>
                </div>
                <button onClick={handleDownloadPdf} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-sm order-1 sm:order-2 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto">
                    Download PDF file
                </button>
            </div>
        </div>
    );
};

export default RoomScheduleClient;