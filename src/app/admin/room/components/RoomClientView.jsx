'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import SuccessAlert from './UpdateSuccessComponent';
import { roomService } from '@/services/room.service';
import { scheduleService } from '@/services/schedule.service';
import RoomPageSkeleton from './RoomPageSkeleton';

// The fetcher function for SWR, which calls your service with the auth token
const scheduleFetcher = ([key, token]) => scheduleService.getAllSchedules(token);

/**
 * Client Component for the Room Management page.
 */
export default function RoomClientView({ initialAllRoomsData, buildingLayout, initialScheduleMap }) {
    // --- Constants ---
    const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const TIME_SLOTS = ['07:00:00-10:00:00', '10:30:00-13:30:00', '14:00:00-17:00:00', '17:30:00-20:30:00'];
    const getDayName = (date) => date.toLocaleDateString('en-US', { weekday: 'long' });

    // --- Style Constants ---
    const textLabelRoom = "font-medium text-base leading-7 text-slate-700 dark:text-slate-300";
    const textValueRoomDisplay = "font-medium text-base leading-7 text-slate-900 dark:text-slate-100";
    const textLabelDefault = "font-medium text-sm leading-6 text-slate-700 dark:text-slate-300";
    const textValueDefaultDisplay = "font-medium text-sm leading-6 text-slate-900 dark:text-slate-100";
    const inputStyle = "py-[9px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md font-normal text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const textareaStyle = `${inputStyle} resize-none`;

    // --- Component State ---
    const [allRoomsData, setAllRoomsData] = useState(initialAllRoomsData);
    const [buildings, setBuildings] = useState(buildingLayout);
    const [scheduleMap, setScheduleMap] = useState(initialScheduleMap);
    const [selectedBuilding, setSelectedBuilding] = useState(Object.keys(buildingLayout)[0] || "");
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableRoomDetails, setEditableRoomDetails] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [error, setError] = useState('');
    const [selectedDay, setSelectedDay] = useState(() => getDayName(new Date()));
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0]);
    const [isSaving, setIsSaving] = useState(false);

    // --- SWR Data Fetching for real-time schedule updates ---
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
    // Re-process the schedule map whenever SWR fetches new data
    useEffect(() => {
        if (apiSchedules && Array.isArray(apiSchedules)) {
            const newScheduleMap = {};
            apiSchedules.forEach(schedule => {
                if (schedule && schedule.shift) {
                    const day = schedule.day;
                    const timeSlot = `${schedule.shift.startTime}-${schedule.shift.endTime}`;
                    if (!newScheduleMap[day]) newScheduleMap[day] = {};
                    if (!newScheduleMap[day][timeSlot]) newScheduleMap[day][timeSlot] = {};
                    newScheduleMap[day][timeSlot][schedule.roomId] = schedule.className;
                }
            });
            setScheduleMap(newScheduleMap);
        } else if (apiSchedules && typeof apiSchedules === 'object') {
            setScheduleMap(apiSchedules);
        }
    }, [apiSchedules]);
    
    // --- Event Handlers ---
    const resetSelection = () => { setSelectedRoomId(null); setRoomDetails(null); setIsEditing(false); };
    const handleDayChange = (day) => { setSelectedDay(day); resetSelection(); };
    const handleTimeChange = (event) => { setSelectedTimeSlot(event.target.value); resetSelection(); };
    const handleBuildingChange = (event) => { setSelectedBuilding(event.target.value); resetSelection(); };
    
    const handleRoomClick = (roomId) => {
        const scheduledClass = scheduleMap[selectedDay]?.[selectedTimeSlot]?.[roomId];
        if (scheduledClass) return; // Prevent clicking occupied rooms

        setSelectedRoomId(roomId);
        setRoomDetails(allRoomsData[roomId]);
        setIsEditing(false);
    };
    
    const handleEditToggle = () => {
        if (isEditing) {
            handleSaveChanges();
        } else if (roomDetails) {
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
            [name]: value,
        }));
    };

    const handleSaveChanges = async () => {
        if (!editableRoomDetails || !session?.accessToken) return;
        setIsSaving(true);
        setError('');

        const roomUpdateDto = {
            roomName: editableRoomDetails.name,
            capacity: Number(editableRoomDetails.capacity) || 0,
            type: editableRoomDetails.type,
            equipment: editableRoomDetails.equipment,
        };

        try {
            await roomService.updateRoom(selectedRoomId, roomUpdateDto, session.accessToken);
            
            const updatedLocalData = {
                ...editableRoomDetails,
                capacity: Number(editableRoomDetails.capacity) || 0,
                equipment: editableRoomDetails.equipment.split(',').map(e => e.trim()).filter(Boolean),
            };
            setRoomDetails(updatedLocalData);
            setAllRoomsData(prev => ({ ...prev, [selectedRoomId]: updatedLocalData }));
            
            setIsEditing(false);
            setShowSuccessAlert(true);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };
    
    // --- Render Logic ---
    const floors = buildings[selectedBuilding] || [];

    if (isScheduleLoading && !apiSchedules) {
        return <RoomPageSkeleton />;
    }
    
    if (scheduleError) {
        return <div className="text-red-500 p-6 text-center">Failed to load schedule data: {scheduleError.message}</div>;
    }

    return (
        <>
            {showSuccessAlert && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                     <SuccessAlert
                         title="Room Updated"
                         messageLine1={`Room ${roomDetails?.name || ''} has been updated successfully.`}
                         onConfirm={() => setShowSuccessAlert(false)}
                     />
                 </div>
            )}
            <div className='p-4 sm:p-6 min-h-full'>
                <div className="mb-4 w-full">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room Management</h2>
                    <hr className="border-t border-slate-300 dark:border-slate-700 mt-3" />
                </div>
                {error && <p className="text-red-500 text-center mb-4 bg-red-100 dark:bg-red-900/20 p-3 rounded-md">{error}</p>}
                
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-w-0">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row items-center justify-between border-b dark:border-gray-600 pb-3 gap-4 mb-4">
                             <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden w-full sm:w-auto">
                                 {WEEKDAYS.map(day => (<button key={day} onClick={() => handleDayChange(day)} className={`px-3 py-1.5 text-xs font-medium transition-colors w-full ${selectedDay === day ? 'bg-blue-600 text-white shadow' : 'border-r dark:border-r-gray-500 last:border-r-0 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{day.substring(0, 3)}</button>))}
                             </div>
                             <div className="flex items-center gap-2 w-full sm:w-auto">
                                 <label htmlFor="time-select" className="text-sm font-medium dark:text-gray-300">Time:</label>
                                 <select id="time-select" value={selectedTimeSlot} onChange={handleTimeChange} className="p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 w-full">
                                     {TIME_SLOTS.map(t => <option key={t} value={t}>{t.replace(/-/g, ' - ')}</option>)}
                                 </select>
                             </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                             <select value={selectedBuilding} onChange={handleBuildingChange} className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                 {Object.keys(buildings).map((building) => <option key={building} value={building}>{building}</option>)}
                             </select>
                             <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                        </div>
                        
                        {/* Room Grid */}
                        <div className="space-y-4">
                            {floors.map(({ floor, rooms }) => (
                                <div key={floor} className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2"><h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Floor {floor}</h4><hr className="flex-1 border-t border-slate-300 dark:border-slate-700" /></div>
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 sm:gap-4">
                                        {rooms.map((roomName) => {
                                            const room = Object.values(allRoomsData).find(r => r.name === roomName && r.building === selectedBuilding && r.floor === floor);
                                            if (!room) return null;
                                            const isSelected = selectedRoomId === room.id;
                                            const scheduledClass = scheduleMap[selectedDay]?.[selectedTimeSlot]?.[room.id];
                                            const isOccupied = !!scheduledClass;
                                            return (
                                                <div key={room.id}
                                                     className={`h-[90px] sm:h-[100px] border rounded-md flex flex-col transition-all duration-150 shadow-sm ${isOccupied ? 'cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 opacity-70' : 'cursor-pointer hover:shadow-md bg-white dark:bg-slate-800'} ${isSelected ? "border-blue-500 ring-2 ring-blue-500" : isOccupied ? "border-slate-200 dark:border-slate-700" : "border-slate-300 dark:border-slate-700 hover:border-slate-400"}`}
                                                     onClick={() => !isOccupied && handleRoomClick(room.id)}>
                                                    <div className={`h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b ${isOccupied ? 'bg-slate-100 dark:bg-slate-700/60' : 'bg-slate-50 dark:bg-slate-700'}`}>
                                                        <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isSelected ? 'bg-blue-500' : isOccupied ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                        <span className={`ml-3 text-xs sm:text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : isOccupied ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{room.name}</span>
                                                    </div>
                                                    <div className="flex-1 rounded-b-md p-2 flex flex-col justify-center items-center">
                                                        <span className={`text-xs font-semibold ${isOccupied ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{isOccupied ? scheduledClass : 'Available'}</span>
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
                        <div className="flex items-center gap-2 mb-3 sm:mb-4"><h3 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">Details</h3><hr className="flex-1 border-t border-slate-300 dark:border-slate-700" /></div>
                        <div className="flex flex-col items-start gap-6 w-full min-h-[420px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
                            {roomDetails ? (
                                <>
                                    <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md">
                                        <div className="flex flex-row items-center p-4"><div className="w-[100px]"><span className={textLabelRoom}>Room</span></div><div className="flex-1">{isEditing ? <input type="text" name="name" value={editableRoomDetails.name} onChange={handleInputChange} className={inputStyle} /> : <span className={textValueRoomDisplay}>{roomDetails.name}</span>}</div></div>
                                        <div className="flex flex-row items-center p-4 border-t"><div className="w-[100px]"><span className={textLabelDefault}>Building</span></div><div className="flex-1"><span className={textValueDefaultDisplay}>{roomDetails.building}</span></div></div>
                                        <div className="flex flex-row items-center p-4 border-t"><div className="w-[100px]"><span className={textLabelDefault}>Floor</span></div><div className="flex-1"><span className={textValueDefaultDisplay}>{roomDetails.floor}</span></div></div>
                                        <div className="flex flex-row items-center p-4 border-t"><div className="w-[100px]"><span className={textLabelDefault}>Capacity</span></div><div className="flex-1">{isEditing ? <input type="number" name="capacity" value={editableRoomDetails.capacity} onChange={handleInputChange} className={inputStyle} /> : <span className={textValueDefaultDisplay}>{roomDetails.capacity}</span>}</div></div>
                                        <div className="flex flex-row items-start p-4 border-t"><div className="w-[100px] pt-2"><span className={textLabelDefault}>Equipment</span></div><div className="flex-1">{isEditing ? <textarea name="equipment" value={editableRoomDetails.equipment} onChange={handleInputChange} className={textareaStyle}></textarea> : <span className={`${textValueDefaultDisplay} pt-1`}>{Array.isArray(roomDetails.equipment) ? roomDetails.equipment.join(", ") : ''}</span>}</div></div>
                                    </div>
                                    <button
                                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-md rounded-md text-white font-semibold disabled:opacity-60"
                                        onClick={handleEditToggle}
                                        disabled={isSaving}>
                                        {isEditing ? (isSaving ? "Saving..." : "Save Changes") : "Edit Room"}
                                    </button>
                                </>
                            ) : (
                                <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">
                                    Select an available room to view details.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}