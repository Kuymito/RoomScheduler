import { Suspense } from 'react';
import InstructorLayout from "@/components/InstructorLayout";
import InstructorRoomPageSkeleton from "./components/InstructorRoomPageSkeleton";
import InstructorRoomClientView from './components/InstructorRoomClientView';

// --- SERVER-SIDE DATA FETCHING ---

// Helper function to generate a random weekly schedule for a room
const generateDaySchedule = (isAvailableOverall) => {
    if (!isAvailableOverall) {
        // If the is generally unavailable, all slots are unavailable
        return {
            '7:00 - 10:00': "Unavailable",
            '10:30 - 13:30': "Unavailable",
            '14:00 - 17:00': "Unavailable",
            '17:30 - 20:30': "Unavailable",
        };
    }
    // Otherwise, randomly assign "Available" or "Unavailable" to time slots
    return {
        '7:00 - 10:00': Math.random() > 0.5 ? "Available" : "Unavailable",
        '10:30 - 13:30': Math.random() > 0.5 ? "Available" : "Unavailable",
        '14:00 - 17:00': Math.random() > 0.5 ? "Available" : "Unavailable",
        '17:30 - 20:30': Math.random() > 0.5 ? "Available" : "Unavailable",
    };
};

// Helper function to generate a full weekly schedule (Mon-Sun)
const generateWeeklySchedule = (isAvailableOverall) => ({
    'Mon': generateDaySchedule(isAvailableOverall),
    'Tue': generateDaySchedule(isAvailableOverall),
    'Wed': generateDaySchedule(isAvailableOverall),
    'Thur': generateDaySchedule(isAvailableOverall),
    'Fri': generateDaySchedule(isAvailableOverall),
    'Sat': generateDaySchedule(isAvailableOverall),
    'Sun': generateDaySchedule(isAvailableOverall),
});

/**
 * Fetches all rooms data and instructor-specific classes.
 * This function runs on the server.
 */
