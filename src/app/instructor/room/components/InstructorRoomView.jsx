"use client";

import { useState, useEffect } from "react";
import SuccessAlert from "@/components/RequestSuccessComponent"; 
import RequestChangeForm from "@/components/RequestChangeForm";
import FilterControls from "./FilterControls";
import RoomGrid from "./RoomGrid";
import RoomDetailsPanel from "./RoomDetailsPanel";
import { weekdays, timeSlots, getInstructorClasses } from "../lib/data";
const currentInstructor = { id: "instructor01", name: "Dr. Ada Lovelace" };

export default function InstructorRoomView({ initialRoomsData, buildings }) {
  // State management
  const [selectedDay, setSelectedDay] = useState(weekdays[0]);
  const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
  const [selectedBuilding, setSelectedBuilding] = useState(Object.keys(buildings)[0]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [instructorClasses, setInstructorClasses] = useState([]);

  const allRoomsData = initialRoomsData;

  // Handlers
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
    const status = room?.weeklySchedule?.[selectedDay]?.[selectedTime] || "Unavailable";

    if (status === "Unavailable" || selectedRoom === roomId) return;

    setSelectedRoom(roomId);
    setLoading(true);
    setRoomDetails(null);
    try {
      // Simulate network delay for fetching details
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!room) throw new Error("Room not found");
      setRoomDetails({ ...room, status });
    } catch (error) {
      console.error("Error fetching room details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = () => {
    if (roomDetails) setIsFormOpen(true);
  };

  const handleSaveRequest = (data) => {
    console.log("Change Request Submitted:", {
      instructor: currentInstructor,
      requestDetails: data,
    });
    setShowSuccessAlert(true);
  };

  // Fetch instructor classes when the request form is opened
  useEffect(() => {
    if (isFormOpen) {
      getInstructorClasses(currentInstructor.id).then(setInstructorClasses);
    }
  }, [isFormOpen]);

  const floors = buildings[selectedBuilding] || [];

  return (
    <>
      {/* Modals and Alerts */}
      {showSuccessAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <SuccessAlert
            show={showSuccessAlert}
            title="Request Sent Successfully"
            messageLine1={`Your request for Room ${roomDetails?.name || ""} was sent.`}
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

      {/* Main Content */}
      <div className="p-4 sm:p-6 min-h-full">
        <div className="mb-4 w-full">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Room Selection</h2>
          <hr className="border-t border-slate-300 dark:border-slate-700 mt-3" />
        </div>

        <FilterControls
          selectedDay={selectedDay}
          selectedTime={selectedTime}
          selectedBuilding={selectedBuilding}
          onDayChange={handleDayChange}
          onTimeChange={handleTimeChange}
          onBuildingChange={handleBuildingChange}
          buildings={buildings}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <RoomGrid
            floors={floors}
            allRoomsData={allRoomsData}
            selectedDay={selectedDay}
            selectedTime={selectedTime}
            selectedRoom={selectedRoom}
            onRoomClick={handleRoomClick}
          />
          <RoomDetailsPanel
            loading={loading}
            roomDetails={roomDetails}
            onRequest={handleRequest}
          />
        </div>
      </div>
    </>
  );
}
