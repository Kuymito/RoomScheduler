<<<<<<< Updated upstream
import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import RoomPageSkeleton from './components/RoomPageSkeleton';
import RoomClientView from './components/RoomClientView'; // We will create this next

/**
 * Mock data fetching function. In a real app, this would fetch from your database.
 * Because this is a Server Component, this function now runs on the server.
 */
const fetchRoomData = async () => {
    const initialRoomsData = {
        A1: { id: "A1", name: "Room A1", building: "Building A", floor: 5, capacity: 30, equipment: ["Projector", "Whiteboard", "AC"] },
        A2: { id: "A2", name: "Room A2", building: "Building A", floor: 5, capacity: 20, equipment: ["Whiteboard", "AC"] },
        A3: { id: "A3", name: "Room A3", building: "Building A", floor: 5, capacity: 25, equipment: ["Projector", "AC"] },
        A4: { id: "A4", name: "Room A4", building: "Building A", floor: 5, capacity: 18, equipment: ["Whiteboard"] },
        A5: { id: "A5", name: "Room A5", building: "Building A", floor: 5, capacity: 22, equipment: ["Projector", "AC"] },
        B1: { id: "B1", name: "Room B1", building: "Building A", floor: 4, capacity: 15, equipment: ["Projector", "AC"] },
        B2: { id: "B2", name: "Room B2", building: "Building A", floor: 4, capacity: 20, equipment: ["Whiteboard"] },
        C1: { id: "C1", name: "Room C1", building: "Building A", floor: 3, capacity: 10, equipment: ["AC"] },
        C2: { id: "C2", name: "Room C2", building: "Building A", floor: 3, capacity: 12, equipment: ["Whiteboard", "AC"] },
        D1: { id: "D1", name: "Room D1", building: "Building A", floor: 2, capacity: 8, equipment: ["Projector"] },
        D2: { id: "D2", name: "Room D2", building: "Building A", floor: 2, capacity: 10, equipment: ["Whiteboard"] },
        E1: { id: "E1", name: "Room E1", building: "Building A", floor: 1, capacity: 5, equipment: ["AC"] },
        E2: { id: "E2", name: "Room E2", building: "Building A", floor: 1, capacity: 6, equipment: ["Projector", "Whiteboard"] },
        F1: { id: "F1", name: "Room F1", building: "Building B", floor: 3, capacity: 12, equipment: ["Projector", "Whiteboard"] },
        F2: { id: "F2", name: "Room F2", building: "Building B", floor: 3, capacity: 10, equipment: ["AC"] },
        G1: { id: "G1", name: "Room G1", building: "Building B", floor: 2, capacity: 8, equipment: ["Whiteboard"] },
        G2: { id: "G2", name: "Room G2", building: "Building B", floor: 2, capacity: 6, equipment: ["Projector"] },
        H1: { id: "H1", name: "Room H1", building: "Building B", floor: 1, capacity: 5, equipment: ["AC"] },
        H2: { id: "H2", name: "Room H2", building: "Building B", floor: 1, capacity: 4, equipment: ["Whiteboard"] },
    };

    // Simulate network delay for fetching data
    await new Promise(resolve => setTimeout(resolve, 500));
    return initialRoomsData;
};

/**
 * The main page component is now an async Server Component.
 */
