'use client';

import { useState, useEffect } from 'react';
import SuccessAlert from './UpdateSuccessComponent';

/**
 * This is the Client Component for the Room Management page.
 * It receives the initial room data as a prop from its parent Server Component
 * and handles all user interactions like selecting buildings, rooms, and editing details.
 */
export default function RoomClientView({ initialAllRoomsData }) {
    // --- Styles (for readability) ---
    const textLabelRoom = "font-medium text-base leading-7 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueRoomDisplay = "font-medium text-base leading-7 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const textLabelDefault = "font-medium text-sm leading-6 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueDefaultDisplay = "font-medium text-sm leading-6 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const inputContainerSizeDefault = "w-full sm:w-[132px] h-[40px]"; // Responsive width for smaller screens
    const equipmentInputContainerSize = "w-full sm:w-[132px] h-[72px]"; // Larger height for textarea

    const inputStyle = "py-[9px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const readOnlyInputStyle = "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"; // Style for read-only fields

    const textareaStyle = "py-[10px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-500 scrollbar-track-slate-100 dark:scrollbar-track-slate-800";

    // --- State Variables ---
    const [allRoomsData, setAllRoomsData] = useState(initialAllRoomsData);
    const [selectedBuilding, setSelectedBuilding] = useState("Building A");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableRoomDetails, setEditableRoomDetails] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // --- Data Structures ---
    const buildings = {
        "Building A": [
            { floor: 3, rooms: ["A19", "A20", "A21", "A22", "A23", "A24", "A25"] }, // Rooms A19-A25 (7 rooms)
            { floor: 2, rooms: ["A10", "A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18"] }, // Rooms A10-A18 (9 rooms)
            { floor: 1, rooms: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "MeetingA"] }, // Rooms A1-A9, MeetingA (10 rooms)
        ],
        "Building B": [
            { floor: 2, rooms: ["B6", "Meeting"] }, // Merged B7-B10 into "Meeting"
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
            { floor: 1, rooms: ["F1", "F1", "F3", "F4"] },   // Floor 1, 4 rooms
        ],
    };

    // --- Event Handlers ---
    const handleRoomClick = async (roomId) => {
        setSelectedRoom(roomId);
        setIsEditing(false); // Exit editing mode when a new room is selected
        setLoading(true);
        try {
            // Simulate a quick fetch/lookup for details
            await new Promise((resolve) => setTimeout(resolve, 100));
            const data = allRoomsData[roomId];
            if (!data) throw new Error("Room not found");
            setRoomDetails(data);
        } catch (error) {
            console.error("Error fetching room details:", error);
            setRoomDetails(null);
        } finally {
            setLoading(false);
        }
    };

    const handleBuildingChange = (event) => {
        setSelectedBuilding(event.target.value);
        setSelectedRoom(null);
        setRoomDetails(null);
        setIsEditing(false); // Exit editing mode
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // If currently editing, save changes
            handleSaveChanges();
        } else {
            // If not editing, enter editing mode and prepare editable data
            if (roomDetails) {
                setIsEditing(true);
                setEditableRoomDetails({
                    ...roomDetails,
                    // Convert array of equipment to a comma-separated string for easier editing in textarea
                    equipment: roomDetails.equipment.join(", "),
                });
            }
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setEditableRoomDetails((prevDetails) => ({
            ...prevDetails,
            // Convert 'floor' and 'capacity' to numbers, or keep as empty string if input is empty
            [name]: name === 'floor' || name === 'capacity' ? (value === '' ? '' : parseInt(value, 10)) : value,
        }));
    };

    const handleSaveChanges = async () => {
        if (!editableRoomDetails) return;
        setLoading(true);
        // Prepare data for saving: convert equipment string back to array
        const updatedRoomData = {
            ...editableRoomDetails,
            id: selectedRoom, // Ensure the ID is carried over
            floor: parseInt(editableRoomDetails.floor, 10) || 0, // Ensure floor is a number
            capacity: parseInt(editableRoomDetails.capacity, 10) || 0, // Ensure capacity is a number
            equipment: editableRoomDetails.equipment.split(',').map(e => e.trim()).filter(e => e), // Split and clean equipment string
        };
        console.log("Simulating API call to update room:", updatedRoomData);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setRoomDetails(updatedRoomData); // Update displayed details
            // Update the main allRoomsData state to reflect changes across the app
            setAllRoomsData(prevAllRooms => ({
                ...prevAllRooms,
                [selectedRoom]: updatedRoomData,
            }));
            setIsEditing(false); // Exit editing mode
            setShowSuccessAlert(true); // Show success message
        } catch (error) {
            console.error("Failed to save room details:", error);
        } finally {
            setLoading(false); // Ensure loading is reset here regardless of success or failure
        }
    };

    // Get the floor data for the currently selected building
    const floors = buildings[selectedBuilding] || [];

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
                return "xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            case "Building B":
                if (floorNumber === 2) {
                    return "grid-cols-5";
                }
                return "xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            case "Building C":
            case "Building F":
                return "xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            case "Building D":
                return "grid-cols-1";
            case "Building E":
                if (floorNumber === 1) {
                    return "xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
                }
                return "xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]";
            default:
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
            return "col-span-4";
        }
        if (building === "Building D" && roomName.includes("Library Room")) {
            return "col-span-full";
        }
        return "";
    };

    return (
        <>
            {/* Success Alert Modal */}
            {showSuccessAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <SuccessAlert
                        show={showSuccessAlert}
                        title="Room Updated"
                        messageLine1={`Room ${roomDetails?.name || ''} has been updated successfully.`}
                        messageLine2="You can continue managing rooms."
                        confirmButtonText="OK"
                        onConfirm={() => setShowSuccessAlert(false)}
                        onClose={() => setShowSuccessAlert(false)}
                    />
                </div>
            )}

            <div className='p-4 sm:p-6 min-h-full'>
                <div className="mb-4 w-full">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room</h2>
                    <hr className="border-t border-slate-300 dark:border-slate-700 mt-3" />
                </div>
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Room Selection Panel */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <select
                                value={selectedBuilding}
                                onChange={handleBuildingChange}
                                className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                {Object.keys(buildings).map((building) => (
                                    <option key={building} value={building}>{building}</option>
                                ))}
                            </select>
                            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                        </div>
                        <div className="space-y-4">
                            {floors.map(({ floor, rooms }) => (
                                <div key={floor} className="space-y-3">
                                    <div className="floor-section">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Floor {floor}</h4>
                                            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                                        </div>
                                        {/* Dynamic grid columns based on building type */}
                                        <div className={`grid gap-3 sm:gap-4 ${getGridColumnClasses(selectedBuilding, floor)}`}>
                                            {rooms.map((roomId) => {
                                                const room = allRoomsData[roomId];
                                                if (!room) return null;
                                                const isSelected = selectedRoom === roomId;
                                                const isUnavailable = room.status === "unavailable";
                                                
                                                return (
                                                    <div
                                                        key={roomId}
                                                        className={`h-[90px] sm:h-[100px] border rounded-md flex flex-col transition-all duration-150 shadow-sm
                                                            ${getRoomColSpan(selectedBuilding, room.name)}
                                                            ${isUnavailable ? 'cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 opacity-70' : 'cursor-pointer hover:shadow-md bg-white dark:bg-slate-800'}
                                                            ${isSelected ? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-500" : isUnavailable ? "border-slate-200 dark:border-slate-700" : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"}
                                                        `}
                                                        onClick={() => !isUnavailable && handleRoomClick(roomId)}
                                                    >
                                                        <div className={`h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b ${isSelected ? 'border-b-transparent' : 'border-slate-200 dark:border-slate-600'} ${isUnavailable ? 'bg-slate-100 dark:bg-slate-700/60' : 'bg-slate-50 dark:bg-slate-700'}`}>
                                                            <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isSelected ? 'bg-blue-500' : isUnavailable ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                            <span className={`ml-3 text-xs sm:text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : isUnavailable ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{room.name || roomId}</span>
                                                        </div>
                                                        <div className={`flex-1 rounded-b-md p-2 flex flex-col justify-center items-center ${isUnavailable ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}`}>
                                                            <span className={`text-xs ${isUnavailable ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'} ${isSelected ? 'text-slate-600 dark:text-slate-300' : ''}`}>
                                                                {isUnavailable ? 'Unavailable' : `Capacity: ${room.capacity}`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Details Panel */}
                    <div className="w-full lg:w-[320px] shrink-0">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">Details</h3>
                            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                        </div>
                        <div className="flex flex-col items-start gap-6 w-full min-h-[420px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
                            {loading && !isEditing && !roomDetails ? (
                                <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Loading room details...</div>
                            ) : roomDetails ? (
                                <>
                                    <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                                        {/* Room Name */}
                                        <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelRoom}>Room</span></div>
                                            <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                                                {isEditing && editableRoomDetails ? (
                                                    <div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}>
                                                        <input type="text" name="name" value={editableRoomDetails.name} onChange={handleInputChange} className={inputStyle} />
                                                    </div>
                                                ) : (
                                                    <span className={textValueRoomDisplay}>{roomDetails.name}</span>
                                                )}
                                            </div>
                                        </div>
                                        {/* Building - Always Read-Only, display as text */}
                                        <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Building</span></div>
                                            <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                                                <span className={textValueDefaultDisplay}>{roomDetails.building}</span>
                                            </div>
                                        </div>
                                        {/* Floor - Always Read-Only, display as text */}
                                        <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Floor</span></div>
                                            <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                                                <span className={textValueDefaultDisplay}>{roomDetails.floor}</span>
                                            </div>
                                        </div>
                                        {/* Capacity */}
                                        <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Capacity</span></div>
                                            <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                                                {isEditing && editableRoomDetails ? (
                                                    <div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}>
                                                        <input type="number" name="capacity" value={editableRoomDetails.capacity} onChange={handleInputChange} className={inputStyle} />
                                                    </div>
                                                ) : (
                                                    <span className={textValueDefaultDisplay}>{roomDetails.capacity}</span>
                                                )}
                                            </div>
                                        </div>
                                        {/* Equipment */}
                                        <div className="flex flex-row items-start self-stretch w-full min-h-[92px] hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px] pt-5"><span className={textLabelDefault}>Equipment</span></div>
                                            <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2 pt-3">
                                                {isEditing && editableRoomDetails ? (
                                                    <div className={`flex flex-col items-start self-stretch ${equipmentInputContainerSize}`}>
                                                        <textarea name="equipment" value={editableRoomDetails.equipment} onChange={handleInputChange} className={textareaStyle} placeholder="Item1, Item2, ..."></textarea>
                                                    </div>
                                                ) : (
                                                    <span className={`${textValueDefaultDisplay} pt-1`}>{roomDetails.equipment.join(", ")}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="flex flex-row justify-center items-center pyx-3 px-5 sm:px-6 gap-2 w-full h-[48px] sm:h-[50px] bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg rounded-md text-white font-semibold text-sm sm:text-base self-stretch disabled:opacity-60 transition-all duration-150"
                                        onClick={handleEditToggle}
                                        disabled={loading && isEditing}
                                    >
                                        {loading && isEditing ? "Saving..." : isEditing ? "Save Changes" : "Edit Room"}
                                    </button>
                                </>
                            ) : (
                                <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Select a room to view details.</div>
                            )}
                            {!roomDetails && !loading && (
                                <div className="w-full h-[50px] self-stretch"></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}