'use client';

import React, { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { scheduleService } from '@/services/schedule.service';
import { useSession } from 'next-auth/react';
import Toast from '@/components/Toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ConfirmationModal = lazy(() => import('./ConfirmationModal'));

// --- Helper function to calculate academic year ---
const mapGenerationToYear = (generation) => {
    if (!generation) return null;
    const genNumber = parseInt(generation, 10);
    if (isNaN(genNumber)) return null;
    const BASE_GENERATION = 34;
    const BASE_YEAR = 2025;
    const currentYear = new Date().getFullYear();
    const currentFirstYearGeneration = BASE_GENERATION + (currentYear - BASE_YEAR);
    const academicYear = currentFirstYearGeneration - genNumber + 1;
    return academicYear > 0 ? academicYear : null;
};


// --- Child Components ---

const SpinnerIcon = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const MovedClassPlaceholderCard = ({ classData }) => (
    <div className="w-full h-24 p-2 bg-blue-100 dark:bg-blue-800 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg shadow-sm flex flex-col justify-center items-center text-center">
        <p className="text-xs font-semibold text-blue-800 dark:text-blue-100 break-words">{classData.className}</p>
        <p className="text-xs text-blue-500 dark:text-blue-300 opacity-80 mt-1">Moved to:</p>
        <p className="text-xs font-bold text-blue-800 dark:text-blue-100">{classData.movedToRoomName}</p>
    </div>
);

const ScheduledClassCard = ({ classData, onDragStart, onDragEnd, isTemporary }) => {
    const cardColor = isTemporary
        ? 'bg-orange-100 dark:bg-orange-800 border-orange-400 dark:border-orange-600'
        : 'bg-blue-100 dark:bg-blue-800 border-blue-400 dark:border-blue-600';
    const textColor = isTemporary
        ? 'text-orange-800 dark:text-orange-100'
        : 'text-blue-800 dark:text-blue-100';
    const subTextColor = isTemporary
        ? 'text-orange-600 dark:text-orange-300'
        : 'text-blue-600 dark:text-blue-300';

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={`w-full sm:h-24 h-20 sm:p-2 p-1 border-2 rounded-lg shadow-md flex flex-col justify-center items-center text-center cursor-grab active:cursor-grabbing transition-all duration-150 ${cardColor}`}
        >
            <p className={`max-w-[120px] sm:text-xs text-[10px] font-semibold break-words truncate ${textColor}`} title={classData.className}  >{classData.className}</p>
            <p className={`2xl:max-w-[120px] xl:max-w-[90px] max-w-[120px] sm:inline hidden 2xl:text-xs text-[10px] opacity-80 ${subTextColor} truncate`} title={classData.majorName} >{classData.majorName}</p>
        </div>
    );
};

