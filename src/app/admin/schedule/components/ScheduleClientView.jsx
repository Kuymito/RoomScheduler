'use client';

import React, { useState, useMemo, useEffect } from 'react';
import ConfirmationModal from './ConfirmationModal';
import { useRouter } from 'next/navigation';

// --- Reusable Components ---
const RoomCardSkeleton = () => (
    <div className="h-28 sm:h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
);

const ScheduledClassCard = ({ classData, onDragStart, onDragEnd }) => (
    // This div is intentionally draggable, as it represents a scheduled class that can be moved
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} className="w-full h-24 p-2 bg-blue-100 dark:bg-blue-800 border border-blue-400 dark:border-blue-600 rounded-lg shadow-md flex flex-col justify-center items-center text-center cursor-grab active:cursor-grabbing transition-all duration-150">
        <p className="text-xs font-semibold text-blue-800 dark:text-blue-100 break-words">{classData.name}</p>
        <p className="text-xs text-blue-600 dark:text-blue-300 opacity-80">{classData.code}</p>
    </div>
);

const RoomCard = ({ cellData, isDragOver, isWarning, dragHandlers, className }) => {
    const router = useRouter();
    const { room, class: classData } = cellData;
    const isOccupied = !!classData;
    const isUnavailable = room.status === "unavailable";

    const getBorderColor = () => {
        // Reintroducing scale-105 for drag over and warning states
        if (isWarning) return 'border-red-500 dark:border-red-400 shadow-lg scale-105';
        if (isDragOver) return 'border-emerald-400 dark:border-emerald-500 shadow-lg scale-105';
        return 'border-gray-300 dark:border-gray-700 shadow-sm';
    };

    const handleHeaderClick = () => {
        router.push(`/admin/schedule/${room.id}`);
    };

    return (
        <div
            className={`rounded-lg border flex flex-col transition-all duration-150 overflow-hidden ${getBorderColor()}
            ${isUnavailable ? 'cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 opacity-70' : ''}
            ${className || ''}
            `}
        >
            <div
                onClick={handleHeaderClick}
                className={`px-2 py-1 flex justify-between items-center border-b-2 transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700
                ${isWarning ? 'bg-red-100 dark:bg-red-800/50' : (isUnavailable ? 'bg-slate-100 dark:bg-slate-700/60' : 'bg-gray-50 dark:bg-gray-800')}
                `}
            >
                <div
                    className={`w-2 h-2 rounded-full ring-1 ring-white/50
                    ${isOccupied ? 'bg-red-500' : isUnavailable ? 'bg-red-500' : 'bg-green-500'}
                    `}
                    title={isOccupied ? 'Occupied' : 'Available'}
                ></div>
                <span className={`text-xs font-bold ${isUnavailable ? 'text-slate-500 dark:text-slate-400' : 'text-gray-700 dark:text-gray-300'}`}>{room.name}</span>
            </div>
            <div
                onDragOver={!isUnavailable ? dragHandlers.onDragOver : null}
                onDragEnter={!isUnavailable ? dragHandlers.onDragEnter : null}
                onDragLeave={!isUnavailable ? dragHandlers.onDragLeave : null}
                onDrop={!isUnavailable ? dragHandlers.onDrop : null}
                className={`flex-grow p-2 flex justify-center items-center text-center transition-colors min-h-[112px]
                ${isDragOver ? 'bg-emerald-100 dark:bg-emerald-800/50' : (isUnavailable ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-gray-900')}
                `}
            >
                {isOccupied ? (
                    <ScheduledClassCard classData={classData} onDragStart={dragHandlers.onDragStart} onDragEnd={dragHandlers.onDragEnd} />
                ) : (
                    <span className={`text-xs italic select-none pointer-events-none ${isUnavailable ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-600'}`}>
                        {isUnavailable ? 'Unavailable' : `${room.name}`}
                    </span>
                )}
            </div>
        </div>
    );
};


