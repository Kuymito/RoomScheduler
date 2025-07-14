import { Suspense } from 'react';
import InstructorLayout from "@/components/InstructorLayout";
import InstructorRoomPageSkeleton from "./components/InstructorRoomPageSkeleton";
import InstructorRoomClientView from './components/InstructorRoomClientView';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAllRooms } from '@/services/room.service';
import { scheduleService } from '@/services/schedule.service';

/**
 * Fetches all necessary data for the instructor room page on the server.
 * This includes all rooms, the complete schedule, and the schedules taught by the current instructor.
 * By fetching everything here, we ensure the client component gets all data at once.
 * @returns {Promise<object>} An object containing all the data needed for the client component.
 */
async function fetchAllRoomsAndSchedules() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Instructor Room Page: Not authenticated.");
        return { 
            initialAllRoomsData: {}, 
            buildingLayout: {}, 
            initialScheduleMap: {}, 
            initialInstructorClasses: [] 
        };
    }

    try {
        // Fetch all required data concurrently for better performance.
        const [apiRooms, apiSchedules, apiInstructorSchedules] = await Promise.all([
            getAllRooms(token),
            scheduleService.getAllSchedules(token),
            scheduleService.getMySchedule(token) 
        ]);

        // Process rooms into a map and layout structure.
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
            if (!floorObj.rooms.includes(roomId)) {
                 floorObj.rooms.push(roomId);
            }
            roomsDataMap[roomId] = {
                id: roomId, name: roomName, building: buildingName, floor: floor,
                capacity: capacity, type: type,
                equipment: typeof equipment === 'string' ? equipment.split(',').map(e => e.trim()).filter(Boolean) : [],
            };
        });
        for (const building in populatedLayout) {
            populatedLayout[building].sort((a, b) => b.floor - a.floor);
        }

        // Process the full schedule into a map for quick lookups on the client.
        const shiftNameMap = {
            '07:00:00': 'Morning Shift', '10:30:00': 'Noon Shift', '14:00:00': 'Afternoon Shift',
            '17:30:00': 'Evening Shift', '07:30:00': 'Weekend Shift'
        };
        const dayApiToFullName = {
             MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday',
             FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday'
        };
        const scheduleMap = {};
        apiSchedules.forEach(schedule => {
            if (schedule && schedule.dayDetails && Array.isArray(schedule.dayDetails) && schedule.shift) {
                const timeSlot = shiftNameMap[schedule.shift.startTime];
                schedule.dayDetails.forEach(dayDetail => {
                    const dayName = dayApiToFullName[dayDetail.dayOfWeek.toUpperCase()];
                    if (dayName && timeSlot) {
                        if (!scheduleMap[dayName]) scheduleMap[dayName] = {};
                        if (!scheduleMap[dayName][timeSlot]) scheduleMap[dayName][timeSlot] = {};
                        scheduleMap[dayName][timeSlot][schedule.roomId] = schedule.className;
                    }
                });
            }
        });

        // Format the classes specific to the instructor for the request form.
        const formattedClasses = apiInstructorSchedules.map(cls => ({
            id: cls.scheduleId,
            name: cls.className,
            shift: `${cls.shift.startTime}-${cls.shift.endTime}`,
        }));

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
 * Main Instructor Page Server Component. This component now fetches all data
 * and passes it down to the client component, wrapped in a Suspense boundary.
 */
export default async function InstructorRoomPage() {
    // The page will wait for this data fetching to complete before rendering.
    // During this time, the loading.jsx or a parent Suspense boundary will be shown.
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