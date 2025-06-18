import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import RoomPageSkeleton from './components/RoomPageSkeleton';
import RoomClientView from './components/RoomClientView';

/**
 * Mock data fetching function. In a real app, this would fetch from your database.
 * Because this is a Server Component, this function now runs on the server.
 */
const fetchRoomData = async () => {
    const initialRoomsData = {
        // Building A - Floors 1 to 5, Rooms A1-A25
        A1: { id: "A1", name: "Room A1", building: "Building A", floor: 1, capacity: 30, equipment: ["Projector", "Whiteboard", "AC"] },
        A2: { id: "A2", name: "Room A2", building: "Building A", floor: 1, capacity: 20, equipment: ["Whiteboard", "AC"] },
        A3: { id: "A3", name: "Room A3", building: "Building A", floor: 1, capacity: 25, equipment: ["Projector", "AC"] },
        A4: { id: "A4", name: "Room A4", building: "Building A", floor: 1, capacity: 18, equipment: ["Whiteboard"] },
        A5: { id: "A5", name: "Room A5", building: "Building A", floor: 1, capacity: 22, equipment: ["Projector", "AC"] },

        A6: { id: "A6", name: "Room A6", building: "Building A", floor: 2, capacity: 15, equipment: ["Projector", "AC"] },
        A7: { id: "A7", name: "Room A7", building: "Building A", floor: 2, capacity: 20, equipment: ["Whiteboard"] },
        A8: { id: "A8", name: "Room A8", building: "Building A", floor: 2, capacity: 15, equipment: ["Projector", "AC"] },
        A9: { id: "A9", name: "Room A9", building: "Building A", floor: 2, capacity: 20, equipment: ["Whiteboard"] },
        A10: { id: "A10", name: "Room A10", building: "Building A", floor: 2, capacity: 20, equipment: ["Whiteboard"] },

        A11: { id: "A11", name: "Room A11", building: "Building A", floor: 3, capacity: 10, equipment: ["AC"] },
        A12: { id: "A12", name: "Room A12", building: "Building A", floor: 3, capacity: 12, equipment: ["Whiteboard", "AC"] },
        A13: { id: "A13", name: "Room A13", building: "Building A", floor: 3, capacity: 10, equipment: ["Projector"] },
        A14: { id: "A14", name: "Room A14", building: "Building A", floor: 3, capacity: 12, equipment: ["Whiteboard"] },
        A15: { id: "A15", name: "Room A15", building: "Building A", floor: 3, capacity: 15, equipment: ["AC"] },

        A16: { id: "A16", name: "Room A16", building: "Building A", floor: 4, capacity: 8, equipment: ["Projector"] },
        A17: { id: "A17", name: "Room A17", building: "Building A", floor: 4, capacity: 10, equipment: ["Whiteboard"] },
        A18: { id: "A18", name: "Room A18", building: "Building A", floor: 4, capacity: 8, equipment: ["AC"] },
        A19: { id: "A19", name: "Room A19", building: "Building A", floor: 4, capacity: 10, equipment: ["Projector", "Whiteboard"] },
        A20: { id: "A20", name: "Room A20", building: "Building A", floor: 4, capacity: 12, equipment: ["AC"] },

        A21: { id: "A21", name: "Room A21", building: "Building A", floor: 5, capacity: 5, equipment: ["AC"] },
        A22: { id: "A22", name: "Room A22", building: "Building A", floor: 5, capacity: 6, equipment: ["Projector", "Whiteboard"] },
        A23: { id: "A23", name: "Room A23", building: "Building A", floor: 5, capacity: 5, equipment: ["Whiteboard"] },
        A24: { id: "A24", name: "Room A24", building: "Building A", floor: 5, capacity: 6, equipment: ["AC"] },
        A25: { id: "A25", name: "Room A25", building: "Building A", floor: 5, capacity: 7, equipment: ["Projector", "Whiteboard", "AC"] },

        // Building B - Floors 1 to 4, Rooms B1-B20
        B1: { id: "B1", name: "Room B1", building: "Building B", floor: 1, capacity: 5, equipment: ["AC"] },
        B2: { id: "B2", name: "Room B2", building: "Building B", floor: 1, capacity: 6, equipment: ["Projector", "Whiteboard"] },
        B3: { id: "B3", name: "Room B3", building: "Building B", floor: 1, capacity: 5, equipment: ["Whiteboard"] },
        B4: { id: "B4", name: "Room B4", building: "Building B", floor: 1, capacity: 6, equipment: ["AC"] },
        B5: { id: "B5", name: "Room B5", building: "Building B", floor: 1, capacity: 7, equipment: ["Projector", "Whiteboard", "AC"] },

        B6: { id: "B6", name: "Room B6", building: "Building B", floor: 2, capacity: 8, equipment: ["Projector"] },
        B7: { id: "B7", name: "Room B7", building: "Building B", floor: 2, capacity: 10, equipment: ["Whiteboard"] },
        B8: { id: "B8", name: "Room B8", building: "Building B", floor: 2, capacity: 8, equipment: ["AC"] },
        B9: { id: "B9", name: "Room B9", building: "Building B", floor: 2, capacity: 10, equipment: ["Projector", "Whiteboard"] },
        B10: { id: "B10", name: "Room B10", building: "Building B", floor: 2, capacity: 12, equipment: ["AC"] },

        B11: { id: "B11", name: "Room B11", building: "Building B", floor: 3, capacity: 10, equipment: ["AC"] },
        B12: { id: "B12", name: "Room B12", building: "Building B", floor: 3, capacity: 12, equipment: ["Whiteboard", "AC"] },
        B13: { id: "B13", name: "Room B13", building: "Building B", floor: 3, capacity: 10, equipment: ["Projector"] },
        B14: { id: "B14", name: "Room B14", building: "Building B", floor: 3, capacity: 12, equipment: ["Whiteboard"] },
        B15: { id: "B15", name: "Room B15", building: "Building B", floor: 3, capacity: 15, equipment: ["AC"] },

        B16: { id: "B16", name: "Room B16", building: "Building B", floor: 4, capacity: 15, equipment: ["Projector", "AC"] },
        B17: { id: "B17", name: "Room B17", building: "Building B", floor: 4, capacity: 20, equipment: ["Whiteboard"] },
        B18: { id: "B18", name: "Room B18", building: "Building B", floor: 4, capacity: 15, equipment: ["Projector", "AC"] },
        B19: { id: "B19", name: "Room B19", building: "Building B", floor: 4, capacity: 20, equipment: ["Whiteboard"] },
        B20: { id: "B20", name: "Room B20", building: "Building B", floor: 4, capacity: 20, equipment: ["Whiteboard"] },

        // Building C - Floors 1 to 4, Rooms C1-C20
        C1: { id: "C1", name: "Room C1", building: "Building C", floor: 1, capacity: 5, equipment: ["AC"] },
        C2: { id: "C2", name: "Room C2", building: "Building C", floor: 1, capacity: 4, equipment: ["Whiteboard"] },
        C3: { id: "C3", name: "Room C3", building: "Building C", floor: 1, capacity: 5, equipment: ["Projector"] },
        C4: { id: "C4", name: "Room C4", building: "Building C", floor: 1, capacity: 4, equipment: ["AC"] },
        C5: { id: "C5", name: "Room C5", building: "Building C", floor: 1, capacity: 6, equipment: ["Whiteboard", "AC"] },

        C6: { id: "C6", name: "Room C6", building: "Building C", floor: 2, capacity: 8, equipment: ["Whiteboard"] },
        C7: { id: "C7", name: "Room C7", building: "Building C", floor: 2, capacity: 6, equipment: ["Projector"] },
        C8: { id: "C8", name: "Room C8", building: "Building C", floor: 2, capacity: 8, equipment: ["AC"] },
        C9: { id: "C9", name: "Room C9", building: "Building C", floor: 2, capacity: 6, equipment: ["Whiteboard"] },
        C10: { id: "C10", name: "Room C10", building: "Building C", floor: 2, capacity: 10, equipment: ["Projector", "AC"] },

        C11: { id: "C11", name: "Room C11", building: "Building C", floor: 3, capacity: 10, equipment: ["AC"] },
        C12: { id: "C12", name: "Room C12", building: "Building C", floor: 3, capacity: 12, equipment: ["Whiteboard", "AC"] },
        C13: { id: "C13", name: "Room C13", building: "Building C", floor: 3, capacity: 12, equipment: ["Whiteboard"] },
        C14: { id: "C14", name: "Room C14", building: "Building C", floor: 3, capacity: 10, equipment: ["Projector"] },
        C15: { id: "C15", name: "Room C15", building: "Building C", floor: 3, capacity: 15, equipment: ["AC"] },

        C16: { id: "C16", name: "Room C16", building: "Building C", floor: 4, capacity: 18, equipment: ["Projector"] },
        C17: { id: "C17", name: "Room C17", building: "Building C", floor: 4, capacity: 22, equipment: ["Whiteboard", "AC"] },
        C18: { id: "C18", name: "Room C18", building: "Building C", floor: 4, capacity: 16, equipment: ["AC"] },
        C19: { id: "C19", name: "Room C19", building: "Building C", floor: 4, capacity: 20, equipment: ["Projector", "Whiteboard"] },
        C20: { id: "C20", name: "Room C20", building: "Building C", floor: 4, capacity: 25, equipment: ["AC"] },

        // Building D - Floors 1 to 3, Rooms D1-D15
        D1: { id: "D1", name: "Room D1", building: "Building D", floor: 1, capacity: 5, equipment: ["AC"] },
        D2: { id: "D2", name: "Room D2", building: "Building D", floor: 1, capacity: 6, equipment: ["Projector", "Whiteboard"] },
        D3: { id: "D3", name: "Room D3", building: "Building D", floor: 1, capacity: 5, equipment: ["Whiteboard"] },
        D4: { id: "D4", name: "Room D4", building: "Building D", floor: 1, capacity: 6, equipment: ["AC"] },
        D5: { id: "D5", name: "Room D5", building: "Building D", floor: 1, capacity: 7, equipment: ["Projector", "Whiteboard", "AC"] },

        D6: { id: "D6", name: "Room D6", building: "Building D", floor: 2, capacity: 8, equipment: ["Projector"] },
        D7: { id: "D7", name: "Room D7", building: "Building D", floor: 2, capacity: 10, equipment: ["Whiteboard"] },
        D8: { id: "D8", name: "Room D8", building: "Building D", floor: 2, capacity: 8, equipment: ["AC"] },
        D9: { id: "D9", name: "Room D9", building: "Building D", floor: 2, capacity: 10, equipment: ["Projector", "Whiteboard"] },
        D10: { id: "D10", name: "Room D10", building: "Building D", floor: 2, capacity: 12, equipment: ["AC"] },

        D11: { id: "D11", name: "Room D11", building: "Building D", floor: 3, capacity: 14, equipment: ["Projector", "Whiteboard"] },
        D12: { id: "D12", name: "Room D12", building: "Building D", floor: 3, capacity: 11, equipment: ["AC"] },
        D13: { id: "D13", name: "Room D13", building: "Building D", floor: 3, capacity: 9, equipment: ["Whiteboard"] },
        D14: { id: "D14", name: "Room D14", building: "Building D", floor: 3, capacity: 16, equipment: ["Projector", "AC"] },
        D15: { id: "D15", name: "Room D15", building: "Building D", floor: 3, capacity: 13, equipment: ["Whiteboard", "AC"] },

        // Building E - Floors 1 to 2, Rooms E1-E10
        E1: { id: "E1", name: "Room E1", building: "Building E", floor: 1, capacity: 5, equipment: ["AC"] },
        E2: { id: "E2", name: "Room E2", building: "Building E", floor: 1, capacity: 6, equipment: ["Projector", "Whiteboard"] },
        E3: { id: "E3", name: "Room E3", building: "Building E", floor: 1, capacity: 5, equipment: ["Whiteboard"] },
        E4: { id: "E4", name: "Room E4", building: "Building E", floor: 1, capacity: 6, equipment: ["AC"] },
        E5: { id: "E5", name: "Room E5", building: "Building E", floor: 1, capacity: 7, equipment: ["Projector", "Whiteboard", "AC"] },

        E6: { id: "E6", name: "Room E6", building: "Building E", floor: 2, capacity: 7, equipment: ["Projector"] },
        E7: { id: "E7", name: "Room E7", building: "Building E", floor: 2, capacity: 9, equipment: ["Whiteboard"] },
        E8: { id: "E8", name: "Room E8", building: "Building E", floor: 2, capacity: 6, equipment: ["AC"] },
        E9: { id: "E9", name: "Room E9", building: "Building E", floor: 2, capacity: 8, equipment: ["Projector", "Whiteboard"] },
        E10: { id: "E10", name: "Room E10", building: "Building E", floor: 2, capacity: 10, equipment: ["AC"] },

        // Building F - Floors 1 to 3, Rooms F1-F20
        F1: { id: "F1", name: "Room F1", building: "Building F", floor: 1, capacity: 5, equipment: ["AC"] },
        F2: { id: "F2", name: "Room F2", building: "Building F", floor: 1, capacity: 4, equipment: ["Whiteboard"] },
        F3: { id: "F3", name: "Room F3", building: "Building F", floor: 1, capacity: 5, equipment: ["Projector"] },
        F4: { id: "F4", name: "Room F4", building: "Building F", floor: 1, capacity: 4, equipment: ["AC"] },
        F5: { id: "F5", name: "Room F5", building: "Building F", floor: 1, capacity: 6, equipment: ["Whiteboard", "AC"] },

        F6: { id: "F6", name: "Room F6", building: "Building F", floor: 2, capacity: 8, equipment: ["Whiteboard"] },
        F7: { id: "F7", name: "Room F7", building: "Building F", floor: 2, capacity: 6, equipment: ["Projector"] },
        F8: { id: "F8", name: "Room F8", building: "Building F", floor: 2, capacity: 8, equipment: ["AC"] },
        F9: { id: "F9", name: "Room F9", building: "Building F", floor: 2, capacity: 6, equipment: ["Whiteboard"] },
        F10: { id: "F10", name: "Room F10", building: "Building F", floor: 2, capacity: 10, equipment: ["Projector", "AC"] },

        F11: { id: "F11", name: "Room F11", building: "Building F", floor: 3, capacity: 12, equipment: ["Projector", "Whiteboard"] },
        F12: { id: "F12", name: "Room F12", building: "Building F", floor: 3, capacity: 10, equipment: ["AC"] },
        F13: { id: "F13", name: "Room F13", building: "Building F", floor: 3, capacity: 12, equipment: ["Whiteboard"] },
        F14: { id: "F14", name: "Room F14", building: "Building F", floor: 3, capacity: 10, equipment: ["Projector"] },
        F15: { id: "F15", name: "Room F15", building: "Building F", floor: 3, capacity: 15, equipment: ["AC"] },
        F16: { id: "F16", name: "Room F16", building: "Building F", floor: 3, capacity: 11, equipment: ["Projector"] },
        F17: { id: "F17", name: "Room F17", building: "Building F", floor: 3, capacity: 9, equipment: ["Whiteboard"] },
        F18: { id: "F18", name: "Room F18", building: "Building F", floor: 3, capacity: 13, equipment: ["AC"] },
        F19: { id: "F19", name: "Room F19", building: "Building F", floor: 3, capacity: 10, equipment: ["Projector", "Whiteboard"] },
        F20: { id: "F20", name: "Room F20", building: "Building F", floor: 3, capacity: 14, equipment: ["AC"] },
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