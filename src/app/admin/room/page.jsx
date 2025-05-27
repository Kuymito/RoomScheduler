'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar'; // Assuming this component exists and handles its own width/visibility based on isCollapsed
import Topbar from '@/components/Topbar';   // Assuming this component exists
import AdminPopup from 'src/app/admin/profile/components/AdminPopup';
import LogoutAlert from '@/components/LogoutAlert'; // Assuming this component exists
import Footer from '@/components/Footer';     // Assuming this component exists

// Define placeholder content components (these would ideally be separate files)
    

const RoomViewContent = () => {
    const [selectedBuilding, setSelectedBuilding] = useState("Building A");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableRoomDetails, setEditableRoomDetails] = useState(null);

    const initialRoomsData = {
      A1: { id: "A1", name: "Room A1", building: "Building A", floor: 5, capacity: 30, equipment: ["Projector", "Whiteboard", "AC"] },
      A2: { id: "A2", name: "Room A2", building: "Building A", floor: 5, capacity: 20, equipment: ["Whiteboard", "AC"] },
      A3: { id: "A3", name: "Room A3", building: "Building A", floor: 5, capacity: 25, equipment: ["Projector", "AC"] },
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
    const [allRoomsData, setAllRoomsData] = useState(initialRoomsData);

    const buildings = {
      "Building A": [
        { floor: 5, rooms: ["A1", "A2", "A3"] },
        { floor: 4, rooms: ["B1", "B2"] },
        { floor: 3, rooms: ["C1", "C2"] },
        { floor: 2, rooms: ["D1", "D2"] },
        { floor: 1, rooms: ["E1", "E2"] },
      ],
      "Building B": [
        { floor: 3, rooms: ["F1", "F2"] },
        { floor: 2, rooms: ["G1", "G2"] },
        { floor: 1, rooms: ["H1", "H2"] },
      ],
    };

    const handleRoomClick = async (roomId) => {
      setSelectedRoom(roomId);
      setIsEditing(false);
      setLoading(true);
      try {
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
        setIsEditing(true);
        setEditableRoomDetails({
          ...roomDetails,
          equipment: roomDetails.equipment.join(", "),
        });
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
        console.log("Simulating POST request to API with data:", updatedRoomData);
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            setRoomDetails(updatedRoomData);
            setAllRoomsData(prevAllRooms => ({
                ...prevAllRooms,
                [selectedRoom]: updatedRoomData,
            }));
            setIsEditing(false);
            console.log("Room details updated successfully locally.");
        } catch (error) {
            console.error("Failed to save room details:", error);
        } finally {
            setLoading(false);
        }
    };

    const floors = buildings[selectedBuilding] || [];

    // Style definitions based on spec for readability
    const textLabelRoom = "font-medium text-base leading-7 text-[#323539] tracking-[-0.01em]";
    const textValueRoomDisplay = "font-medium text-base leading-7 text-[#323539] tracking-[-0.01em]";
    
    const textLabelDefault = "font-medium text-sm leading-6 text-[#323539] tracking-[-0.01em]";
    const textValueDefaultDisplay = "font-medium text-sm leading-6 text-[#323539] tracking-[-0.01em]";
    
    const inputContainerSizeDefault = "w-[132px] h-[40px]";
    const inputStyle = "py-[9px] px-3 w-full h-full bg-[#F8F9FB] border border-[#E5E5E7] rounded-[6px] font-normal text-sm leading-[22px] text-gray-800 placeholder:text-[#858C95] focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600";
    
    const equipmentInputContainerSize = "w-[132px] h-[72px]";
    const textareaStyle = "py-[14px] px-4 w-full h-full bg-[#F8F9FB] border border-[#E5E5E7] rounded-[6px] font-normal text-sm leading-[22px] text-gray-800 placeholder:text-[#858C95] resize-none focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600";


    return (
      <>
        <div className="mb-4">
          <h2 className="text-base font-medium text-black">Room</h2>
          <hr className="border-t border-gray-200 mt-3" />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Building Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2.5">
              <select
                value={selectedBuilding}
                onChange={handleBuildingChange}
                className="text-xs font-semibold text-black bg-white border border-gray-300 rounded-md px-2 py-1"
              >
                {Object.keys(buildings).map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>
              <hr className="flex-1 border-t border-gray-300" />
            </div>
            <div className="space-y-4">
              {floors.map(({ floor, rooms }) => (
                <div key={floor} className="space-y-4">
                  <div className="floor-section">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <h4 className="text-[8px] font-normal text-black whitespace-nowrap">
                        Floor {floor}
                      </h4>
                      <hr className="flex-1 border-t border-gray-300" />
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-4 gap-y-2.5">
                      {rooms.map((roomId) => (
                        <div
                          key={roomId}
                          className={`h-[100px] border ${
                            selectedRoom === roomId && !isEditing
                              ? "border-blue-600"
                              : "border-[rgba(0,0,0,0.3)]"
                          } rounded-[4px] flex flex-col cursor-pointer`}
                          onClick={() => handleRoomClick(roomId)}
                        >
                          <div className="h-[30px] bg-white rounded-t-[3px] flex items-center justify-center px-2 relative">
                            <div className="absolute left-1.5 top-1.5 w-1.5 h-1.5 bg-[#48AA2B] rounded-full"></div>
                            <span className="text-[13px] font-medium text-[#696969]">
                              {allRoomsData[roomId]?.name || roomId} 
                            </span>
                          </div>
                          <div className="flex-1 bg-[#E5E5E7] rounded-b-[3px] border-b border-[#B3B3B3]"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details Panel - Styled according to Frame 1321314803 spec */}
          <div className="w-full lg:w-[304px] shrink-0"> {/* Main container for details section */}
            <div className="flex items-center gap-1.5 mb-4"> {/* Title "Details" + hr - This is from original code, kept above the new spec frame */}
              <h3 className="text-xs font-semibold text-black">Details</h3>
              <hr className="flex-1 border-t border-gray-300" />
            </div>

            {/* Frame 1321314803 equivalent: container for table and button */}
            <div className="flex flex-col items-start gap-[32px] w-[304px] h-[406px]">
                {loading && !isEditing ? (
                    <div className="text-center text-gray-500 w-full h-[320px] flex items-center justify-center">Loading room details...</div>
                ) : roomDetails ? (
                    // Tabel container (from spec)
                    <div className="flex flex-col items-start self-stretch w-[304px] h-[320px]">
                        {/* Tabel (from spec) */}
                        <div className="box-border flex flex-col items-start self-stretch w-full h-full bg-white border border-[#E5E5E7] shadow-[0px_1px_2px_rgba(16,24,40,0.04)] rounded-[5px] overflow-y-auto">
                            {/* --- Room Row --- */}
                            <div className="flex flex-row items-center self-stretch w-full h-[60px]">
                                <div className="box-border flex flex-col justify-center items-start p-4 w-[152px] h-full border-b border-[#E5E5E7] flex-1">
                                    <span className={textLabelRoom}>Room</span>
                                </div>
                                <div className="box-border flex flex-col justify-center items-start px-[10px] w-[152px] h-full border-b border-[#E5E5E7] flex-1">
                                    {isEditing && editableRoomDetails ? (
                                        <div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}>
                                            <input type="text" name="name" value={editableRoomDetails.name} onChange={handleInputChange} className={inputStyle} />
                                        </div>
                                    ) : (<span className={textValueRoomDisplay}>{roomDetails.name}</span>)}
                                </div>
                            </div>

                            {/* --- Building Row --- */}
                            <div className="flex flex-row items-center self-stretch w-full h-[56px]">
                                <div className="box-border flex flex-col justify-center items-start p-4 w-[152px] h-full border-b border-[#E5E5E7] flex-1">
                                    <span className={textLabelDefault}>Building</span>
                                </div>
                                <div className="box-border flex flex-col justify-center items-start px-[10px] w-[152px] h-full border-b border-[#E5E5E7] flex-1">
                                    {isEditing && editableRoomDetails ? (
                                        <div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}>
                                            <input type="text" name="building" value={editableRoomDetails.building} onChange={handleInputChange} className={inputStyle} />
                                        </div>
                                    ) : (<span className={textValueDefaultDisplay}>{roomDetails.building}</span>)}
                                </div>
                            </div>

                            {/* --- Floor Row --- */}
                            <div className="flex flex-row items-center self-stretch w-full h-[56px]">
                                <div className="box-border flex flex-col justify-center items-start p-4 w-[152px] h-full border-b border-[#E5E5E7] flex-1">
                                    <span className={textLabelDefault}>Floor</span>
                                </div>
                                <div className="box-border flex flex-col justify-center items-start px-[10px] w-[152px] h-full border-b border-[#E5E5E7] flex-1">
                                    {isEditing && editableRoomDetails ? (
                                        <div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}>
                                            <input type="number" name="floor" value={editableRoomDetails.floor} onChange={handleInputChange} className={inputStyle} />
                                        </div>
                                    ) : (<span className={textValueDefaultDisplay}>{roomDetails.floor}</span>)}
                                </div>
                            </div>
                            
                            {/* --- Capacity Row --- */}
                            <div className="flex flex-row items-center self-stretch w-full h-[56px]">
                                <div className="box-border flex flex-col justify-center items-start p-4 w-[152px] h-full border-b border-[#E5E5E7] flex-1">
                                    <span className={textLabelDefault}>Capacity</span>
                                </div>
                                <div className="box-border flex flex-col justify-center items-start px-[10px] w-[152px] h-full border-b border-[#E5E5E7] flex-1">
                                    {isEditing && editableRoomDetails ? (
                                        <div className={`flex flex-col items-start self-stretch ${inputContainerSizeDefault}`}>
                                            <input type="number" name="capacity" value={editableRoomDetails.capacity} onChange={handleInputChange} className={inputStyle} />
                                        </div>
                                    ) : (<span className={textValueDefaultDisplay}>{roomDetails.capacity}</span>)}
                                </div>
                            </div>

                            {/* --- Equipment Row --- */}
                            <div className="flex flex-row items-center self-stretch w-full h-[92px]"> {/* Taller row */}
                                <div className="box-border flex flex-col justify-center items-start p-4 w-[152px] h-full border-b border-[#E5E5E7] flex-1"> {/* Spec implies border-bottom on all .Web Tabel Base */}
                                    <span className={textLabelDefault}>Equipment</span>
                                </div>
                                <div className="box-border flex flex-col justify-center items-start px-[10px] w-[152px] h-full border-b border-[#E5E5E7] flex-1">
                                    {isEditing && editableRoomDetails ? (
                                        <div className={`flex flex-col items-start self-stretch ${equipmentInputContainerSize}`}>
                                            <textarea name="equipment" value={editableRoomDetails.equipment} onChange={handleInputChange} className={textareaStyle} placeholder="Item1, Item2, ..."></textarea>
                                        </div>
                                    ) : (<span className={textValueDefaultDisplay}>{roomDetails.equipment.join(", ")}</span>)}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                     <div className="text-center text-gray-500 w-full h-[320px] flex items-center justify-center">Select a room to view details.</div>
                )}

                {/* Button (from spec & original code) */}
                {roomDetails && (
                    <button
                        className="flex flex-row justify-center items-center py-4 px-6 gap-2 w-[304px] h-[54px] bg-[#0A77FF] shadow-[0px_1px_2px_rgba(16,24,40,0.04)] rounded-[6px] text-white font-semibold text-[15px] leading-[22px] self-stretch disabled:opacity-50"
                        onClick={handleEditToggle}
                        disabled={loading && isEditing}
                    >
                        {loading && isEditing ? "Saving..." : isEditing ? "Save Changes" : "Edit Room"}
                    </button>
                )}
                {!roomDetails && !loading && ( // Placeholder for button area if no room selected, to maintain height
                    <div className="w-[304px] h-[54px] self-stretch"></div>
                )}
            </div>
          </div>
        </div>
      </>
    );
};


const ProfileViewContent = ({ textNumDarkText, borderNumGrayLight, shadowCustomLight, bgNumContentBg, textNumGray }) => ( // Added props for custom classes
  <>
    <div className={`section-title font-semibold text-base ${textNumDarkText} mb-4`}> {/* Was mb-5 */}
      Profile
    </div>
    <div className="profile-section flex gap-4 mb-4 flex-wrap"> {/* Was gap-[30px] mb-[30px] or gap-5 mb-6 */}
      <div className={`avatar-card w-[311px] h-[130px] p-3 bg-white border ${borderNumGrayLight} ${shadowCustomLight} rounded-lg flex-shrink-0`}> {/* Reduced h and p slightly */}
        <div className="avatar-content flex">
          <Image
            src="/images/kok.png" // Ensure this path is correct
            alt="Profile Avatar"
            width={56}
            height={56}
            className={`avatar-img w-14 h-14 rounded-full ${bgNumContentBg} mr-3`} // Reduced mr
          />
          <div className="avatar-info flex flex-col">
            <div className="avatar-name font-semibold text-lg text-black mb-0.5">Admin</div>
            <div className={`avatar-role text-[15px] ${textNumGray} mb-2`}>Admin</div> {/* Was mb-3 */}
            <button className={`avatar-button bg-blue-600 hover:bg-blue-700 ${shadowCustomLight} rounded-md text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer`}> {/* Reduced py and px */}
              Upload Profile
            </button>
          </div>
        </div>
      </div>
      {/* General Information Card */}
      <div className={`info-details-wrapper flex-grow flex flex-col gap-4 min-w-[300px]`}>
        <div className={`info-card p-3 sm:p-4 bg-white border ${borderNumGrayLight} ${shadowCustomLight} rounded-lg`}>
          <div className={`section-title font-semibold text-base ${textNumDarkText} mb-3`}>General information</div>
          <div className="form-row flex gap-3 mb-2 flex-wrap">
            <div className="form-group flex-1 min-w-[200px]">
              <label className={`form-label block font-medium text-sm ${textNumDarkText} mb-1`}>First Name</label>
              <input type="text" className={`form-input w-full py-2 px-3 ${bgNumContentBg} border ${borderNumGrayLight} rounded-md font-medium text-[14px] ${textNumDarkText}`} defaultValue="Admin" />
            </div>
            <div className="form-group flex-1 min-w-[200px]">
              <label className={`form-label block font-medium text-sm ${textNumDarkText} mb-1`}>Last Name</label>
              <input type="text" className={`form-input w-full py-2 px-3 ${bgNumContentBg} border ${borderNumGrayLight} rounded-md font-medium text-[14px] ${textNumDarkText}`} defaultValue="User" />
            </div>
          </div>
          <div className="form-row flex gap-3 mb-2 flex-wrap">
            <div className="form-group flex-1 min-w-[200px]">
              <label className={`form-label block font-medium text-sm ${textNumDarkText} mb-1`}>Email</label>
              <input type="email" className={`form-input w-full py-2 px-3 bg-gray-100 border ${borderNumGrayLight} rounded-md font-medium text-[14px] text-gray-500`} defaultValue="admin@gmail.com" readOnly />
            </div>
            <div className="form-group flex-1 min-w-[200px]">
              <label className={`form-label block font-medium text-sm ${textNumDarkText} mb-1`}>Phone Number</label>
              <input type="tel" className={`form-input w-full py-2 px-3 ${bgNumContentBg} border ${borderNumGrayLight} rounded-md font-medium text-[14px] ${textNumDarkText}`} defaultValue="+855 12 345 678" />
            </div>
          </div>
          <div className="form-row flex gap-3 mb-2 flex-wrap">
            <div className="form-group flex-1 min-w-[200px]">
                <label className={`form-label block font-medium text-sm ${textNumDarkText} mb-1`}>Address</label>
                <input type="text" className={`form-input w-full py-2 px-3 ${bgNumContentBg} border ${borderNumGrayLight} rounded-md font-medium text-[14px] ${textNumDarkText}`} defaultValue="Phnom Penh, Cambodia" />
            </div>
          </div>
          <div className="form-actions flex justify-end mt-3">
            <button className={`save-button bg-blue-600 hover:bg-blue-700 ${shadowCustomLight} rounded-md text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer`}>
              Save
            </button>
          </div>
        </div>
        {/* Password Information Card */}
        <div className={`info-card-password p-3 sm:p-4 bg-white border ${borderNumGrayLight} ${shadowCustomLight} rounded-lg`}>
            <div className={`section-title font-semibold text-base ${textNumDarkText} mb-3`}>Password information</div>
            <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                    <label className={`form-label block font-medium text-sm ${textNumDarkText} mb-1`}>Current Password</label>
                    <input type="password" placeholder="Enter current password" className={`form-input w-full py-2 px-3 ${bgNumContentBg} border ${borderNumGrayLight} rounded-md font-medium text-[14px] ${textNumDarkText}`} />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                    <label className={`form-label block font-medium text-sm ${textNumDarkText} mb-1`}>New Password</label>
                    <input type="password" placeholder="Enter new password" className={`form-input w-full py-2 px-3 ${bgNumContentBg} border ${borderNumGrayLight} rounded-md font-medium text-[14px] ${textNumDarkText}`} />
                </div>
            </div>
            <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                    <label className={`form-label block font-medium text-sm ${textNumDarkText} mb-1`}>Confirm New Password</label>
                    <input type="password" placeholder="Confirm new password" className={`form-input w-full py-2 px-3 ${bgNumContentBg} border ${borderNumGrayLight} rounded-md font-medium text-[14px] ${textNumDarkText}`} />
                </div>
            </div>
            <div className="form-actions flex justify-end mt-3">
                <button className={`save-button bg-blue-600 hover:bg-blue-700 ${shadowCustomLight} rounded-md text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer`}>
                    Save Password
                </button>
            </div>
        </div>
      </div>
    </div>
  </>
);

const DashboardViewContent = ({ textNumDarkText }) => ( // Added prop
  <>
    <div className={`section-title font-semibold text-base ${textNumDarkText} mb-4`}>
      Dashboard
    </div>
    <p>Welcome to the Admin Dashboard. More content coming soon!</p>
  </>
);

// Define dummy prop values for custom classes if not using Tailwind JIT for arbitrary values extensively
// Or better, configure these in tailwind.config.js
const customClassProps = {
    textNumDarkText: "text-gray-800", // Example replacement
    borderNumGrayLight: "border-gray-300", // Example
    shadowCustomLight: "shadow-sm", // Example
    bgNumContentBg: "bg-gray-50", // Example
    textNumGray: "text-gray-600" // Example
};


export default function AdminProfilePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('room'); // Default to room to show this content
  const [pageSubtitle, setPageSubtitle] = useState('Room');   // Default to room

  const adminPopupRef = useRef(null);
  const userIconRef = useRef(null);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const handleUserIconClick = (event) => { event.stopPropagation(); setShowAdminPopup(!showAdminPopup); };
  const handleLogoutClick = () => { setShowAdminPopup(false); setShowLogoutAlert(true); };
  const handleCloseLogoutAlert = () => setShowLogoutAlert(false);
  const handleConfirmLogout = () => { alert('Logged out'); setShowLogoutAlert(false); /* Actual logout */ };
  
  const handleNavItemClick = (item) => {
    setActiveNavItem(item);
    const navItemText = item.charAt(0).toUpperCase() + item.slice(1).toLowerCase().replace(/_/g, ' '); // Handle underscore too
    setPageSubtitle(navItemText);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAdminPopup && adminPopupRef.current && !adminPopupRef.current.contains(event.target) &&
          userIconRef.current && !userIconRef.current.contains(event.target)) {
        setShowAdminPopup(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAdminPopup]);

  let currentView;
  const currentViewKey = activeNavItem; // Use activeNavItem directly as it's more reliable for keys

  if (currentViewKey === 'room') {
    currentView = <RoomViewContent />;
  } else if (currentViewKey === 'profile') { // This was the original content
    currentView = <ProfileViewContent {...customClassProps} />;
  } else if (currentViewKey === 'dashboard') {
    currentView = <DashboardViewContent {...customClassProps} />;
  }
  // Add cases for 'class', 'instructor', 'schedule'
  else if (currentViewKey === 'class') {
    currentView = <div><h2 className="text-xl font-semibold">Class</h2><p>Class Management Area.</p></div>;
  } else if (currentViewKey === 'instructor') {
    currentView = <div><h2 className="text-xl font-semibold">Instructor</h2><p>Instructor Management Area.</p></div>;
  } else if (currentViewKey === 'schedule') {
    currentView = <div><h2 className="text-xl font-semibold">Schedule</h2><p>Scheduling Area.</p></div>;
  }
  else {
    currentView = (<div><h2 className="text-xl font-semibold">{pageSubtitle}</h2><p>Content for {pageSubtitle} not implemented.</p></div>);
  }

  return (
    // This outer div establishes the flex layout and overall page background
    <div className="flex w-full min-h-screen bg-[#E2E1EF]"> {/* Page background */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        activeItem={activeNavItem}
        onNavItemClick={handleNavItemClick}
        // The Sidebar component should handle its own width (e.g. w-[265px] or w-16)
        // and have flex-shrink-0
      />
      {/* main-content takes remaining space. No margin needed if Sidebar is a flex item. */}
      {/* The transition here will smooth the width change of main-content if sidebar width changes */}
      <div className={`main-content flex-grow flex flex-col transition-all duration-300 ease-in-out`}>
        <Topbar
            onToggleSidebar={toggleSidebar}
            isSidebarCollapsed={isSidebarCollapsed}
            onUserIconClick={handleUserIconClick}
            pageSubtitle={pageSubtitle}
            userIconRef={userIconRef}
            // Topbar usually has its own background (e.g., bg-white shadow)
        />
        {/* content-area is the main space for dynamic views, with padding and its own background */}
        {/* This div takes the styles from your original "content-area" in AdminProfilePage.js */}
        <main className="content-area flex-grow p-3 m-6 bg-white rounded-lg shadow-md"> {/* Added shadow-md for better distinction */}
            {currentView}
        </main>
        <Footer/>
      </div>

      {/* Popups */}
      <div ref={adminPopupRef}>
        <AdminPopup show={showAdminPopup} onLogoutClick={handleLogoutClick} />
      </div>
      <LogoutAlert show={showLogoutAlert} onClose={handleCloseLogoutAlert} onConfirmLogout={handleConfirmLogout} />
    </div>
  );
}