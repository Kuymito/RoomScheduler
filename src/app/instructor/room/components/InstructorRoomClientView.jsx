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
    // State to hold all room data and instructor's classes, initialized from server-provided props.
    const [allRoomsData, setAllRoomsData] = useState(initialAllRoomsData);
    const [instructorClasses] = useState(initialInstructorClasses); // Instructor's classes are static for this view

    // State for selected filters (Day, Time, Building)
    const [selectedDay, setSelectedDay] = useState(weekdays[0]);
    const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
    const [selectedBuilding, setSelectedBuilding] = useState("Building A");

    // State for selected room details and loading state
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(false); // Used for loading room details after selection

    // State for modals and alerts
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // Mock current instructor data (in a real app, this would come from authentication context)
    const currentInstructor = { id: "instructor01", name: "Dr. Ada Lovelace" };

    // Define the building and floor structure for display.
    // This structure mirrors the `buildings` object from the admin room page for consistency.
    const buildings = {
        "Building A": [
            { floor: 3, rooms: ["A19", "A20", "A21", "A22", "A23", "A24", "A25"] }, // Rooms A19-A25 (7 rooms)
            { floor: 2, rooms: ["A10", "A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18"] }, // Rooms A10-A18 (9 rooms)
            { floor: 1, rooms: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "MeetingA"] }, // Rooms A1-A9, MeetingA (10 rooms)
        ],
        "Building B": [
            { floor: 2, rooms: ["B6", "Meeting"] }, 
            { floor: 1, rooms: ["B1", "B2", "B3", "B4", "B5"] },
        ],
        "Building C": [
            { floor: 3, rooms: ["C9", "C10", "C11", "C12"] },   // Floor 3, 4 rooms
            { floor: 2, rooms: ["C5", "C6", "C7", "C8"] },   // Floor 2, 4 rooms
            { floor: 1, rooms: ["C1", "C2", "C3", "C4"] },   // Floor 1, 4 rooms
        ],
        "Building D": [
            { floor: 3, rooms: ["LibraryD3"] }, // Floor 3, 1 library room
            { floor: 2, rooms: ["LibraryD2"] },   // Floor 2, 1 library room
            { floor: 1, rooms: ["LibraryD1"] },   // Floor 1, 1 library room
        ],
        "Building E": [
            { floor: 5, rooms: ["E22", "E23", "E24", "E25", "E26"] }, // Floor 5, 5 rooms
            { floor: 4, rooms: ["E17", "E18", "E19", "E20", "E21"] }, // Floor 4, 5 rooms
            { floor: 3, rooms: ["E12", "E13", "E14", "E15", "E16"] }, // Floor 3, 5 rooms
            { floor: 2, rooms: ["E7", "E8", "E9", "E10", "E11"] },   // Floor 2, 5 rooms
            { floor: 1, rooms: ["E1", "E2", "E3", "E4", "E5", "E6"] }, // Floor 1, 6 rooms
        ],
        "Building F": [
            { floor: 5, rooms: ["F17", "F18", "F19", "F20"] }, // Floor 5, 4 rooms
            { floor: 4, rooms: ["F13", "F14", "F15", "F16"] }, // Floor 4, 4 rooms
            { floor: 3, rooms: ["F9", "F10", "F11", "F12"] },   // Floor 3, 4 rooms
            { floor: 2, rooms: ["F5", "F6", "F7", "F8"] },   // Floor 2, 4 rooms
            { floor: 1, rooms: ["F1", "F2", "F3", "F4"] },   // Floor 1, 4 rooms
        ],
    };

    /**
     * Resets the selected room state, clearing details panel.
     */
    const resetSelection = () => {
        setSelectedRoom(null);
        setRoomDetails(null);
    };
    
    /**
     * Handles change in selected day of the week.
     * Resets room selection as availability depends on day/time.
     */
    const handleDayChange = (day) => {
        setSelectedDay(day);
        resetSelection();
    };

    /**
     * Handles change in selected time slot.
     * Resets room selection as availability depends on day/time.
     */
    const handleTimeChange = (event) => {
        setSelectedTime(event.target.value);
        resetSelection();
    };

    /**
     * Handles change in selected building.
     * Resets room selection as availability depends on building.
     */
    const handleBuildingChange = (event) => {
        setSelectedBuilding(event.target.value);
        resetSelection();
    };

    /**
     * Handles click on a room card.
     * Updates selected room and fetches/displays its details.
     */
    const handleRoomClick = async (roomId) => {
        const room = allRoomsData[roomId];
        // Determine status for the currently selected day and time slot
        const status = room?.weeklySchedule?.[selectedDay]?.[selectedTime] || 'Unavailable';
        
        // Prevent selection of unavailable rooms or if the same room is clicked again
        if (status === 'Unavailable') return;
        if (selectedRoom === roomId) return;

        setSelectedRoom(roomId);
        setLoading(true); // Set loading true while fetching details
        setRoomDetails(null); // Clear previous details
        try {
            // Simulate a quick fetch/lookup for details.
            // In a real app, this would be an API call to get detailed room info.
            await new Promise((resolve) => setTimeout(resolve, 300)); 
            if (!room) throw new Error("Room not found");
            // Set room details including the current status for the selected slot
            setRoomDetails({ ...room, status });
        } catch (error) {
            console.error("Error setting room details:", error);
            setRoomDetails(null); // Clear details on error
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    /**
     * Opens the request change form modal if a room is selected.
     */
    const handleRequest = () => {
        if (roomDetails) {
            setIsFormOpen(true);
        }
    };

    /**
     * Handles saving a new change request.
     * In a real app, this would send data to a backend API.
     */
    const handleSaveRequest = (data) => {
        console.log("Change Request Submitted:", {
            instructor: currentInstructor, // The instructor making the request
            requestDetails: data, // Details from the form (class, date, description, time slot, room)
        });
        // Show a success alert upon successful submission
        setShowSuccessAlert(true);
    };

    // Dynamically get floors for the selected building
    const floors = buildings[selectedBuilding] || [];

    // --- Styling constants for consistent UI elements ---
    const textLabelRoom = "font-medium text-base leading-7 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueRoomDisplay = "font-medium text-base leading-7 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const textLabelDefault = "font-medium text-sm leading-6 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueDefaultDisplay = "font-medium text-sm leading-6 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";

    // These sizes are for input fields within the details panel.
    const inputContainerSizeDefault = "w-full sm:w-[132px] h-[40px]"; // Responsive width for smaller screens
    const equipmentInputContainerSize = "w-full sm:w-[132px] h-[72px]"; // Larger height for textarea

    // Tailwind CSS classes for consistent input styling
    const inputStyle = "py-[9px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const textareaStyle = "py-[10px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-500 scrollbar-track-slate-100 dark:scrollbar-track-slate-800";


    /**
     * Determines the appropriate Tailwind CSS grid column classes for a given building and floor.
     * This ensures the room cards are laid out correctly based on the building's specific design.
     * @param {string} building - The name of the building (e.g., "Building A").
     * @param {number} floorNumber - The floor number.
     * @returns {string} Tailwind CSS grid classes.
     */
    const getGridColumnClasses = (building, floorNumber) => {
        switch (building) {
            case "Building A":
                // Building A uses 5 columns for most floors, but 10 rooms on Floor 1
                return "xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            case "Building B":
                // Building B, Floor 2 has a large "Meeting Room" which requires a specific grid setup.
                // Other floors can use a default responsive grid.
                if (floorNumber === 2) {
                    return "grid-cols-5"; // Explicitly 5 columns for this specific floor
                }
                return "xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            case "Building C":
            case "Building F":
                // Buildings C and F typically use 4 columns per row.
                return "xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            case "Building D":
                // Building D typically has 1 large room per floor (e.g., Library), spanning full width.
                return "grid-cols-1"; // Full width for each room
            case "Building E":
                // Building E has 6 rooms on Floor 1, and 5 rooms on other floors.
                if (floorNumber === 1) {
                    return "xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
                }
                return "xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            default:
                // Default grid for any other buildings or unmatched cases
                return "grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
        }
    };

    /**
     * Determines if a specific room should span multiple columns in the grid.
     * This is used for rooms like "Meeting Room" or "Library Room" which are larger.
     * @param {string} building - The name of the building.
     * @param {string} roomName - The name of the room.
     * @returns {string} Tailwind CSS `col-span-*` class or an empty string.
     */
    const getRoomColSpan = (building, roomName) => {
        if (building === "Building B" && roomName === "Meeting Room") {
            return "col-span-4"; // Meeting room spans 4 columns in Building B
        }
        if (building === "Building D" && roomName.includes("Library Room")) {
            return "col-span-full"; // Library rooms span full width in Building D
        }
        return ""; // No specific col-span needed
    };

    return (
    <>
      {/* Success Alert Modal */}
      {showSuccessAlert && ( 
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 ">
          <SuccessAlert
            show={showSuccessAlert}
            title="Request was sent Successfully"
            messageLine1={`Room ${roomDetails?.name || ""} Your request was sent Successfully`}
            messageLine2=""
            confirmButtonText="Close"
            onConfirm={() => setShowSuccessAlert(false)}
            onClose={() => setShowSuccessAlert(false)}
          />
        </div>
      )}

      {/* Request Change Form Modal */}
      <RequestChangeForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveRequest}
          roomDetails={roomDetails}
          instructorClasses={instructorClasses}
          selectedDay={selectedDay}
          selectedTime={selectedTime}
      />

      {/* Main Page Content */}
      <div className="p-4 sm:p-6 min-h-full">
        {/* Page Header */}
        <div className="mb-4 w-full">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room</h2>
          <hr className="border-t border-slate-300 dark:border-slate-700 mt-3" />
        </div>

        {/* Filters Section (Day, Time, Building) */}
        <div className="flex flex-col gap-4 mb-4">
          {/* Day & Time Selection */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b dark:border-gray-600 pb-3 gap-4">
              {/* Day Buttons */}
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden w-full sm:w-auto">
                  {weekdays.map(day => (
                      <button 
                          key={day} 
                          onClick={() => handleDayChange(day)} 
                          className={`px-3.5 py-1.5 text-sm font-medium transition-colors w-full ${selectedDay === day ? 'bg-sky-600 text-white shadow' : 'border-r dark:border-r-gray-500 last:border-r-0 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                          {day}
                      </button>
                  ))}
              </div>
              {/* Time Slot Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label htmlFor="time-select" className="text-sm font-medium dark:text-gray-300">Time:</label>
                  <select 
                      id="time-select" 
                      value={selectedTime} 
                      onChange={handleTimeChange} 
                      className="p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500 w-full"
                  >
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
              </div>
          </div>

          {/* Building Selection */}
          <div className="flex items-center gap-2">
                <select 
                    value={selectedBuilding} 
                    onChange={handleBuildingChange} 
                    className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    {Object.keys(buildings).map((building) => ( 
                        <option key={building} value={building}>{building}</option>
                    ))}
                </select>
                <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
          </div>
        </div>

        {/* Main Content Area: Room List and Details Panel */}
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Room Selection Panel (Left Side) */}
            <div className="flex-1 min-w-0">
                <div className="space-y-4">
                    {/* Iterate over floors for the selected building */}
                    {floors.map(({ floor, rooms }) => (
                        <div key={floor} className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Floor {floor}</h4>
                                <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                            </div>
                            {/* Grid of Room Cards */}
                            <div className={`grid gap-3 sm:gap-4 ${getGridColumnClasses(selectedBuilding, floor)}`}>
                                {rooms.map((roomId) => {
                                    const room = allRoomsData[roomId];
                                    if (!room) return null; // Skip if room data is not found
                                    
                                    // Get the availability status for the current day and time slot
                                    const status = room.weeklySchedule?.[selectedDay]?.[selectedTime] || 'Unavailable';
                                    const isAvailable = status === 'Available';
                                    const isSelected = selectedRoom === roomId;

                                    return (
                                        <div 
                                            key={roomId} 
                                            onClick={() => handleRoomClick(roomId)} 
                                            // Apply responsive col-span for specific rooms (e.g., Meeting, Library)
                                            className={`h-[90px] sm:h-[100px] border rounded-md flex flex-col transition-all duration-150 shadow-sm
                                                ${getRoomColSpan(selectedBuilding, room.name)} 
                                                ${isAvailable ? 'cursor-pointer hover:shadow-md bg-white dark:bg-slate-800' : 'cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 opacity-70'} 
                                                ${isSelected ? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-500" : isAvailable ? "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600" : "border-slate-200 dark:border-slate-700"}
                                            `}
                                        >
                                            {/* Room Card Header */}
                                            <div className={`h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b ${isSelected ? 'border-b-transparent' : 'border-slate-200 dark:border-slate-600'} ${isAvailable ? 'bg-slate-50 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-700/60'}`}>
                                                {/* Status Indicator Dot */}
                                                <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'} ${isSelected ? 'bg-blue-500' : ''}`}></div>
                                                <span className={`ml-3 text-xs sm:text-sm font-medium ${isSelected ? "text-blue-700 dark:text-blue-300" : isAvailable ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                                                    {room?.name || roomId}
                                                </span>
                                            </div>
                                            {/* Room Card Body (Availability & Capacity) */}
                                            <div className={`flex-1 rounded-b-md p-2 flex flex-col justify-center items-center ${isAvailable ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                                <span className={`font-semibold text-xs ${isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {status} {/* Display availability status */}
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
          
            {/* Details Panel (Right Side) */}
            <div className="w-full lg:w-[320px] shrink-0">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">Details</h3>
                    <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                </div>
                <div className="flex flex-col items-start gap-6 w-full min-h-[420px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
                    {loading ? ( 
                        // Show skeleton while room details are loading
                        <InstructorRoomPageSkeleton.RoomDetailsSkeleton />
                    ) : roomDetails ? (
                        // Display room details if a room is selected and loaded
                        <>
                            <div className="flex flex-col items-start self-stretch w-full flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-700 pr-1">
                                <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                                    {/* Room Name */}
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelRoom}>Room</span></div>
                                        <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueRoomDisplay}>{roomDetails.name}</span></div>
                                    </div>
                                    {/* Building */}
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Building</span></div>
                                        <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.building}</span></div>
                                    </div>
                                    {/* Floor */}
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Floor</span></div>
                                        <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.floor}</span></div>
                                    </div>
                                    {/* Capacity */}
                                    <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Capacity</span></div>
                                        <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.capacity}</span></div>
                                    </div>
                                    {/* Equipment (as a comma-separated string) */}
                                    <div className="flex flex-row items-start self-stretch w-full min-h-[92px] hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px] pt-5"><span className={textLabelDefault}>Equipment</span></div>
                                        <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2 pt-3"><span className={`${textValueDefaultDisplay} pt-1`}>{roomDetails.equipment.join(", ")}</span></div>
                                    </div>
                                </div>
                            </div>
                            {/* Request Button */}
                            <button 
                                className="flex flex-row justify-center items-center pyx-3 px-5 sm:px-6 gap-2 w-full h-[48px] sm:h-[50px] bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 shadow-md hover:shadow-lg rounded-md text-white font-semibold text-sm sm:text-base self-stretch disabled:opacity-60 transition-all duration-150"
                                onClick={handleRequest} 
                                disabled={loading}
                            >
                                {loading ? "Loading..." : "Request"}
                            </button>
                        </>
                    ) : (
                        // Message when no room is selected or available
                        <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Select an available room to view details.</div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </>
    );
}