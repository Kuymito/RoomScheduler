// File Path: app/admin/schedule/[roomId]/page.jsx
// This single file creates the dynamic room schedule page with D&D, responsiveness, and swap confirmation.

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { scheduleService } from '@/services/schedule.service';
import { useSession } from 'next-auth/react';

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

// --- Helper function to calculate year from semester ---
const mapSemesterToYear = (semester) => {
    if (!semester || typeof semester !== 'string') return '';
    const semesterNumber = parseInt(semester.replace(/[^0-9]/g, ''), 10);
    if (isNaN(semesterNumber)) return '';
    return Math.ceil(semesterNumber / 2);
};

// --- Responsive Hook ---
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
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

const ScheduleItemCard = React.memo(({ item, isOrigin, onDragStart, onDragEnd }) => (
    <div
        draggable="true"
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={`p-2 h-full w-full flex flex-col text-xs rounded-md shadow-sm border border-green-200 dark:border-green-800/60 cursor-move transition-opacity duration-300 ${SCHEDULE_ITEM_BG_COLOR} ${isOrigin ? 'opacity-40' : 'opacity-100'}`}
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

const ScheduleGrid = ({ scheduleData, loading, dragHandlers, dragOverCell, draggedItemInfo }) => (
    <div className="overflow-x-auto">
        <div className="grid grid-cols-[minmax(120px,1fr)_repeat(7,minmax(150px,1.5fr))] border-t border-l border-gray-300 dark:border-gray-600 min-w-[1024px]">
            <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 p-3 text-center border-r border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 sticky top-0 z-10">Time</div>
            {DAYS_OF_WEEK.map(day => (
                <div key={day} className={`font-semibold text-sm p-3 text-center border-b border-gray-300 dark:border-gray-600 ${DAY_HEADER_COLORS[day]} ${day !== 'Sunday' ? 'border-r dark:border-r-gray-600' : ''} sticky top-0 z-10`}>{day}</div>
            ))}
            {TIME_SLOTS.map(timeSlot => (
                <React.Fragment key={timeSlot}>
                    <div className="p-3 h-36 text-sm font-medium text-gray-600 dark:text-gray-400 text-center border-r border-b border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">{timeSlot}</div>
                    {DAYS_OF_WEEK.map(day => {
                        const item = !loading ? (scheduleData[day]?.[timeSlot] || null) : null;
                        const isDragOver = dragOverCell?.day === day && dragOverCell?.timeSlot === timeSlot;
                        const isOrigin = draggedItemInfo?.origin.day === day && draggedItemInfo?.origin.timeSlot === timeSlot;
                        const canDrop = draggedItemInfo && !(isOrigin);

                        return (
                            <div
                                key={`${day}-${timeSlot}`}
                                onDragOver={dragHandlers.handleDragOver}
                                onDragEnter={(e) => dragHandlers.handleDragEnter(e, day, timeSlot)}
                                onDragLeave={dragHandlers.handleDragLeave}
                                onDrop={(e) => dragHandlers.handleDrop(e, day, timeSlot)}
                                className={`p-1.5 h-36 border-r border-b border-gray-300 dark:border-gray-600 ${day === 'Sunday' ? 'border-r-0' : ''} flex items-stretch justify-stretch relative transition-all duration-200
                                    ${isDragOver && canDrop ? 'bg-blue-100 dark:bg-blue-900/40 shadow-inner' : ''}
                                    ${isOrigin ? 'border-dashed border-gray-400 dark:border-gray-500' : ''}
                                `}
                            >
                                {isDragOver && canDrop && <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse" />}
                                {loading ? <SkeletonCard /> : (item ?
                                    <ScheduleItemCard
                                        item={item}
                                        isOrigin={isOrigin}
                                        onDragStart={(e) => dragHandlers.handleDragStart(e, item, day, timeSlot)}
                                        onDragEnd={dragHandlers.handleDragEnd}
                                    />
                                    : <div className="w-full h-full"></div>)}
                            </div>
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
    </div>
);

const ScheduleList = ({ scheduleData, loading, dragHandlers, dragOverCell, draggedItemInfo }) => (
    <div className="space-y-4">
        {DAYS_OF_WEEK.map(day => (
            <div key={day} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className={`p-3 font-semibold text-center ${DAY_HEADER_COLORS[day]}`}>{day}</div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {TIME_SLOTS.map(timeSlot => {
                        const item = !loading ? (scheduleData[day]?.[timeSlot] || null) : null;
                        const isDragOver = dragOverCell?.day === day && dragOverCell?.timeSlot === timeSlot;
                        const isOrigin = draggedItemInfo?.origin.day === day && draggedItemInfo?.origin.timeSlot === timeSlot;
                        const canDrop = draggedItemInfo && !(isOrigin);

                        return (
                            <div
                                key={`${day}-${timeSlot}`}
                                onDragOver={dragHandlers.handleDragOver}
                                onDragEnter={(e) => dragHandlers.handleDragEnter(e, day, timeSlot)}
                                onDragLeave={dragHandlers.handleDragLeave}
                                onDrop={(e) => dragHandlers.handleDrop(e, day, timeSlot)}
                                className={`flex items-center p-2 min-h-[80px] transition-all duration-200 relative ${isDragOver && canDrop ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-white dark:bg-gray-800'}`}
                            >
                                <div className="w-28 text-center text-xs text-gray-500 dark:text-gray-400">{timeSlot}</div>
                                <div className={`flex-1 h-full p-1 rounded-md ${isOrigin ? 'border-dashed border-gray-400 dark:border-gray-500' : ''}`}>
                                    {isDragOver && canDrop && <div className="absolute inset-2 border-2 border-blue-500 rounded-lg animate-pulse" />}
                                    {loading ? <SkeletonCard /> : (item ?
                                        <ScheduleItemCard
                                            item={item}
                                            isOrigin={isOrigin}
                                            onDragStart={(e) => dragHandlers.handleDragStart(e, item, day, timeSlot)}
                                            onDragEnd={dragHandlers.handleDragEnd}
                                        />
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

const ConfirmationModal = ({ isOpen, onCancel, onConfirm, swapDetails }) => {
    if (!isOpen || !swapDetails) return null;

    const { from, to } = swapDetails;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirm Class Swap</h2>
                <div className="space-y-4 text-sm">
                    <p className="text-gray-600 dark:text-gray-300">Are you sure you want to swap these two classes?</p>
                    <div className="p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/60">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{from.classData.subject}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">From: {from.day}, {from.time}</p>
                    </div>
                    <div className="p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/60">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{to.classData.subject}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">To: {to.day}, {to.time}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">
                        Confirm Swap
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const RoomSchedulePage = () => {
    const { roomId } = useParams();
    const { data: session } = useSession();
    const [scheduleData, setScheduleData] = useState({});
    const [loading, setLoading] = useState(true);
    const publicDate = "2025-06-09 14:31:43"; // Updated timestamp
    const scheduleRef = useRef(null);
    const [draggedItemInfo, setDraggedItemInfo] = useState(null);
    const [dragOverCell, setDragOverCell] = useState(null);
    const [modalState, setModalState] = useState({ isOpen: false, details: null, onConfirm: () => {} });
    const [classAssignCount, setClassAssignCount] = useState(0);
    const [availableShiftCount, setAvailableShiftCount] = useState(0);

    const isDesktop = useMediaQuery('(min-width: 1024px)');

    useEffect(() => {
        if (roomId && session?.accessToken) {
            setLoading(true);
            scheduleService.getAllSchedules(session.accessToken)
                .then(apiSchedules => {
                    const roomSchedules = {};
                    apiSchedules.forEach(schedule => {
                        if (String(schedule.roomId) === String(roomId)) {
                            const timeSlotKey = `${schedule.shift.startTime.slice(0, 5)} - ${schedule.shift.endTime.slice(0, 5)}`;
                            if (schedule.dayDetails && Array.isArray(schedule.dayDetails)) {
                                schedule.dayDetails.forEach(dayDetail => {
                                    const dayName = dayDetail.dayOfWeek.charAt(0).toUpperCase() + dayDetail.dayOfWeek.slice(1).toLowerCase();
                                    if (!roomSchedules[dayName]) {
                                        roomSchedules[dayName] = {};
                                    }
                                    const academicYear = mapSemesterToYear(schedule.semester);
                                    roomSchedules[dayName][timeSlotKey] = {
                                        subject: schedule.className,
                                        year: `Year ${academicYear}`,
                                        semester: schedule.semester,
                                        timeDisplay: timeSlotKey,
                                    };
                                });
                            }
                        }
                    });
                    setScheduleData(roomSchedules);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch schedules:", err);
                    setLoading(false);
                });
        }
    }, [roomId, session]);

    useEffect(() => {
        if (!loading) {
            const assignedCount = Object.values(scheduleData).reduce(
                (count, daySchedule) => count + Object.keys(daySchedule || {}).length,
                0
            );
            const totalSlots = DAYS_OF_WEEK.length * TIME_SLOTS.length;

            setClassAssignCount(assignedCount);
            setAvailableShiftCount(totalSlots - assignedCount);
        }
    }, [scheduleData, loading]);

    const handleDownloadPdf = () => {
        if (scheduleRef.current) {
            html2canvas(scheduleRef.current, {
                scale: 2, useCORS: true, logging: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`Room_${roomId}_Schedule.pdf`);
            });
        }
    };

    // --- Modal Handlers ---
    const handleCancelSwap = () => {
        setModalState({ isOpen: false, details: null, onConfirm: () => {} });
    };

    const handleConfirmSwap = () => {
        setTimeout(modalState.onConfirm, 0);
        handleCancelSwap();
    };

    // --- Drag and Drop Handlers ---
    const handleDragStart = useCallback((e, item, day, timeSlot) => {
        setDraggedItemInfo({ item, origin: { day, timeSlot } });
        e.dataTransfer.effectAllowed = 'move';
        const dragGhost = e.currentTarget.cloneNode(true);
        dragGhost.style.position = 'absolute';
        dragGhost.style.top = '-9999px';
        dragGhost.style.width = '200px';
        dragGhost.style.height = '80px';
        document.body.appendChild(dragGhost);
        e.dataTransfer.setDragImage(dragGhost, 20, 20);
        document.body.setAttribute('data-dragging', 'true');
        setTimeout(() => document.body.removeChild(dragGhost), 0);
    }, []);

    const handleDragEnd = useCallback(() => {
        document.body.removeAttribute('data-dragging');
        setDraggedItemInfo(null);
        setDragOverCell(null);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        if (draggedItemInfo) e.dataTransfer.dropEffect = 'move';
    }, [draggedItemInfo]);

    const handleDragEnter = useCallback((e, day, timeSlot) => {
        e.preventDefault();
        setDragOverCell({ day, timeSlot });
    }, []);

    const handleDragLeave = useCallback((e) => {
        if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) return;
        setDragOverCell(null);
    }, []);
    
    const handleDrop = useCallback((e, targetDay, targetTimeSlot) => {
        e.preventDefault();
        setDragOverCell(null);
        if (!draggedItemInfo) return;

        const { item: draggedItem, origin } = draggedItemInfo;
        if (origin.day === targetDay && origin.timeSlot === targetTimeSlot) return;

        const targetItem = scheduleData[targetDay]?.[targetTimeSlot] || null;

        const performMoveOrSwap = () => {
            setScheduleData(currentSchedule => {
                const newSchedule = JSON.parse(JSON.stringify(currentSchedule));
                const currentTargetItem = newSchedule[targetDay]?.[targetTimeSlot] || null;

                if (newSchedule[origin.day]?.[origin.timeSlot]) {
                    delete newSchedule[origin.day][origin.timeSlot];
                    if (Object.keys(newSchedule[origin.day]).length === 0) delete newSchedule[origin.day];
                }
                
                if (!newSchedule[targetDay]) newSchedule[targetDay] = {};
                newSchedule[targetDay][targetTimeSlot] = { ...draggedItem, timeDisplay: targetTimeSlot };

                if (currentTargetItem) {
                    if (!newSchedule[origin.day]) newSchedule[origin.day] = {};
                    newSchedule[origin.day][origin.timeSlot] = { ...currentTargetItem, timeDisplay: origin.timeSlot };
                }
                
                return newSchedule;
            });
        };

        if (targetItem) {
            setModalState({
                isOpen: true,
                details: {
                    from: { classData: draggedItem, day: origin.day, time: origin.timeSlot },
                    to: { classData: targetItem, day: targetDay, time: targetTimeSlot }
                },
                onConfirm: performMoveOrSwap,
            });
        } else {
            setTimeout(performMoveOrSwap, 0);
        }

    }, [draggedItemInfo, scheduleData]);

    const dragHandlers = { handleDragStart, handleDragEnd, handleDragOver, handleDragEnter, handleDragLeave, handleDrop };

    return (
        <div className='p-4 sm:p-6'>
            <style jsx global>{`
                body[data-dragging] * {
                    cursor: not-allowed !important;
                }
                body[data-dragging] [draggable="true"] {
                    cursor: move !important;
                }
            `}</style>
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onCancel={handleCancelSwap}
                onConfirm={handleConfirmSwap}
                swapDetails={modalState.details}
            />
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Weekly Room Schedule</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">A view of all scheduled classes for room <span className="font-medium text-gray-700 dark:text-gray-300">{roomId}</span>.</p>
            </div>

            <div ref={scheduleRef} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">Room {roomId} Schedule</h2>
                {isDesktop ? (
                    <ScheduleGrid {...{ scheduleData, loading, dragHandlers, dragOverCell, draggedItemInfo }} />
                ) : (
                    <ScheduleList {...{ scheduleData, loading, dragHandlers, dragOverCell, draggedItemInfo }} />
                )}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
                 <p className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1 mt-4 sm:mt-0">
                    <ul>
                        <li>Assigned Classes: <span className="font-medium text-gray-700 dark:text-gray-300">{classAssignCount}</span></li>
                        <li>Available Shifts: <span className="font-medium text-gray-700 dark:text-gray-300">{availableShiftCount}</span></li>
                        <li>Total Shifts: <span className="font-medium text-gray-700 dark:text-gray-300">{DAYS_OF_WEEK.length * TIME_SLOTS.length}</span></li>
                    </ul>
                    Public Date: 2025-06-09 15:20:09
                </p>
                <button onClick={handleDownloadPdf} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-sm order-1 sm:order-2 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto">
                    Download PDF file
                </button>
            </div>
        </div>
    );
};

export default function AdminScheduleRoomDetailPage() {
    const { roomId } = useParams();

    const breadcrumbs = [
        { label: "Schedule", href: "/admin/schedule" },
        { label: `${roomId}` }
    ];

    return (
        <AdminLayout activeItem="schedule" breadcrumbs={breadcrumbs}>
            <RoomSchedulePage />
        </AdminLayout>
    );
}