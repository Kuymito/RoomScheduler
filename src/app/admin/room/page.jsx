import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import RoomPageSkeleton from './components/RoomPageSkeleton';
import RoomClientView from './components/RoomClientView'; // We will create this next

const fetchRoomData = async () => {
    const initialRoomsData = {
        // Building A: Total 26 rooms, 10 rooms on Floor 1 (unavailable, includes MeetingA), 9 rooms on Floor 2 (available), 7 rooms on Floor 3 (available)
        A1: { id: "A1", name: "A1", building: "Building A", floor: 1, capacity: 30, equipment: ["Projector", "Whiteboard", "AC"], status: "unavailable" },
        A2: { id: "A2", name: "A2", building: "Building A", floor: 1, capacity: 20, equipment: ["Whiteboard", "AC"], status: "unavailable" },
        A3: { id: "A3", name: "A3", building: "Building A", floor: 1, capacity: 25, equipment: ["Projector", "AC"], status: "unavailable" },
        A4: { id: "A4", name: "A4", building: "Building A", floor: 1, capacity: 18, equipment: ["Whiteboard"], status: "unavailable" },
        A5: { id: "A5", name: "A5", building: "Building A", floor: 1, capacity: 22, equipment: ["Projector", "AC"], status: "unavailable" },
        A6: { id: "A6", name: "A6", building: "Building A", floor: 1, capacity: 18, equipment: ["Whiteboard"], status: "unavailable" },
        A7: { id: "A7", name: "A7", building: "Building A", floor: 1, capacity: 20, equipment: ["Projector", "AC"], status: "unavailable" },
        A8: { id: "A8", name: "A8", building: "Building A", floor: 1, capacity: 16, equipment: ["Whiteboard"], status: "unavailable" },
        A9: { id: "A9", name: "A9", building: "Building A", floor: 1, capacity: 18, equipment: ["Projector", "AC"], status: "unavailable" },
        MeetingA: { id: "MeetingA", name: "Meeting A", building: "Building A", floor: 1, capacity: 100, equipment: ["Projector", "Whiteboard", "Conference System", "Video Conferencing"], status: "unavailable" }, // 10th on Floor 1

        A10: { id: "A10", name: "A10", building: "Building A", floor: 2, capacity: 20, equipment: ["Whiteboard"], status: "available" },
        A11: { id: "A11", name: "A11", building: "Building A", floor: 2, capacity: 22, equipment: ["Projector", "AC"], status: "available" },
        A12: { id: "A12", name: "A12", building: "Building A", floor: 2, capacity: 18, equipment: ["Whiteboard"], status: "available" },
        A13: { id: "A13", name: "A13", building: "Building A", floor: 2, capacity: 20, equipment: ["Projector", "AC"], status: "available" },
        A14: { id: "A14", name: "A14", building: "Building A", floor: 2, capacity: 16, equipment: ["Whiteboard"], status: "available" },
        A15: { id: "A15", name: "A15", building: "Building A", floor: 2, capacity: 18, equipment: ["Projector", "AC"], status: "available" },
        A16: { id: "A16", name: "A16", building: "Building A", floor: 2, capacity: 20, equipment: ["Whiteboard"], status: "available" },
        A17: { id: "A17", name: "A17", building: "Building A", floor: 2, capacity: 22, equipment: ["Projector", "AC"], status: "available" },
        A18: { id: "A18", name: "A18", building: "Building A", floor: 2, capacity: 18, equipment: ["Whiteboard"], status: "available" }, // Total 9 rooms on Floor 2

        A19: { id: "A19", name: "A19", building: "Building A", floor: 3, capacity: 20, equipment: ["Projector", "AC"], status: "available" },
        A20: { id: "A20", name: "A20", building: "Building A", floor: 3, capacity: 16, equipment: ["Whiteboard"], status: "available" },
        A21: { id: "A21", name: "A21", building: "Building A", floor: 3, capacity: 18, equipment: ["Projector", "AC"], status: "available" },
        A22: { id: "A22", name: "A22", building: "Building A", floor: 3, capacity: 20, equipment: ["Whiteboard"], status: "available" },
        A23: { id: "A23", name: "A23", building: "Building A", floor: 3, capacity: 22, equipment: ["Projector", "AC"], status: "available" },
        A24: { id: "A24", name: "A24", building: "Building A", floor: 3, capacity: 18, equipment: ["Whiteboard"], status: "available" },
        A25: { id: "A25", name: "A25", building: "Building A", floor: 3, capacity: 20, equipment: ["Projecter", "AC"], status: "available" },
        A26: { id: "A26", name: "A26", building: "Building A", floor: 3, capacity: 16, equipment: ["Whiteboard"], status: "available" }, // Total 9 rooms on Floor 3

        // Building B: 2 floors, 5 rooms on Floor 1, (B1-B5), 2 rooms on Floor 2 (B6, Meeting)
        B1: { id: "B1", name: "B1", building: "Building B", floor: 1, capacity: 15, equipment: ["Projector", "AC"], status: "available" },
        B2: { id: "B2", name: "B2", building: "Building B", floor: 1, capacity: 20, equipment: ["Whiteboard"], status: "available" },
        B3: { id: "B3", name: "B3", building: "Building B", floor: 1, capacity: 18, equipment: ["Projector", "AC"], status: "available" },
        B4: { id: "B4", name: "B4", building: "Building B", floor: 1, capacity: 22, equipment: ["Whiteboard"], status: "available" },
        B5: { id: "B5", name: "B5", building: "Building B", floor: 1, capacity: 20, equipment: ["Projector", "AC"], status: "available" },
        B6: { id: "B6", name: "B6", building: "Building B", floor: 2, capacity: 18, equipment: ["Whiteboard"], status: "available" },
        Meeting: { id: "Meeting", name: "Meeting Room", building: "Building B", floor: 2, capacity: 82, equipment: ["Projector", "Whiteboard", "AC", "Conference System"], status: "available" },
        
        // Building C: 3 floors, 4 rooms per floor (total 12 rooms)
        C1: { id: "C1", name: "C1", building: "Building C", floor: 1, capacity: 10, equipment: ["AC"], status: "unavailable" },
        C2: { id: "C2", name: "C2", building: "Building C", floor: 1, capacity: 12, equipment: ["Whiteboard", "AC"], status: "unavailable" },
        C3: { id: "C3", name: "C3", building: "Building C", floor: 1, capacity: 8, equipment: ["Projector"], status: "unavailable" },
        C4: { id: "C4", name: "C4", building: "Building C", floor: 1, capacity: 10, equipment: ["Whiteboard"], status: "unavailable" },
        C5: { id: "C5", name: "C5", building: "Building C", floor: 2, capacity: 5, equipment: ["AC"], status: "available" },
        C6: { id: "C6", name: "C6", building: "Building C", floor: 2, capacity: 6, equipment: ["Projector", "Whiteboard"], status: "available" },
        C7: { id: "C7", name: "C7", building: "Building C", floor: 2, capacity: 12, equipment: ["Projector", "Whiteboard"], status: "available" },
        C8: { id: "C8", name: "C8", building: "Building C", floor: 2, capacity: 10, equipment: ["AC"], status: "available" },
        C9: { id: "C9", name: "C9", building: "Building C", floor: 3, capacity: 8, equipment: ["Whiteboard"], status: "available" },
        C10: { id: "C10", name: "C10", building: "Building C", floor: 3, capacity: 6, equipment: ["Projector"], status: "available" },
        C11: { id: "C11", name: "C11", building: "Building C", floor: 3, capacity: 5, equipment: ["AC"], status: "available" },
        C12: { id: "C12", name: "C12", building: "Building C", floor: 3, capacity: 4, equipment: ["Whiteboard"], status: "available" },
        
        // Building D: 3 floors, 1 library per floor. Floor 1 library unavailable.
        LibraryD1: { id: "LibraryD1", name: "Library D1", building: "Building D", floor: 1, capacity: 60, equipment: ["Bookshelves", "Computers", "Tables", "Study Desks"], status: "unavailable" },
        LibraryD2: { id: "LibraryD2", name: "Library D2", building: "Building D", floor: 2, capacity: 60, equipment: ["Bookshelves", "Computers", "Tables", "Study Desks"], status: "available" },
        LibraryD3: { id: "LibraryD3", name: "Library D3", building: "Building D", floor: 3, capacity: 60, equipment: ["Bookshelves", "Computers", "Tables", "Study Desks"], status: "available" },

        // Building E: 5 floors. Floor 1 has 6 rooms (E1-E6, E3 available, others unavailable). Floors 2-5 have 5 rooms each (available).
        E1: { id: "E1", name: "E1", building: "Building E", floor: 1, capacity: 5, equipment: ["AC"], status: "unavailable" },
        E2: { id: "E2", name: "E2", building: "Building E", floor: 1, capacity: 6, equipment: ["Projector", "Whiteboard"], status: "unavailable" },
        E3: { id: "E3", name: "E3", building: "Building E", floor: 1, capacity: 8, equipment: ["Whiteboard"], status: "available" },
        E4: { id: "E4", name: "E4", building: "Building E", floor: 1, capacity: 10, equipment: ["AC", "Projector"], status: "unavailable" },
        E5: { id: "E5", name: "E5", building: "Building E", floor: 1, capacity: 12, equipment: ["AC"], status: "unavailable" },
        E6: { id: "E6", name: "E6", building: "Building E", floor: 1, capacity: 9, equipment: ["Whiteboard", "Projector"], status: "unavailable" },

        E7: { id: "E7", name: "E7", building: "Building E", floor: 2, capacity: 7, equipment: ["Projector"], status: "available" },
        E8: { id: "E8", name: "E8", building: "Building E", floor: 2, capacity: 11, equipment: ["AC"], status: "available" },
        E9: { id: "E9", name: "E9", building: "Building E", floor: 2, capacity: 13, equipment: ["Whiteboard", "AC"], status: "available" },
        E10: { id: "E10", name: "E10", building: "Building E", floor: 2, capacity: 15, equipment: ["Projector", "Whiteboard"], status: "available" },
        E11: { id: "E11", name: "E11", building: "Building E", floor: 2, capacity: 6, equipment: ["AC"], status: "available" },

        E12: { id: "E12", name: "E12", building: "Building E", floor: 3, capacity: 8, equipment: ["Whiteboard"], status: "available" },
        E13: { id: "E13", name: "E13", building: "Building E", floor: 3, capacity: 5, equipment: ["Projector"], status: "available" },
        E14: { id: "E14", name: "E14", building: "Building E", floor: 3, capacity: 9, equipment: ["AC"], status: "available" },
        E15: { id: "E15", name: "E15", building: "Building E", floor: 3, capacity: 10, equipment: ["Whiteboard", "AC"], status: "available" },
        E16: { id: "E16", name: "E16", building: "Building E", floor: 3, capacity: 7, equipment: ["Projector"], status: "available" },

        E17: { id: "E17", name: "E17", building: "Building E", floor: 4, capacity: 14, equipment: ["AC", "Whiteboard"], status: "available" },
        E18: { id: "E18", name: "E18", building: "Building E", floor: 4, capacity: 11, equipment: ["Projector"], status: "available" },
        E19: { id: "E19", name: "E19", building: "Building E", floor: 4, capacity: 4, equipment: ["Whiteboard"], status: "available" },
        E20: { id: "E20", name: "E20", building: "Building E", floor: 4, capacity: 6, equipment: ["AC"], status: "available" },
        E21: { id: "E21", name: "E21", building: "Building E", floor: 4, capacity: 8, equipment: ["Projector", "Whiteboard"], status: "available" },

        E22: { id: "E22", name: "E22", building: "Building E", floor: 5, capacity: 10, equipment: ["AC"], status: "available" },
        E23: { id: "E23", name: "E23", building: "Building E", floor: 5, capacity: 12, equipment: ["Whiteboard"], status: "available" },
        E24: { id: "E24", name: "E24", building: "Building E", floor: 5, capacity: 15, equipment: ["Projector", "AC"], status: "available" },
        E25: { id: "E25", name: "E25", building: "Building E", floor: 5, capacity: 13, equipment: ["AC", "Whiteboard"], status: "available" },
        E26: { id: "E26", name: "E26", building: "Building E", floor: 5, capacity: 9, equipment: ["Whiteboard"], status: "available" }, // Total 5 rooms on Floor 5
        
        // Building F: 5 floors, 4 rooms per floor (total 20 rooms)
        F1: { id: "F1", name: "F1", building: "Building F", floor: 1, capacity: 12, equipment: ["Projector", "Whiteboard"], status: "available" },
        F2: { id: "F2", name: "F2", building: "Building F", floor: 1, capacity: 10, equipment: ["AC"], status: "available" },
        F3: { id: "F3", name: "F3", building: "Building F", floor: 1, capacity: 8, equipment: ["Whiteboard"], status: "available" },
        F4: { id: "F4", name: "F4", building: "Building F", floor: 1, capacity: 6, equipment: ["Projector"], status: "available" },

        F5: { id: "F5", name: "F5", building: "Building F", floor: 2, capacity: 5, equipment: ["AC"], status: "available" },
        F6: { id: "F6", name: "F6", building: "Building F", floor: 2, capacity: 4, equipment: ["Whiteboard"], status: "available" },
        F7: { id: "F7", name: "F7", building: "Building F", floor: 2, capacity: 15, equipment: ["Projector", "AC", "Whiteboard"], status: "available" },
        F8: { id: "F8", name: "F8", building: "Building F", floor: 2, capacity: 7, equipment: ["AC"], status: "available" },

        F9: { id: "F9", name: "F9", building: "Building F", floor: 3, capacity: 9, equipment: ["Whiteboard", "AC"], status: "available" },
        F10: { id: "F10", name: "F10", building: "Building F", floor: 3, capacity: 11, equipment: ["Projector"], status: "available" },
        F11: { id: "F11", name: "F11", building: "Building F", floor: 3, capacity: 6, equipment: ["AC"], status: "available" },
        F12: { id: "F12", name: "F12", building: "Building F", floor: 3, capacity: 8, equipment: ["Whiteboard"], status: "available" },

        F13: { id: "F13", name: "F13", building: "Building F", floor: 4, capacity: 10, equipment: ["Projector", "AC"], status: "available" },
        F14: { id: "F14", name: "F14", building: "Building F", floor: 4, capacity: 7, equipment: ["Whiteboard"], status: "available" },
        F15: { id: "F15", name: "F15", building: "Building F", floor: 4, capacity: 14, equipment: ["AC"], status: "available" },
        F16: { id: "F16", name: "F16", building: "Building F", floor: 4, capacity: 9, equipment: ["Projector", "Whiteboard"], status: "available" },

        F17: { id: "F17", name: "F17", building: "Building F", floor: 5, capacity: 5, equipment: ["AC"], status: "available" },
        F18: { id: "F18", name: "F18", building: "Building F", floor: 5, capacity: 6, equipment: ["Whiteboard"], status: "available" },
        F19: { id: "F19", name: "F19", building: "Building F", floor: 5, capacity: 11, equipment: ["Projector"], status: "available" },
        F20: { id: "F20", name: "F20", building: "Building F", floor: 5, capacity: 13, equipment: ["AC", "Whiteboard"], status: "available" },
    };

    // Artificial delay removed
    return initialRoomsData;
};

export default async function AdminRoomPage() {
    // Data is fetched on the server before the page is sent to the client.
    const allRoomsData = await fetchRoomData();

    return (
        <AdminLayout activeItem="room" pageTitle="Management">
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