'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import SuccessAlert from './components/UpdateSuccessComponent';
import apiClient from '@/utils/apiClient';

// --- FIX: Added all missing skeleton components ---

const RoomCardSkeleton = () => (
    <div className="h-[90px] sm:h-[100px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md animate-pulse">
        <div className="h-[30px] bg-slate-100 dark:bg-slate-700 rounded-t-md border-b border-slate-200 dark:border-slate-600"></div>
        <div className="p-2 flex flex-col justify-center items-center gap-2">
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
        </div>
    </div>
);

const RoomSelectionSkeleton = ({ floors = 3, roomsPerFloor = 4 }) => (
    <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
        </div>
        <div className="space-y-4">
            {Array.from({ length: floors }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                        <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 sm:gap-4">
                        {Array.from({ length: roomsPerFloor }).map((_, j) => (
                            <RoomCardSkeleton key={j} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const RoomDetailsSkeleton = () => (
    <div className="flex flex-col items-start gap-6 w-full animate-pulse">
        <div className="flex flex-col items-start self-stretch w-full flex-grow">
            <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`flex flex-row items-center self-stretch w-full min-h-[56px] ${i < 4 ? 'border-b border-slate-200 dark:border-slate-700' : ''}`}>
                        <div className="p-3 sm:p-4 w-[100px] sm:w-[120px]"><div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div></div>
                        <div className="px-2 sm:px-3 flex-1 py-2"><div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div></div>
                    </div>
                ))}
            </div>
        </div>
        <div className="h-[48px] sm:h-[50px] w-full bg-slate-300 dark:bg-slate-700 rounded-md"></div>
    </div>
);

// This is the main missing component that combines the others
const RoomPageSkeleton = () => (
    <div className='p-4 sm:p-6 min-h-full'>
        <div className="mb-4 w-full">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room</h2>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-3" />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
            <RoomSelectionSkeleton />
            <div className="w-full lg:w-[320px] shrink-0">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Details</h3>
                    <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                </div>
                <RoomDetailsSkeleton />
            </div>
        </div>
    </div>
);

// --- END SKELETONS ---

const weekdays = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
const timeSlots = ['07:00:00 - 10:00:00', '10:30:00 - 13:30:00', '14:00:00 - 17:00:00', '17:30:00 - 20:30:00'];

const RoomViewContent = () => {
    // --- Styles ---
    const textLabelRoom = "font-medium text-base leading-7 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueRoomDisplay = "font-medium text-base leading-7 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const textLabelDefault = "font-medium text-sm leading-6 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueDefaultDisplay = "font-medium text-sm leading-6 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const inputStyle = "py-[9px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const textareaStyle = `${inputStyle} resize-none scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-500 scrollbar-track-slate-100 dark:scrollbar-track-slate-800`;
    
    // --- State Management ---
    const [selectedDay, setSelectedDay] = useState(weekdays[0]);
    const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
    const [buildings, setBuildings] = useState({});
    const [selectedBuilding, setSelectedBuilding] = useState("");
    const [rooms, setRooms] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableRoomDetails, setEditableRoomDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // --- Data Fetching ---
    const loadInitialData = useCallback(async () => {
        // Don't set loading to true here to avoid flicker on re-fetch
        setError(null);
        try {
            const [roomsResponse, schedulesResponse] = await Promise.all([
                apiClient.get('/api/v1/room'),
                apiClient.get('/api/v1/schedule')
            ]);

            const allRoomsData = roomsResponse.payload || [];
            setRooms(allRoomsData);
            setSchedules(schedulesResponse.payload || []);

            const buildingsMap = allRoomsData.reduce((acc, room) => {
                const { buildingName, floor, roomId } = room;
                if (!acc[buildingName]) acc[buildingName] = {};
                if (!acc[buildingName][floor]) acc[buildingName][floor] = [];
                acc[buildingName][floor].push(roomId.toString());
                return acc;
            }, {});

            const structuredBuildings = Object.keys(buildingsMap).reduce((acc, buildingName) => {
                acc[buildingName] = Object.keys(buildingsMap[buildingName])
                    .sort((a, b) => a - b)
                    .map(floorNumber => ({ floor: floorNumber, rooms: buildingsMap[buildingName][floorNumber] }));
                return acc;
            }, {});

            setBuildings(structuredBuildings);

            if (Object.keys(structuredBuildings).length > 0 && !selectedBuilding) {
                setSelectedBuilding(Object.keys(structuredBuildings)[0]);
            }
        } catch (err) {
            setError(err.message || "Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    }, [selectedBuilding]); 

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // --- Handlers ---
    const resetSelection = () => {
        setSelectedRoomId(null);
        setIsEditing(false);
    };
    
    const handleDayChange = (day) => {
        setSelectedDay(day);
        resetSelection();
    };

    const handleTimeChange = (event) => {
        setSelectedTime(event.target.value);
        resetSelection();
    };

    const handleBuildingChange = (event) => {
        setSelectedBuilding(event.target.value);
        resetSelection();
    };

    const handleRoomClick = (roomId) => {
        setSelectedRoomId(roomId);
        setIsEditing(false);
    };

    const handleEditToggle = () => {
        if (isEditing) {
            handleSaveChanges();
        } else if (roomDetails) {
            setIsEditing(true);
            setEditableRoomDetails({ ...roomDetails, equipment: roomDetails.equipment.join(', ') });
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setEditableRoomDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        if (!editableRoomDetails) return;
        
        try {
            await apiClient.patch(`/api/v1/room/${selectedRoomId}`, {
                ...editableRoomDetails,
                floor: Number(editableRoomDetails.floor),
                capacity: Number(editableRoomDetails.capacity),
            });
            setShowSuccessAlert(true);
            setIsEditing(false);
            await loadInitialData(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update room');
        }
    };

    const roomDetails = rooms.find(r => r.roomId === selectedRoomId);
    
    if (isLoading && rooms.length === 0) {
        return <RoomPageSkeleton />;
    }

    return (
        <>
            {showSuccessAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <SuccessAlert
                        title="Room Updated"
                        messageLine1={`Room ${roomDetails?.roomName || ''} has been updated successfully.`}
                        onConfirm={() => setShowSuccessAlert(false)}
                    />
                </div>
            )}
            <div className='p-4 sm:p-6 min-h-full'>
                <div className="mb-4 w-full">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room Management & Schedule</h2>
                    <hr className="border-t border-slate-300 dark:border-slate-700 mt-3" />
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                
                {/* Filters */}
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between border-b dark:border-gray-600 pb-3 gap-4">
                        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden w-full sm:w-auto">
                            {weekdays.map(day => <button key={day} onClick={() => handleDayChange(day)} className={`px-3.5 py-1.5 text-sm font-medium transition-colors w-full ${selectedDay === day ? 'bg-sky-600 text-white shadow' : 'border-r dark:border-r-gray-500 last:border-r-0 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{day}</button>)}
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label htmlFor="time-select" className="text-sm font-medium dark:text-gray-300">Time:</label>
                            <select id="time-select" value={selectedTime} onChange={handleTimeChange} className="p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500 w-full">
                                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select value={selectedBuilding} onChange={handleBuildingChange} className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" disabled={isLoading}>
                            {Object.keys(buildings).map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Room Grid */}
                    <div className="flex-1 min-w-0">
                        <div className="space-y-4">
                            {buildings[selectedBuilding]?.map(({ floor, rooms: floorRoomIds }) => (
                                <div key={floor} className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Floor {floor}</h4>
                                        <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                                    </div>
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 sm:gap-4">
                                        {floorRoomIds.map(roomId => {
                                            const room = rooms.find(r => r.roomId.toString() === roomId);
                                            if (!room) return null;
                                            
                                            const selectedStartTime = selectedTime.split(' - ')[0];
                                            const scheduleEntry = schedules.find(s =>
                                                s.roomId.toString() === roomId &&
                                                s.day.toLowerCase().startsWith(selectedDay.toLowerCase()) &&
                                                s.shift.startTime === selectedStartTime
                                            );
                                            const isAvailable = !scheduleEntry;
                                            const isSelected = selectedRoomId === room.roomId;

                                            return (
                                                <div key={roomId} onClick={() => handleRoomClick(room.roomId)} className={`h-[90px] sm:h-[100px] border rounded-md flex flex-col cursor-pointer transition-all duration-150 shadow-sm ${isSelected ? "border-blue-500 ring-2 ring-blue-500" : "border-slate-300 dark:border-slate-700 hover:border-slate-400"}`}>
                                                    <div className={`h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b ${isAvailable ? 'bg-slate-50 dark:bg-slate-700' : 'bg-red-100 dark:bg-red-900/40'}`}>
                                                        <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                        <span className={`ml-3 text-xs sm:text-sm font-medium ${isSelected ? "text-blue-700 dark:text-blue-300" : isAvailable ? "text-slate-700 dark:text-slate-300" : "text-red-700 dark:text-red-300"}`}>{room.roomName}</span>
                                                    </div>
                                                    <div className="flex-1 rounded-b-md p-2 flex flex-col justify-center items-center bg-white dark:bg-slate-800">
                                                        <span className={`font-semibold text-xs text-center ${isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {isAvailable ? 'Available' : `Used by ${scheduleEntry.className}`}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Capacity: {room.capacity}</span>
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
                         <div className="flex items-center gap-2 mb-3 sm:mb-4">
                             <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Details</h3>
                             <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                         </div>
                         <div className="flex flex-col items-start gap-6 w-full min-h-[420px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
                            {roomDetails ? (
                                <>
                                    <div className="flex flex-col items-start self-stretch w-full flex-grow overflow-y-auto scrollbar-thin pr-1">
                                        <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                                            <div className="flex flex-row items-center w-full min-h-[56px] border-b p-4"><div className="w-[120px]"><span className={textLabelRoom}>Room</span></div><div className="flex-1">{isEditing ? <input type="text" name="roomName" value={editableRoomDetails.roomName} onChange={handleInputChange} className={inputStyle} /> : <span className={textValueRoomDisplay}>{roomDetails.roomName}</span>}</div></div>
                                            <div className="flex flex-row items-center w-full min-h-[56px] border-b p-4"><div className="w-[120px]"><span className={textLabelDefault}>Building</span></div><div className="flex-1">{isEditing ? <input type="text" name="buildingName" value={editableRoomDetails.buildingName} onChange={handleInputChange} className={inputStyle} /> : <span className={textValueDefaultDisplay}>{roomDetails.buildingName}</span>}</div></div>
                                            <div className="flex flex-row items-center w-full min-h-[56px] border-b p-4"><div className="w-[120px]"><span className={textLabelDefault}>Floor</span></div><div className="flex-1">{isEditing ? <input type="number" name="floor" value={editableRoomDetails.floor} onChange={handleInputChange} className={inputStyle} /> : <span className={textValueDefaultDisplay}>{roomDetails.floor || 'N/A'}</span>}</div></div>
                                            <div className="flex flex-row items-center w-full min-h-[56px] border-b p-4"><div className="w-[120px]"><span className={textLabelDefault}>Capacity</span></div><div className="flex-1">{isEditing ? <input type="number" name="capacity" value={editableRoomDetails.capacity} onChange={handleInputChange} className={inputStyle} /> : <span className={textValueDefaultDisplay}>{roomDetails.capacity}</span>}</div></div>
                                            <div className="flex flex-row items-start w-full min-h-[92px] p-4"><div className="w-[120px] pt-2"><span className={textLabelDefault}>Equipment</span></div><div className="flex-1">{isEditing ? <textarea name="equipment" value={editableRoomDetails.equipment} onChange={handleInputChange} className={textareaStyle}></textarea> : <span className={`${textValueDefaultDisplay} pt-1`}>{Array.isArray(roomDetails.equipment) ? roomDetails.equipment.join(', ') : roomDetails.equipment || 'None'}</span>}</div></div>
                                        </div>
                                    </div>
                                    <button
                                        className="w-full h-[50px] bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold disabled:opacity-60"
                                        onClick={handleEditToggle}
                                        disabled={isLoading}
                                    >
                                        {isEditing ? (isLoading ? "Saving..." : "Save Changes") : "Edit Room"}
                                    </button>
                                </>
                             ) : (
                                <div className="text-center text-slate-500 w-full flex-grow flex items-center justify-center">Select a room to view details.</div>
                            )}
                         </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default function AdminRoomPage() {
    return (
        <AdminLayout activeItem="room" pageTitle="Room Management">
            <RoomViewContent />
        </AdminLayout>
    );
}