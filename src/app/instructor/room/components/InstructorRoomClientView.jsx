'use client';

import { useState, useEffect } from "react";
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import SuccessAlert from "./RequestSuccessComponent";
import RequestChangeForm from "./RequestChangeForm";
import InstructorRoomPageSkeleton from "./InstructorRoomPageSkeleton";
import { scheduleService } from '@/services/schedule.service';

// Fetcher for useSWR
const scheduleFetcher = ([key, token]) => scheduleService.getAllSchedules(token);

/**
 * This is the Client Component for the Instructor Room page.
 * It receives its initial data from props and handles all user interactions.
 */
export default function InstructorRoomClientView({ initialAllRoomsData, buildingLayout, initialScheduleMap, initialInstructorClasses }) {
    // --- State Management ---
    const [allRoomsData, setAllRoomsData] = useState(initialAllRoomsData);
    const [buildings, setBuildings] = useState(buildingLayout);
    const [scheduleMap, setScheduleMap] = useState(initialScheduleMap);
    const [instructorClasses] = useState(initialInstructorClasses);
    
    const [selectedDay, setSelectedDay] = useState(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('07:00-10:00');
    const [selectedBuilding, setSelectedBuilding] = useState(Object.keys(buildingLayout)[0] || "");

    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [error, setError] = useState('');

    // --- SWR for live schedule data ---
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
    // Update scheduleMap when SWR fetches new data
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
        } else if (apiSchedules) {
            setScheduleMap(apiSchedules);
        }
    }, [apiSchedules]);

    // Reset component state if initial server props change
    useEffect(() => {
        setAllRoomsData(initialAllRoomsData);
        setBuildings(buildingLayout);
        setSelectedBuilding(Object.keys(buildingLayout)[0] || "");
        resetSelection();
    }, [initialAllRoomsData, buildingLayout]);

    // --- Handlers ---
    const resetSelection = () => { setSelectedRoomId(null); setRoomDetails(null); };
    const handleDayChange = (day) => { setSelectedDay(day); resetSelection(); };
    const handleTimeChange = (event) => { setSelectedTimeSlot(event.target.value); resetSelection(); };
    const handleBuildingChange = (event) => { setSelectedBuilding(event.target.value); resetSelection(); };

    const handleRoomClick = async (roomId) => {
        const isOccupied = scheduleMap[selectedDay]?.[selectedTimeSlot]?.[roomId];
        if (isOccupied) return; // Prevent clicking occupied rooms

        setSelectedRoomId(roomId);
        setLoading(true);
        setRoomDetails(null);
        setError('');
        try {
            const room = allRoomsData[roomId];
            if (!room) throw new Error("Room not found");
            setRoomDetails(room);
        } catch (err) {
            setError("Error setting room details.");
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = () => { if (roomDetails) setIsFormOpen(true); };
    const handleSaveRequest = (data) => {
        console.log("Change Request Submitted:", { requestDetails: data });
        setShowSuccessAlert(true);
    };

    // --- Derived Data and Constants ---
    const floors = buildings[selectedBuilding] || [];
    const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const TIME_SLOTS = ['07:00-10:00', '10:30-13:30', '14:00-17:00', '17:30-20:30'];
    const formatTimeSlot = (time) => time.replace('-', ' to ');

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

    const getRoomColSpan = (building, roomName) => {
        if (building === "Building A" && roomName === "Conference Room") return "col-span-2"; 
        if (building === "Building B" && roomName === "Conference Room") return "col-span-4";
        if (building === "Building D" && roomName?.includes("Library")) return "col-span-full";
        return "";
    };

    if (isScheduleLoading && !apiSchedules) {
        return <InstructorRoomPageSkeleton />;
    }

    if (scheduleError) {
        return <div className="p-6 text-center text-red-500">Failed to load schedule data: {scheduleError.message}</div>;
    }

    return (
    <>
      {showSuccessAlert && ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 "><SuccessAlert show={showSuccessAlert} title="Request was sent Successfully" messageLine1={`Room ${roomDetails?.name || ""} Your request was sent Successfully`} messageLine2="" confirmButtonText="Close" onConfirm={() => setShowSuccessAlert(false)} onClose={() => setShowSuccessAlert(false)}/></div>)}
      <RequestChangeForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveRequest} roomDetails={roomDetails} instructorClasses={instructorClasses} selectedDay={selectedDay} selectedTime={selectedTimeSlot}/>
      <div className="p-4 sm:p-6 min-h-full">
        <div className="mb-4 w-full"><h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room</h2><hr className="border-t border-slate-300 dark:border-slate-700 mt-3" /></div>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b dark:border-gray-600 pb-3 gap-4">
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 dark:text-gray-300 overflow-hidden w-full sm:w-auto">
                  {WEEKDAYS.map(day => (<button key={day} onClick={() => handleDayChange(day)} className={`px-3.5 py-1.5 text-sm font-medium transition-colors w-full ${selectedDay === day ? 'bg-blue-600 text-white shadow' : 'border-r dark:border-r-gray-500 last:border-r-0 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{day.substring(0,3)}</button>))}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label htmlFor="time-select" className="text-sm font-medium dark:text-gray-300">Time:</label>
                  <select id="time-select" value={selectedTimeSlot} onChange={handleTimeChange} className="p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 w-full">
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{formatTimeSlot(t)}</option>)}
                  </select>
              </div>
          </div>
          <div className="flex items-center gap-2">
                <select value={selectedBuilding} onChange={handleBuildingChange} className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    {Object.keys(buildings).map((building) => <option key={building} value={building}>{building}</option>)}
                </select>
                <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
                <div className="space-y-4">
                    {floors.map(({ floor, rooms }) => (
                        <div key={floor} className="space-y-3">
                            <div className="flex items-center gap-2 mb-2"><h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Floor {floor}</h4><hr className="flex-1 border-t border-slate-300 dark:border-slate-700" /></div>
                            <div className={`grid gap-3 sm:gap-4 ${getGridColumnClasses(selectedBuilding, floor)}`}>
                                {rooms.map((roomName) => {
                                    const room = Object.values(allRoomsData).find(r => r.name === roomName);
                                    if (!room) return null;
                                    const scheduledClass = scheduleMap[selectedDay]?.[selectedTimeSlot]?.[room.id];
                                    const isOccupied = !!scheduledClass;
                                    const isSelected = selectedRoomId === room.id;
                                    return (
                                        <div key={room.id} onClick={() => handleRoomClick(room.id)} className={`h-[90px] sm:h-[100px] border rounded-md flex flex-col transition-all duration-150 shadow-sm ${getRoomColSpan(selectedBuilding, room.name)} ${isOccupied ? 'cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 opacity-70' : 'cursor-pointer hover:shadow-md bg-white dark:bg-slate-800'} ${isSelected ? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-500" : isOccupied ? "border-slate-200 dark:border-slate-700" : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"}`}>
                                            <div className={`h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b ${isSelected ? 'border-b-transparent' : 'border-slate-200 dark:border-slate-600'} ${isOccupied ? 'bg-slate-100 dark:bg-slate-700/60' : 'bg-slate-50 dark:bg-slate-700'}`}>
                                                <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isSelected ? 'bg-blue-500' : isOccupied ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                <span className={`ml-3 text-xs sm:text-sm font-medium ${isSelected ? "text-blue-700 dark:text-blue-300" : isOccupied ? "text-slate-500 dark:text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>{room?.name || roomName}</span>
                                            </div>
                                            <div className={`flex-1 rounded-b-md p-2 flex flex-col justify-center items-center ${isOccupied ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}`}>
                                                <span className={`text-xs ${isOccupied ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{isOccupied ? scheduledClass : 'Available'}</span>
                                                <span className={`text-xs text-slate-500 dark:text-slate-400 ${isSelected ? "text-slate-600 dark:text-slate-300" : ""} mt-1`}>Capacity: {room?.capacity}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-full lg:w-[320px] shrink-0">
                <div className="flex items-center gap-2 mb-3 sm:mb-4"><h3 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">Details</h3><hr className="flex-1 border-t border-slate-300 dark:border-slate-700" /></div>
                <div className="flex flex-col items-start gap-6 w-full min-h-[420px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
                    {loading ? (<InstructorRoomPageSkeleton.RoomDetailsSkeleton />) : roomDetails ? (
                        <>
                            <div className="flex flex-col items-start self-stretch w-full flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-700 pr-1">
                                <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[120px]"><span className={textLabelRoom}>Room</span></div><div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueRoomDisplay}>{roomDetails.name}</span></div></div>
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Building</span></div><div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.building}</span></div></div>
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Floor</span></div><div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.floor}</span></div></div>
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Capacity</span></div><div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.capacity}</span></div></div>
                                    <div className="flex flex-row items-start self-stretch w-full min-h-[92px]"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[120px] pt-5"><span className={textLabelDefault}>Equipment</span></div><div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2 pt-3"><span className={`${textValueDefaultDisplay} pt-1`}>{roomDetails.equipment.join(", ")}</span></div></div>
                                </div>
                            </div>
                            <button className="flex flex-row justify-center items-center pyx-3 px-5 sm:px-6 gap-2 w-full h-[48px] sm:h-[50px] bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 shadow-md hover:shadow-lg rounded-md text-white font-semibold text-sm sm:text-base self-stretch disabled:opacity-60 transition-all duration-150" onClick={handleRequest} disabled={loading}>{loading ? "Loading..." : "Request"}</button>
                        </>
                    ) : ( <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Select an available room to view details.</div> )}
                </div>
            </div>
        </div>
      </div>
    </>
    );
}