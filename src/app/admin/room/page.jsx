import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import RoomPageSkeleton from './components/RoomPageSkeleton';
import RoomClientView from './components/RoomClientView'; // We will create this next

/**
 * Mock data fetching function. In a real app, this would fetch from your database.
 * Because this is a Server Component, this function now runs on the server.
 */
const fetchRoomData = async () => {
    const initialRoomsData = {
        A1: { id: "A1", name: "Room A1", building: "Building A", floor: 5, capacity: 30, equipment: ["Projector", "Whiteboard", "AC"] },
        A2: { id: "A2", name: "Room A2", building: "Building A", floor: 5, capacity: 20, equipment: ["Whiteboard", "AC"] },
        A3: { id: "A3", name: "Room A3", building: "Building A", floor: 5, capacity: 25, equipment: ["Projector", "AC"] },
        A4: { id: "A4", name: "Room A4", building: "Building A", floor: 5, capacity: 18, equipment: ["Whiteboard"] },
        A5: { id: "A5", name: "Room A5", building: "Building A", floor: 5, capacity: 22, equipment: ["Projector", "AC"] },
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

    // Simulate network delay for fetching data
    await new Promise(resolve => setTimeout(resolve, 500));
    return initialRoomsData;
};

/**
 * The main page component is now an async Server Component.
 */
export default async function AdminRoomPage() {
    // Data is fetched on the server before the page is sent to the client.
    const allRoomsData = await fetchRoomData();

    return (
        <AdminLayout activeItem="room" pageTitle="Room Management">
            <Suspense fallback={<RoomPageSkeleton />}>
                {/* The Client Component is rendered here, receiving the server-fetched data as a prop.
                  The browser gets the pre-rendered HTML for the list of rooms, making the initial
                  load appear instant. Then, the client-side JavaScript will load to make it interactive.
                */}
                <RoomClientView initialAllRoomsData={allRoomsData} />
            </Suspense>
        </AdminLayout>
    );
}