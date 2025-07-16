'use client';

import { useState, useEffect, lazy, Suspense } from "react";
import { notificationService } from '@/services/notification.service';
import { useSession } from 'next-auth/react';
import Toast from "@/components/Toast";

// Lazy load the modal component. It will now be in a separate JavaScript file.
const RequestChangeForm = lazy(() => import("./RequestChangeForm"));

// This component now receives all its data as props from the parent server component.
export default function InstructorRoomClientView({ initialAllRoomsData, buildingLayout, initialScheduleMap, initialInstructorClasses }) {
    // --- State Management ---
    const [allRoomsData] = useState(initialAllRoomsData);
    const [buildings] = useState(buildingLayout);
    const [scheduleMap] = useState(initialScheduleMap);
    const [instructorClasses] = useState(initialInstructorClasses);
    
    const [selectedDay, setSelectedDay] = useState(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    const TIME_SLOTS = ['Morning Shift', 'Noon Shift', 'Afternoon Shift', 'Evening Shift', 'Weekend Shift'];
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0]);
    
    const [selectedBuilding, setSelectedBuilding] = useState(Object.keys(buildingLayout)[0] || "");
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const { data: session } = useSession();

    // --- Event Handlers ---
    const resetSelection = () => { setSelectedRoomId(null); setRoomDetails(null); };
    const handleDayChange = (day) => { setSelectedDay(day); resetSelection(); };
    const handleTimeChange = (event) => { setSelectedTimeSlot(event.target.value); resetSelection(); };
    const handleBuildingChange = (event) => { setSelectedBuilding(event.target.value); resetSelection(); };

    /**
     * Handles a click on any room card.
     * It will now display details for any room, regardless of its status.
     * @param {number} roomId - The ID of the clicked room.
     */
    const handleRoomClick = async (roomId) => {
        const room = allRoomsData[roomId];

        setSelectedRoomId(roomId);
        setLoading(true);
        setRoomDetails(null);
        setError('');
        try {
            if (!room) throw new Error("Room not found");
            setRoomDetails(room);
        } catch (err) {
            setError("Error setting room details.");
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = () => { if (roomDetails) setIsFormOpen(true); };
    
    /**
     * Handles the submission of a room change/booking request.
     * @param {object} requestData - The data for the request from the form.
     */
    const handleSaveRequest = async (requestData) => {
        if (!session?.accessToken) {
            setToast({ show: true, message: 'Authentication session expired.', type: 'error' });
            return;
        }
        
        try {
            const payload = {
                ...requestData,
                instructorId: session.user.id, // Add instructor ID from session
            };
            await notificationService.submitChangeRequest(payload, session.accessToken);
            setToast({ show: true, message: 'Request sent successfully!', type: 'success' });
            setIsFormOpen(false); // Close the form on success
        } catch (err) {
            setToast({ show: true, message: `Request failed: ${err.message}`, type: 'error' });
        }
    };

    // --- Derived Data and Constants ---
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

    // Determine if the request button should be disabled.
    const isRequestDisabled = loading || !roomDetails || roomDetails.status === 'unavailable' || !!scheduleMap[selectedDay]?.[selectedTimeSlot]?.[roomDetails.id];

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
                                    const scheduledClass = scheduleMap[selectedDay]?.[selectedTimeSlot]?.[room.id];
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
                    {loading ? (<div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Loading...</div>) : roomDetails ? (
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
                            <button className="flex flex-row justify-center items-center pyx-3 px-5 sm:px-6 gap-2 w-full h-[48px] sm:h-[50px] bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 shadow-md hover:shadow-lg rounded-md text-white font-semibold text-sm sm:text-base self-stretch disabled:opacity-60 disabled:bg-gray-400 disabled:dark:bg-gray-600 disabled:cursor-not-allowed transition-all duration-150" onClick={handleRequest} disabled={isRequestDisabled}>{loading ? "Loading..." : "Request"}</button>
                        </>
                    ) : ( <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Select a room to view details.</div> )}
                </div>
            </div>
        </div>
      </div>
    </>
    );
}