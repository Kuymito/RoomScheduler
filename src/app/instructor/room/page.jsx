"use client";

import { useState, useEffect, useCallback } from "react";
import InstructorLayout from "@/components/InstructorLayout";
import SuccessAlert from "./components/UpdateSuccessComponent";
import RequestChangeForm from "./components/RequestChangeForm";
import apiClient from "@/utils/apiClient";

// --- SKELETON COMPONENTS (No changes needed) ---
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
// END SKELETONS

const weekdays = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
// FIX: Use the same format as the API response ('HH:mm:ss') for consistency
const timeSlots = ['07:00:00 - 10:00:00', '10:30:00 - 13:30:00', '14:00:00 - 17:00:00', '17:30:00 - 20:30:00'];

const InstructorRoomViewContent = () => {
    const [selectedDay, setSelectedDay] = useState(weekdays[0]);
    const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
    const [selectedBuilding, setSelectedBuilding] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [instructorClasses, setInstructorClasses] = useState([]);
    
    const [buildings, setBuildings] = useState({});
    const [rooms, setRooms] = useState([]);
    const [schedules, setSchedules] = useState([]); // State for schedules
    const [error, setError] = useState(null);

    const textLabelRoom = "font-medium text-base leading-7 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueRoomDisplay = "font-medium text-base leading-7 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const textLabelDefault = "font-medium text-sm leading-6 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueDefaultDisplay = "font-medium text-sm leading-6 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setInitialLoading(true);
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

                const buildingKeys = Object.keys(structuredBuildings);
                if (buildingKeys.length > 0) {
                    setSelectedBuilding(buildingKeys[0]);
                }

            } catch (err) {
                setError(err.message || "Failed to fetch initial data");
            } finally {
                setInitialLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const resetSelection = () => {
        setSelectedRoom(null);
        setRoomDetails(null);
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

    const handleRoomClick = useCallback(async (roomId) => {
        if (selectedRoom === roomId) return;
        setSelectedRoom(roomId);
        setLoading(true);
        try {
            const roomData = rooms.find(r => r.roomId.toString() === roomId);
            if (!roomData) throw new Error("Room not found");
            
            setRoomDetails({ 
                ...roomData,
                equipment: roomData.equipment ? roomData.equipment.split(',').map(e => e.trim()) : []
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [rooms, selectedRoom]);

    const handleRequest = () => {
        if (roomDetails) setIsFormOpen(true);
    };

    const handleSaveRequest = async (data) => {
        try {
            setLoading(true);
            const requestData = {
                roomId: selectedRoom,
                classId: data.selectedClass,
            };
            await apiClient.post('/api/v1/schedule/assign', requestData);
            setShowSuccessAlert(true);
            const schedulesResponse = await apiClient.get('/api/v1/schedule');
            setSchedules(schedulesResponse.payload || []);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to submit request");
        } finally {
            setLoading(false);
            setIsFormOpen(false);
        }
    };

    useEffect(() => {
        const fetchInstructorClasses = async () => {
            if (!isFormOpen) return;
            try {
                setLoading(true);
                const response = await apiClient.get('/api/v1/class/unscheduled'); 
                setInstructorClasses(response.payload || []);
            } catch (err) {
                setError(err.message || "Failed to fetch classes");
            } finally {
                setLoading(false);
            }
        };
        fetchInstructorClasses();
    }, [isFormOpen]);

    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
    
    return (
        <>
            {showSuccessAlert && ( 
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <SuccessAlert
                        title="Request Sent Successfully"
                        messageLine1={`Room ${roomDetails?.roomName || ""} has been scheduled.`}
                        onConfirm={() => setShowSuccessAlert(false)}
                    />
                </div>
            )}
            
            <RequestChangeForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveRequest}
                roomDetails={roomDetails}
                instructorClasses={instructorClasses}
                selectedDay={selectedDay}
                selectedTime={selectedTime}
            />
            
            <div className="p-4 sm:p-6 min-h-full">
                <div className="mb-4 w-full">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room Schedule</h2>
                    <hr className="border-t border-slate-300 dark:border-slate-700 mt-3" />
                </div>

                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between border-b dark:border-gray-600 pb-3 gap-4">
                        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden w-full sm:w-auto">
                            {weekdays.map(day => (
                                <button key={day} onClick={() => handleDayChange(day)} className={`px-3.5 py-1.5 text-sm font-medium transition-colors w-full ${selectedDay === day ? 'bg-sky-600 text-white shadow' : 'border-r dark:border-r-gray-500 last:border-r-0 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{day}</button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label htmlFor="time-select" className="text-sm font-medium dark:text-gray-300">Time:</label>
                            <select id="time-select" value={selectedTime} onChange={handleTimeChange} className="p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500 w-full">
                                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select value={selectedBuilding} onChange={handleBuildingChange} className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" disabled={initialLoading}>
                            {Object.keys(buildings).map((building) => (<option key={building} value={building}>{building}</option>))}
                        </select>
                        <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {initialLoading ? <RoomSelectionSkeleton /> : (
                        <div className="flex-1 min-w-0">
                            <div className="space-y-4">
                                {buildings[selectedBuilding]?.map(({ floor, rooms: floorRooms }) => (
                                    <div key={floor} className="space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Floor {floor}</h4>
                                            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                                        </div>
                                        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 sm:gap-4">
                                            {floorRooms.map((roomId) => {
                                                const room = rooms.find(r => r.roomId.toString() === roomId);
                                                if (!room) return null;
                                                
                                                // --- FIX: Robust availability checking ---
                                                let scheduleEntry = null;
                                                // Only check for a schedule if selectedTime is a valid string
                                                if (typeof selectedTime === 'string' && selectedTime.includes(' - ')) {
                                                    const selectedStartTime = selectedTime.split(' - ')[0];
                                                    
                                                    scheduleEntry = schedules.find(s =>
                                                        s.roomId.toString() === roomId &&
                                                        s.day.toLowerCase().startsWith(selectedDay.toLowerCase()) &&
                                                        s.shift.startTime === selectedStartTime
                                                    );
                                                }

                                                const isAvailable = !scheduleEntry;
                                                const status = isAvailable ? 'Available' : 'Unavailable';
                                                const isSelected = selectedRoom === roomId;
                                                
                                                return (
                                                    <div key={roomId} onClick={() => isAvailable && handleRoomClick(roomId)} className={`h-[90px] sm:h-[100px] border rounded-md flex flex-col transition-all duration-150 shadow-sm ${isAvailable ? 'cursor-pointer hover:shadow-md bg-white dark:bg-slate-800' : 'cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 opacity-70'} ${isSelected ? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-500" : isAvailable ? "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600" : "border-slate-200 dark:border-slate-700"}`}>
                                                        <div className={`h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b ${isSelected ? 'border-b-transparent' : 'border-slate-200 dark:border-slate-600'} ${isAvailable ? 'bg-slate-50 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-700/60'}`}>
                                                            <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'} ${isSelected ? 'bg-blue-500' : ''}`}></div>
                                                            <span className={`ml-3 text-xs sm:text-sm font-medium ${isSelected ? "text-blue-700 dark:text-blue-300" : isAvailable ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>{room.roomName}</span>
                                                        </div>
                                                        <div className={`flex-1 rounded-b-md p-2 flex flex-col justify-center items-center ${isAvailable ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                                            <span className={`font-semibold text-xs text-center ${isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                {isAvailable ? 'Available' : `Used by ${scheduleEntry.className}`}
                                                            </span>
                                                            <span className={`text-xs text-slate-500 dark:text-slate-400 ${isSelected ? "text-slate-600 dark:text-slate-300" : ""} mt-1`}>
                                                                Capacity: {room.capacity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="w-full lg:w-[320px] shrink-0">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">Details</h3>
                            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                        </div>
                        <div className="flex flex-col items-start gap-6 w-full min-h-[420px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
                            {initialLoading || loading ? <RoomDetailsSkeleton /> : roomDetails ? (
                                <>
                                    <div className="flex flex-col items-start self-stretch w-full flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-700 pr-1">
                                        <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                                            <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelRoom}>Room</span></div>
                                                <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueRoomDisplay}>{roomDetails.roomName}</span></div>
                                            </div>
                                            <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Building</span></div>
                                                <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.buildingName}</span></div>
                                            </div>
                                            <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Floor</span></div>
                                                <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.floor}</span></div>
                                            </div>
                                            <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Capacity</span></div>
                                                <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.capacity}</span></div>
                                            </div>
                                            <div className="flex flex-row items-start self-stretch w-full min-h-[92px] hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px] pt-5"><span className={textLabelDefault}>Equipment</span></div>
                                                <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2 pt-3"><span className={`${textValueDefaultDisplay} pt-1`}>{roomDetails.equipment.join(", ")}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={handleRequest} disabled={loading} className="flex flex-row justify-center items-center pyx-3 px-5 sm:px-6 gap-2 w-full h-[48px] sm:h-[50px] bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 shadow-md hover:shadow-lg rounded-md text-white font-semibold text-sm sm:text-base self-stretch disabled:opacity-60 transition-all duration-150">
                                        {loading ? "Loading..." : "Request Change"}
                                    </button>
                                </>
                            ) : (
                                <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Select an available room to view details.</div>
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
        <InstructorLayout activeItem="room" pageTitle="Room Management">
            <InstructorRoomViewContent />
        </InstructorLayout>
    );
}