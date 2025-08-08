'use client';

import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Constants ---
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
    '07:00 - 10:00', // Morning Shift
    '10:30 - 13:30', // Noon Shift
    '14:00 - 17:00', // Afternoon Shift
    '17:30 - 20:30', // Evening Shift
    '07:30 - 17:00'  // Weekend Shift
];

const DAY_HEADER_COLORS = {
    Monday: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    Tuesday: 'bg-purple-50 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    Wednesday: 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    Thursday: 'bg-orange-50 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
    Friday: 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    Saturday: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
    Sunday: 'bg-pink-50 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
};

// --- Helper Components ---
const SkeletonCard = () => (
    <div className="w-full h-full p-2 bg-gray-200 dark:bg-gray-700/50 rounded-md animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3 absolute bottom-2 right-2"></div>
    </div>
);

// UPDATED: ScheduleItemCard now displays a "Temporary" status when applicable.
const ScheduleItemCard = React.memo(({ item }) => {
    const isTemporary = item.status === 'temporary';
    const cardBgColor = isTemporary 
        ? 'bg-orange-50 dark:bg-orange-900/40' 
        : 'bg-green-50 dark:bg-green-900/40';
    const borderColor = isTemporary 
        ? 'border-orange-200 dark:border-orange-800/60' 
        : 'border-green-200 dark:border-green-800/60';

    return (
        <div
            className={`p-2 h-full w-full flex flex-col text-xs rounded-md shadow-sm border ${borderColor} ${cardBgColor}`}
        >
            <div className="flex justify-between items-start mb-1">
                {/* MODIFIED: Added 'pdf-subject-name' class to handle PDF text wrapping */}
                <span className="pdf-subject-name max-w-[180px] font-semibold sm:text-[13px] text-[11px] text-gray-800 dark:text-gray-200 truncate" title={item.subject}>{item.subject}</span>
            </div>
            <div className="text-gray-700 dark:text-gray-300 sm:text-[11px] text-[9px]">{item.year}</div>
            
            {isTemporary && (
                <div className="mt-2">
                    {/* MODIFIED: Added 'pdf-temp-status' class to handle PDF styling */}
                    <span className="pdf-temp-status px-2 py-0.5 text-[10px] font-semibold text-orange-800 bg-orange-200 dark:text-orange-200 dark:bg-orange-700/50 rounded-full">
                        Temporary
                    </span>
                </div>
            )}

            <div className="sm:inline hidden mt-auto text-right text-gray-500 dark:text-gray-400 text-[10px]">{item.timeDisplay}</div>
            <div className="sm:inline hidden mt-1 text-right text-gray-500 dark:text-gray-400 text-[11px]">{item.semester}</div>
        </div>
    );
});
ScheduleItemCard.displayName = 'ScheduleItemCard';

