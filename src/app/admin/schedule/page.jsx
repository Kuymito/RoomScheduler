'use client';

import React, { useState, useMemo, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout'; // Assuming you use this layout
import ConfirmationModal from './components/ConfirmationModal';
import RoomCardSkeleton from './components/RoomCardSkeleton';
import ClassListSkeleton from './components/ClassListSkeleton';

// --- Default Icon for items without an image ---
const DefaultClassIcon = ({ className = "w-8 h-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-gray-500 dark:text-gray-400`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

const degrees = ['Bachelor', 'Master', 'PhD'];
const generations = ['Gen 2023', 'Gen 2024', 'Gen 2025', 'Gen 2026'];

// NEW: Color mapping for generations
const generationColorMap = {
    'Gen 2023': 'bg-sky-500',
    'Gen 2024': 'bg-emerald-500',
    'Gen 2025': 'bg-amber-500',
    'Gen 2026': 'bg-indigo-500',
};

const initialClasses = [
    { id: 'class_101', name: 'Intro to Physics', code: 'PHY-101', degree: 'Bachelor', generation: 'Gen 2025' },
    { id: 'class_102', name: 'Calculus I', code: 'MTH-110', degree: 'Bachelor', generation: 'Gen 2026' },
    { id: 'class_103', name: 'Organic Chemistry', code: 'CHM-220', degree: 'Bachelor', generation: 'Gen 2024' },
    { id: 'class_104', name: 'World History', code: 'HIS-100', degree: 'Master', generation: 'Gen 2023' },
    { id: 'class_105', name: 'English Composition', code: 'ENG-101', degree: 'Master', generation: 'Gen 2025' },
    { id: 'class_106', name: 'Linear Algebra', code: 'MTH-210', degree: 'Master', generation: 'Gen 2025' },
    { id: 'class_107', name: 'Data Structures', code: 'CS-250', degree: 'PhD', generation: 'Gen 2024' },
    { id: 'class_108', name: 'Microeconomics', code: 'ECN-200', degree: 'PhD', generation: 'Gen 2026' },
    { id: 'class_109', name: 'Art History', code: 'ART-150', degree: 'PhD', generation: 'Gen 2023' },
    { id: 'class_110', name: 'Computer Networks', code: 'CS-350', degree: 'PhD', generation: 'Gen 2023' },
];

const buildings = ['A', 'B', 'C', 'D', 'E'];
const weekdays = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
const timeSlots = ['7:00 - 10:00', '10:30 - 13:30', '14:00 - 17:00', '17:30 - 20:30'];
const gridDimensions = { rows: 5, cols: 5 };

const initialRooms = [];
let roomCounter = 1;
for (const building of buildings) {
    roomCounter = 1;
    for (let floor = 1; floor <= gridDimensions.rows; floor++) {
        for (let col = 1; col <= gridDimensions.cols; col++) {
            initialRooms.push({ id: `${building}-${roomCounter}`, name: `${building}${roomCounter}`, building, floor, capacity: (floor + col) % 2 === 0 ? 30 : 45 });
            roomCounter++;
        }
    }
}

const createInitialSchedules = () => {
    const schedules = {};
    weekdays.forEach(day => {
        schedules[day] = {};
        timeSlots.forEach(time => {
            schedules[day][time] = {};
            buildings.forEach(building => {
                const buildingRooms = initialRooms.filter(r => r.building === building);
                const floors = Array.from({ length: gridDimensions.rows }, (_, i) => gridDimensions.rows - i);
                schedules[day][time][building] = floors.map(floorNum => buildingRooms.filter(r => r.floor === floorNum).map(room => ({ room, class: null })));
            });
        });
    });
    return schedules;
};

const ScheduleGridSkeleton = () => (
     <div className='flex-1 p-4 sm:p-6 bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-xl rounded-xl flex flex-col overflow-y-auto'>
         {/* Header Skeleton */}
         <div className="flex flex-row items-center justify-between mb-4 border-b dark:border-gray-600 pb-3 animate-pulse">
             <div className="h-7 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
             <div className="flex gap-2">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-9 w-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>)}</div>
         </div>
         {/* Controls Skeleton */}
         <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 animate-pulse">
             <div className="h-6 w-56 bg-gray-300 dark:bg-gray-700 rounded"></div>
             <div className="flex items-center gap-4">
                 <div className="h-10 w-48 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                 <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
             </div>
         </div>
         {/* Grid Skeleton */}
         <div className="flex-grow flex flex-col gap-y-4">
             {Array.from({ length: gridDimensions.rows }).map((_, floorIndex) => (
                 <div key={floorIndex}>
                     <div className="flex items-center gap-2 mb-2 animate-pulse"><div className="h-5 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div><div className="h-px flex-1 bg-gray-300 dark:bg-gray-700"></div></div>
                     <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${gridDimensions.cols}, 1fr)`}}>
                         {Array.from({ length: gridDimensions.cols }).map((_, roomIndex) => <RoomCardSkeleton key={roomIndex} />)}
                     </div>
                 </div>
             ))}
         </div>
     </div>
);

const ScheduledClassCard = ({ classData, onDragStart, onDragEnd }) => (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} className="w-full h-24 p-2 bg-blue-100 dark:bg-blue-800 border-2 border-blue-400 dark:border-blue-600 rounded-lg shadow-md flex flex-col justify-center items-center text-center cursor-grab active:cursor-grabbing transition-all duration-150">
        <DefaultClassIcon className="w-6 h-6 mb-1 text-blue-600 dark:text-blue-200" />
        <p className="text-xs font-semibold text-blue-800 dark:text-blue-100 break-words">{classData.name}</p>
        <p className="text-xs text-blue-600 dark:text-blue-300 opacity-80">{classData.code}</p>
    </div>
);

const RoomCard = ({ cellData, isDragOver, isWarning, dragHandlers }) => {
    const { room, class: classData } = cellData;
    const isOccupied = !!classData;

    const getBorderColor = () => {
        if (isWarning) return 'border-red-500 dark:border-red-400 shadow-lg scale-105';
        if (isDragOver) return 'border-emerald-400 dark:border-emerald-500 scale-105 shadow-lg';
        return 'border-gray-300 dark:border-gray-700 shadow-sm';
    };

    return (
        <div className={`rounded-lg border-2 flex flex-col transition-all duration-150 overflow-hidden ${getBorderColor()}`}>
            <div className={`px-2 py-1 flex justify-between items-center border-b-2 transition-colors ${isWarning ? 'bg-red-100 dark:bg-red-800/50' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <div className={`w-2 h-2 rounded-full ring-1 ring-white/50 ${isOccupied ? 'bg-red-500' : 'bg-green-500'}`} title={isOccupied ? 'Occupied' : 'Available'}></div>
                <a href="#" onClick={(e) => { e.preventDefault(); alert(`Link to details for Room ${room.name}`); }} className="text-xs font-bold text-gray-700 dark:text-gray-300 hover:underline">{room.name}</a>
            </div>
            <div onDragOver={dragHandlers.onDragOver} onDragEnter={dragHandlers.onDragEnter} onDragLeave={dragHandlers.onDragLeave} onDrop={dragHandlers.onDrop} className={`flex-grow p-2 flex justify-center items-center text-center transition-colors min-h-[100px] ${isDragOver ? 'bg-emerald-100 dark:bg-emerald-800/50' : 'bg-white dark:bg-gray-900'}`}>
                {isOccupied ? (<ScheduledClassCard classData={classData} onDragStart={dragHandlers.onDragStart} onDragEnd={dragHandlers.onDragEnd} />) : (<span className="text-xs text-gray-400 dark:text-gray-600 italic select-none pointer-events-none">Room {room.name}</span>)}
            </div>
        </div>
    );
};

const SchedulePageContent = () => {
    // --- State Management ---
    const [schedules, setSchedules] = useState(null); // Initial state is null
    const [isLoading, setIsLoading] = useState(true); // NEW loading state
    const [selectedDay, setSelectedDay] = useState(weekdays[0]);
    const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
    const [selectedBuilding, setSelectedBuilding] = useState(buildings[0]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverCell, setDragOverCell] = useState(null);
    const [warningCellId, setWarningCellId] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [selectedDegree, setSelectedDegree] = useState('All');
    const [selectedGeneration, setSelectedGeneration] = useState('All');
    const [searchTerm, setSearchTerm] = useState(''); // NEW: Search term state
    const [swapConfirmation, setSwapConfirmation] = useState({ isOpen: false, details: null });

    // --- Data Loading Simulation ---
    useEffect(() => {
        // Simulate fetching data from an API
        setTimeout(() => {
            setSchedules(createInitialSchedules());
            setIsLoading(false);
        }, 1500); // 1.5 second delay
    }, []); // Empty dependency array means this runs once on mount

    // --- Toast Handler ---
    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // --- Derived State ---
    const availableClasses = useMemo(() => {
        if (isLoading) return []; // Return empty while loading

        const assignedClassIds = new Set();
        Object.values(schedules).forEach(daySchedule => {
            Object.values(daySchedule).forEach(timeSchedule => {
                Object.values(timeSchedule).forEach(buildingSchedule => {
                    buildingSchedule.forEach(floor => {
                        floor.forEach(cell => {
                            if (cell.class) {
                                assignedClassIds.add(cell.class.id);
                            }
                        });
                    });
                });
            });
        });

        return initialClasses.filter(c => {
            const isAssigned = assignedClassIds.has(c.id);
            const degreeMatch = selectedDegree === 'All' || c.degree === selectedDegree;
            const generationMatch = selectedGeneration === 'All' || c.generation === selectedGeneration;
            const searchTermMatch = searchTerm === '' ||
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.code.toLowerCase().includes(searchTerm.toLowerCase());

            return !isAssigned && degreeMatch && generationMatch && searchTermMatch;
        });
    }, [schedules, isLoading, selectedDegree, selectedGeneration, searchTerm]);

    const currentGrid = useMemo(() => {
        if (isLoading) return []; // Return empty while loading
        return schedules[selectedDay]?.[selectedTime]?.[selectedBuilding] ?? [];
    }, [schedules, selectedDay, selectedTime, selectedBuilding, isLoading]);

    // --- Drag Handlers ---
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
        e.preventDefault(); setDragOverCell({ floorIndex: f, roomIndex: r });
        if (draggedItem?.type === 'new' && currentGrid[f][r].class) setWarningCellId(currentGrid[f][r].room.id);
    };
    const handleGridCellDragLeave = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) { setDragOverCell(null); setWarningCellId(null); } };
    const handleGridCellDrop = (e, f, r) => {
        e.preventDefault();
        if (!draggedItem) return;

        const targetCell = schedules[selectedDay][selectedTime][selectedBuilding][f][r];

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
        } else { // 'scheduled'
            const { day: oD, time: oT, building: oB, floorIndex: oF, roomIndex: oR } = draggedItem.origin;
            const originCell = schedules[oD][oT][oB][oF][oR];

            if (oD === selectedDay && oT === selectedTime && oB === selectedBuilding && oF === f && oR === r) {
                return;
            }

            // --- MODIFIED: Trigger confirmation for swap ---
            if (targetCell.class) {
                setSwapConfirmation({
                    isOpen: true,
                    details: {
                        from: {
                            classData: originCell.class,
                            day: oD, time: oT, building: oB, floorIndex: oF, roomIndex: oR,
                            roomName: originCell.room.name
                        },
                        to: {
                            classData: targetCell.class,
                            day: selectedDay, time: selectedTime, building: selectedBuilding, floorIndex: f, roomIndex: r,
                            roomName: targetCell.room.name
                        },
                    }
                });
            } else {
                // If the target cell is empty, just move the class
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

    // --- NEW: Swap Confirmation Handlers ---
    const handleConfirmSwap = () => {
        const { from, to } = swapConfirmation.details;
        setSchedules(p => {
            const n = JSON.parse(JSON.stringify(p));
            const originCell = n[from.day][from.time][from.building][from.floorIndex][from.roomIndex];
            const targetCell = n[to.day][to.time][to.building][to.floorIndex][to.roomIndex];
            [originCell.class, targetCell.class] = [targetCell.class, originCell.class]; // The actual swap
            return n;
        });
        setSwapConfirmation({ isOpen: false, details: null }); // Close the modal
    };

    const handleCancelSwap = () => {
        setSwapConfirmation({ isOpen: false, details: null }); // Just close the modal
    };

    if (isLoading) {
        return (
            <div className='p-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]'>
                <ClassListSkeleton />
                <ScheduleGridSkeleton />
            </div>
        );
    }

    return (
        <>
            <ConfirmationModal
                isOpen={swapConfirmation.isOpen}
                onCancel={handleCancelSwap}
                onConfirm={handleConfirmSwap}
                swapDetails={swapConfirmation.details}
            />
            {toastMessage && (<div className="fixed top-20 right-6 bg-red-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-pulse"><p className="font-semibold">{toastMessage}</p></div>)}
            <div className='p-6 dark:text-white flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]'>
                {/* Left Panel */}
                <div className='w-full lg:w-[260px] xl:w-[300px] flex-shrink-0 p-4 bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-lg rounded-xl flex flex-col'>
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-num-dark-text dark:text-gray-100 border-bpb-2">Classes</h3>
                        <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                    </div>
                    {/* NEW: Search Input */}
                    <div className="mb-2">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    <div className="flex items-center flex-row gap-2 mb-2 ">
                        <div className="w-1/2">
                            <select id="degree-select" value={selectedDegree} onChange={(e) => setSelectedDegree(e.target.value)} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500">
                                <option value="All">Degrees</option>
                                {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="w-1/2">
                            <select id="generation-select" value={selectedGeneration} onChange={(e) => setSelectedGeneration(e.target.value)} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500">
                                <option value="All">Generations</option>
                                {generations.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                        {availableClasses.map((classData) => (
                            <div key={classData.id} draggable onDragStart={(e) => handleDragStartFromList(e, classData)} onDragEnd={handleDragEnd} className="p-2 bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all flex group">
                                <div className={`w-1.5 h-auto rounded-lg ${generationColorMap[classData.generation] || 'bg-slate-400'} mr-3`}></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{classData.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{classData.code}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel */}
                <div className='flex-1 p-4 sm:p-6 bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-xl rounded-xl flex flex-col overflow-y-auto'>
                    <div className="flex flex-row items-center justify-between mb-4 border-b dark:border-gray-600 pb-3">
                        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                            {weekdays.map(day => <button key={day} onClick={() => setSelectedDay(day)} className={`px-3.5 py-1.5 text-sm font-medium transition-colors ${selectedDay === day ? 'bg-sky-600 text-white shadow' : 'border-r dark:border-r-gray-500 last:border-r-0'}`}>{day}</button>)}
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="time-select" className="text-sm font-medium dark:text-gray-300">Time:</label>
                            <select id="time-select" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500">
                            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <label htmlFor="building-select" className="text-sm font-medium text-slate-600 dark:text-slate-400">Building:</label>
                                <select id="building-select" value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)} className="p-2 text-sm rounded-md dark:bg-gray-800 dark:text-gray-200">{buildings.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                        </div>
                        <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                    </div>

                    {/* Grid */}
                    <div className="flex-grow flex flex-col gap-y-4">
                        {currentGrid.map((floor, floorIndex) => (
                            <div key={floorIndex}>
                                <div className="flex items-center gap-2 mb-2"><h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Floor {floor[0]?.room.floor}</h4><hr className="flex-1 border-t border-slate-300 dark:border-slate-700" /></div>
                                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${gridDimensions.cols}, 1fr)`}}>
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
};

export default function AdminSchedulePage() {
  return (
    <AdminLayout activeItem="schedule" pageTitle="Schedule Management">
      <SchedulePageContent />
    </AdminLayout>
  );
}