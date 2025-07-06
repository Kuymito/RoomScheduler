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
            buildingLayout: baseBuildingLayout, 
            initialScheduleMap: {}, 
            initialInstructorClasses: [] 
        };
    }

    try {
        // Fetch rooms, schedules, and instructor's classes in parallel
        const [apiRooms, apiSchedules, apiInstructorClasses] = await Promise.all([
            getAllRooms(token),
            scheduleService.getAllSchedules(token),
            classService.getAssignedClasses(token) // Assuming this fetches classes for the logged-in instructor
        ]);

        const roomsDataMap = {};
        const populatedLayout = JSON.parse(JSON.stringify(baseBuildingLayout));

        // Process all rooms to build the main data map and UI layout
        apiRooms.forEach(room => {
            const { roomId, roomName, buildingName, floor, capacity, type, equipment } = room;

            if (populatedLayout[buildingName]) {
                let floorObj = populatedLayout[buildingName].find(f => f.floor === floor);
                if (!floorObj) {
                    floorObj = { floor: floor, rooms: [] };
                    populatedLayout[buildingName].push(floorObj);
                }
                if (!floorObj.rooms.includes(roomName)) {
                    floorObj.rooms.push(roomName);
                }
            }

            roomsDataMap[roomId] = {
                id: roomId,
                name: roomName,
                building: buildingName,
                floor: floor,
                capacity: capacity,
                type: type,
                equipment: typeof equipment === 'string' ? equipment.split(',').map(e => e.trim()).filter(Boolean) : [],
            };
        });

        // Create a schedule map for quick lookup: { "Monday": { "07:00-10:00": { roomId: className } } }
        const scheduleMap = {};
        apiSchedules.forEach(schedule => {
            const days = schedule.day.split(',').map(d => d.trim());
            const timeSlot = `${schedule.shift.startTime.substring(0, 5)}-${schedule.shift.endTime.substring(0, 5)}`;
            
            days.forEach(apiDay => {
                const dayName = apiDay.charAt(0).toUpperCase() + apiDay.slice(1).toLowerCase();
                if (!scheduleMap[dayName]) {
                    scheduleMap[dayName] = {};
                }
                if (!scheduleMap[dayName][timeSlot]) {
                    scheduleMap[dayName][timeSlot] = {};
                }
                scheduleMap[dayName][timeSlot][schedule.roomId] = schedule.className;
            });
        });
        
        // Format instructor classes for the request form dropdown
        const formattedClasses = apiInstructorClasses.map(cls => ({
            id: cls.classId,
            name: cls.className,
            shift: `${cls.shift.startTime}-${cls.shift.endTime}`,
        }));

        // Sort floors in descending order
        for (const building in populatedLayout) {
            populatedLayout[building].sort((a, b) => b.floor - a.floor);
        }

        return { 
            initialAllRoomsData: roomsDataMap, 
            buildingLayout: populatedLayout,
            initialScheduleMap: scheduleMap,
            initialInstructorClasses: formattedClasses
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
        <InstructorLayout activeItem="room" pageTitle="Room Availability">
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