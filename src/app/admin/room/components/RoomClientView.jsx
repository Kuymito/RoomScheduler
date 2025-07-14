'use client';

import { useState, useEffect, useMemo } from 'react';
import Toast from '@/components/Toast';
import { getAllRooms, updateRoom } from '@/services/room.service';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import RoomPageSkeleton from './RoomPageSkeleton'; // Import the skeleton

// SWR fetcher for rooms
const roomsFetcher = (token) => getAllRooms(token);

/**
 * An internal component to handle the data-dependent rendering.
 * This component will only be rendered when the session is authenticated and data is ready.
 */
const RoomView = () => {
    // --- Style Constants ---
    const textLabelRoom = "font-medium text-base leading-7 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueRoomDisplay = "font-medium text-base leading-7 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const textLabelDefault = "font-medium text-sm leading-6 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
    const textValueDefaultDisplay = "font-medium text-sm leading-6 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
    const inputContainerSizeDefault = "w-full sm:w-[132px] h-[40px]";
    const equipmentInputContainerSize = "w-full sm:w-[132px] h-[72px]";
    const inputStyle = "py-[9px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const textareaStyle = "py-[10px] px-3 w-full h-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-[6px] font-normal text-sm leading-[22px] text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-500 scrollbar-track-slate-100 dark:scrollbar-track-slate-800";
    
    const { data: session } = useSession();

    // The key is guaranteed to be valid here because RoomView is only rendered when authenticated.
    const { data: swrRooms, error: swrError, mutate: mutateRooms } = useSWR(
        ['/api/v1/room', session.accessToken],
        () => roomsFetcher(session.accessToken),
        {
            suspense: true, // Let Suspense boundary handle the loading state
        }
    );

    // Process the data directly from the SWR response.
    // useMemo ensures this logic only re-runs when swrRooms changes.
    const { allRoomsData, buildings } = useMemo(() => {
        if (!swrRooms) return { allRoomsData: {}, buildings: {} };

        const newRoomsDataMap = {};
        const newPopulatedLayout = {};

        swrRooms.forEach(room => {
            const { roomId, roomName, buildingName, floor, capacity, type, equipment } = room;
            if (!newPopulatedLayout[buildingName]) {
                newPopulatedLayout[buildingName] = [];
            }
            let floorObj = newPopulatedLayout[buildingName].find(f => f.floor === floor);
            if (!floorObj) {
                floorObj = { floor: floor, rooms: [] };
                newPopulatedLayout[buildingName].push(floorObj);
            }
            if (!floorObj.rooms.includes(roomId)) {
                 floorObj.rooms.push(roomId);
            }
            newRoomsDataMap[roomId] = {
                id: roomId, name: roomName, building: buildingName, floor: floor,
                capacity: capacity, type: type,
                equipment: typeof equipment === 'string' ? equipment.split(',').map(e => e.trim()).filter(Boolean) : [],
            };
        });

        for (const building in newPopulatedLayout) {
            newPopulatedLayout[building].sort((a, b) => b.floor - a.floor);
        }
        
        return { allRoomsData: newRoomsDataMap, buildings: newPopulatedLayout };
    }, [swrRooms]);

    const [selectedBuilding, setSelectedBuilding] = useState(() => Object.keys(buildings)[0] || "");
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableRoomDetails, setEditableRoomDetails] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const [formError, setFormError] = useState({ field: '', message: '' });

    // This effect will run when the building data changes, ensuring the selected building is valid.
    useEffect(() => {
        const buildingKeys = Object.keys(buildings);
        if (buildingKeys.length > 0 && !buildingKeys.includes(selectedBuilding)) {
            setSelectedBuilding(buildingKeys[0]);
        }
    }, [buildings, selectedBuilding]);

    const resetSelection = () => { setSelectedRoomId(null); setRoomDetails(null); setIsEditing(false); };
    const handleBuildingChange = (event) => { setSelectedBuilding(event.target.value); resetSelection(); };

    const handleRoomClick = (roomId) => {
        setSelectedRoomId(roomId);
        setIsEditing(false);
        setToast({ show: false, message: '', type: 'info' });
        setFormError({ field: '', message: '' });
        const data = allRoomsData[roomId];
        if (!data) {
            setToast({ show: true, message: 'Could not load room details.', type: 'error' });
            setRoomDetails(null);
        } else {
            setRoomDetails(data);
        }
    };

    const handleEdit = () => {
        if (roomDetails) {
            setIsEditing(true);
            setEditableRoomDetails({
                ...roomDetails,
                equipment: Array.isArray(roomDetails.equipment) ? roomDetails.equipment.join(", ") : "",
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditableRoomDetails(null);
        setFormError({ field: '', message: '' });
        setToast({ show: false, message: '', type: 'info' });
    };

    const validateRoomName = (newName) => {
        const trimmedName = newName.trim();
        if (!trimmedName) {
            setFormError({ field: 'name', message: 'Room name cannot be empty.' });
            return false;
        }
        const isDuplicate = Object.values(allRoomsData).some(
            (room) => room.id !== selectedRoomId && room.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (isDuplicate) {
            setFormError({ field: 'name', message: 'Name already exists.' });
            return false;
        }
        setFormError({ field: '', message: '' });
        return true;
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'name' && formError.field === 'name') {
            setFormError({ field: '', message: '' });
        }
        
        if (name === 'capacity') {
            // Enforce a maximum length of 3 for the capacity field.
            // The maxLength attribute does not work for inputs of type="number".
            const slicedValue = value.slice(0, 3);
            setEditableRoomDetails((prev) => ({
                ...prev,
                [name]: parseInt(slicedValue, 10) || 0,
            }));
        } else {
            setEditableRoomDetails((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSaveChanges = async () => {
        if (!editableRoomDetails) return;
        if (!validateRoomName(editableRoomDetails.name)) return;
        setLoading(true);
        setToast({ show: false, message: '', type: 'info' });
        const roomUpdateDto = {
            roomName: editableRoomDetails.name,
            capacity: editableRoomDetails.capacity,
            type: editableRoomDetails.type,
            equipment: editableRoomDetails.equipment,
        };
        try {
            await updateRoom(selectedRoomId, roomUpdateDto);
            mutateRooms(); 
            setIsEditing(false);
            setToast({ show: true, message: `Room '${roomUpdateDto.roomName}' updated successfully.`, type: 'success' });
        } catch (err) {
            setToast({ show: true, message: err.message || 'An error occurred while saving.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getRoomColSpan = (room) => {
        if (!room) return "";
        const id = room.id;
        if (id === 10 && room.building === "Building A") return "col-span-2";
        if (id === 34 && room.building === "Building B") return "col-span-4";
        if ([47, 48, 49].includes(id) && room.building === "Building D") return "col-span-full";
        return "";
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

    const floors = buildings[selectedBuilding] || [];

    if (swrError) {
        return <div className="p-6 text-center text-red-500">Error loading room data: {swrError.message}</div>;
    }

    return (
        <>
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
            <div className='p-4 sm:p-6 min-h-full'>
                <div className="mb-4 w-full"><h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room</h2><hr className="border-t border-slate-300 dark:border-slate-700 mt-3" /></div>
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
                                        {rooms.map((roomId) => {
                                            const room = allRoomsData[roomId];
                                            if (!room) return null;
                                            const isSelected = selectedRoomId === room.id;
                                            return (
                                                <div key={room.id} className={`h-[90px] sm:h-[100px] border rounded-md flex flex-col transition-all duration-150 shadow-sm cursor-pointer hover:shadow-md bg-white dark:bg-slate-800 ${getRoomColSpan(room)} ${isSelected ? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-500" : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"}`}
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
                            {roomDetails ? (
                                <>
                                    <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelRoom}>Room</span></div>
                                            <div className="px-2 sm:px-3 flex-1 py-2">
                                                {isEditing && editableRoomDetails ? (
                                                    <div className="flex flex-col">
                                                        <input type="text" name="name" value={editableRoomDetails.name} onChange={handleInputChange} className={`${inputStyle} ${formError.field === 'name' ? 'border-red-500 ring-1 ring-red-500' : ''}`} maxLength={20}/>
                                                        {formError.field === 'name' && <p className="text-red-500 text-xs mt-1">{formError.message}</p>}
                                                    </div>
                                                ) : (<span className={textValueRoomDisplay}>{roomDetails.name}</span>)}
                                            </div>
                                        </div>
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Building</span></div><div className="px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.building}</span></div></div>
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Floor</span></div><div className="px-2 sm:px-3 flex-1 py-2"><span className={textValueDefaultDisplay}>{roomDetails.floor}</span></div></div>
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Capacity</span></div><div className="px-2 sm:px-3 flex-1 py-2">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input maxLength={3} type="number" name="capacity" value={editableRoomDetails.capacity} onChange={handleInputChange} className={inputStyle} /></div>) : (<span className={textValueDefaultDisplay}>{roomDetails.capacity}</span>)}</div></div>
                                        <div className="flex items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700"><div className="p-3 sm:p-4 w-[120px]"><span className={textLabelDefault}>Type</span></div><div className="px-2 sm:px-3 flex-1 py-2">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input maxLength={30}  type="text" name="type" value={editableRoomDetails.type} onChange={handleInputChange} className={inputStyle} /></div>) : (<span className={textValueDefaultDisplay}>{roomDetails.type}</span>)}</div></div>
                                        <div className="flex items-start self-stretch w-full min-h-[92px]"><div className="p-3 sm:p-4 w-[120px] pt-5"><span className={textLabelDefault}>Equipment</span></div><div className="px-2 sm:px-3 flex-1 py-2 pt-3">{isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${equipmentInputContainerSize}`}><textarea maxLength={30} name="equipment" value={editableRoomDetails.equipment} onChange={handleInputChange} className={textareaStyle} placeholder="Item1, Item2..."></textarea></div>) : (<span className={`${textValueDefaultDisplay} pt-1`}>{Array.isArray(roomDetails.equipment) ? roomDetails.equipment.join(", ") : ''}</span>)}</div></div>
                                    </div>
                                    <div className="w-full mt-auto">
                                        {isEditing ? (
                                            <div className="flex justify-center gap-3">
                                                <button onClick={handleCancel} className="px-6 py-3 w-full h-12 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" disabled={loading}>Cancel</button>
                                                <button onClick={handleSaveChanges} className="px-6 py-3 w-full h-12 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400" disabled={loading || !!formError.field}>{loading ? "Saving..." : "Save"}</button>
                                            </div>
                                        ) : (
                                            <button className="flex justify-center items-center py-3 px-6 gap-2 w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-md rounded-md text-white font-semibold text-sm self-stretch disabled:opacity-60" onClick={handleEdit} disabled={!roomDetails}>Edit Room</button>
                                        )}
                                    </div>
                                </>
                            ) : ( <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">Select a room to view details.</div> )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/**
 * This is the main export. It handles the session loading state, ensuring
 * the skeleton is shown correctly during session validation.
 */
export default function RoomClientView() {
    const { status } = useSession();

    if (status === 'loading') {
        // This will be caught by the Suspense boundary in the parent page.
        // It ensures that while the session is being validated, the skeleton is shown.
        return <RoomPageSkeleton />;
    }

    if (status === 'unauthenticated') {
        // Handle case where user is not logged in
        return <div className="p-6 text-center text-red-500">You must be logged in to view this page.</div>;
    }

    // Once authenticated, render the main view component.
    // The <Suspense> boundary in `page.jsx` will handle the data fetching loading state for RoomView.
    return <RoomView />;
}