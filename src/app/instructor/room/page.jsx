import { Suspense } from 'react';
import InstructorLayout from "@/components/InstructorLayout";
import InstructorRoomPageSkeleton from "./components/InstructorRoomPageSkeleton";
import InstructorRoomClientView from './components/InstructorRoomClientView';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAllRooms } from '@/services/room.service';
import { scheduleService } from '@/services/schedule.service';
import { classService } from '@/services/class.service'; // Assuming a service to get instructor's classes

// This layout structure can be dynamic if your API provides building/floor info
const baseBuildingLayout = {
    "Building A": [ { floor: 3, rooms: [] }, { floor: 2, rooms: [] }, { floor: 1, rooms: [] } ],
    "Building B": [ { floor: 2, rooms: [] }, { floor: 1, rooms: [] } ],
    "Building C": [ { floor: 3, rooms: [] }, { floor: 2, rooms: [] }, { floor: 1, rooms: [] } ],
    "Building D": [ { floor: 3, rooms: [] }, { floor: 2, rooms: [] }, { floor: 1, rooms: [] } ],
    "Building E": [ { floor: 5, rooms: [] }, { floor: 4, rooms: [] }, { floor: 3, rooms: [] }, { floor: 2, rooms: [] }, { floor: 1, rooms: [] } ],
    "Building F": [ { floor: 5, rooms: [] }, { floor: 4, rooms: [] }, { floor: 3, rooms: [] }, { floor: 2, rooms: [] }, { floor: 1, rooms: [] } ],
};


/**
 * Fetches all necessary data for the instructor room page on the server.
 * This includes all rooms, the complete schedule, and the classes taught by the current instructor.
 * @returns {Promise<object>} An object containing data for the client component.
 */
async function fetchAllRoomsAndSchedules() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Instructor Room Page: Not authenticated.");
        return {
            initialAllRoomsData: {},
            buildingLayout: baseBuildingLayout, // Assuming baseBuildingLayout is defined
            initialScheduleMap: {},
            initialInstructorClasses: []
        };
    }

    try {
        // 1. Fetch rooms and the instructor's schedule in parallel.
        // We no longer need to call classService.getAssignedClasses.
        const [apiRooms, apiInstructorSchedules] = await Promise.all([
            getAllRooms(token),
            scheduleService.getMySchedule(token) // This now provides all the class data needed.
        ]);

        // ... (The rest of your existing code for processing rooms remains the same)
        const roomsDataMap = {};
        const populatedLayout = {};
        apiRooms.forEach(room => {
            const { roomId, roomName, buildingName, floor, capacity, type, equipment } = room;
            if (!populatedLayout[buildingName]) {
                populatedLayout[buildingName] = [];
            }
            let floorObj = populatedLayout[buildingName].find(f => f.floor === floor);
            if (!floorObj) {
                floorObj = { floor: floor, rooms: [] };
                populatedLayout[buildingName].push(floorObj);
            }
            if (!floorObj.rooms.includes(roomName)) {
                 floorObj.rooms.push(roomName);
            }
            roomsDataMap[roomId] = {
                id: roomId, name: roomName, building: buildingName, floor: floor,
                capacity: capacity, type: type,
                equipment: typeof equipment === 'string' ? equipment.split(',').map(e => e.trim()).filter(Boolean) : [],
            };
        });


        // 2. Create the schedule map for the UI from the same instructor schedule data.
        const scheduleMap = {};
        apiInstructorSchedules.forEach(schedule => {
            if (schedule && schedule.dayDetails && Array.isArray(schedule.dayDetails) && schedule.shift) {
                const timeSlot = `${schedule.shift.startTime.substring(0, 5)}-${schedule.shift.endTime.substring(0, 5)}`;
                schedule.dayDetails.forEach(dayDetail => {
                    const dayName = dayDetail.dayOfWeek.charAt(0).toUpperCase() + dayDetail.dayOfWeek.slice(1).toLowerCase();
                    if (!scheduleMap[dayName]) scheduleMap[dayName] = {};
                    if (!scheduleMap[dayName][timeSlot]) scheduleMap[dayName][timeSlot] = {};
                    scheduleMap[dayName][timeSlot][schedule.roomId] = schedule.className;
                });
            }
        });

        // 3. ✨ Create the class list for the dropdown directly from the instructor's schedule data.
        const formattedClasses = apiInstructorSchedules.map(schedule => ({
            id: schedule.scheduleId, // Use the correct scheduleId
            name: schedule.className,
            shift: `${schedule.shift.startTime}-${schedule.shift.endTime}`,
        }));

        // Sort floors and return all the data
        for (const building in populatedLayout) {
            populatedLayout[building].sort((a, b) => b.floor - a.floor);
        }

        return {
            initialAllRoomsData: roomsDataMap,
            buildingLayout: populatedLayout,
            initialScheduleMap: scheduleMap,
            initialInstructorClasses: formattedClasses // This is now correctly populated
        };

    } catch (error) {
        console.error("Failed to fetch data for instructor room page:", error.message);
        return { initialAllRoomsData: {}, buildingLayout: {}, initialScheduleMap: {}, initialInstructorClasses: [] };
    }
}

/**
 * Main Instructor Page Server Component.
 */
export default async function InstructorRoomPage() {
    const { initialAllRoomsData, buildingLayout, initialScheduleMap, initialInstructorClasses } = await fetchAllRoomsAndSchedules();

    return (
        <InstructorLayout activeItem="room" pageTitle="Room">
            <Suspense fallback={<InstructorRoomPageSkeleton />}>
                <InstructorRoomClientView
                    initialAllRoomsData={initialAllRoomsData}
                    buildingLayout={buildingLayout}
                    initialScheduleMap={initialScheduleMap}
                    initialInstructorClasses={initialInstructorClasses}
                />
            </Suspense>
        </InstructorLayout>
    );
}