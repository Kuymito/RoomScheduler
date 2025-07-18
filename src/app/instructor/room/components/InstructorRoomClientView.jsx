'use client';

import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import axios from 'axios';
import { notificationService } from '@/services/notification.service';
import { getAllRooms } from '@/services/room.service';
import Toast from "@/components/Toast";
import InstructorRoomPageSkeleton from "./InstructorRoomPageSkeleton";

const RequestChangeForm = lazy(() => import("./RequestChangeForm"));

// Fetchers for SWR
const roomsFetcher = ([, token]) => getAllRooms(token);
const weeklyScheduleFetcher = async (url) => {
    const res = await axios.get(url);
    return res.data;
};

/**
 * **CRUCIAL FIX:** Calculates the correct YYYY-MM-DD date for a given day name within the current week.
 * @param {string} dayName - The full name of the day (e.g., "Friday").
 * @returns {string} The formatted date string (e.g., "2025-07-18").
 */
const getCorrectDateForDay = (dayName) => {
    const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const targetDayIndex = dayMap[dayName];

    const now = new Date(); // Use server's local time, which is fine for this calculation
    const todayIndex = now.getDay();
    
    // Calculate the difference in days to get to the target day
    const date = new Date(now);
    date.setDate(now.getDate() - todayIndex + targetDayIndex);
    
    // Format the date to YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};


export default function InstructorRoomClientView({ initialAllRoomsData, buildingLayout, initialInstructorClasses }) {
    const { data: session } = useSession();
    const token = session?.accessToken;

    const { data: swrRooms, error: roomsError, isLoading: roomsLoading } = useSWR(
        token ? ['allRooms', token] : null,
        roomsFetcher,
        { fallbackData: initialAllRoomsData, revalidateOnFocus: true }
    );
    
    const { data: scheduleMap, error: schedulesError, isLoading: schedulesLoading } = useSWR(
        token ? '/api/schedule/weekly-view' : null,
        weeklyScheduleFetcher,
        { revalidateOnFocus: true }
    );
    
    const [allRoomsData, setAllRoomsData] = useState(initialAllRoomsData);
    const [buildings, setBuildings] = useState(buildingLayout);
    const [instructorClasses] = useState(initialInstructorClasses);
    
    const [selectedDay, setSelectedDay] = useState(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    const TIME_SLOTS = ['Morning Shift', 'Noon Shift', 'Afternoon Shift', 'Evening Shift', 'Weekend Shift'];
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0]);
    
    const [selectedBuilding, setSelectedBuilding] = useState(Object.keys(buildingLayout)[0] || "");
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    useEffect(() => {
        if (Array.isArray(swrRooms)) {
            const roomsDataMap = {};
            const populatedLayout = {};
            swrRooms.forEach(room => {
                const { roomId, roomName, buildingName, floor, capacity, type, equipment } = room;
                if (!populatedLayout[buildingName]) populatedLayout[buildingName] = [];
                let floorObj = populatedLayout[buildingName].find(f => f.floor === floor);
                if (!floorObj) {
                    floorObj = { floor, rooms: [] };
                    populatedLayout[buildingName].push(floorObj);
                }
                if (!floorObj.rooms.includes(roomId)) floorObj.rooms.push(roomId);
                roomsDataMap[roomId] = {
                    id: roomId, name: roomName, building: buildingName, floor, capacity, type,
                    equipment: typeof equipment === 'string' ? equipment.split(',').map(e => e.trim()).filter(Boolean) : [],
                    status: room.status || 'available',
                };
            });
            for (const building in populatedLayout) {
                populatedLayout[building].sort((a, b) => b.floor - a.floor);
            }
            setAllRoomsData(roomsDataMap);
            setBuildings(populatedLayout);
        }
    }, [swrRooms]);

    const resetSelection = () => { setSelectedRoomId(null); setRoomDetails(null); };
    const handleDayChange = (day) => { setSelectedDay(day); resetSelection(); };
    const handleTimeChange = (event) => { setSelectedTimeSlot(event.target.value); resetSelection(); };
    const handleBuildingChange = (event) => { setSelectedBuilding(event.target.value); resetSelection(); };

    const handleRoomClick = (roomId) => {
        const room = allRoomsData[roomId];
        setSelectedRoomId(roomId);
        setRoomDetails(room || null);
    };

    const handleRequest = () => { if (roomDetails) setIsFormOpen(true); };
    
    const handleSaveRequest = async (requestData) => {
        if (!session?.accessToken) {
            setToast({ show: true, message: 'Authentication session expired.', type: 'error' });
            return;
        }
        
        try {
            // **CRUCIAL FIX:** Overwrite the incorrect date from the form with the correctly calculated date.
            const correctDate = getCorrectDateForDay(selectedDay);
            const payload = { 
                ...requestData, 
                effectiveDate: correctDate, // Use the correct date here
                instructorId: session.user.id 
            };
            
            await notificationService.submitChangeRequest(payload, session.accessToken);
            setToast({ show: true, message: 'Request sent successfully!', type: 'success' });
            setIsFormOpen(false);
        } catch (err) {
            setToast({ show: true, message: `Request failed: ${err.message}`, type: 'error' });
        }
    };

    const floors = buildings[selectedBuilding] || [];
    const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    const textLabelRoom = "font-medium text-base leading-7 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueRoomDisplay = "font-medium text-base leading-7 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const textLabelDefault = "font-medium text-sm leading-6 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueDefaultDisplay = "font-medium text-sm leading-6 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    
    const getGridColumnClasses = (building, floorNumber) => {
        switch (building) {
            case "Building A": return "xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            case "Building B": return floorNumber === 2 ? "grid-cols-5" : "xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            case "Building C": case "Building F": return "xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            case "Building D": return "grid-cols-1";
            case "Building E": return floorNumber === 1 ? "xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]" : "xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            default: return "grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
        }
    };

    const getRoomColSpan = (room) => {
        if (!room) return "";
        const id = room.id;
        if (id === 10 && room.building === "Building A") return "col-span-2";
        if (id === 34 && room.building === "Building B") return "col-span-4";
        if ([47, 48, 49].includes(id) && room.building === "Building D") {
            return "col-span-full";
        }
        return "";
    };

    const SpinnerFallback = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
    );

    const isRequestDisabled = roomsLoading || schedulesLoading || !roomDetails || roomDetails.status === 'unavailable' || !!scheduleMap?.[selectedDay]?.[selectedTimeSlot]?.[roomDetails.id];
    
    if (roomsLoading || schedulesLoading) {
        return <InstructorRoomPageSkeleton />;
    }

    if (roomsError || schedulesError) {
        return <div className="p-6 text-center text-red-500">Error loading data. Please refresh the page.</div>;
    }

    return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'info' })} />}

      {isFormOpen && (
        <Suspense fallback={<SpinnerFallback />}>
            <RequestChangeForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveRequest} roomDetails={roomDetails} instructorClasses={instructorClasses} selectedDay={selectedDay} selectedTime={selectedTimeSlot}/>
        </Suspense>
      )}

      <div className="p-4 sm:p-6 min-h-full">
        <div className="mb-4 w-full"><h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room</h2><hr className="border-t border-slate-300 dark:border-slate-700 mt-3" /></div>
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row items-center justify-between border-b dark:border-gray-600 pb-3 gap-4 mb-4">
                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 dark:text-gray-300 overflow-hidden w-full sm:w-auto">
                        {WEEKDAYS.map(day => (<button key={day} onClick={() => handleDayChange(day)} className={`px-3.5 py-1.5 text-sm font-medium transition-colors w-full ${selectedDay === day ? 'bg-blue-600 text-white shadow' : 'border-r dark:border-r-gray-500 last:border-r-0 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{day.substring(0,3)}</button>))}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label htmlFor="time-select" className="text-sm font-medium dark:text-gray-300">Time:</label>
                        <select id="time-select" value={selectedTimeSlot} onChange={handleTimeChange} className="p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 w-full">
                            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <select value={selectedBuilding} onChange={handleBuildingChange} className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500">
                          {Object.keys(buildings).map((building) => <option key={building} value={building}>{building}</option>)}
                      </select>
                      <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                </div>
                <div className="space-y-4">
                    {floors.map(({ floor, rooms }) => (
                        <div key={floor} className="space-y-3">
                            <div className="flex items-center gap-2 mb-2"><h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Floor {floor}</h4><hr className="flex-1 border-t border-slate-300 dark:border-slate-700" /></div>
                            <div className={`grid gap-3 sm:gap-4 ${getGridColumnClasses(selectedBuilding, floor)}`}>
                                {rooms.map((roomId) => {
                                    const room = allRoomsData[roomId];
                                    if (!room) return null;
                                    const isSelected = selectedRoomId === room.id;
                                    const scheduledClass = scheduleMap?.[selectedDay]?.[selectedTimeSlot]?.[room.id];
                                    const isOccupied = !!scheduledClass;
                                    const isUnavailable = room.status === 'unavailable';
                                    const isDisabled = isOccupied || isUnavailable;

                                    return (
                                        <div 
                                            key={room.id} 
                                            className={`h-[90px] sm:h-[100px] border rounded-md flex flex-col transition-all duration-150 shadow-sm cursor-pointer hover:shadow-md ${getRoomColSpan(room)} ${isDisabled ? 'bg-slate-50 dark:bg-slate-800/50 opacity-70' : 'bg-white dark:bg-slate-800'} ${isSelected ? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-500" : isDisabled ? "border-slate-200 dark:border-slate-700" : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"}`}
                                            onClick={() => handleRoomClick(room.id)}>
                                            <div className={`h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b ${isSelected ? 'border-b-transparent' : 'border-slate-200 dark:border-slate-600'} ${isDisabled ? 'bg-slate-100 dark:bg-slate-700/60' : 'bg-slate-50 dark:bg-slate-700'}`}>
                                                <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isSelected ? 'bg-blue-500' : isUnavailable ? 'bg-gray-400' : isOccupied ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                <span className={`ml-3 text-xs sm:text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : isDisabled ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{room.name}</span>
                                            </div>
                                            <div className={`flex-1 rounded-b-md p-2 flex flex-col justify-center items-center ${isDisabled ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}`}>
                                                <span className={`text-xs ${isUnavailable ? 'text-gray-500 dark:text-gray-400' : isOccupied ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{isUnavailable ? 'Unavailable' : isOccupied ? scheduledClass : 'Available'}</span>
                                                <span className={`text-xs text-slate-500 dark:text-slate-400 ${isSelected ? "text-slate-600 dark:text-slate-300" : ""} mt-1`}>Capacity: {room.capacity}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Details Panel */}
            <div className="w-full lg:w-[320px] shrink-0">
                <div className="flex items-center gap-2 mb-3 sm:mb-4"><h3 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">Details</h3><hr className="flex-1 border-t border-slate-300 dark:border-slate-700" /></div>
                <div className="flex flex-col items-start gap-6 w-full min-h-[420px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
                    {roomDetails ? (
                        <>
                            <div className="flex flex-col items-start self-stretch w-full flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-700 pr-1">
                                <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[120px]"><span className={textLabelRoom}>Room</span></div><div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueRoomDisplay}>{roomDetails.name}</span></div></div>
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Building</span></div><div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.building}</span></div></div>
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Floor</span></div><div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.floor}</span></div></div>
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Capacity</span></div><div className="px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.capacity}</span></div></div>
                                    <div className="flex flex-row items-start self-stretch w-full min-h-[92px]"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[120px] pt-5"><span className={textLabelDefault}>Equipment</span></div><div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2 pt-3"><span className={`${textValueDefaultDisplay} pt-1`}>{Array.isArray(roomDetails.equipment) ? roomDetails.equipment.join(", ") : ''}</span></div></div>
                                </div>
                            </div>
                            <button className="flex flex-row justify-center items-center pyx-3 px-5 sm:px-6 gap-2 w-full h-[48px] sm:h-[50px] bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 shadow-md hover:shadow-lg rounded-md text-white font-semibold text-sm sm:text-base self-stretch disabled:opacity-60 disabled:bg-gray-400 disabled:dark:bg-gray-600 disabled:cursor-not-allowed transition-all duration-150" onClick={handleRequest} disabled={isRequestDisabled}>Request</button>
                        </>
                    ) : ( <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Select a room to view details.</div> )}
                </div>
            </div>
        </div>
      </div>
    </>
    );
}