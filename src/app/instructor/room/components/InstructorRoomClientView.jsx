'use client';

import { useState, useEffect } from "react";
import SuccessAlert from "./RequestSuccessComponent";
import RequestChangeForm from "./RequestChangeForm";
import InstructorRoomPageSkeleton from "./InstructorRoomPageSkeleton";

// --- CONSTANTS (can be moved to a shared file) ---
const weekdays = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
const timeSlots = ['7:00 - 10:00', '10:30 - 13:30', '14:00 - 17:00', '17:30 - 20:30'];

/**
 * This is the Client Component for the Instructor Room page.
 * It receives its initial data from props and handles all user interactions.
 */
export default function InstructorRoomClientView({ initialAllRoomsData, initialInstructorClasses }) {
    const [allRoomsData, setAllRoomsData] = useState(initialAllRoomsData);
    const [instructorClasses, setInstructorClasses] = useState(initialInstructorClasses);

    const [selectedDay, setSelectedDay] = useState(weekdays[0]);
    const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
    const [selectedBuilding, setSelectedBuilding] = useState("Building A");

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const currentInstructor = { id: "instructor01", name: "Dr. Ada Lovelace" };

    const buildings = {
        "Building A": [{ floor: 5, rooms: ["A1", "A2", "A3"] }, { floor: 4, rooms: ["B1", "B2"] }, { floor: 3, rooms: ["C1", "C2"] }, { floor: 2, rooms: ["D1", "D2"] }, { floor: 1, rooms: ["E1", "E2"] }],
        "Building B": [{ floor: 3, rooms: ["F1", "F2"] }, { floor: 2, rooms: ["G1", "G2"] }, { floor: 1, rooms: ["H1", "H2"] }],
    };

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

    const handleRoomClick = async (roomId) => {
        const room = allRoomsData[roomId];
        const status = room?.weeklySchedule?.[selectedDay]?.[selectedTime] || 'Unavailable';
        
        if (status === 'Unavailable') return;
        if (selectedRoom === roomId) return;

        setSelectedRoom(roomId);
        setLoading(true);
        setRoomDetails(null);
        try {
            await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate quick lookup
            if (!room) throw new Error("Room not found");
            setRoomDetails({ ...room, status });
        } catch (error) {
            console.error("Error setting room details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = () => {
        if (roomDetails) {
            setIsFormOpen(true);
        }
    };

    const handleSaveRequest = (data) => {
        console.log("Change Request Submitted:", {
            instructor: currentInstructor,
            requestDetails: data,
        });
        setShowSuccessAlert(true);
    };

    const floors = buildings[selectedBuilding] || [];
    const textLabelRoom = "font-medium text-base leading-7 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueRoomDisplay = "font-medium text-base leading-7 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const textLabelDefault = "font-medium text-sm leading-6 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueDefaultDisplay = "font-medium text-sm leading-6 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";

    return (
    <>
      {showSuccessAlert && ( 
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 ">
          <SuccessAlert
            show={showSuccessAlert}
            title="Request was sent Successfully "
            messageLine1={`Room ${roomDetails?.name || ""} Your request was sent Successfully `}
            messageLine2=""
            confirmButtonText="Close"
            onConfirm={() => setShowSuccessAlert(false)}
            onClose={() => setShowSuccessAlert(false)}
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
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room</h2>
          <hr className="border-t border-slate-300 dark:border-slate-700 mt-3" />
        </div>

        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b dark:border-gray-600 pb-3 gap-4">
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden w-full sm:w-auto">
                  {weekdays.map(day => (
                      <button key={day} onClick={() => handleDayChange(day)} className={`px-3.5 py-1.5 text-sm font-medium transition-colors w-full ${selectedDay === day ? 'bg-sky-600 text-white shadow' : 'border-r dark:border-r-gray-500 last:border-r-0 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                          {day}
                      </button>
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
                <select value={selectedBuilding} onChange={handleBuildingChange} className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    {Object.keys(buildings).map((building) => ( <option key={building} value={building}>{building}</option>))}
                </select>
                <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
                <div className="space-y-4">
                    {floors.map(({ floor, rooms }) => (
                        <div key={floor} className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Floor {floor}</h4>
                                <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                            </div>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 sm:gap-4">
                                {rooms.map((roomId) => {
                                    const room = allRoomsData[roomId];
                                    if (!room) return null;
                                    const status = room.weeklySchedule?.[selectedDay]?.[selectedTime] || 'Unavailable';
                                    const isAvailable = status === 'Available';
                                    const isSelected = selectedRoom === roomId;
                                    return (
                                        <div key={roomId} onClick={() => handleRoomClick(roomId)} className={`h-[90px] sm:h-[100px] border rounded-md flex flex-col transition-all duration-150 shadow-sm ${isAvailable ? 'cursor-pointer hover:shadow-md bg-white dark:bg-slate-800' : 'cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 opacity-70'} ${isSelected ? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-500" : isAvailable ? "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600" : "border-slate-200 dark:border-slate-700"}`}>
                                            <div className={`h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b ${isSelected ? 'border-b-transparent' : 'border-slate-200 dark:border-slate-600'} ${isAvailable ? 'bg-slate-50 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-700/60'}`}>
                                                <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'} ${isSelected ? 'bg-blue-500' : ''}`}></div>
                                                <span className={`ml-3 text-xs sm:text-sm font-medium ${isSelected ? "text-blue-700 dark:text-blue-300" : isAvailable ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>{room?.name || roomId}</span>
                                            </div>
                                            <div className={`flex-1 rounded-b-md p-2 flex flex-col justify-center items-center ${isAvailable ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                                <span className={`font-semibold text-xs ${isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {status}
                                                </span>
                                                <span className={`text-xs text-slate-500 dark:text-slate-400 ${isSelected ? "text-slate-600 dark:text-slate-300" : ""} mt-1`}>
                                                    Capacity: {room?.capacity}
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
          
            <div className="w-full lg:w-[320px] shrink-0">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">Details</h3>
                    <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                </div>
                <div className="flex flex-col items-start gap-6 w-full min-h-[420px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
                    {loading ? ( 
                        <InstructorRoomPageSkeleton.RoomDetailsSkeleton />
                    ) : roomDetails ? (
                        <>
                            <div className="flex flex-col items-start self-stretch w-full flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-700 pr-1">
                                <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelRoom}>Room</span></div><div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueRoomDisplay}>{roomDetails.name}</span></div></div>
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Building</span></div><div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.building}</span></div></div>
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Floor</span></div><div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.floor}</span></div></div>
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Capacity</span></div><div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.capacity}</span></div></div>
                                    <div className="flex flex-row items-start self-stretch w-full min-h-[92px] hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"><div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px] pt-5"><span className={textLabelDefault}>Equipment</span></div><div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2 pt-3"><span className={`${textValueDefaultDisplay} pt-1`}>{roomDetails.equipment.join(", ")}</span></div></div>
                                </div>
                            </div>
                            <button className="flex flex-row justify-center items-center pyx-3 px-5 sm:px-6 gap-2 w-full h-[48px] sm:h-[50px] bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 shadow-md hover:shadow-lg rounded-md text-white font-semibold text-sm sm:text-base self-stretch disabled:opacity-60 transition-all duration-150" onClick={handleRequest} disabled={loading}>{loading ? "Loading..." : "Request"}</button>
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
}
