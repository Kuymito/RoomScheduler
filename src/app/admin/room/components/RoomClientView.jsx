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
    const inputContainerSizeDefault = "w-full sm:w-[132px] h-[40px]";
    const inputStyle = "py-[9px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const equipmentInputContainerSize = "w-full sm:w-[132px] h-[72px]";
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
            { floor: 5, rooms: ["A21", "A22", "A23", "A24", "A25"] },
            { floor: 4, rooms: ["A16", "A17", "A18", "A19", "A20"] },
            { floor: 3, rooms: ["A11", "A12", "A13", "A14", "A15"] },
            { floor: 2, rooms: ["A6", "A7", "A8", "A9", "A10"] },
            { floor: 1, rooms: ["A1", "A2", "A3", "A4", "A5"] },
        ],
        "Building B": [
            { floor: 5, rooms: ["B21", "B22", "B23", "B24", "B25"] },
            { floor: 4, rooms: ["B16", "B17", "B18", "B19", "B20"] },
            { floor: 3, rooms: ["B11", "B12", "B13", "B14", "B15"] },
            { floor: 2, rooms: ["B6", "B7", "B8", "B9", "B10"] },
            { floor: 1, rooms: ["B1", "B2", "B3", "B4", "B5"] },
        ],
        "Building C": [
            { floor: 5, rooms: ["C21", "C22", "C23", "C24", "C25"] },
            { floor: 4, rooms: ["C16", "C17", "C18", "C19", "C20"] },
            { floor: 3, rooms: ["C11", "C12", "C13", "C14", "C15"] },
            { floor: 2, rooms: ["C6", "C7", "C8", "C9", "C10"] },
            { floor: 1, rooms: ["C1", "C2", "C3", "C4", "C5"] },
        ],
        "Building D": [
            { floor: 5, rooms: ["D21", "D22", "D23", "D24", "D25"] },
            { floor: 4, rooms: ["D16", "D17", "D18", "D19", "D20"] },
            { floor: 3, rooms: ["D11", "D12", "D13", "D14", "D15"] },
            { floor: 2, rooms: ["D6", "D7", "D8", "D9", "D10"] },
            { floor: 1, rooms: ["D1", "D2", "D3", "D4", "D5"] },
        ],
        "Building E": [
            { floor: 5, rooms: ["E21", "E22", "E23", "E24", "E25"] },
            { floor: 4, rooms: ["E16", "E17", "E18", "E19", "E20"] },
            { floor: 3, rooms: ["E11", "E12", "E13", "E14", "E15"] },
            { floor: 2, rooms: ["E6", "E7", "E8", "E9", "E10"] },
            { floor: 1, rooms: ["E1", "E2", "E3", "E4", "E5"] },
        ],
        "Building F": [
            { floor: 5, rooms: ["F21", "F22", "F23", "F24", "F25"] },
            { floor: 4, rooms: ["F16", "F17", "F18", "F19", "F20"] },
            { floor: 3, rooms: ["F11", "F12", "F13", "F14", "F15"] },
            { floor: 2, rooms: ["F6", "F7", "F8", "F9", "F10"] },
            { floor: 1, rooms: ["F1", "F2", "F3", "F4", "F5"] },
        ],
    };

    // --- Event Handlers ---
    const handleRoomClick = async (roomId) => {
        setSelectedRoom(roomId);
        setIsEditing(false);
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
        setIsEditing(false);
    };

    const handleEditToggle = () => {
        if (isEditing) {
            handleSaveChanges();
        } else {
            if (roomDetails) {
                setIsEditing(true);
                setEditableRoomDetails({
                    ...roomDetails,
                    equipment: roomDetails.equipment.join(", "),
                });
            }
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setEditableRoomDetails((prevDetails) => ({
            ...prevDetails,
            [name]: name === 'floor' || name === 'capacity' ? (value === '' ? '' : parseInt(value, 10)) : value,
        }));
    };

    const handleSaveChanges = async () => {
        if (!editableRoomDetails) return;
        setLoading(true);
        const updatedRoomData = {
            ...editableRoomDetails,
            id: selectedRoom,
            floor: parseInt(editableRoomDetails.floor, 10) || 0,
            capacity: parseInt(editableRoomDetails.capacity, 10) || 0,
            equipment: editableRoomDetails.equipment.split(',').map(e => e.trim()).filter(e => e),
        };
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            setRoomDetails(updatedRoomData);
            setAllRoomsData(prevAllRooms => ({
                ...prevAllRooms,
                [selectedRoom]: updatedRoomData,
            }));
            setIsEditing(false);
            setShowSuccessAlert(true);
        } catch (error) {
            console.error("Failed to save room details:", error);
        } finally {
            setLoading(false);
        }
    };

    const floors = buildings[selectedBuilding] || [];

    // --- Render Logic ---
    return (
        <>
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
                                        <div className="grid xl:grid-cols-5 lg:grid-cols-2 md:grid-cols-2 gap-3">
                                            {rooms.map((roomId) => (
                                                <div
                                                    key={roomId}
                                                    className={`h-[90px] sm:h-[100px] border rounded-md flex flex-col cursor-pointer transition-all duration-150 shadow-sm hover:shadow-md bg-white dark:bg-slate-800 ${selectedRoom === roomId && !isEditing ? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-500" : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"}`}
                                                    onClick={() => handleRoomClick(roomId)}
                                                >
                                                    <div className="h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
                                                        <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 ${allRoomsData[roomId]?.id === selectedRoom && !isEditing ? 'bg-blue-500' : 'bg-green-500'} rounded-full`}></div>
                                                        <span className={`ml-3 text-xs sm:text-sm font-medium ${selectedRoom === roomId && !isEditing ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{allRoomsData[roomId]?.name || roomId}</span>
                                                    </div>
                                                    <div className="flex-1 rounded-b-md p-2 flex flex-col justify-center items-center bg-white dark:bg-slate-800">
                                                        <span className={`text-xs text-slate-500 dark:text-slate-400 ${selectedRoom === roomId && !isEditing ? 'text-slate-600 dark:text-slate-300' : ''}`}>Capacity: {allRoomsData[roomId]?.capacity}</span>
                                                    </div>
                                                </div>
                                            ))}
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
                                        <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelRoom}>Room</span></div>
                                            <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="text" name="name" value={editableRoomDetails.name} onChange={handleInputChange} className={inputStyle} /></div>) : (<span className={textValueRoomDisplay}>{roomDetails.name}</span>)}</div>
                                        </div>
                                        <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Building</span></div>
                                            <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="text" name="building" value={editableRoomDetails.building} onChange={handleInputChange} className={inputStyle} /></div>) : (<span className={textValueDefaultDisplay}>{roomDetails.building}</span>)}</div>
                                        </div>
                                        <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Floor</span></div>
                                            <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="number" name="floor" value={editableRoomDetails.floor} onChange={handleInputChange} className={inputStyle} /></div>) : (<span className={textValueDefaultDisplay}>{roomDetails.floor}</span>)}</div>
                                        </div>
                                        <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Capacity</span></div>
                                            <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="number" name="capacity" value={editableRoomDetails.capacity} onChange={handleInputChange} className={inputStyle} /></div>) : (<span className={textValueDefaultDisplay}>{roomDetails.capacity}</span>)}</div>
                                        </div>
                                        <div className="flex flex-row items-start self-stretch w-full min-h-[92px] hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px] pt-5"><span className={textLabelDefault}>Equipment</span></div>
                                            <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2 pt-3">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${equipmentInputContainerSize}`}><textarea name="equipment" value={editableRoomDetails.equipment} onChange={handleInputChange} className={textareaStyle} placeholder="Item1, Item2, ..."></textarea></div>) : (<span className={`${textValueDefaultDisplay} pt-1`}>{roomDetails.equipment.join(", ")}</span>)}</div>
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
};