// This is the main interactive client component
export default function ScheduleClientView({ initialClasses, initialRooms, initialSchedules, constants }) {
    const allRoomsMap = useMemo(() => {
        return initialRooms.reduce((acc, room) => {
            acc[room.id] = room;
            return acc;
        }, {});
    }, [initialRooms]);


    const { degrees, generations, buildings, weekdays, timeSlots, gridDimensions } = constants;

    const [schedules, setSchedules] = useState(initialSchedules);
    const [selectedDay, setSelectedDay] = useState(weekdays[0]);
    const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
    const [selectedBuilding, setSelectedBuilding] = useState(buildings[0]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverCell, setDragOverCell] = useState(null);
    const [warningCellId, setWarningCellId] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [selectedDegree, setSelectedDegree] = useState('All');
    const [selectedGeneration, setSelectedGeneration] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [swapConfirmation, setSwapConfirmation] = useState({ isOpen: false, details: null });

    const generationColorMap = {
        'Gen 2023': 'bg-sky-500',
        'Gen 2024': 'bg-emerald-500',
        'Gen 2025': 'bg-amber-500',
        'Gen 2026': 'bg-indigo-500',
    };

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 1500);
    };

    const allFilteredClasses = useMemo(() => {
        const assignedClassIds = new Set();
        Object.values(schedules).forEach(daySchedule => {
            Object.values(daySchedule).forEach(timeSchedule => {
                Object.values(timeSchedule).forEach(buildingSchedule => {
                    buildingSchedule.forEach(floor => {
                        floor.forEach(cell => { if (cell.class) assignedClassIds.add(cell.class.id); });
                    });
                });
            });
        });

        return initialClasses.filter(c => {
            const isAssigned = assignedClassIds.has(c.id);
            const degreeMatch = selectedDegree === 'All' || c.degree === selectedDegree;
            const generationMatch = selectedGeneration === 'All' || c.generation === selectedGeneration;
            const searchTermMatch = searchTerm === '' || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase());

            return !isAssigned && degreeMatch && generationMatch && searchTermMatch;
        });
    }, [schedules, selectedDegree, selectedGeneration, searchTerm, initialClasses]);

    const groupedClassesByShift = useMemo(() => {
        const groups = {};
        timeSlots.forEach(slot => {
            groups[slot] = [];
        });
        allFilteredClasses.forEach(c => {
            if (c.shift) {
                groups[c.shift].push(c);
            }
        });
        return groups;
    }, [allFilteredClasses, timeSlots]);

    const orderedTimeSlots = useMemo(() => {
        if (selectedTime === 'All') {
            return timeSlots;
        }
        const otherTimes = timeSlots.filter(slot => slot !== selectedTime);
        return [selectedTime, ...otherTimes];
    }, [selectedTime, timeSlots]);

    const currentGrid = useMemo(() => {
        return schedules[selectedDay]?.[selectedTime]?.[selectedBuilding] ?? [];
    }, [schedules, selectedDay, selectedTime, selectedBuilding]);

    const handleDragStartFromList = (e, classData) => setDraggedItem({ item: classData, type: 'new' });
    const handleDragStartFromGrid = (e, classData, f, r) => setDraggedItem({ item: classData, type: 'scheduled', origin: { day: selectedDay, time: selectedTime, building: selectedBuilding, floorIndex: f, roomIndex: r } });
    const handleDragEnd = (e) => {
        if (draggedItem?.type === 'scheduled' && e.dataTransfer.dropEffect === 'none') {
            const { day, time, building, floorIndex, roomIndex } = draggedItem.origin;
            setSchedules(p => { const n = JSON.parse(JSON.stringify(p)); n[day][time][building][floorIndex][roomIndex].class = null; return n; });
        }
        setDraggedItem(null); setDragOverCell(null); setWarningCellId(null);
    };
    const handleGridCellDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
    const handleGridCellDragEnter = (e, f, r) => {
        e.preventDefault();
        const targetRoom = currentGrid[f][r].room;
        if (targetRoom.status === "unavailable") {
            setWarningCellId(targetRoom.id);
        } else {
            setDragOverCell({ floorIndex: f, roomIndex: r });
            if (draggedItem?.type === 'new' && currentGrid[f][r].class) {
                setWarningCellId(currentGrid[f][r].room.id);
            }
        }
    };
    const handleGridCellDragLeave = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) { setDragOverCell(null); setWarningCellId(null); } };
    const handleGridCellDrop = (e, f, r) => {
        e.preventDefault();
        if (!draggedItem) return;

        const targetCell = schedules[selectedDay][selectedTime][selectedBuilding][f][r];
        if (targetCell.room.status === "unavailable") {
            showToast("Cannot assign to an unavailable room.");
            setDragOverCell(null);
            setWarningCellId(null);
            return;
        }

        if (draggedItem.type === 'new') {
            if (targetCell.class) {
                showToast("This room is already occupied.");
            } else {
                setSchedules(p => {
                    const n = JSON.parse(JSON.stringify(p));
                    n[selectedDay][selectedTime][selectedBuilding][f][r].class = draggedItem.item;
                    return n;
                });
            }
        } else {
            const { day: oD, time: oT, building: oB, floorIndex: oF, roomIndex: oR } = draggedItem.origin;
            const originCell = schedules[oD][oT][oB][oF][oR];
            if (oD === selectedDay && oT === selectedTime && oB === selectedBuilding && oF === f && oR === r) return;
            if (targetCell.class) {
                setSwapConfirmation({ isOpen: true, details: { from: { classData: originCell.class, day: oD, time: oT, building: oB, floorIndex: oF, roomIndex: oR, roomName: originCell.room.name }, to: { classData: targetCell.class, day: selectedDay, time: selectedTime, building: selectedBuilding, floorIndex: f, roomIndex: r, roomName: targetCell.room.name } } });
            } else {
                setSchedules(p => {
                    const n = JSON.parse(JSON.stringify(p));
                    n[selectedDay][selectedTime][selectedBuilding][f][r].class = originCell.class;
                    n[oD][oT][oB][oF][oR].class = null;
                    return n;
                });
            }
        }
        setDragOverCell(null);
        setWarningCellId(null);
    };

    const handleConfirmSwap = () => {
        const { from, to } = swapConfirmation.details;

        const targetRoomInSwap = schedules[to.day][to.time][to.building][to.floorIndex][to.roomIndex].room;
        if (targetRoomInSwap.status === "unavailable") {
            showToast("Cannot swap into an unavailable room.");
            setSwapConfirmation({ isOpen: false, details: null });
            return;
        }

        setSchedules(p => {
            const n = JSON.parse(JSON.stringify(p));
            const originCell = n[from.day][from.time][from.building][from.floorIndex][from.roomIndex];
            const targetCell = n[to.day][to.time][to.building][to.floorIndex][to.roomIndex];
            [originCell.class, targetCell.class] = [targetCell.class, originCell.class];
            return n;
        });
        setSwapConfirmation({ isOpen: false, details: null });
    };
    const handleCancelSwap = () => setSwapConfirmation({ isOpen: false, details: null });

    const getGridColumnClasses = (building, floorNumber) => {
        switch (building) {
            case "Building A":
                return "xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            case "Building B":
                if (floorNumber === 2) {
                    return "grid-cols-5";
                }
                return "xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            case "Building C":
            case "Building F":
                return "xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            case "Building D":
                return "grid-cols-1";
            case "Building E":
                if (floorNumber === 1) {
                    return "xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
                }
                return "xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            default:
                return "grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
        }
    };

    const getRoomColSpan = (building, roomName) => {
        if (building === "Building B" && roomName === "Meeting Room") {
            return "col-span-4";
        }
        if (building === "Building D" && roomName.includes("Library Room")) {
            return "col-span-full";
        }
        return "";
    };

    return (
        <>
            <ConfirmationModal isOpen={swapConfirmation.isOpen} onCancel={handleCancelSwap} onConfirm={handleConfirmSwap} swapDetails={swapConfirmation.details} />
            {toastMessage && (<div className="fixed top-20 right-6 bg-red-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-pulse"><p className="font-semibold">{toastMessage}</p></div>)}
            <div className='p-6 dark:text-white flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]'>
                <div className='w-full lg:w-[260px] xl:w-[300px] flex-shrink-0 p-4 bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-lg rounded-xl flex flex-col'>
                    <div className="flex items-center gap-2 mb-2"><h3 className="text-lg font-semibold text-num-dark-text dark:text-gray-100">Classes</h3><hr className="flex-1 border-t border-slate-300 dark:border-slate-700" /></div>
                    <div className="mb-2"><input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500" /></div>
                    <div className="flex items-center flex-row gap-2 mb-2 ">
                        <div className="w-1/2">
                            <select id="degree-select" value={selectedDegree} onChange={(e) => setSelectedDegree(e.target.value)} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500">
                                <option value="All">Degrees</option>{degrees.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="w-1/2">
                            <select id="generation-select" value={selectedGeneration} onChange={(e) => setSelectedGeneration(e.target.value)} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500">
                                <option value="All">Generations</option>{generations.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                        {orderedTimeSlots.map(shift => {
                            const classesInShift = groupedClassesByShift[shift];
                            if (classesInShift && classesInShift.length > 0) {
                                return (
                                    <div key={shift} className="space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                {shift}
                                            </h4>
                                            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                                        </div>
                                        {classesInShift.map((classData) => (
                                            <div key={classData.id} draggable onDragStart={(e) => handleDragStartFromList(e, classData)} onDragEnd={handleDragEnd} className="p-2 bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all flex group">
                                                <div className={`w-1.5 h-auto rounded-lg ${generationColorMap[classData.generation] || 'bg-slate-400'} mr-3`}></div>
                                                <div><p className="text-sm font-medium text-gray-800 dark:text-gray-200">{classData.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{classData.code}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            return null;
                        })}
                        {Object.values(groupedClassesByShift).every(arr => arr.length === 0) && (
                            <div className="text-center text-gray-400 dark:text-gray-600 mt-4">No classes available for the selected filters.</div>
                        )}
                    </div>
                </div>
                <div className='flex-1 p-4 sm:p-6 bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-xl rounded-xl flex flex-col overflow-y-auto'>
                    <div className="flex flex-row items-center justify-between mb-4 border-b dark:border-gray-600 pb-3">
                        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">{weekdays.map(day => <button key={day} onClick={() => setSelectedDay(day)} className={`px-3.5 py-1.5 text-sm font-medium transition-colors ${selectedDay === day ? 'bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white shadow' : 'border-r hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-r-gray-500 last:border-r-0'}`}>{day}</button>)}</div>
                        <div className="flex items-center gap-2"><label htmlFor="time-select" className="text-sm font-medium dark:text-gray-300">Time:</label><select id="time-select" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500">{timeSlots.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                            <label htmlFor="building-select" className="text-sm font-medium text-slate-600 dark:text-slate-400">Building:</label>
                            <select id="building-select" value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)} className="p-2 text-sm rounded-md dark:bg-gray-800 dark:text-gray-200">
                                {buildings.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                    </div>
                    <div className="flex-grow flex flex-col gap-y-4 mt-4">
                        {currentGrid.map((floor, floorIndex) => (
                            <div key={floorIndex}>
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                        Floor {floor[0]?.room.floor}
                                    </h4>
                                    <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                                </div>
                                <div className={`grid gap-3 ${getGridColumnClasses(selectedBuilding, floor[0]?.room.floor)}`}>
                                    {floor.map((cellData, roomIndex) => (
                                        <RoomCard
                                            key={cellData.room.id}
                                            cellData={cellData}
                                            isDragOver={dragOverCell?.floorIndex === floorIndex && dragOverCell?.roomIndex === roomIndex}
                                            isWarning={warningCellId === cellData.room.id}
                                            dragHandlers={{
                                                onDragOver: handleGridCellDragOver,
                                                onDragEnter: (e) => handleGridCellDragEnter(e, floorIndex, roomIndex),
                                                onDragLeave: handleGridCellDragLeave,
                                                onDrop: (e) => handleGridCellDrop(e, floorIndex, roomIndex),
                                                onDragStart: (e) => handleDragStartFromGrid(e, cellData.class, floorIndex, roomIndex),
                                                onDragEnd: handleDragEnd,
                                            }}
                                            className={getRoomColSpan(selectedBuilding, cellData.room.name)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}