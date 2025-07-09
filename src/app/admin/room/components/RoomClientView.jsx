'use client';

import { useState, useEffect } from 'react';
import SuccessAlert from './UpdateSuccessComponent';
import { updateRoom } from '@/services/room.service';
import RoomPageSkeleton from './RoomPageSkeleton'; // Import skeleton for loading state

export default function RoomClientView({ initialAllRoomsData, buildingLayout }) {
    // --- Style Constants ---
    const textLabelRoom = "font-medium text-base leading-7 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueRoomDisplay = "font-medium text-base leading-7 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const textLabelDefault = "font-medium text-sm leading-6 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueDefaultDisplay = "font-medium text-sm leading-6 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const inputContainerSizeDefault = "w-full sm:w-[132px] h-[40px]";
    const equipmentInputContainerSize = "w-full sm:w-[132px] h-[72px]";
    const inputStyle = "py-[9px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const textareaStyle = "py-[10px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-500 scrollbar-track-slate-100 dark:scrollbar-track-slate-800";

    // --- Component State ---
    const [allRoomsData, setAllRoomsData] = useState(initialAllRoomsData);
    const [buildings, setBuildings] = useState(buildingLayout);
    const [selectedBuilding, setSelectedBuilding] = useState(Object.keys(buildingLayout)[0] || "");
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableRoomDetails, setEditableRoomDetails] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState({ field: '', message: '' });

    // --- Effects ---
    // Update main state when initial props change
    useEffect(() => {
        setAllRoomsData(initialAllRoomsData);
        setBuildings(buildingLayout);
        const firstBuilding = Object.keys(buildingLayout)[0] || "";
        setSelectedBuilding(firstBuilding);
        resetSelection();
    }, [initialAllRoomsData, buildingLayout]);

    // --- Event Handlers ---
    const resetSelection = () => { setSelectedRoomId(null); setRoomDetails(null); setIsEditing(false); };
    const handleBuildingChange = (event) => { setSelectedBuilding(event.target.value); resetSelection(); };

    const handleRoomClick = (roomId) => {
        setSelectedRoomId(roomId);
        setIsEditing(false);
        setLoading(true);
        setError('');
        setFormError({ field: '', message: '' });
        try {
            const data = allRoomsData[roomId];
            if (!data) throw new Error("Room data not found.");
            setRoomDetails(data);
        } catch (err) {
            setError("Could not load room details.");
            setRoomDetails(null);
        } finally {
            setLoading(false);
        }
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

    const validateRoomName = (newName) => {
        const trimmedName = newName.trim();
        if (!trimmedName) {
            setFormError({ field: 'name'});
            return false;
        }

        const isDuplicate = Object.values(allRoomsData).some(
            (room) => room.id !== selectedRoomId && room.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (isDuplicate) {
            setFormError({ field: 'name'});
            return false;
        }

        setFormError({ field: '', message: '' });
        return true;
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        // Clear error message when user starts typing in the problematic field
        if (name === 'name' && formError.field === 'name') {
            setFormError({ field: '', message: '' });
        }

        setEditableRoomDetails((prev) => ({
            ...prev,
            [name]: (name === 'capacity') ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleSaveChanges = async () => {
        if (!editableRoomDetails) return;

        // Validation is now only performed on save.
        if (!validateRoomName(editableRoomDetails.name)) {
            return;
        }

        setLoading(true);
        setError('');
        const roomUpdateDto = {
            roomName: editableRoomDetails.name,
            capacity: editableRoomDetails.capacity,
            type: editableRoomDetails.type,
            equipment: editableRoomDetails.equipment,
        };

        try {
            await updateRoom(selectedRoomId, roomUpdateDto);
            const updatedLocalData = { ...editableRoomDetails, equipment: editableRoomDetails.equipment.split(',').map(e => e.trim()).filter(Boolean), };
            setRoomDetails(updatedLocalData);
            setAllRoomsData(prev => ({ ...prev, [selectedRoomId]: updatedLocalData }));
            setIsEditing(false);
            setShowSuccessAlert(true);
        } catch (err) {
            setError(err.message || 'An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

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

    const floors = buildings[selectedBuilding] || [];

    return (
        <>
            {showSuccessAlert && ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"><SuccessAlert show={showSuccessAlert} title="Room Updated" messageLine1={`Room ${roomDetails?.name || ''} has been updated successfully.`} messageLine2="You can continue managing rooms." confirmButtonText="OK" onConfirm={() => setShowSuccessAlert(false)} onClose={() => setShowSuccessAlert(false)}/></div> )}
            <div className='p-4 sm:p-6 min-h-full'>
                <div className="mb-4 w-full"><h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room</h2><hr className="border-t border-slate-300 dark:border-slate-700 mt-3" /></div>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <select value={selectedBuilding} onChange={handleBuildingChange} className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                {Object.keys(buildings).map((building) => <option key={building} value={building}>{building}</option>)}
                            </select>
                            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                        </div>
                        <div className="space-y-4">
                            {floors.map(({ floor, rooms }) => (
                                <div key={floor} className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2"><h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Floor {floor}</h4><hr className="flex-1 border-t border-slate-300 dark:border-slate-700" /></div>
                                    <div className={`grid gap-3 sm:gap-4 ${getGridColumnClasses(selectedBuilding, floor)}`}>
                                        {rooms.map((roomName) => {
                                            const room = Object.values(allRoomsData).find(r => r.name === roomName);
                                            if (!room) return null;
                                            const isSelected = selectedRoomId === room.id;
                                            return (
                                                <div key={room.id} className={`h-[90px] sm:h-[100px] border rounded-md flex flex-col transition-all duration-150 shadow-sm cursor-pointer hover:shadow-md bg-white dark:bg-slate-800 ${getRoomColSpan(selectedBuilding, room.name)} ${isSelected ? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-500" : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"}`}
                                                    onClick={() => handleRoomClick(room.id)}>
                                                    <div className={`h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b ${isSelected ? 'border-b-transparent' : 'border-slate-200 dark:border-slate-600'} bg-slate-50 dark:bg-slate-700`}>
                                                        <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{room.name}</span>
                                                    </div>
                                                    <div className="flex-1 rounded-b-md p-2 flex flex-col justify-center items-center bg-white dark:bg-slate-800">
                                                        <span className={`text-xs text-slate-500 dark:text-slate-400 ${isSelected ? "text-slate-600 dark:text-slate-300" : ""}`}>Capacity: {room.capacity}</span>
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
                            {loading && !isEditing ? ( <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Loading...</div> ) : roomDetails ? (
                                <>
                                    <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelRoom}>Room</span></div>
                                            <div className="px-2 sm:px-3 flex-1 py-2">
                                                {isEditing && editableRoomDetails ? (
                                                    <div className="flex flex-col">
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={editableRoomDetails.name}
                                                            onChange={handleInputChange}
                                                            className={`${inputStyle} ${formError.field === 'name' ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className={textValueRoomDisplay}>{roomDetails.name}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Building</span></div><div className="px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.building}</span></div></div>
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Floor</span></div><div className="px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.floor}</span></div></div>
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Capacity</span></div><div className="px-2 sm:px-3 flex-1 py-2">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="number" name="capacity" value={editableRoomDetails.capacity} onChange={handleInputChange} className={inputStyle} /></div>) : (<span className={textValueDefaultDisplay}>{roomDetails.capacity}</span>)}</div></div>
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Type</span></div><div className="px-2 sm:px-3 flex-1 py-2">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="text" name="type" value={editableRoomDetails.type} onChange={handleInputChange} className={inputStyle} /></div>) : (<span className={textValueDefaultDisplay}>{roomDetails.type}</span>)}</div></div>
                                        <div className="flex items-start self-stretch w-full min-h-[92px]"><div className="p-3 sm:p-4 w-[120px] pt-5"><span className={textLabelDefault}>Equipment</span></div><div className="px-2 sm:px-3 flex-1 py-2 pt-3">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${equipmentInputContainerSize}`}><textarea name="equipment" value={editableRoomDetails.equipment} onChange={handleInputChange} className={textareaStyle} placeholder="Item1, Item2..."></textarea></div>) : (<span className={`${textValueDefaultDisplay} pt-1`}>{Array.isArray(roomDetails.equipment) ? roomDetails.equipment.join(", ") : ''}</span>)}</div></div>
                                    </div>
                                    <button
                                        className="flex justify-center items-center py-3 px-6 gap-2 w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-md rounded-md text-white font-semibold text-sm self-stretch disabled:opacity-60"
                                        onClick={handleEditToggle}
                                        disabled={(loading && isEditing) || !!formError.field}>
                                        {loading && isEditing ? "Saving..." : isEditing ? "Save Changes" : "Edit Room"}
                                    </button>
                                </>
                            ) : ( <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Select a room to view details.</div> )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}