const RoomCard = React.memo(({ room, classData, isDragOver, isWarning, dragHandlers, className, isNavigating, onHeaderClick }) => {
    const isOccupied = !!classData;
    const isUnavailable = room.status === "unavailable";

    const getBorderColor = () => {
        if (isWarning) return 'border-red-500 dark:border-red-400 shadow-lg scale-105';
        if (isDragOver) return 'border-emerald-400 dark:border-emerald-500 shadow-lg scale-105';
        return 'border-gray-300 dark:border-gray-700 shadow-sm';
    };

    return (
        <div
            className={`rounded-lg border flex flex-col transition-all duration-150 overflow-hidden ${getBorderColor()} ${isUnavailable ? 'cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 opacity-70' : ''} ${className || ''}`}
        >
            <div
                onClick={() => !isNavigating && !classData?.isMovedPlaceholder && onHeaderClick(room.roomId)}
                className={`sm:px-2 px-1.5 sm:py-1 py-0.5 flex justify-between items-center border-b-2 border-b-gray-300 dark:border-b-gray-700 transition-colors ${isNavigating ? 'cursor-not-allowed' : (classData?.isMovedPlaceholder ? 'cursor-default' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700')} ${isWarning ? 'bg-red-100 dark:bg-red-800/50' : (isUnavailable ? 'bg-slate-100 dark:bg-slate-700/60' : 'bg-gray-50 dark:bg-gray-800')}`}
            >
                <div className={`w-2 h-2 rounded-full ring-1 ring-white/50 ${isOccupied || isUnavailable ? 'bg-red-500' : 'bg-green-500'}`} title={isOccupied || isUnavailable ? 'Occupied/Unavailable' : 'Available'}></div>
                {isNavigating ? (
                    <SpinnerIcon className="h-4 w-4 text-gray-500" />
                ) : (
                    <span className={`sm:text-xs text-[10px] sm:font-bold font-semibold ${isUnavailable ? 'text-slate-500 dark:text-slate-400' : 'text-gray-700 dark:text-gray-300'}`}>{room.roomName}</span>
                )}
            </div>
            <div
                onDragOver={dragHandlers.onDragOver}
                onDragEnter={dragHandlers.onDragEnter}
                onDragLeave={dragHandlers.onDragLeave}
                onDrop={dragHandlers.onDrop}
                className={`flex-grow sm:p-2 p-1 flex flex-col justify-center items-center text-center transition-colors sm:min-h-[112px] min-h-[92px] room-card-drop-zone ${isDragOver ? 'bg-emerald-100 dark:bg-emerald-800/50' : (isUnavailable ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-gray-900')}`}
            >
                {isOccupied ? (
                    classData.isMovedPlaceholder ? (
                        <MovedClassPlaceholderCard classData={classData} />
                    ) : (
                        <ScheduledClassCard
                            classData={classData}
                            onDragStart={dragHandlers.onDragStart}
                            onDragEnd={dragHandlers.onDragEnd}
                            isTemporary={!!classData.isTemporary}
                        />
                    )
                ) : (
                    <span className={`sm:text-xs text-[10px] italic select-none pointer-events-none ${isUnavailable ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-600'}`}>
                        {isUnavailable ? 'Unavailable' : `${room.roomName}`}
                    </span>
                )}
            </div>
        </div>
    );
});
RoomCard.displayName = 'RoomCard';


// --- Main Component ---

