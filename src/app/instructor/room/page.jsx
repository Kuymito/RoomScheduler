"use client";

import { useState, useEffect, useRef } from "react";
import InstructorLayout from "@/components/InstructorLayout";
import SuccessAlert from "./components/UpdateSuccessComponent";

// ===================================================================
// --- SKELETON COMPONENTS (No Changes) ---
// ===================================================================

const RoomCardSkeleton = () => (
    <div className="h-[90px] sm:h-[100px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md animate-pulse">
        <div className="h-[30px] bg-slate-100 dark:bg-slate-700 rounded-t-md border-b border-slate-200 dark:border-slate-600"></div>
        <div className="p-2 flex flex-col justify-center items-center gap-2">
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
        </div>
    </div>
);

const RoomSelectionSkeleton = ({ floors = 3, roomsPerFloor = 4 }) => (
    <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
            <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
        </div>
        <div className="space-y-4">
            {Array.from({ length: floors }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                        <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 sm:gap-4">
                        {Array.from({ length: roomsPerFloor }).map((_, j) => (
                            <RoomCardSkeleton key={j} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);


const RoomDetailsSkeleton = () => (
    <div className="flex flex-col items-start gap-6 w-full animate-pulse">
        <div className="flex flex-col items-start self-stretch w-full flex-grow">
            <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md">
                {/* 5 detail rows */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`flex flex-row items-center self-stretch w-full min-h-[56px] ${i < 4 ? 'border-b border-slate-200 dark:border-slate-700' : ''}`}>
                        <div className="p-3 sm:p-4 w-[100px] sm:w-[120px]">
                            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        </div>
                        <div className="px-2 sm:px-3 flex-1 py-2">
                            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="h-[48px] sm:h-[50px] w-full bg-slate-300 dark:bg-slate-700 rounded-md"></div>
    </div>
);


const InstructorRoomViewContent = () => {
  const [selectedBuilding, setSelectedBuilding] = useState("Building A");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(false); // For loading details on click
  const [initialLoading, setInitialLoading] = useState(true); // For initial page load
  const [isEditing, setIsEditing] = useState(false);
  const [editableRoomDetails, setEditableRoomDetails] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // ===================================================================
  // --- UPDATED DUMMY DATA with 'status' field ---
  // ===================================================================
  const initialRoomsData = {
    A1: {id: "A1",name: "Room A1",building: "Building A",floor: 5,capacity: 30,equipment: ["Projector", "Whiteboard", "AC"], status: "Available"},
    A2: {id: "A2",name: "Room A2",building: "Building A",floor: 5,capacity: 20,equipment: ["Whiteboard", "AC"], status: "Unavailable"},
    A3: {id: "A3",name: "Room A3",building: "Building A",floor: 5,capacity: 25,equipment: ["Projector", "AC"], status: "Available"},
    B1: {id: "B1",name: "Room B1",building: "Building A",floor: 4,capacity: 15,equipment: ["Projector", "AC"], status: "Available"},
    B2: {id: "B2",name: "Room B2",building: "Building A",floor: 4,capacity: 20,equipment: ["Whiteboard"], status: "Available"},
    C1: {id: "C1",name: "Room C1",building: "Building A",floor: 3,capacity: 10,equipment: ["AC"], status: "Unavailable"},
    C2: {id: "C2",name: "Room C2",building: "Building A",floor: 3,capacity: 12,equipment: ["Whiteboard", "AC"], status: "Available"},
    D1: {id: "D1",name: "Room D1",building: "Building A",floor: 2,capacity: 8,equipment: ["Projector"], status: "Available"},
    D2: {id: "D2",name: "Room D2",building: "Building A",floor: 2,capacity: 10,equipment: ["Whiteboard"], status: "Unavailable"},
    E1: {id: "E1",name: "Room E1",building: "Building A",floor: 1,capacity: 5,equipment: ["AC"], status: "Available"},
    E2: {id: "E2",name: "Room E2",building: "Building A",floor: 1,capacity: 6,equipment: ["Projector", "Whiteboard"], status: "Available"},
    F1: {id: "F1",name: "Room F1",building: "Building B",floor: 3,capacity: 12,equipment: ["Projector", "Whiteboard"], status: "Available"},
    F2: {id: "F2",name: "Room F2",building: "Building B",floor: 3,capacity: 10,equipment: ["AC"], status: "Unavailable"},
    G1: {id: "G1",name: "Room G1",building: "Building B",floor: 2,capacity: 8,equipment: ["Whiteboard"], status: "Available"},
    G2: {id: "G2",name: "Room G2",building: "Building B",floor: 2,capacity: 6,equipment: ["Projector"], status: "Available"},
    H1: {id: "H1",name: "Room H1",building: "Building B",floor: 1,capacity: 5,equipment: ["AC"], status: "Unavailable"},
    H2: {id: "H2",name: "Room H2",building: "Building B",floor: 1,capacity: 4,equipment: ["Whiteboard"], status: "Available"},
  };

  const [allRoomsData, setAllRoomsData] = useState(initialRoomsData);

  const buildings = {
  "Building A": [{ floor: 5, rooms: ["A1", "A2", "A3"] },{ floor: 4, rooms: ["B1", "B2"] },{ floor: 3, rooms: ["C1", "C2"] },{ floor: 2, rooms: ["D1", "D2"] },{ floor: 1, rooms: ["E1", "E2"] },],
  "Building B": [{ floor: 3, rooms: ["F1", "F2"] },{ floor: 2, rooms: ["G1", "G2"] },{ floor: 1, rooms: ["H1", "H2"] },],
  };

  useEffect(() => {
    // Simulate initial data fetch for the whole page
    const timer = setTimeout(() => {
        setAllRoomsData(initialRoomsData);
        setInitialLoading(false);
    }, 1500); // 1.5-second delay for initial load
    return () => clearTimeout(timer);
  }, []);

  const handleRoomClick = async (roomId) => {
    // Prevent clicking on unavailable rooms
    if (allRoomsData[roomId]?.status === 'Unavailable') return;
    if (selectedRoom === roomId && !isEditing) return; // Don't reload if already selected

    setSelectedRoom(roomId);
    setIsEditing(false);
    setLoading(true);
    setRoomDetails(null); // Clear previous details immediately
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call for details
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
      [name]:
        name === "floor" || name === "capacity"
          ? value === ""
            ? ""
            : parseInt(value, 10)
          : value,
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
      equipment: editableRoomDetails.equipment
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e),
    };
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API
      setRoomDetails(updatedRoomData);
      setAllRoomsData((prevAllRooms) => ({
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 ">
          <SuccessAlert
            title="Request was sent Successfully "
            messageLine1={`Room ${
              roomDetails?.name || ""
            } Your request was sent Successfully `}
            messageLine2=""
            confirmButtonText="Close"
            onConfirm={() => setShowSuccessAlert(false)}
            onClose={() => setShowSuccessAlert(false)}
          />
        </div>
      )}

      <div className="p-4 sm:p-6 min-h-full">
        <div className="mb-4 w-full">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room</h2>
          <hr className="border-t border-slate-300 dark:border-slate-700 mt-3" />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          {initialLoading ? (
            <RoomSelectionSkeleton />
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <select value={selectedBuilding} onChange={handleBuildingChange} className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  {Object.keys(buildings).map((building) => ( <option key={building} value={building}>{building}</option>))}
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
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 sm:gap-4">
                                {rooms.map((roomId) => {
                                    const room = allRoomsData[roomId];
                                    const isAvailable = room?.status === 'Available';
                                    const isSelected = selectedRoom === roomId;

                                    // ===================================================================
                                    // --- UPDATED ROOM CARD ---
                                    // ===================================================================
                                    return (
                                        <div 
                                            key={roomId} 
                                            className={`
                                                h-[90px] sm:h-[100px] border rounded-md flex flex-col transition-all duration-150 shadow-sm
                                                ${isAvailable ? 'cursor-pointer hover:shadow-md bg-white dark:bg-slate-800' : 'cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 opacity-70'}
                                                ${isSelected && !isEditing ? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-500" : isAvailable ? "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600" : "border-slate-200 dark:border-slate-700"}
                                            `}
                                            onClick={() => handleRoomClick(roomId)}
                                        >
                                            <div className={`h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b
                                                ${isSelected && !isEditing ? 'border-b-transparent' : 'border-slate-200 dark:border-slate-600'}
                                                ${isAvailable ? 'bg-slate-50 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-700/60'}
                                            `}>
                                                <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full
                                                    ${isAvailable ? 'bg-green-500' : 'bg-red-500'}
                                                    ${isSelected && !isEditing ? 'bg-blue-500' : ''}
                                                `}></div>
                                                <span className={`ml-3 text-xs sm:text-sm font-medium
                                                    ${isSelected && !isEditing ? "text-blue-700 dark:text-blue-300" : isAvailable ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}
                                                `}>{room?.name || roomId}</span>
                                            </div>
                                            <div className={`flex-1 rounded-b-md p-2 flex flex-col justify-center items-center ${isAvailable ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                                <span className={`font-semibold text-xs
                                                    ${isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                                                `}>
                                                    {room?.status}
                                                </span>
                                                <span className={`text-xs text-slate-500 dark:text-slate-400 ${isSelected && !isEditing ? "text-slate-600 dark:text-slate-300" : ""} mt-1`}>
                                                    Capacity: {room?.capacity}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Details Panel */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">Details</h3>
              <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
            </div>
            <div className="flex flex-col items-start gap-6 w-full min-h-[420px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
                {initialLoading || loading ? (
                    <RoomDetailsSkeleton />
                ) : roomDetails ? (
                    <>
                        <div className="flex flex-col items-start self-stretch w-full flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-700 pr-1">
                            <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                                {/* --- Room Row --- */}
                                <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelRoom}>Room</span></div>
                                    <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                                        {isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="text" name="name" value={editableRoomDetails.name} onChange={handleInputChange} className={inputStyle}/></div>) : (<span className={textValueRoomDisplay}>{roomDetails.name}</span>)}
                                    </div>
                                </div>
                                {/* --- Building Row --- */}
                                <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Building</span></div>
                                    <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                                        {isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="text" name="building" value={editableRoomDetails.building} onChange={handleInputChange} className={inputStyle} /></div>) : (<span className={textValueDefaultDisplay}>{roomDetails.building}</span>)}
                                    </div>
                                </div>
                                {/* --- Floor Row --- */}
                                <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Floor</span></div>
                                    <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                                        {isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="number" name="floor" value={editableRoomDetails.floor} onChange={handleInputChange} className={inputStyle}/></div>) : (<span className={textValueDefaultDisplay}>{roomDetails.floor}</span>)}
                                    </div>
                                </div>
                                {/* --- Capacity Row --- */}
                                <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]"><span className={textLabelDefault}>Capacity</span></div>
                                    <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                                        {isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}><input type="number" name="capacity" value={editableRoomDetails.capacity} onChange={handleInputChange} className={inputStyle}/></div>) : (<span className={textValueDefaultDisplay}>{roomDetails.capacity}</span>)}
                                    </div>
                                </div>
                                {/* --- Equipment Row --- */}
                                <div className="flex flex-row items-start self-stretch w-full min-h-[92px] hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px] pt-5"><span className={textLabelDefault}>Equipment</span></div>
                                    <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2 pt-3">
                                        {isEditing && editableRoomDetails ? (<div className={`flex flex-col items-start self-stretch ${equipmentInputContainerSize}`}><textarea name="equipment" value={editableRoomDetails.equipment} onChange={handleInputChange} className={textareaStyle} placeholder="Item1, Item2, ..."></textarea></div>) : (<span className={`${textValueDefaultDisplay} pt-1`}>{roomDetails.equipment.join(", ")}</span>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button className="flex flex-row justify-center items-center pyx-3 px-5 sm:px-6 gap-2 w-full h-[48px] sm:h-[50px] bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 shadow-md hover:shadow-lg rounded-md text-white font-semibold text-sm sm:text-base self-stretch disabled:opacity-60 transition-all duration-150" onClick={handleEditToggle} disabled={loading && isEditing}>
                            {loading && isEditing ? "Saving..." : isEditing ? "Save Changes" : "Request"}
                        </button>
                    </>
                ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">
                        Select a room to view details.
                    </div>
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
    <InstructorLayout activeItem="room" pageTitle="Room Management">
      <InstructorRoomViewContent />
    </InstructorLayout>
  );
}