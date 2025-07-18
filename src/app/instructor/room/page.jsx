import { Suspense } from 'react';
import InstructorLayout from "@/components/InstructorLayout";
import InstructorRoomPageSkeleton from "./components/InstructorRoomPageSkeleton";
import InstructorRoomClientView from './components/InstructorRoomClientView';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAllRooms } from '@/services/room.service';
import { scheduleService } from '@/services/schedule.service';

// Define the unavailable room IDs
const UNAVAILABLE_ROOM_IDS = new Set([1, 2, 3, 35, 36, 37, 38, 47, 48, 49, 50, 51, 53, 54, 55]);

async function fetchInitialPageData() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Instructor Room Page: Not authenticated.");
        return { 
            initialAllRoomsData: {}, 
            buildingLayout: {}, 
            initialInstructorClasses: [] 
        };
    }

    try {
        // Fetch only rooms and the instructor's specific classes.
        // The main schedule map will be fetched on the client.
        const [apiRooms, apiInstructorSchedules] = await Promise.all([
            getAllRooms(token),
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
                status: UNAVAILABLE_ROOM_IDS.has(roomId) ? 'unavailable' : 'available',
            };
        });
        for (const building in populatedLayout) {
            populatedLayout[building].sort((a, b) => b.floor - a.floor);
        }

        // Format the classes specific to the instructor for the request form.
        const formattedClasses = apiInstructorSchedules.map(cls => ({
            id: cls.scheduleId,
            name: cls.className,
            shift: `${cls.shift.startTime}-${cls.shift.endTime}`,
        }));

        return { 
            initialAllRoomsData: roomsDataMap, 
            buildingLayout: populatedLayout,
            initialInstructorClasses: formattedClasses
        };

    } catch (error) {
        console.error("Failed to fetch initial data for instructor room page:", error.message);
        return { initialAllRoomsData: {}, buildingLayout: {}, initialInstructorClasses: [] };
    }
}


export default async function InstructorRoomPage() {
    const { initialAllRoomsData, buildingLayout, initialInstructorClasses } = await fetchInitialPageData();

    return (
        <InstructorLayout activeItem="room" pageTitle="Room">
            <Suspense fallback={<InstructorRoomPageSkeleton />}>
                <InstructorRoomClientView
                    initialAllRoomsData={initialAllRoomsData}
                    buildingLayout={buildingLayout}
                    // The initial schedule map is no longer passed; the client will fetch it.
                    initialScheduleMap={{}} 
                    initialInstructorClasses={initialInstructorClasses}
                />
            </Suspense>
        </InstructorLayout>
    );
}