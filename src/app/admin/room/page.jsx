'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import SuccessAlert from './components/UpdateSuccessComponent';
import RoomPageSkeleton from './components/RoomPageSkeleton';
import * as roomService from '@/services/roomService';

const RoomViewContent = () => {
    // --- Styles ---
    const textLabelRoom = "font-medium text-base leading-7 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueRoomDisplay = "font-medium text-base leading-7 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const textLabelDefault = "font-medium text-sm leading-6 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueDefaultDisplay = "font-medium text-sm leading-6 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const inputContainerSizeDefault = "w-full sm:w-[132px] h-[40px]";
    const inputStyle = "py-[9px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const equipmentInputContainerSize = "w-full sm:w-[132px] h-[72px]";
    const textareaStyle = "py-[10px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-500 scrollbar-track-slate-100 dark:scrollbar-track-slate-800";
    
    // --- State Variables ---
    const [allRoomsById, setAllRoomsById] = useState({});
    const [buildingsLayout, setBuildingsLayout] = useState({});
    const [selectedBuilding, setSelectedBuilding] = useState("");
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableRoomDetails, setEditableRoomDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // --- Data Processing and Fetching ---
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const roomsFromApi = await roomService.getAllRooms();

                // 1. Create a lookup map of rooms by their ID for easy access
                const roomsById = roomsFromApi.reduce((acc, room) => {
                    acc[room.roomId] = room;
                    return acc;
                }, {});
                setAllRoomsById(roomsById);
                
                // 2. Dynamically generate the building/floor layout from the API data
                const groupedByBuilding = roomsFromApi.reduce((acc, room) => {
                    const building = room.buildingName || 'Uncategorized';
                    if (!acc[building]) acc[building] = [];
                    acc[building].push(room);
                    return acc;
                }, {});

                const layout = {};
                for (const buildingName in groupedByBuilding) {
                    const roomsInBuilding = groupedByBuilding[buildingName];
                    const groupedByFloor = roomsInBuilding.reduce((acc, room) => {
                        const floor = room.floor || 'N/A';
                        if (!acc[floor]) acc[floor] = { floor, rooms: [] };
                        acc[floor].rooms.push(room.roomId); // Use roomId for the layout, as in original code
                        return acc;
                    }, {});
                    layout[buildingName] = Object.values(groupedByFloor).sort((a, b) => b.floor - a.floor);
                }
                setBuildingsLayout(layout);

                // 3. Set the default selected building
                if (Object.keys(layout).length > 0) {
                    setSelectedBuilding(Object.keys(layout)[0]);
                }
            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch room data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // --- Handlers ---
    const handleRoomClick = (roomId) => {
        setSelectedRoomId(roomId);
        setIsEditing(false);
    };

    const handleBuildingChange = (event) => {
        setSelectedBuilding(event.target.value);
        setSelectedRoomId(null);
        setIsEditing(false);
    };

    const handleEditToggle = () => {
        if (isEditing) {
            handleSaveChanges();
        } else if (roomDetails) {
            setIsEditing(true);
            setEditableRoomDetails({ ...roomDetails });
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setEditableRoomDetails((prev) => ({
            ...prev,
            [name]: name === 'floor' || name === 'capacity' ? (value === '' ? '' : parseInt(value, 10)) : value,
        }));
    };

    const handleSaveChanges = async () => {
        if (!editableRoomDetails) return;
        setIsLoading(true);
        try {
            // Construct the payload with the keys the backend API expects
            const payload = {
                roomName: editableRoomDetails.roomName,
                buildingName: editableRoomDetails.buildingName,
                floor: Number(editableRoomDetails.floor) || null,
                capacity: Number(editableRoomDetails.capacity) || 0,
                type: editableRoomDetails.type,
                equipment: editableRoomDetails.equipment,
            };

            const updatedRoom = await roomService.updateRoom(selectedRoomId, payload);
            
            setAllRoomsById(prev => ({ ...prev, [updatedRoom.roomId]: updatedRoom }));
            setIsEditing(false);
            setShowSuccessAlert(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const roomDetails = allRoomsById[selectedRoomId];
    const floors = buildingsLayout[selectedBuilding] || [];
    
    if (isLoading && Object.keys(allRoomsById).length === 0) {
        return <RoomPageSkeleton />;
    }

    return (
        <>
            {showSuccessAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <SuccessAlert
                        title="Room Updated"
                        messageLine1={`Room ${roomDetails?.roomName || ''} has been updated successfully.`}
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
                {error && <p className="text-red-500">{error}</p>}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <select value={selectedBuilding} onChange={handleBuildingChange} className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-md px-3 py-2">
                                {Object.keys(buildingsLayout).map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                        </div>
                        <div className="space-y-4">
                            {floors.map(({ floor, rooms }) => (
                                <div key={floor} className="space-y-3">
                                    <div className="floor-section">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Floor {floor}</h4>
                                            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                                        </div>
                                        <div className="grid xl:grid-cols-5 lg:grid-cols-2 md:grid-cols-2 gap-3">
                                            {rooms.map((roomId) => {
                                                const room = allRoomsById[roomId];
                                                if (!room) return null;
                                                return (
                                                    <div
                                                        key={roomId}
                                                        className={`h-[100px] border rounded-md flex flex-col cursor-pointer transition-all ${selectedRoomId === roomId ? "border-blue-500 ring-2 ring-blue-500" : "border-slate-300 dark:border-slate-700"}`}
                                                        onClick={() => handleRoomClick(roomId)}
                                                    >
                                                        <div className="h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b bg-slate-50 dark:bg-slate-700">
                                                            <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 ${room.isAvailable ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                                                            <span className={`ml-3 text-sm font-medium ${selectedRoomId === roomId ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{room.roomName}</span>
                                                        </div>
                                                        <div className="flex-1 rounded-b-md p-2 flex flex-col justify-center items-center bg-white dark:bg-slate-800">
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">Capacity: {room.capacity}</span>
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

                    <div className="w-full lg:w-[320px] shrink-0">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Details</h3>
                            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                        </div>
                        <div className="flex flex-col items-start gap-6 w-full min-h-[420px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
                            {roomDetails ? (
                                <>
                                    <div className="flex flex-col items-start self-stretch w-full flex-grow overflow-y-auto scrollbar-thin pr-1">
                                        <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                                            <div className="flex flex-row items-center w-full min-h-[56px] border-b p-4"><div className="w-[120px]"><span className={textLabelRoom}>Room</span></div><div className="flex-1">{isEditing ? <input type="text" name="roomName" value={editableRoomDetails.roomName} onChange={handleInputChange} className={inputStyle} /> : <span className={textValueRoomDisplay}>{roomDetails.roomName}</span>}</div></div>
                                            <div className="flex flex-row items-center w-full min-h-[56px] border-b p-4"><div className="w-[120px]"><span className={textLabelDefault}>Building</span></div><div className="flex-1">{isEditing ? <input type="text" name="buildingName" value={editableRoomDetails.buildingName} onChange={handleInputChange} className={inputStyle} /> : <span className={textValueDefaultDisplay}>{roomDetails.buildingName}</span>}</div></div>
                                            <div className="flex flex-row items-center w-full min-h-[56px] border-b p-4"><div className="w-[120px]"><span className={textLabelDefault}>Floor</span></div><div className="flex-1">{isEditing ? <input type="number" name="floor" value={editableRoomDetails.floor} onChange={handleInputChange} className={inputStyle} /> : <span className={textValueDefaultDisplay}>{roomDetails.floor || 'N/A'}</span>}</div></div>
                                            <div className="flex flex-row items-center w-full min-h-[56px] border-b p-4"><div className="w-[120px]"><span className={textLabelDefault}>Capacity</span></div><div className="flex-1">{isEditing ? <input type="number" name="capacity" value={editableRoomDetails.capacity} onChange={handleInputChange} className={inputStyle} /> : <span className={textValueDefaultDisplay}>{roomDetails.capacity}</span>}</div></div>
                                            <div className="flex flex-row items-start w-full min-h-[92px] p-4"><div className="w-[120px] pt-2"><span className={textLabelDefault}>Equipment</span></div><div className="flex-1">{isEditing ? <textarea name="equipment" value={editableRoomDetails.equipment} onChange={handleInputChange} className={textareaStyle}></textarea> : <span className={`${textValueDefaultDisplay} pt-1`}>{roomDetails.equipment || 'None'}</span>}</div></div>
                                        </div>
                                    </div>
                                    <button
                                        className="w-full h-[50px] bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold disabled:opacity-60"
                                        onClick={handleEditToggle}
                                        disabled={isLoading}
                                    >
                                        {isLoading && isEditing ? "Saving..." : isEditing ? "Save Changes" : "Edit Room"}
                                    </button>
                                </>
                            ) : (
                                <div className="text-center text-slate-500 w-full flex-grow flex items-center justify-center">Select a room to view details.</div>
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
        <AdminLayout activeItem="room" pageTitle="Room Management">
            <RoomViewContent />
        </AdminLayout>
    );
}