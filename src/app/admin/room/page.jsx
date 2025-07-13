import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import RoomPageSkeleton from './components/RoomPageSkeleton';
import RoomClientView from './components/RoomClientView';
import { getAllRooms } from '@/services/room.service';
import { scheduleService } from '@/services/schedule.service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Fetches and processes both room and schedule data on the server.
 * This function now combines data from two endpoints to build the full picture.
 * @returns {Promise<{initialAllRoomsData: object, buildingLayout: object, scheduleMap: object}>}
 */
async function fetchAndProcessRoomData() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Admin Room Page: Not authenticated.");
        return { initialAllRoomsData: {}, buildingLayout: {}, scheduleMap: {} };
    }

    try {
        // Fetch rooms and schedules in parallel for efficiency
        const [apiRooms, apiSchedules] = await Promise.all([
            getAllRooms(token),
            scheduleService.getAllSchedules(token)
        ]);
        
        const roomsDataMap = {};
        const populatedLayout = {};

        // Process all rooms to build the main data map and UI layout
        apiRooms.forEach(room => {
            const { roomId, roomName, buildingName, floor, capacity, type, equipment } = room;

            // Dynamically build the building layout object from the fetched data
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

            // Store detailed room metadata
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
        
        // Create a map of schedules for quick lookup: { "Monday": { "07:00-10:00": { roomId: className } } }
        const scheduleMap = {};
        apiSchedules.forEach(schedule => {
            // FIX: Use the new `dayDetails` array from the API response
            if (schedule && schedule.dayDetails && Array.isArray(schedule.dayDetails) && schedule.shift) {
                const timeSlot = `${schedule.shift.startTime.substring(0, 5)}-${schedule.shift.endTime.substring(0, 5)}`;
                
                schedule.dayDetails.forEach(dayDetail => {
                    const dayName = dayDetail.dayOfWeek.charAt(0).toUpperCase() + dayDetail.dayOfWeek.slice(1).toLowerCase();
                    if (!scheduleMap[dayName]) {
                        scheduleMap[dayName] = {};
                    }
                    if (!scheduleMap[dayName][timeSlot]) {
                        scheduleMap[dayName][timeSlot] = {};
                    }
                    scheduleMap[dayName][timeSlot][schedule.roomId] = schedule.className;
                });
            }
        });

        // Sort floors in descending order for each building
        for (const building in populatedLayout) {
            populatedLayout[building].sort((a, b) => b.floor - a.floor);
        }
        
        return { 
            initialAllRoomsData: roomsDataMap, 
            buildingLayout: populatedLayout,
            scheduleMap: scheduleMap 
        };

    } catch (error) {
        console.error("Failed to fetch or process room/schedule data on server:", error.message);
        return { initialAllRoomsData: {}, buildingLayout: {}, scheduleMap: {} };
    }
}

/**
 * Main page component for Admin Room Management. This is a Server Component.
 */
export default async function AdminRoomPage() {
    const { initialAllRoomsData, buildingLayout, scheduleMap } = await fetchAndProcessRoomData();

    return (
        <AdminLayout activeItem="room" pageTitle="Room">
            <Suspense fallback={<RoomPageSkeleton />}>
                <RoomClientView 
                    initialAllRoomsData={initialAllRoomsData} 
                    buildingLayout={buildingLayout} 
                    initialScheduleMap={scheduleMap}
                />
            </Suspense>
        </AdminLayout>
    );
}