const ScheduleGrid = ({ scheduleData, loading }) => (
    <div className="overflow-x-auto">
        <div className="grid sm:grid-cols-[minmax(120px,1fr)_repeat(7,minmax(150px,1.5fr))] grid-cols-[minmax(90px,0.8fr)_repeat(7,minmax(110px,1fr))] border-t border-l border-gray-300 dark:border-gray-600 sm:min-w-[1024px] min-w-[924px]">
            <div className="font-semibold sm:text-sm text-xs text-gray-700 dark:text-gray-300 sm:p-3 p-1 text-center border-r border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 sticky top-0 z-10">Time</div>
            {DAYS_OF_WEEK.map(day => (
                <div key={day} className={`font-semibold sm:text-sm text-xs sm:p-3 p-2 text-center border-b border-r border-gray-300 dark:border-gray-600 ${DAY_HEADER_COLORS[day]} sticky top-0 z-10`}>{day}</div>
            ))}
            {TIME_SLOTS.map(timeSlot => (
                <React.Fragment key={timeSlot}>
                    <div className="sm:p-3 p-1.5 sm:h-36 h-20 sm:text-sm text-xs font-medium text-gray-600 dark:text-gray-400 text-center border-r border-b border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">{timeSlot}</div>
                    {DAYS_OF_WEEK.map(day => {
                        const item = !loading ? (scheduleData[day]?.[timeSlot] || null) : null;
                        return (
                            <div
                                key={`${day}-${timeSlot}`}
                                className={`p-1.5 sm:h-36 h-20 border-r border-b border-gray-300 dark:border-gray-600 flex items-stretch justify-stretch relative`}
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


// --- Main Client Component ---
const RoomScheduleClient = ({ initialScheduleData, roomId, roomName }) => {
    const [scheduleData] = useState(initialScheduleData);
    const [loading] = useState(false);
    const publicDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const scheduleRef = useRef(null);
    const [classAssignCount, setClassAssignCount] = useState(0);
    const [availableShiftCount, setAvailableShiftCount] = useState(0);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    useEffect(() => {
        const assignedCount = Object.values(scheduleData).reduce(
            (count, daySchedule) => count + Object.keys(daySchedule || {}).length,
            0
        );
        const totalSlots = DAYS_OF_WEEK.length * TIME_SLOTS.length;

        setClassAssignCount(assignedCount);
        setAvailableShiftCount(totalSlots - assignedCount);
    }, [scheduleData]);

    const handleDownloadPdf = async () => {
        const captureElement = scheduleRef.current;
        if (!captureElement) return;
        setIsGeneratingPdf(true);

        // MODIFIED: Added temporary styles for PDF generation
        const style = document.createElement('style');
        style.id = 'pdf-capture-styles';
        style.innerHTML = `
            .pdf-capture-mode .pdf-subject-name {
                max-width: none !important;
                white-space: normal !important;
                overflow: visible !important;
                text-overflow: clip !important;
                word-break: break-word !important;
            }
            .pdf-capture-mode .pdf-temp-status {
                background-color: transparent !important;
                border: none !important;
                color: #D97706 !important; /* A dark orange for visibility */
            }
        `;
        document.head.appendChild(style);
        captureElement.classList.add('pdf-capture-mode');

        const statsContainer = document.createElement('div');
        const footer = document.createElement('div');
        const totalShifts = DAYS_OF_WEEK.length * TIME_SLOTS.length;

        statsContainer.className = 'mt-6 p-4 text-sm text-gray-700 dark:text-gray-300 space-y-1 border-t dark:border-gray-600';
        statsContainer.innerHTML = `
            <ul>
                <li>Assigned Classes: <span style="font-weight: 500;">${classAssignCount}</span></li>
                <li>Available Shifts: <span style="font-weight: 500;">${availableShiftCount}</span></li>
                <li>Total Shifts: <span style="font-weight: 500;">${totalShifts}</span></li>
            </ul>
            <p style="margin-top: 8px;">Public Date: ${publicDate}</p>
        `;

        const currentYear = new Date().getFullYear();
        footer.className = 'mt-6 pt-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-600';
        footer.innerHTML = `Copyright @${currentYear} NUM-FIT Digital Center. All rights reserved.`;

        captureElement.appendChild(statsContainer);
        captureElement.appendChild(footer);

        try {
            const canvas = await html2canvas(captureElement, {
                scale: 2, useCORS: true, logging: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Room_${roomName}_Schedule.pdf`);
        } catch (err) {
            console.error("Error generating PDF:", err);
        } finally {
            captureElement.removeChild(statsContainer);
            captureElement.removeChild(footer);
            // MODIFIED: Cleanup temporary styles
            document.getElementById('pdf-capture-styles')?.remove();
            captureElement.classList.remove('pdf-capture-mode');
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className='p-2 sm:p-6'>
            <div className="sm:mb-6 mb-3">
                <h1 className="sm:text-lg text-sm font-bold text-gray-800 dark:text-gray-200">Weekly Room Schedule</h1>
                <p className="sm:text-sm text-xs text-gray-500 dark:text-gray-400 mt-1">A view of all scheduled classes for room <span className="font-medium text-gray-700 dark:text-gray-300">{roomName}</span>.</p>
            </div>

            <div ref={scheduleRef} className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="sm:text-lg text-sm font-medium text-gray-700 dark:text-gray-300 sm:mb-4 mb-2">Room {roomName} Schedule</h2>
                <ScheduleGrid scheduleData={scheduleData} loading={loading} />
            </div>

            <div className="sm:mt-4 mt-2 flex flex-row justify-between items-center no-print">
                 <div className="sm:text-sm text-xs text-gray-500 dark:text-gray-400 mt-2 sm:mt-0 order-2 sm:order-1">
                    <ul className="mb-2">
                        <li>Assigned Classes: <span className="font-medium text-gray-700 dark:text-gray-300">{classAssignCount}</span></li>
                        <li>Available Shifts: <span className="font-medium text-gray-700 dark:text-gray-300">{availableShiftCount}</span></li>
                        <li>Total Shifts: <span className="font-medium text-gray-700 dark:text-gray-300">{DAYS_OF_WEEK.length * TIME_SLOTS.length}</span></li>
                        <li>Public Date: <span className="font-medium text-gray-700 dark:text-gray-300">{publicDate}</span></li>
                    </ul>
                </div>
                <button onClick={handleDownloadPdf} disabled={loading || isGeneratingPdf} className="bg-blue-600 hover:bg-blue-700 text-white sm:text-sm text-xs font-semibold sm:py-2.5 py-1.5 sm:px-6 px-3 rounded-md shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed w-auto order-1 sm:order-2">
                    {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF file'}
                </button>
            </div>
        </div>
    );
};

export default RoomScheduleClient;