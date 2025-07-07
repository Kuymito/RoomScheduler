'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import SuccessAlert from './UpdateSuccessComponent';
import { updateRoom } from '@/services/room.service';
import { scheduleService } from '@/services/schedule.service';
import RoomPageSkeleton from './RoomPageSkeleton'; // Import skeleton for loading state

// The fetcher function for SWR, which will call your service
const scheduleFetcher = ([, token]) => scheduleService.getAllSchedules(token);

/**
 * Client Component for the Room Management page.
 * It now uses useSWR for real-time schedule updates.
 */
export default function RoomClientView({ initialAllRoomsData, buildingLayout, initialScheduleMap }) {
    // --- Constants and Helper Functions ---
    const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const TIME_SLOTS = ['07:00-10:00', '10:30-13:30', '14:00-17:00', '17:30-20:30'];
    const getDayName = (date) => date.toLocaleDateString('en-US', { weekday: 'long' });
    const formatTimeSlot = (time) => time.replace('-', ' to ');

    // --- Style Constants ---
    const textLabelRoom = "font-medium text-base leading-7 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueRoomDisplay = "font-medium text-base leading-7 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const textLabelDefault = "font-medium text-sm leading-6 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueDefaultDisplay = "font-medium text-sm leading-6 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const inputContainerSizeDefault = "w-full sm:w-[132px] h-[40px]";
    const equipmentInputContainerSize = "w-full sm:w-[132px] h-[72px]";
    const inputStyle = "py-[9px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const textareaStyle = "py-[10px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-500 scrollbar-track-slate-100 dark:scrollbar-track-slate-800";

    // --- Component State ---
    const [allRoomsData, setAllRoomsData] = useState(initialAllRoomsData);
    const [buildings, setBuildings] = useState(buildingLayout);
    const [scheduleMap, setScheduleMap] = useState(initialScheduleMap);
    const [selectedBuilding, setSelectedBuilding] = useState(Object.keys(buildingLayout)[0] || "");
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableRoomDetails, setEditableRoomDetails] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [error, setError] = useState('');
    const [selectedDay, setSelectedDay] = useState(() => getDayName(new Date()));
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0]);

    // --- SWR Data Fetching for Schedules ---
    const { data: session } = useSession();
    const { data: apiSchedules, error: scheduleError, isLoading: isScheduleLoading } = useSWR(
        session?.accessToken ? ['/api/v1/schedule', session.accessToken] : null,
        scheduleFetcher,
        {
            fallbackData: initialScheduleMap, 
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        }
    );
    
    // --- Effects ---
    // Update the schedule map whenever SWR re-fetches new data
    useEffect(() => {
        if (apiSchedules && Array.isArray(apiSchedules)) {
            const newScheduleMap = {};
            apiSchedules.forEach(schedule => {
                if (schedule && schedule.dayDetails && Array.isArray(schedule.dayDetails) && schedule.shift) {
                    const timeSlot = `${schedule.shift.startTime.substring(0, 5)}-${schedule.shift.endTime.substring(0, 5)}`;
                    schedule.dayDetails.forEach(dayDetail => {
                        const dayName = dayDetail.dayOfWeek.charAt(0).toUpperCase() + dayDetail.dayOfWeek.slice(1).toLowerCase();
                        if (!newScheduleMap[dayName]) {
                            newScheduleMap[dayName] = {};
                        }
                        if (!newScheduleMap[dayName][timeSlot]) {
                            newScheduleMap[dayName][timeSlot] = {};
                        }
                        newScheduleMap[dayName][timeSlot][schedule.roomId] = schedule.className;
                    });
                }
            });
            setScheduleMap(newScheduleMap);
        } else if (apiSchedules) {
            setScheduleMap(apiSchedules);
        }
    }, [apiSchedules]);

    // Update main state when initial props change
    useEffect(() => {
        setAllRoomsData(initialAllRoomsData);
        setBuildings(buildingLayout);
        const firstBuilding = Object.keys(buildingLayout)[0] || "";
        setSelectedBuilding(firstBuilding);
        resetSelection();
    }, [initialAllRoomsData, buildingLayout]);

    // --- Event Handlers ---
    const resetSelection = () => { setSelectedRoomId(null); setRoomDetails(null); setIsEditing(false); };
    const handleDayChange = (day) => { setSelectedDay(day); resetSelection(); };
    const handleTimeChange = (event) => { setSelectedTimeSlot(event.target.value); resetSelection(); };
    const handleBuildingChange = (event) => { setSelectedBuilding(event.target.value); resetSelection(); };
    
    const handleRoomClick = (roomId) => {
        // Allow selecting any room to view its details, regardless of status
        setSelectedRoomId(roomId);
        setIsEditing(false);
        setLoading(true);
        setError('');
        try {
            const data = allRoomsData[roomId];
            if (!data) throw new Error("Room data not found.");
            setRoomDetails(data);
        } catch (err) {
            setError("Could not load room details.");
            setRoomDetails(null);
        } finally {
            setLoading(false);
        }
    };
    
    const handleEditToggle = () => {
        if (isEditing) handleSaveChanges();
        else if (roomDetails) {
            setIsEditing(true);
            setEditableRoomDetails({
                ...roomDetails,
                equipment: Array.isArray(roomDetails.equipment) ? roomDetails.equipment.join(", ") : "",
            });
        }
    };
    
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setEditableRoomDetails((prev) => ({
            ...prev,
            [name]: (name === 'capacity') ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleSaveChanges = async () => {
        if (!editableRoomDetails) return;
        setLoading(true);
        setError('');
        const roomUpdateDto = {
            roomName: editableRoomDetails.name,
            capacity: editableRoomDetails.capacity,
            type: editableRoomDetails.type,
            equipment: editableRoomDetails.equipment,
        };

        try {
            await updateRoom(selectedRoomId, roomUpdateDto);
            const updatedLocalData = { ...editableRoomDetails, equipment: editableRoomDetails.equipment.split(',').map(e => e.trim()).filter(Boolean), };
            setRoomDetails(updatedLocalData);
            setAllRoomsData(prev => ({ ...prev, [selectedRoomId]: updatedLocalData }));
            setIsEditing(false);
            setShowSuccessAlert(true);
        } catch (err) {
            setError(err.message || 'An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    const floors = buildings[selectedBuilding] || [];

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

    const getRoomColSpan = (building, roomName) => {
        if (building === "Building A" && roomName === "Conference Room") return "col-span-2";
        if (building === "Building B" && roomName === "Conference Room") return "col-span-4";
        if (building === "Building D" && roomName?.includes("Library")) return "col-span-full";
        return "";
    };

    if (isScheduleLoading && !apiSchedules) {
        return <RoomPageSkeleton />;
    }
    
    if (scheduleError) {
        return <div className="text-red-500 p-6 text-center">Failed to load schedule data: {scheduleError.message}</div>;
    }

    return (
        <>
            {showSuccessAlert && ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"><SuccessAlert show={showSuccessAlert} title="Room Updated" messageLine1={`Room ${roomDetails?.name || ''} has been updated successfully.`} messageLine2="You can continue managing rooms." confirmButtonText="OK" onConfirm={() => setShowSuccessAlert(false)} onClose={() => setShowSuccessAlert(false)}/></div> )}
            <div className='p-4 sm:p-6 min-h-full'>
                <div className="mb-4 w-full"><h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room</h2><hr className="border-t border-slate-300 dark:border-slate-700 mt-3" /></div>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row items-center justify-between border-b dark:border-gray-600 pb-3 gap-4 mb-4">
                            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 dark:text-gray-300 overflow-hidden w-full sm:w-auto">
                                {WEEKDAYS.map(day => (<button key={day} onClick={() => handleDayChange(day)} className={`px-3 py-1.5 text-xs font-medium transition-colors w-full ${selectedDay === day ? 'bg-blue-600 text-white shadow' : 'border-r dark:border-r-gray-500 last:border-r-0 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{day.substring(0, 3)}</button>))}
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label htmlFor="time-select" className="text-sm font-medium dark:text-gray-300">Time:</label>
                                <select id="time-select" value={selectedTimeSlot} onChange={handleTimeChange} className="p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 w-full">
                                    {TIME_SLOTS.map(t => <option key={t} value={t}>{formatTimeSlot(t)}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <select value={selectedBuilding} onChange={handleBuildingChange} className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                {Object.keys(buildings).map((building) => <option key={building} value={building}>{building}</option>)}
                            </select>
                            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                        </div>
                        <div className="space-y-4">
                            {floors.map(({ floor, rooms }) => (
                                <div key={floor} className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2"><h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Floor {floor}</h4><hr className="flex-1 border-t border-slate-300 dark:border-slate-700" /></div>
                                    <div className={`grid gap-3 sm:gap-4 ${getGridColumnClasses(selectedBuilding, floor)}`}>
                                        {rooms.map((roomName) => {
                                            const room = Object.values(allRoomsData).find(r => r.name === roomName);
                                            if (!room) return null;
                                            const isSelected = selectedRoomId === room.id;
                                            const scheduledClass = scheduleMap[selectedDay]?.[selectedTimeSlot]?.[room.id];
                                            const isOccupied = !!scheduledClass;
                                            return (
                                                <div key={room.id} className={`h-[90px] sm:h-[100px] border rounded-md flex flex-col transition-all duration-150 shadow-sm cursor-pointer ${getRoomColSpan(selectedBuilding, room.name)} ${isOccupied ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:shadow-md bg-white dark:bg-slate-800'} ${isSelected ? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-500" : isOccupied ? "border-slate-200 dark:border-slate-700" : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"}`}
                                                    onClick={() => handleRoomClick(room.id)}>
                                                    <div className={`h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b ${isSelected ? 'border-b-transparent' : 'border-slate-200 dark:border-slate-600'} ${isOccupied ? 'bg-slate-100 dark:bg-slate-700/60' : 'bg-slate-50 dark:bg-slate-700'}`}>
                                                        <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isSelected ? 'bg-blue-500' : isOccupied ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                        <span className={`ml-3 text-xs sm:text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : isOccupied ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{room.name}</span>
                                                    </div>
                                                    <div className={`flex-1 rounded-b-md p-2 flex flex-col justify-center items-center ${isOccupied ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}`}>
                                                        <span className={`text-xs ${isOccupied ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{isOccupied ? scheduledClass : 'Available'}</span>
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
                            {loading && !isEditing ? ( <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Loading...</div> ) : roomDetails ? (
                                <>
                                    <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelRoom}>Room</span></div><div className="px-2 sm:px-3 flex-1 py-2">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="text" name="name" value={editableRoomDetails.name} onChange={handleInputChange} className={inputStyle} /></div>) : (<span className={textValueRoomDisplay}>{roomDetails.name}</span>)}</div></div>
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Building</span></div><div className="px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.building}</span></div></div>
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Floor</span></div><div className="px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.floor}</span></div></div>
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Capacity</span></div><div className="px-2 sm:px-3 flex-1 py-2">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="number" name="capacity" value={editableRoomDetails.capacity} onChange={handleInputChange} className={inputStyle} /></div>) : (<span className={textValueDefaultDisplay}>{roomDetails.capacity}</span>)}</div></div>
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Type</span></div><div className="px-2 sm:px-3 flex-1 py-2">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="text" name="type" value={editableRoomDetails.type} onChange={handleInputChange} className={inputStyle} /></div>) : (<span className={textValueDefaultDisplay}>{roomDetails.type}</span>)}</div></div>
                                        <div className="flex items-start self-stretch w-full min-h-[92px]"><div className="p-3 sm:p-4 w-[120px] pt-5"><span className={textLabelDefault}>Equipment</span></div><div className="px-2 sm:px-3 flex-1 py-2 pt-3">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${equipmentInputContainerSize}`}><textarea name="equipment" value={editableRoomDetails.equipment} onChange={handleInputChange} className={textareaStyle} placeholder="Item1, Item2..."></textarea></div>) : (<span className={`${textValueDefaultDisplay} pt-1`}>{Array.isArray(roomDetails.equipment) ? roomDetails.equipment.join(", ") : ''}</span>)}</div></div>
                                    </div>
                                    <button
                                        className="flex justify-center items-center py-3 px-6 gap-2 w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-md rounded-md text-white font-semibold text-sm self-stretch disabled:opacity-60"
                                        onClick={handleEditToggle}
                                        disabled={loading && isEditing}>
                                        {loading && isEditing ? "Saving..." : isEditing ? "Save Changes" : "Edit Room"}
                                    </button>
                                </>
                            ) : ( <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Select an available room to view details.</div> )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}