export default async function AdminRoomPage() {
    // Data is fetched on the server before the page is sent to the client.
    const allRoomsData = await fetchRoomData();

=======
// src/app/admin/room/page.jsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import SuccessAlert from './components/UpdateSuccessComponent';

const API_ROOM_URL = 'http://localhost:8080/api/v1/room';

const RoomViewContent = () => {
    const [selectedBuilding, setSelectedBuilding] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableRoomDetails, setEditableRoomDetails] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [error, setError] = useState(null);

    const [allRoomsData, setAllRoomsData] = useState({});
    const [buildings, setBuildings] = useState({});

    // --- Data Mapping (API to Component) ---
    const mapApiRoomToComponentRoom = useCallback((apiRoom) => {
        if (!apiRoom) return null;
        return {
            id: apiRoom.roomId,
            name: apiRoom.roomName || '',
            building: apiRoom.buildingName || '',
            floor: apiRoom.floor,
            capacity: apiRoom.capacity,
            equipment: apiRoom.equipment || '', 
            roomType: apiRoom.type || '', 
            isAvailable: apiRoom.isAvailable === undefined ? true : !!apiRoom.isAvailable,
        };
    }, []);

    // --- Data Mapping (Component Form Data to API DTO for PATCH) ---
    const mapComponentDataToPatchDto = useCallback((componentRoomData) => {
        if (!componentRoomData) return {};
        return {
            roomName: componentRoomData.name,
            buildingName: componentRoomData.building,
            floor: componentRoomData.floor !== '' ? parseInt(componentRoomData.floor, 10) : null,
            capacity: componentRoomData.capacity !== '' ? parseInt(componentRoomData.capacity, 10) : null,
            equipment: componentRoomData.equipment,
            type: componentRoomData.roomType || null,
            isAvailable: componentRoomData.isAvailable,
        };
    }, []);

    // --- API Functions ---
    const fetchAllRooms = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_ROOM_URL);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `HTTP error! status: ${response.status}`);
            }
            const apiResponse = await response.json();
            if (apiResponse.status === "OK" && Array.isArray(apiResponse.payload)) {
                const roomsById = {};
                const newBuildingsData = {};
                apiResponse.payload.forEach(apiRoom => {
                    const room = mapApiRoomToComponentRoom(apiRoom);
                    if (!room || room.id === undefined || room.id === null) {
                        console.warn("Skipping room with invalid ID from API:", apiRoom);
                        return;
                    }
                    roomsById[room.id] = room;
                    if (room.building && !newBuildingsData[room.building]) {
                        newBuildingsData[room.building] = [];
                    }
                    if (room.building) {
                        let floorObj = newBuildingsData[room.building].find(f => f.floor === room.floor);
                        if (!floorObj) {
                            floorObj = { floor: room.floor, rooms: [] };
                            newBuildingsData[room.building].push(floorObj);
                        }
                        floorObj.rooms.push(room.id);
                    }
                });
                for (const buildingName in newBuildingsData) {
                    newBuildingsData[buildingName].sort((a, b) => b.floor - a.floor);
                }
                setAllRoomsData(roomsById);
                setBuildings(newBuildingsData);
                const buildingKeys = Object.keys(newBuildingsData);
                if (buildingKeys.length > 0 && (!selectedBuilding || !newBuildingsData[selectedBuilding])) {
                    setSelectedBuilding(buildingKeys[0]);
                }
            } else {
                throw new Error(apiResponse.message || "Failed to fetch rooms: Invalid data format");
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [mapApiRoomToComponentRoom, selectedBuilding]);

    useEffect(() => {
        fetchAllRooms();
    }, [fetchAllRooms]);

    const handleSaveChanges = async () => {
        if (!editableRoomDetails || !selectedRoom) {
            setError("No room selected or details to save.");
            return;
        }
        setActionLoading(true);
        setError(null);
        const roomPatchPayload = mapComponentDataToPatchDto(editableRoomDetails);
        try {
            const response = await fetch(`${API_ROOM_URL}/${selectedRoom}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomPatchPayload),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to save changes.');
            }
            const updatedRoomFromApi = await response.json();
            if (updatedRoomFromApi.status === "OK" && updatedRoomFromApi.payload) {
                const fullyUpdatedRoom = mapApiRoomToComponentRoom(updatedRoomFromApi.payload);
                setAllRoomsData(prev => ({ ...prev, [selectedRoom]: fullyUpdatedRoom }));
                setRoomDetails(fullyUpdatedRoom);
                setShowSuccessAlert(true);
                setIsEditing(false);
            } else {
                 throw new Error(updatedRoomFromApi.message || "Save operation returned unexpected format.");
            }
        } catch (error) {
            console.error("Failed to save room details:", error);
            setError(error.message);
        } finally {
            setActionLoading(false);
        }
    };
    
    // --- UI State Handlers ---
    const handleRoomClick = (roomId) => {
        setSelectedRoom(roomId);
        setIsEditing(false);
        const data = allRoomsData[roomId];
        if (data) {
            setRoomDetails(data);
            setEditableRoomDetails({ ...data }); 
        } else {
            setError("Room details not found in local data.");
            setRoomDetails(null);
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
                setEditableRoomDetails({ ...roomDetails });
            }
        }
    };

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setEditableRoomDetails((prevDetails) => ({
            ...prevDetails,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const floors = useMemo(() => buildings[selectedBuilding] || [], [buildings, selectedBuilding]);

    // --- JSX RENDER ---
    const textLabelRoom = "font-medium text-base leading-7 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueRoomDisplay = "font-medium text-base leading-7 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const textLabelDefault = "font-medium text-sm leading-6 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueDefaultDisplay = "font-medium text-sm leading-6 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const inputContainerSizeDefault = "w-full sm:w-[132px] h-[40px]";
    const inputStyle = "py-[9px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const equipmentInputContainerSize = "w-full sm:w-[132px] h-[72px]";
    const textareaStyle = "py-[10px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-500 scrollbar-track-slate-100 dark:scrollbar-track-slate-800";

    return (
        <>
            {showSuccessAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <SuccessAlert
                        title="Action Successful"
                        messageLine1={`Room ${roomDetails?.name || ''} has been updated.`}
                        onConfirm={() => setShowSuccessAlert(false)}
                        onClose={() => setShowSuccessAlert(false)}
                    />
                </div>
            )}

            <div className='p-4 sm:p-6 min-h-full'>
                <div className="mb-4 w-full">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room Management</h2>
                    {error && (
                        <div className="mt-3 p-2 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200">
                            Error: {error}
                            <button onClick={() => setError(null)} className="ml-4 font-bold hover:text-red-900 dark:hover:text-red-100">Dismiss</button>
                        </div>
                    )}
                    <hr className="border-t border-slate-300 dark:border-slate-700 mt-3" />
                </div>
                
                {loading && !Object.keys(allRoomsData).length ? (
                    <div className="text-center text-slate-500 dark:text-slate-400 py-10">Loading rooms...</div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <select value={selectedBuilding} onChange={handleBuildingChange} disabled={Object.keys(buildings).length === 0}
                                    className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50">
                                    {Object.keys(buildings).length === 0 ? <option value="">No Buildings Available</option> : Object.keys(buildings).map((building) => (
                                        <option key={building} value={building}>{building}</option>
                                    ))}
                                </select>
                                <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                            </div>
                            <div className="space-y-4">
                                {floors.map(({ floor, rooms }) => (
                                    <div key={`${selectedBuilding}-${floor}`} className="space-y-3">
                                        <div className="floor-section">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Floor {floor}</h4>
                                                <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                                            </div>
                                            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 sm:gap-4">
                                                {rooms.map((roomId) => {
                                                    const room = allRoomsData[roomId];
                                                    if (!room) return null; 
                                                    return (
                                                        <div key={roomId}
                                                            className={`h-[90px] sm:h-[100px] border rounded-md flex flex-col cursor-pointer transition-all duration-150 shadow-sm hover:shadow-md bg-white dark:bg-slate-800 ${selectedRoom === roomId && !isEditing ? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-500" : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"}`}
                                                            onClick={() => handleRoomClick(roomId)}>
                                                            <div className={`h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700`}>
                                                                <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 ${room.isAvailable === false ? 'bg-red-500' : (selectedRoom === roomId && !isEditing ? 'bg-blue-500' : 'bg-green-500')} rounded-full`} title={room.isAvailable === false ? "Not Available" : "Available"}></div>
                                                                <span className={`ml-3 text-xs sm:text-sm font-medium truncate ${selectedRoom === roomId && !isEditing ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{room.name || roomId}</span>
                                                            </div>
                                                            <div className={`flex-1 rounded-b-md p-2 flex flex-col justify-center items-center bg-white dark:bg-slate-800`}>
                                                                <span className={`text-xs text-slate-500 dark:text-slate-400 ${selectedRoom === roomId && !isEditing ? 'text-slate-600 dark:text-slate-300' : ''}`}>Capacity: {room.capacity}</span>
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
                                <h3 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">Room Details</h3>
                                <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                            </div>
                            <div className="flex flex-col items-start gap-6 w-full min-h-[420px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
                                {actionLoading && !isEditing ? (
                                    <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Loading...</div>
                                ) : roomDetails ? (
                                    <>
                                        <div className="flex flex-col items-start self-stretch w-full flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-700 pr-1">
                                            <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                                                {/* Details Rows Here */}
                                                <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelRoom}>Room</span></div>
                                                    <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                                                        {isEditing && editableRoomDetails ? (
                                                            <div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="text" name="name" value={editableRoomDetails.name || ''} onChange={handleInputChange} className={inputStyle} /></div>
                                                        ) : (<span className={textValueRoomDisplay}>{roomDetails.name}</span>)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Building</span></div>
                                                    <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                                                        {isEditing && editableRoomDetails ? (
                                                            <div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="text" name="building" value={editableRoomDetails.building || ''} onChange={handleInputChange} className={inputStyle} /></div>
                                                        ) : (<span className={textValueDefaultDisplay}>{roomDetails.building}</span>)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Floor</span></div>
                                                    <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                                                        {isEditing && editableRoomDetails ? (
                                                            <div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="number" name="floor" value={editableRoomDetails.floor || ''} onChange={handleInputChange} className={inputStyle} /></div>
                                                        ) : (<span className={textValueDefaultDisplay}>{roomDetails.floor}</span>)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Capacity</span></div>
                                                    <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                                                        {isEditing && editableRoomDetails ? (
                                                            <div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="number" name="capacity" value={editableRoomDetails.capacity || ''} onChange={handleInputChange} className={inputStyle} /></div>
                                                        ) : (<span className={textValueDefaultDisplay}>{roomDetails.capacity}</span>)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Type</span></div>
                                                    <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                                                        {isEditing && editableRoomDetails ? (
                                                            <div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="text" name="roomType" value={editableRoomDetails.roomType || ''} onChange={handleInputChange} placeholder="e.g. Lecture Hall, Lab" className={inputStyle} /></div>
                                                        ) : (<span className={textValueDefaultDisplay}>{roomDetails.roomType || 'N/A'}</span>)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Available</span></div>
                                                    <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                                                        {isEditing && editableRoomDetails ? (
                                                            <input type="checkbox" name="isAvailable" checked={!!editableRoomDetails.isAvailable} onChange={handleInputChange} className="form-checkbox h-5 w-5 text-blue-600 rounded border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-blue-500" />
                                                        ) : (<span className={textValueDefaultDisplay}>{roomDetails.isAvailable ? 'Yes' : 'No'}</span>)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-row items-start self-stretch w-full min-h-[92px] hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px] pt-5"><span className={textLabelDefault}>Equipment</span></div>
                                                    <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2 pt-3">
                                                        {isEditing && editableRoomDetails ? (
                                                            <div className={`flex flex-col items-start self-stretch ${equipmentInputContainerSize}`}><textarea name="equipment" value={editableRoomDetails.equipment} onChange={handleInputChange} className={textareaStyle} placeholder="Item1, Item2, ..."></textarea></div>
                                                        ) : (<span className={`${textValueDefaultDisplay} pt-1`}>{roomDetails.equipment}</span>)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="flex flex-row justify-center items-center pyx-3 px-5 sm:px-6 gap-2 w-full h-[48px] sm:h-[50px] bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg rounded-md text-white font-semibold text-sm sm:text-base self-stretch disabled:opacity-60 transition-all duration-150"
                                            onClick={handleEditToggle}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading && isEditing ? "Saving..." : isEditing ? "Save Changes" : "Edit Room"}
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Select a room to view details.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default function AdminRoomPage() {
>>>>>>> Stashed changes
    return (
        <AdminLayout activeItem="room" pageTitle="Room Management">
            <Suspense fallback={<RoomPageSkeleton />}>
                {/* The Client Component is rendered here, receiving the server-fetched data as a prop.
                  The browser gets the pre-rendered HTML for the list of rooms, making the initial
                  load appear instant. Then, the client-side JavaScript will load to make it interactive.
                */}
                <RoomClientView initialAllRoomsData={allRoomsData} />
            </Suspense>
        </AdminLayout>
    );
}