const fetchAllRoomsAndClasses = async () => {
    // In a real application, this data would typically come from a database.
    // Here, we are using a comprehensive mock dataset that mirrors the admin page.
    const rooms = {};

    // Helper to create a entry
    const createRoom = (id, name, building, floor, capacity, equipment, status) => {
        const isAvailableOverall = status === "available";
        return {
            id,
            name,
            building,
            floor,
            capacity,
            equipment,
            status,
            weeklySchedule: generateWeeklySchedule(isAvailableOverall),
        };
    };

    // Building A: Only first floor unavailable.
    const buildingARooms = [
        // Floor 1 (unavailable)
        ["A1", "A1", 30, ["Projector", "Whiteboard", "AC"], 1, "unavailable"],
        ["A2", "A2", 20, ["Whiteboard", "AC"], 1, "unavailable"],
        ["A3", "A3", 25, ["Projector", "AC"], 1, "unavailable"],
        ["A4", "A4", 18, ["Whiteboard"], 1, "unavailable"],
        ["A5", "A5", 22, ["Projector", "AC"], 1, "unavailable"],
        ["A6", "A6", 18, ["Whiteboard"], 1, "unavailable"],
        ["A7", "A7", 20, ["Projector", "AC"], 1, "unavailable"],
        ["A8", "A8", 16, ["Whiteboard"], 1, "unavailable"],
        ["A9", "A9", 18, ["Projector", "AC"], 1, "unavailable"],
        ["MeetingA", "Meeting A", 100, ["Projector", "Whiteboard", "Conference System", "Video Conferencing"], 1, "unavailable"],
        // Floor 2 (available)
        ["A10", "A10", 20, ["Whiteboard"], 2, "available"],
        ["A11", "A11", 22, ["Projector", "AC"], 2, "available"],
        ["A12", "A12", 18, ["Whiteboard"], 2, "available"],
        ["A13", "A13", 20, ["Projector", "AC"], 2, "available"],
        ["A14", "A14", 16, ["Whiteboard"], 2, "available"],
        ["A15", "A15", 18, ["Projector", "AC"], 2, "available"],
        ["A16", "A16", 20, ["Whiteboard"], 2, "available"],
        ["A17", "A17", 22, ["Projector", "AC"], 2, "available"],
        ["A18", "A18", 18, ["Whiteboard"], 2, "available"],
        // Floor 3 (available)
        ["A19", "A19", 20, ["Projector", "AC"], 3, "available"],
        ["A20", "A20", 16, ["Whiteboard"], 3, "available"],
        ["A21", "A21", 18, ["Projector", "AC"], 3, "available"],
        ["A22", "A22", 20, ["Whiteboard"], 3, "available"],
        ["A23", "A23", 22, ["Projector", "AC"], 3, "available"],
        ["A24", "A24", 18, ["Whiteboard"], 3, "available"],
        ["A25", "A25", 20, ["Projector", "AC"], 3, "available"],
    ];
    buildingARooms.forEach(([id, name, capacity, equipment, floor, status]) => {
        rooms[id] = createRoom(id, name, "Building A", floor, capacity, equipment, status);
    });

    // Building B: All available
    const buildingBRooms = [
        ["B1", "B1", 15, ["Projector", "AC"], 1, "available"],
        ["B2", "B2", 20, ["Whiteboard"], 1, "available"],
        ["B3", "B3", 18, ["Projector", "AC"], 1, "available"],
        ["B4", "B4", 22, ["Whiteboard"], 1, "available"],
        ["B5", "B5", 20, ["Projector", "AC"], 1, "available"],
        ["B6", "B6", 18, ["Whiteboard"], 2, "available"],
        ["Meeting", "Meeting Room", 82, ["Projector", "Whiteboard", "AC", "Conference System"], 2, "available"],
    ];
    buildingBRooms.forEach(([id, name, capacity, equipment, floor, status]) => {
        rooms[id] = createRoom(id, name, "Building B", floor, capacity, equipment, status);
    });

    // Building C: Only first floor unavailable
    const buildingCRooms = [
        // Floor 1 (unavailable)
        ["C1", "C1", 10, ["AC"], 1, "unavailable"],
        ["C2", "C2", 12, ["Whiteboard", "AC"], 1, "unavailable"],
        ["C3", "C3", 8, ["Projector"], 1, "unavailable"],
        ["C4", "C4", 10, ["Whiteboard"], 1, "unavailable"],
        // Floor 2 (available)
        ["C5", "C5", 5, ["AC"], 2, "available"],
        ["C6", "C6", 6, ["Projector", "Whiteboard"], 2, "available"],
        ["C7", "C7", 12, ["Projector", "Whiteboard"], 2, "available"],
        ["C8", "C8", 10, ["AC"], 2, "available"],
        // Floor 3 (available)
        ["C9", "C9", 8, ["Whiteboard"], 3, "available"],
        ["C10", "C10", 6, ["Projector"], 3, "available"],
        ["C11", "C11", 5, ["AC"], 3, "available"],
        ["C12", "C12", 4, ["Whiteboard"], 3, "available"],
    ];
    buildingCRooms.forEach(([id, name, capacity, equipment, floor, status]) => {
        rooms[id] = createRoom(id, name, "Building C", floor, capacity, equipment, status);
    });

    // Building D: All unavailable
    const buildingDRooms = [
        ["LibraryD1", "Library D1", 60, ["Bookshelves", "Computers", "Tables", "Study Desks"], 1, "unavailable"],
        ["LibraryD2", "Library D2", 60, ["Bookshelves", "Computers", "Tables", "Study Desks"], 2, "unavailable"],
        ["LibraryD3", "Library D3", 60, ["Bookshelves", "Computers", "Tables", "Study Desks"], 3, "unavailable"],
    ];
    buildingDRooms.forEach(([id, name, capacity, equipment, floor, status]) => {
        rooms[id] = createRoom(id, name, "Building D", floor, capacity, equipment, status);
    });

    // Building E: Only E3 on the first floor is available. Other first floor rooms and all other floors are unavailable.
    const buildingERooms = [
        // Floor 1
        ["E1", "E1", 5, ["AC"], 1, "unavailable"],
        ["E2", "E2", 6, ["Projector", "Whiteboard"], 1, "unavailable"],
        ["E3", "E3", 8, ["Whiteboard"], 1, "available"], // This is the ONLY available room
        ["E4", "E4", 10, ["AC", "Projector"], 1, "unavailable"],
        ["E5", "E5", 12, ["AC"], 1, "unavailable"],
        ["E6", "E6", 9, ["Whiteboard", "Projector"], 1, "unavailable"],
        // Floor 2
        ["E7", "E7", 7, ["Projector"], 2, "available"],
        ["E8", "E8", 11, ["AC"], 2, "available"],
        ["E9", "E9", 13, ["Whiteboard", "AC"], 2, "available"],
        ["E10", "E10", 15, ["Projector", "Whiteboard"], 2, "available"],
        ["E11", "E11", 6, ["AC"], 2, "available"],
        // Floor 3
        ["E12", "E12", 8, ["Whiteboard"], 3, "available"],
        ["E13", "E13", 5, ["Projector"], 3, "available"],
        ["E14", "E14", 9, ["AC"], 3, "available"],
        ["E15", "E15", 10, ["Whiteboard", "AC"], 3, "available"],
        ["E16", "E16", 7, ["Projector"], 3, "available"],
        // Floor 4
        ["E17", "E17", 14, ["AC", "Whiteboard"], 4, "available"],
        ["E18", "E18", 11, ["Projector"], 4, "available"],
        ["E19", "E19", 4, ["Whiteboard"], 4, "available"],
        ["E20", "E20", 6, ["AC"], 4, "available"],
        ["E21", "E21", 8, ["Projector", "Whiteboard"], 4, "available"],
        // Floor 5 
        ["E22", "E22", 10, ["AC"], 5, "available"],
        ["E23", "E23", 12, ["Whiteboard"], 5, "available"],
        ["E24", "E24", 15, ["Projector", "AC"], 5, "available"],
        ["E25", "E25", 13, ["AC", "Whiteboard"], 5, "available"],
        ["E26", "E26", 9, ["Whiteboard"], 5, "available"],
    ];
    buildingERooms.forEach(([id, name, capacity, equipment, floor, status]) => {
        rooms[id] = createRoom(id, name, "Building E", floor, capacity, equipment, status);
    });

    // Building F: All available
    const buildingFRooms = [
        ["F1", "F1", 12, ["Projector", "Whiteboard"], 1, "available"],
        ["F2", "F2", 10, ["AC"], 1, "available"],
        ["F3", "F3", 8, ["Whiteboard"], 1, "available"],
        ["F4", "F4", 6, ["Projector"], 1, "available"],
        ["F5", "F5", 5, ["AC"], 2, "available"],
        ["F6", "F6", 4, ["Whiteboard"], 2, "available"],
        ["F7", "F7", 15, ["Projector", "AC", "Whiteboard"], 2, "available"],
        ["F8", "F8", 7, ["AC"], 2, "available"],
        ["F9", "F9", 9, ["Whiteboard", "AC"], 3, "available"],
        ["F10", "F10", 11, ["Projector"], 3, "available"],
        ["F11", "F11", 6, ["AC"], 3, "available"],
        ["F12", "F12", 8, ["Whiteboard"], 3, "available"],
        ["F13", "F13", 10, ["Projector", "AC"], 4, "available"],
        ["F14", "F14", 7, ["Whiteboard"], 4, "available"],
        ["F15", "F15", 14, ["AC"], 4, "available"],
        ["F16", "F16", 9, ["Projector", "Whiteboard"], 4, "available"],
        ["F17", "F17", 5, ["AC"], 5, "available"],
        ["F18", "F18", 6, ["Whiteboard"], 5, "available"],
        ["F19", "F19", 11, ["Projector"], 5, "available"],
        ["F20", "F20", 13, ["AC", "Whiteboard"], 5, "available"],
    ];
    buildingFRooms.forEach(([id, name, capacity, equipment, floor, status]) => {
        rooms[id] = createRoom(id, name, "Building F", floor, capacity, equipment, status);
    });

    // Mock classes assigned to an instructor (e.g., 'instructor01')
    const mockInstructorClasses = {
        "instructor01": [
            { id: "CS101", name: "CS101 - Introduction to Programming", shift: "7:00 - 10:00" },
            { id: "CS305", name: "CS305 - Databases and SQL", shift: "10:30 - 13:30" },
            { id: "IT440", name: "IT440 - Web Development", shift: "14:00 - 17:00" },
            { id: "MTH201", name: "MTH201 - Linear Algebra", shift: "17:30 - 20:30" },
        ],
        // Other instructors and their classes could be here
    };

    // Simulate network delay for fetching data
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    // Return the fetched data
    return { 
        allRoomsData: rooms, 
        instructorClasses: mockInstructorClasses['instructor01'] // Assuming 'instructor01' is the logged-in instructor
    };
};

/**
 * Main Instructor Page Server Component.
 * Fetches initial data on the server and passes it to the client component.
 */
export default async function InstructorRoomPage() {
    const { allRoomsData, instructorClasses } = await fetchAllRoomsAndClasses();

    return (
        <InstructorLayout activeItem="room" pageTitle="Management">
            {/* Suspense boundary for loading state */}
            <Suspense fallback={<InstructorRoomPageSkeleton />}>
                {/* Render the Client Component, passing the server-fetched data as props. */}
                <InstructorRoomClientView
                    initialAllRoomsData={allRoomsData}
                    initialInstructorClasses={instructorClasses}
                />
            </Suspense>
        </InstructorLayout>
    );
}