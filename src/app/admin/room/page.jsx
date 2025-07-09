import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import RoomPageSkeleton from './components/RoomPageSkeleton';
import RoomClientView from './components/RoomClientView';
import { getAllRooms } from '@/services/room.service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Fetches and processes room data on the server.
 * This function now only fetches room data.
 * @returns {Promise<{initialAllRoomsData: object, buildingLayout: object}>}
 */
async function fetchAndProcessRoomData() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Admin Room Page: Not authenticated.");
        return { initialAllRoomsData: {}, buildingLayout: {} };
    }

    try {
        const apiRooms = await getAllRooms(token);
        
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
        
        // Sort floors in descending order for each building
        for (const building in populatedLayout) {
            populatedLayout[building].sort((a, b) => b.floor - a.floor);
        }
        
        return { 
            initialAllRoomsData: roomsDataMap, 
            buildingLayout: populatedLayout,
        };

    } catch (error) {
        console.error("Failed to fetch or process room data on server:", error.message);
        return { initialAllRoomsData: {}, buildingLayout: {} };
    }
}

/**
 * Main page component for Admin Room Management. This is a Server Component.
 */
export default async function AdminRoomPage() {
    const { initialAllRoomsData, buildingLayout } = await fetchAndProcessRoomData();

    return (
        <AdminLayout activeItem="room" pageTitle="Room">
            <Suspense fallback={<RoomPageSkeleton />}>
                <RoomClientView 
                    initialAllRoomsData={initialAllRoomsData} 
                    buildingLayout={buildingLayout} 
                />
            </Suspense>
        </AdminLayout>
    );
}