const ScheduleClientView = ({
    initialClasses,
    initialRooms,
    initialSchedules,
    buildingLayout,
    constants
}) => {
    const { data: session } = useSession();
    const token = session?.accessToken;
    const { degrees, generations, buildings, weekdays, timeSlots } = constants;
    const router = useRouter();

    const [schedules, setSchedules] = useState(initialSchedules);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);

    // **FIX**: Initialize state with simple, consistent defaults to prevent hydration errors.
    const [selectedDay, setSelectedDay] = useState(weekdays[0]);
    const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
    const [selectedBuilding, setSelectedBuilding] = useState(buildings[0]);
    
    // **FIX**: Use a useEffect to set the state from client-side sources (localStorage, new Date())
    // This runs *after* the initial render, avoiding the server-client mismatch.
    useEffect(() => {
        const savedDay = localStorage.getItem('adminSchedule_selectedDay');
        const dayAbbreviationMap = { 0: 'Su', 1: 'Mo', 2: 'Tu', 3: 'We', 4: 'Th', 5: 'Fr', 6: 'Sa' };
        const currentDayAbbr = dayAbbreviationMap[new Date().getDay()];
        const dayToSet = savedDay && weekdays.includes(savedDay) ? savedDay : (weekdays.includes(currentDayAbbr) ? currentDayAbbr : weekdays[0]);
        setSelectedDay(dayToSet);

        const savedTime = localStorage.getItem('adminSchedule_selectedTime');
        if (savedTime && timeSlots.includes(savedTime)) {
            setSelectedTime(savedTime);
        }

        const savedBuilding = localStorage.getItem('adminSchedule_selectedBuilding');
        if (savedBuilding && buildings.includes(savedBuilding)) {
            setSelectedBuilding(savedBuilding);
        }
    }, [weekdays, timeSlots, buildings]); // Dependencies ensure this runs if constants change

    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverCell, setDragOverCell] = useState(null);
    const [warningCellId, setWarningCellId] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const [selectedDegree, setSelectedDegree] = useState('All');
    const [selectedGeneration, setSelectedGeneration] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [navigatingToRoomId, setNavigatingToRoomId] = useState(null);
    const [swapConfirmation, setSwapConfirmation] = useState({ isOpen: false, details: null });
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const schedulePageReference = useRef(null);
    const unassignmentProcessed = useRef(false);

    const dayApiToAbbreviationMap = { MONDAY: 'Mo', TUESDAY: 'Tu', WEDNESDAY: 'We', THURSDAY: 'Th', FRIDAY: 'Fr', SATURDAY: 'Sa', SUNDAY: 'Su' };
    
    const yearColorMap = {
        1: 'bg-sky-500', 2: 'bg-emerald-500', 3: 'bg-amber-500', 4: 'bg-indigo-500',
    };

    const showToast = (message, type = 'info') => setToast({ show: true, message, type });

    // --- Effects ---
    useEffect(() => { localStorage.setItem('adminSchedule_selectedDay', selectedDay); }, [selectedDay]);
    useEffect(() => { localStorage.setItem('adminSchedule_selectedTime', selectedTime); }, [selectedTime]);
    useEffect(() => { localStorage.setItem('adminSchedule_selectedBuilding', selectedBuilding); }, [selectedBuilding]);
    
    useEffect(() => {
        const weekdaysArray = ['Mo', 'Tu', 'We', 'Th', 'Fr'];
        const weekendDaysArray = ['Sa', 'Su'];
        const isWeekdayShift = selectedTime !== 'Weekend Shift';

        if (isWeekdayShift && weekendDaysArray.includes(selectedDay)) {
            setSelectedDay('Mo');
        } else if (!isWeekdayShift && weekdaysArray.includes(selectedDay)) {
            setSelectedDay('Sa');
        }
    }, [selectedTime, selectedDay]);

    useEffect(() => {
        setSchedules(initialSchedules);
        const currentAssignedIds = new Set();
        Object.values(initialSchedules).forEach(day => 
            Object.values(day).forEach(time => 
                Object.values(time).forEach(schedule => {
                    if (schedule.classId) currentAssignedIds.add(schedule.classId);
                })
            )
        );
        const unassigned = initialClasses.filter(cls => !currentAssignedIds.has(cls.classId));
        setAvailableClasses(unassigned);
    }, [initialSchedules, initialClasses]);

    useEffect(() => {
        const preventDefault = (event) => event.preventDefault();
        window.addEventListener('dragover', preventDefault, { passive: false });
        window.addEventListener('drop', preventDefault);
        return () => {
            window.removeEventListener('dragover', preventDefault);
            window.removeEventListener('drop', preventDefault);
        };
    }, []);

    // --- Memoized Calculations ---

    const allFilteredAndSortedClasses = useMemo(() => {
        const selectedDayFull = Object.keys(dayApiToAbbreviationMap).find(key => dayApiToAbbreviationMap[key] === selectedDay) || '';
        const filtered = availableClasses.map(classItem => ({
            ...classItem,
            year: mapGenerationToYear(classItem.generation)
        })).filter(classItem => {
            if (classItem.archived) return false;
            const dailySchedule = classItem.dailySchedule || {};
            const assignmentForDay = dailySchedule[selectedDayFull];
            const occursOnSelectedDay = assignmentForDay && !assignmentForDay.online;
            const degreeMatch = selectedDegree === 'All' || classItem.degreeName === selectedDegree;
            const generationMatch = selectedGeneration === 'All' || classItem.generation === selectedGeneration;
            const searchTermMatch = searchTerm === '' || classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) || (classItem.majorName && classItem.majorName.toLowerCase().includes(searchTerm.toLowerCase()));
            return occursOnSelectedDay && degreeMatch && generationMatch && searchTermMatch;
        });
        return filtered.sort((classA, classB) => {
            const shiftA = classA.shift?.name;
            const shiftB = classB.shift?.name;
            if (selectedTime !== 'All') {
                const aMatches = shiftA === selectedTime;
                const bMatches = shiftB === selectedTime;
                if (aMatches && !bMatches) return -1;
                if (!aMatches && bMatches) return 1;
            }
            const indexA = timeSlots.indexOf(shiftA);
            const indexB = timeSlots.indexOf(shiftB);
            if (indexA !== indexB) return indexA - indexB;
            return classA.className.localeCompare(classB.className);
        });
    }, [availableClasses, selectedDay, selectedTime, selectedDegree, selectedGeneration, searchTerm, timeSlots, dayApiToAbbreviationMap]);

    const groupedClassesByShift = useMemo(() => {
        const groups = {};
        allFilteredAndSortedClasses.forEach(classItem => {
            const shiftName = classItem.shift?.name || 'Unassigned';
            if (!groups[shiftName]) groups[shiftName] = [];
            groups[shiftName].push(classItem);
        });
        return groups;
    }, [allFilteredAndSortedClasses]);

    const orderedTimeSlots = useMemo(() => {
        if (selectedTime === 'All') return timeSlots;
        const otherTimes = timeSlots.filter(slot => slot !== selectedTime);
        return [selectedTime, ...otherTimes];
    }, [selectedTime, timeSlots]);

    const getClassForRoom = (roomId) => {
        return schedules[selectedDay]?.[selectedTime]?.[roomId] || null;
    };

    const currentGrid = useMemo(() => buildingLayout[selectedBuilding] ?? {}, [buildingLayout, selectedBuilding]);
    
    const { availableRoomsCount, unavailableRoomsCount } = useMemo(() => {
        if (!selectedBuilding || !buildingLayout[selectedBuilding]) return { availableRoomsCount: 0, unavailableRoomsCount: 0 };
        const roomsInBuilding = Object.values(buildingLayout[selectedBuilding]).flat();
        const totalRoomsInBuilding = roomsInBuilding.length;
        const timeSchedule = schedules[selectedDay]?.[selectedTime] || {};
        const occupiedRoomIds = new Set(Object.keys(timeSchedule).map(Number));
        const unavailableRoomIds = new Set(roomsInBuilding.filter(room => room.status === 'unavailable').map(room => room.roomId));
        const totalUnavailable = new Set([...occupiedRoomIds, ...unavailableRoomIds]).size;
        return { availableRoomsCount: totalRoomsInBuilding - totalUnavailable, unavailableRoomsCount: totalUnavailable };
    }, [selectedBuilding, selectedDay, selectedTime, schedules, buildingLayout]);

    // --- Handlers ---

    const handleRoomCardClick = (roomId) => {
        setNavigatingToRoomId(roomId);
        router.push(`/admin/schedule/${roomId}`);
    };

    const handleRevertTemporaryMove = async (draggedItemPayload) => {
        const { item: tempClassInfo, origin } = draggedItemPayload;
        if (!origin || !origin.scheduleId) {
            showToast("Cannot revert: Missing schedule ID.", 'error');
            return;
        }
        if (unassignmentProcessed.current) return;
        unassignmentProcessed.current = true;
        setIsAssigning(true);
        try {
            await scheduleService.revertTemporaryMove(origin.scheduleId, token);
            showToast("Temporary move canceled.", 'success');
            router.refresh(); // REFETCH DATA
        } catch (error) {
            showToast(`Failed to cancel move: ${error.message}`, 'error');
        } finally {
            setIsAssigning(false);
        }
    };

    const handleUnassign = async (draggedItemPayload) => {
        const { origin } = draggedItemPayload;
        if (!origin || !origin.scheduleId) {
            showToast("Cannot unassign: Schedule ID is missing.", 'error');
            return;
        }
        if (unassignmentProcessed.current) return;
        unassignmentProcessed.current = true;
        setIsAssigning(true);
        try {
            await scheduleService.unassignRoomFromClass(origin.scheduleId, token);
            showToast("Class unassigned successfully.", 'success');
            router.refresh(); // REFETCH DATA
        } catch (error) {
            showToast(`Failed to unassign class: ${error.message}`, 'error');
        } finally {
            setIsAssigning(false);
        }
    };
    
    const handleDragStart = (event, item, type, origin = null) => {
        if (item.isMovedPlaceholder) {
            event.preventDefault();
            return;
        }
        unassignmentProcessed.current = false;
        setDraggedItem({ item, type, origin });
    };

    const handleDragEnd = async (event) => {
        const dropTarget = document.elementFromPoint(event.clientX, event.clientY);
        const droppedOutsideGrid = !dropTarget?.closest('.room-card-drop-zone');

        if (draggedItem?.type === 'scheduled' && droppedOutsideGrid) {
            if (draggedItem.item.isTemporary) {
                await handleRevertTemporaryMove(draggedItem);
            } else {
                await handleUnassign(draggedItem);
            }
        }
        
        setDraggedItem(null);
        setDragOverCell(null);
        setWarningCellId(null);
    };

    const handleGridCellDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const handleGridCellDragEnter = (event, roomId) => {
        event.preventDefault();
        const room = initialRooms.find(roomObject => roomObject.roomId === roomId);
        if (room.status === "unavailable") {
            setWarningCellId(roomId);
            return;
        }
        
        setDragOverCell({ roomId });

        if (draggedItem?.type === 'new') {
            const classShiftName = draggedItem.item.shift?.name;
            const isOccupied = !!getClassForRoom(roomId);
            
            if (classShiftName !== selectedTime || isOccupied) {
                setWarningCellId(roomId);
            }
        } else if (draggedItem?.type === 'scheduled') {
            if (getClassForRoom(roomId)) {
                setWarningCellId(roomId);
            }
        }
    };

    const handleGridCellDragLeave = (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setDragOverCell(null);
            setWarningCellId(null);
        }
    };
    
    const handleGridCellDrop = async (event, targetRoomId) => {
        event.preventDefault();
        setDragOverCell(null);
        setWarningCellId(null);

        if (!draggedItem) return;

        const { item: draggedClass, type: draggedType, origin: dragOrigin } = draggedItem;
        const targetRoomData = getClassForRoom(targetRoomId);

        if (targetRoomData?.isMovedPlaceholder) {
            showToast("Cannot drop here; this is a placeholder for a moved class.", "error");
            return;
        }

        if (draggedType === 'scheduled' && targetRoomData) {
            if (dragOrigin.roomId === targetRoomId) return; 

            setSwapConfirmation({
                isOpen: true,
                details: {
                    from: { ...dragOrigin, classData: draggedClass },
                    to: { ...targetRoomData, day: selectedDay, time: selectedTime, roomId: targetRoomId, classData: targetRoomData },
                },
            });
            setDraggedItem(null); 
            return;
        }

        if (draggedType === 'scheduled' && !targetRoomData) {
            setIsAssigning(true);
            try {
                await scheduleService.moveScheduleToRoom(dragOrigin.scheduleId, targetRoomId, token);
                showToast("Class moved to temporary room!", 'success');
                router.refresh(); // REFETCH DATA
            } catch (error) {
                showToast(`Move failed: ${error.message}`, 'error');
            } finally {
                setIsAssigning(false);
                setDraggedItem(null);
            }
            return;
        }

        if (draggedType === 'new' && !targetRoomData) {
            const classShiftName = draggedClass.shift?.name;
            if (classShiftName !== selectedTime) {
                showToast(`Shift mismatch: A "${classShiftName}" class cannot be assigned to a "${selectedTime}" slot.`, 'error');
                setDraggedItem(null);
                return;
            }

            setIsAssigning(true);
            try {
                const payload = { classId: draggedClass.classId, roomId: targetRoomId };
                await scheduleService.assignRoomToClass(payload, token);
                showToast("Class scheduled successfully!", 'success');
                router.refresh(); // REFETCH DATA
            } catch (error) {
                showToast(error.message || "Failed to schedule class.", 'error');
            } finally {
                setIsAssigning(false);
                setDraggedItem(null);
            }
            return;
        }

        if (draggedType === 'new' && targetRoomData) {
            showToast("This room is already occupied.", 'error');
        }
    };

    const handleCancelSwap = () => {
        setSwapConfirmation({ isOpen: false, details: null });
    };
    
    const handleConfirmSwap = async () => {
        if (!swapConfirmation.details) return;
        const { from, to } = swapConfirmation.details;
        
        setIsAssigning(true);
        setSwapConfirmation({ isOpen: false, details: null }); 

        try {
            const payload = { scheduleId1: from.scheduleId, scheduleId2: to.scheduleId };
            await scheduleService.swapSchedules(payload, token);
            showToast("Classes swapped successfully!", 'success');
            router.refresh(); // REFETCH DATA
        } catch (error) {
            showToast(`Swap failed: ${error.message}`, 'error');
        } finally {
            setIsAssigning(false);
        }
    };

    const getGridColumnClasses = (building, floorNumber) => {
        switch (building) {
            case "Building A": return floorNumber === 1 ? "2xl:grid-cols-5 grid-cols-3" : "2xl:grid-cols-5 xl:grid-cols-4 grid-cols-3";
            case "Building B": return floorNumber === 2 ? "sm:grid-cols-5 grid-cols-3" : "xl:grid-cols-5 grid-cols-3";
            case "Building C": return "xl:grid-cols-5 grid-cols-3";
            case "Building D": return "grid-cols-1";
            case "Building E": return floorNumber === 1 ? "xl:grid-cols-6 grid-cols-3" : "xl:grid-cols-5 grid-cols-3";
            case "Building F": return "xl:grid-cols-4 grid-cols-3";
            default: return "grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
        }
    };

    const getRoomColumnSpan = (room) => {
        if (!room) return "";
        const id = room.roomId;
        const building = room.buildingName;
        if (id === 10 && building === "Building A") return "2xl:col-span-2 md:col-span-3 sm:col-span-2 col-span-3";
        if (id === 34 && building === "Building B") return "sm:col-span-4 col-span-2";
        if ([47, 48, 49].includes(id) && building === "Building D") return "col-span-full";
        return "";
    };

    const handleDownloadPdf = async () => {
        setIsGeneratingPdf(true);

        const printElement = document.createElement('div');
        printElement.style.position = 'absolute';
        printElement.style.left = '-9999px';
        printElement.style.width = '1123px'; 
        printElement.style.padding = '40px';
        printElement.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff';
        printElement.style.color = document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937';
        printElement.style.fontFamily = 'sans-serif';

        let floorsHtml = '';
        const floors = Object.entries(currentGrid).sort(([floorA], [floorB]) => Number(floorB) - Number(floorA));
        if (floors && floors.length > 0) {
            floors.forEach(([floor, rooms]) => {
                floorsHtml += `
                    <div style="margin-bottom: 20px;">
                        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; border-bottom: 1px solid #4b5563; padding-bottom: 4px;">Floor ${floor}</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
                `;
                rooms.forEach(room => {
                    const classData = getClassForRoom(room.roomId);
                    const isOccupied = !!classData;
                    const isUnavailable = room.status === 'unavailable';
                    const borderColor = isUnavailable || isOccupied ? '#ef4444' : '#22c55e';
                    const backgroundColor = isUnavailable || isOccupied ? '#fee2e2' : '#f0fdf4';
                    const textColor = isUnavailable || isOccupied ? '#7f1d1d' : '#14532d';
                    const roomNameColor = document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1f2937';

                    floorsHtml += `
                            <div
                                style="
                                    border: 1px solid ${borderColor};
                                    border-radius: 8px;
                                    padding: 10px;
                                    background-color: ${backgroundColor};
                                    color: ${textColor};
                                    text-align: center;
                                    font-size: 12px;
                                    word-break: break-word;
                                    min-height: 90px;
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: center;
                                    align-items: center;
                                "
                            >
                                <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: ${roomNameColor};">${room.roomName}</div>
                                ${isOccupied ? `
                                    <div style="font-weight: 500; font-size: 13px;">${classData.className}</div>
                                    <div style="font-size: 11px; opacity: 0.8;">${classData.majorName}</div>
                                ` : `
                                    <div style="font-style: italic; opacity: 0.9;">${isUnavailable ? 'Unavailable' : 'Available'}</div>
                                `}
                            </div>
                        `;
                });
                floorsHtml += `</div></div>`;
            });
        } else {
             floorsHtml += `<p style="text-align: center; font-style: italic; color: ${document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'};">No layout data found for ${selectedBuilding}.</p>`;
        }

        const headerHtml = `
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="font-size: 24px; font-weight: bold;">Room Schedule</h1>
                <h2 style="font-size: 18px; color: #4b5563;">${selectedBuilding}</h2>
                <p style="font-size: 14px; color: #6b7280;">${selectedDay} | ${selectedTime}</p>
            </div>
        `;
        
        const footerHtml = `
            <div style="margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 12px; text-align: center; color: #6b7280;">
                <p>Available Rooms: <span style="font-weight: bold; color: ${document.documentElement.classList.contains('dark') ? '#90EE90' : '#228B22'};">${availableRoomsCount}</span> &nbsp;|&nbsp;
                    Unavailable Rooms: <span style="font-weight: bold; color: ${document.documentElement.classList.contains('dark') ? '#FA8072' : '#B22222'};">${unavailableRoomsCount}</span>
                </p>
                <p style="margin-top: 8px;">© ${new Date().getFullYear()} NUM-FIT Digital Center. All Rights Reserved.</p>
            </div>
        `;

        printElement.innerHTML = headerHtml + floorsHtml + footerHtml;
        document.body.appendChild(printElement); 

        const options = {
            scale: 2,
            useCORS: true,
            logging: true,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#030712' : '#f9fafb',
            windowHeight: printElement.scrollHeight,
            windowWidth: printElement.scrollWidth,
            ignoreElements: (element) => {
                return element.classList.contains('no-print');
            }
        };

        try {
            const canvas = await html2canvas(printElement, options);
            const imageData = canvas.toDataURL('image/png');
            const pdfDocument = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height],
            });

            pdfDocument.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height);

            const date = new Date().toISOString().slice(0, 10);
            pdfDocument.save(`Schedule_${selectedBuilding}_${selectedDay}_${selectedTime}_${date}.pdf`);
        } catch (error) {
            console.error("PDF generation error:", error);
            showToast("An error occurred while generating the PDF.", 'error');
        } finally {
            document.body.removeChild(printElement);
            setIsGeneratingPdf(false);
        }
    };

    return (
        <>
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

            {swapConfirmation.isOpen && (
                <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 z-[1002] flex items-center justify-center"><div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div></div>}>
                    <ConfirmationModal
                        isOpen={swapConfirmation.isOpen}
                        onCancel={handleCancelSwap}
                        onConfirm={handleConfirmSwap}
                        swapDetails={swapConfirmation.details}
                    />
                </Suspense>
            )}
            
            <div className='sm:p-6 p-2 dark:text-white flex flex-col lg:flex-row sm:gap-6 gap-3 h-[calc(100vh-100px)]'>
                <div 
                    onDragOver={handleGridCellDragOver}
                    className='w-full lg:w-[220px] xl:w-[300px] flex-shrink-0 sm:p-4 p-2 bg-white dark:bg-gray-900 border dark:border-gray-700 sm:shadow-lg shadow-md rounded-xl flex flex-col'
                >
                    <div className="flex items-center gap-2 sm:mb-2 mb-1">
                        <h3 className="sm:text-lg text-sm font-semibold text-num-dark-text dark:text-gray-100">Classes</h3>
                        <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                    </div>
                    <div className="sm:mb-2 mb-1">
                        <input type="text" placeholder="Search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full sm:p-2 p-1 sm:text-sm text-xs border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                    <div className="flex items-center flex-row sm:gap-2 gap-1 sm:mb-2 mb-1">
                        <div className="w-1/2">
                            <select id="degree-select" value={selectedDegree} onChange={(event) => setSelectedDegree(event.target.value)} className="w-full mt-1 sm:p-2 p-1 sm:text-xs text-[10px] border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500">
                                <option value="All">Degrees</option>
                                {degrees.map(degree => (<option key={degree} value={degree}>{degree}</option>))}
                            </select>
                        </div>
                        <div className="w-1/2">
                            <select id="generation-select" value={selectedGeneration} onChange={(event) => setSelectedGeneration(event.target.value)} className="w-full mt-1 sm:p-2 p-1 sm:text-xs text-[10px] border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500">
                                <option value="All">Generations</option>
                                {generations.map(generation => (<option key={generation} value={generation}>{generation}</option>))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                        {orderedTimeSlots.map(shift => {
                            const classesInShift = groupedClassesByShift[shift];
                            if (classesInShift && classesInShift.length > 0) {
                                return (
                                    <div key={shift} className="sm:space-y-3 space-y-1.5">
                                        <div className="flex items-center sm:gap-2 gap-1 sm:mb-2 mb-1"><h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{shift}</h4><hr className="flex-1 border-t border-slate-300 dark:border-slate-700" /></div>
                                        {classesInShift.map((classItem) => (
                                            <div key={classItem.classId} draggable onDragStart={(event) => handleDragStart(event, classItem, 'new')} onDragEnd={handleDragEnd} className="sm:p-2 p-1 bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border dark:border-gray-700 sm:rounded-lg rounded-md shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all flex group">
                                                <div className={`w-1.5 h-auto sm:rounded-lg rounded-md ${yearColorMap[classItem.year] || 'bg-violet-500'} sm:mr-3 mr-1.5`}></div>
                                                <div><p className="max-w-[200px] sm:text-sm text-[10px] font-medium text-gray-800 dark:text-gray-200 truncate" title={classItem.className}>{classItem.className}</p><p className="sm:text-xs text-[10px] text-gray-500 dark:text-gray-400">{classItem.majorName}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            return null;
                        })}
                        {Object.values(groupedClassesByShift).every(array => array.length === 0) && (<div className="text-center sm:text-md text-sm text-gray-400 dark:text-gray-600 mt-4">No classes available for the selected filters.</div>)}
                    </div>
                </div>
                <div ref={schedulePageReference} className='flex-1 p-2.5 sm:p-6 bg-white dark:bg-gray-900 border dark:border-gray-700 sm:shadow-xl shadow-md rounded-xl flex flex-col overflow-y-auto'>
                    <div className="flex flex-row items-center justify-between sm:mb-4 mb-2 sm:border-b dark:border-gray-600 sm:pb-3 no-print">
                        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                            {weekdays.map(day => {
                                const isWeekendShift = selectedTime === 'Weekend Shift';
                                const isWeekdayShift = !isWeekendShift;
                                
                                const isDayDisabled = (isWeekendShift && ['Mo', 'Tu', 'We', 'Th', 'Fr'].includes(day)) || (isWeekdayShift && ['Sa', 'Su'].includes(day));

                                return (
                                    <button
                                        key={day}
                                        onClick={() => !isDayDisabled && setSelectedDay(day)}
                                        disabled={isDayDisabled}
                                        className={`sm:px-3.5 px-1.5 sm:py-1.5 py-1 sm:text-sm text-[10px] sm:font-medium transition-colors ${selectedDay === day ? 'bg-blue-600 dark:bg-blue-600 text-white shadow' : `border-r border-gray-300 dark:border-gray-500 last:border-r-0 ${isDayDisabled ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex items-center sm:gap-2 gap-1">
                            <label htmlFor="time-select" className="text-sm sm:inline hidden font-medium dark:text-gray-300">Time:</label>
                            <select id="time-select" value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)} className="sm:p-2 p-1 sm:text-sm text-[10px] border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500">
                                {timeSlots.map(timeSlot => (<option key={timeSlot} value={timeSlot}>{timeSlot}</option>))}
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-row justify-between items-center sm:gap-2 gap-1 no-print">
                        <div className="flex items-center"><select id="building-select" value={selectedBuilding} onChange={(event) => setSelectedBuilding(event.target.value)} className="block w-full sm:p-2 p-1 sm:text-sm text-[10px] text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">{buildings.map(building => (<option key={building} value={building}>{building}</option>))}</select></div>
                        <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                    </div>
                    <div className="flex-grow flex flex-col sm:gap-y-4 gap-y-2 sm:mt-4 mt-2">
                        {isAssigning && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex justify-center items-center z-50">
                                <SpinnerIcon className="h-10 w-10 text-blue-600" />
                            </div>
                        )}
                        {Object.entries(currentGrid).sort(([floorA], [floorB]) => Number(floorB) - Number(floorA)).map(([floor, rooms]) => (
                            <div key={floor}>
                                <div className="flex items-center gap-2 mb-2"><h4 className="text-xs sm:text-sm sm:font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Floor {floor}</h4><hr className="flex-1 border-t border-slate-300 dark:border-slate-700" /></div>
                                <div className={`grid sm:gap-3 gap-1.5 ${getGridColumnClasses(selectedBuilding, parseInt(floor))}`}>
                                    {rooms.map((room) => {
                                        const classData = getClassForRoom(room.roomId);
                                        const scheduleInformation = schedules[selectedDay]?.[selectedTime]?.[room.roomId];
                                        return (
                                            <RoomCard key={room.roomId} room={room} classData={classData} 
                                                isDragOver={dragOverCell?.roomId === room.roomId} 
                                                isWarning={warningCellId === room.roomId}
                                                isNavigating={navigatingToRoomId === room.roomId}
                                                onHeaderClick={handleRoomCardClick}
                                                dragHandlers={{
                                                    onDragOver: handleGridCellDragOver,
                                                    onDragEnter: (event) => handleGridCellDragEnter(event, room.roomId),
                                                    onDragLeave: handleGridCellDragLeave,
                                                    onDrop: (event) => handleGridCellDrop(event, room.roomId),
                                                    onDragStart: (event) => { if (classData && scheduleInformation) { handleDragStart(event, classData, 'scheduled', { day: selectedDay, time: selectedTime, roomId: room.roomId, scheduleId: scheduleInformation.scheduleId }); } },
                                                    onDragEnd: handleDragEnd,
                                                }}
                                                className={getRoomColumnSpan(room)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-3 no-print">
                        <div className="sm:text-xs text-[10px] text-gray-600 dark:text-gray-400 space-y-0.5">
                            <p><span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full mr-1.5 align-middle"></span> Available Rooms: {availableRoomsCount}</p>
                            <p><span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full mr-1.5 align-middle"></span> Unavailable Rooms: {unavailableRoomsCount}</p>
                        </div>
                        <button
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf}
                            className="bg-blue-600 hover:bg-blue-700 text-white sm:font-semibold sm:py-2 py-1.5 sm:px-4 px-2 rounded-md sm:text-sm text-[10px] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ScheduleClientView;