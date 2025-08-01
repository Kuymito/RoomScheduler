import { Suspense } from 'react';
import InstructorLayout from "@/components/InstructorLayout";
import InstructorRoomPageSkeleton from "./components/InstructorRoomPageSkeleton";
import InstructorRoomClientView from './components/InstructorRoomClientView';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAllRooms } from '@/services/room.service';
import { scheduleService } from '@/services/schedule.service';

const UNAVAILABLE_ROOM_IDS = new Set([1, 2, 3, 35, 36, 37, 38, 47, 48, 49, 50, 51, 53, 54, 55]);

async function fetchInitialPageData() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Instructor Room Page: Not authenticated.");
        return { 
            initialAllRoomsData: {}, 
            buildingLayout: {}, 
            initialInstructorSchedules: [] // Fallback to empty array
        };
    }

    try {
        const [apiRooms, apiInstructorSchedules] = await Promise.all([
            getAllRooms(token),
            scheduleService.getMySchedule(token) 
        ]);

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
                status: UNAVAILABLE_ROOM_IDS.has(roomId) ? 'unavailable' : 'available',
            };
        });
        for (const building in populatedLayout) {
            populatedLayout[building].sort((a, b) => b.floor - a.floor);
        }

        // **FIX**: Return the full, detailed schedule data, not a formatted version.
        return { 
            initialAllRoomsData: roomsDataMap, 
            buildingLayout: populatedLayout,
            initialInstructorSchedules: apiInstructorSchedules || [] // Ensure it's always an array
        };

    } catch (error) {
        console.error("Failed to fetch initial data for instructor room page:", error);
        return { initialAllRoomsData: {}, buildingLayout: {}, initialInstructorSchedules: [] };
    }
}

export default async function InstructorRoomPage() {
    // **FIX**: Renamed prop for clarity to reflect it holds the full schedule.
    const { initialAllRoomsData, buildingLayout, initialInstructorSchedules } = await fetchInitialPageData();

    return (
        <InstructorLayout activeItem="room" pageTitle="Room">
            <Suspense fallback={<InstructorRoomPageSkeleton />}>
                <InstructorRoomClientView
                    initialAllRoomsData={initialAllRoomsData}
                    buildingLayout={buildingLayout}
                    initialScheduleMap={{}} 
                    // Pass the full schedule data to the client component
                    initialInstructorSchedules={initialInstructorSchedules}
                />
            </Suspense>
        </InstructorLayout>
    );
}