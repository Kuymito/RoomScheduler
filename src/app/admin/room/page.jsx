import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AdminLayout from '@/components/AdminLayout';
import RoomPageSkeleton from './components/RoomPageSkeleton';
import RoomClientView from './components/RoomClientView';
import { roomService } from '@/services/room.service';
import { scheduleService } from '@/services/schedule.service';

/**
 * Fetches and processes both room and schedule data on the server.
 */
async function fetchAndProcessRoomData() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Admin Room Page: Not authenticated.");
        return { initialAllRoomsData: {}, buildingLayout: {}, scheduleMap: {} };
    }

    try {
        const [apiRooms, apiSchedules] = await Promise.all([
            roomService.getAllRooms(token),
            scheduleService.getAllSchedules(token)
        ]);

        const roomsDataMap = {};
        const populatedLayout = {};
        const scheduleMap = {};

        // 1. First process all rooms
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
                id: roomId,
                name: roomName,
                building: buildingName,
                floor: floor,
                capacity: capacity,
                type: type,
                equipment: typeof equipment === 'string' 
                    ? equipment.split(',').map(e => e.trim()).filter(Boolean) 
                    : (Array.isArray(equipment) ? equipment : []),
                // Initialize all rooms as available by default
                isAvailable: true
            };
        });

        // 2. Then process schedules to mark occupied rooms
        if (apiSchedules?.payload) {
            apiSchedules.payload.forEach(schedule => {
                // Skip if missing critical data
                if (!schedule?.shift || !schedule?.dayDetails || !schedule.roomId) return;

                const timeSlot = `${schedule.shift.startTime}-${schedule.shift.endTime}`;
                
                schedule.dayDetails.forEach(dayDetail => {
                    if (!dayDetail?.dayOfWeek) return;
                    
                    // Format day name (e.g., "Monday")
                    const dayKey = dayDetail.dayOfWeek.charAt(0).toUpperCase() + 
                                  dayDetail.dayOfWeek.slice(1).toLowerCase();
                    
                    // Initialize schedule map structure if needed
                    if (!scheduleMap[dayKey]) scheduleMap[dayKey] = {};
                    if (!scheduleMap[dayKey][timeSlot]) scheduleMap[dayKey][timeSlot] = {};
                    
                    // Mark the room as occupied in this time slot
                    scheduleMap[dayKey][timeSlot][schedule.roomId] = {
                        className: schedule.className,
                        isOccupied: true
                    };
                    
                    // Also update the room's general availability if needed
                    if (roomsDataMap[schedule.roomId]) {
                        roomsDataMap[schedule.roomId].isAvailable = false;
                    }
                });
            });
        }

        // Sort floors in descending order
        for (const building in populatedLayout) {
            populatedLayout[building].sort((a, b) => b.floor - a.floor);
        }
        
        return {
            initialAllRoomsData: roomsDataMap,
            buildingLayout: populatedLayout,
            scheduleMap: scheduleMap
        };

    } catch (error) {
        console.error("Failed to fetch or process room/schedule data on server:", error);
        return { initialAllRoomsData: {}, buildingLayout: {}, scheduleMap: {} };
    }
}
/**
 * Main page component for Admin Room Management.
 */
export default async function AdminRoomPage() {
    const { initialAllRoomsData, buildingLayout, scheduleMap } = await fetchAndProcessRoomData();

    return (
        <AdminLayout activeItem="room" pageTitle="Management">
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