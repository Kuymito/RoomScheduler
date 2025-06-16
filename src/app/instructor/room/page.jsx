import { Suspense } from 'react';
import InstructorLayout from "@/components/InstructorLayout";
import InstructorRoomPageSkeleton from "./components/InstructorRoomPageSkeleton";
import InstructorRoomClientView from './components/InstructorRoomClientView';

// --- SERVER-SIDE DATA FETCHING ---
const generateDaySchedule = () => ({
    '7:00 - 10:00': Math.random() > 0.5 ? "Available" : "Unavailable",
    '10:30 - 13:30': Math.random() > 0.5 ? "Available" : "Unavailable",
    '14:00 - 17:00': Math.random() > 0.5 ? "Available" : "Unavailable",
    '17:30 - 20:30': Math.random() > 0.5 ? "Available" : "Unavailable",
});
const generateWeeklySchedule = () => ({
    'Mon': generateDaySchedule(),
    'Tue': generateDaySchedule(),
    'Wed': generateDaySchedule(),
    'Thur': generateDaySchedule(),
    'Fri': generateDaySchedule(),
    'Sat': generateDaySchedule(),
    'Sun': generateDaySchedule(),
});

const fetchAllRoomsAndClasses = async () => {
    // In a real app, this would be a database query.
    const initialRoomsData = {
        A1: {id: "A1",name: "Room A1",building: "Building A",floor: 5,capacity: 30,equipment: ["Projector", "Whiteboard", "AC"], weeklySchedule: generateWeeklySchedule()},
        A2: {id: "A2",name: "Room A2",building: "Building A",floor: 5,capacity: 20,equipment: ["Whiteboard", "AC"], weeklySchedule: generateWeeklySchedule()},
        A3: {id: "A3",name: "Room A3",building: "Building A",floor: 5,capacity: 25,equipment: ["Projector", "AC"], weeklySchedule: generateWeeklySchedule()},
        B1: {id: "B1",name: "Room B1",building: "Building A",floor: 4,capacity: 15,equipment: ["Projector", "AC"], weeklySchedule: generateWeeklySchedule()},
        B2: {id: "B2",name: "Room B2",building: "Building A",floor: 4,capacity: 20,equipment: ["Whiteboard"], weeklySchedule: generateWeeklySchedule()},
        C1: {id: "C1",name: "Room C1",building: "Building A",floor: 3,capacity: 10,equipment: ["AC"], weeklySchedule: generateWeeklySchedule()},
        C2: {id: "C2",name: "Room C2",building: "Building A",floor: 3,capacity: 12,equipment: ["Whiteboard", "AC"], weeklySchedule: generateWeeklySchedule()},
        D1: {id: "D1",name: "Room D1",building: "Building A",floor: 2,capacity: 8,equipment: ["Projector"], weeklySchedule: generateWeeklySchedule()},
        D2: {id: "D2",name: "Room D2",building: "Building A",floor: 2,capacity: 10,equipment: ["Whiteboard"], weeklySchedule: generateWeeklySchedule()},
        E1: {id: "E1",name: "Room E1",building: "Building A",floor: 1,capacity: 5,equipment: ["AC"], weeklySchedule: generateWeeklySchedule()},
        E2: {id: "E2",name: "Room E2",building: "Building A",floor: 1,capacity: 6,equipment: ["Projector", "Whiteboard"], weeklySchedule: generateWeeklySchedule()},
        F1: {id: "F1",name: "Room F1",building: "Building B",floor: 3,capacity: 12,equipment: ["Projector", "Whiteboard"], weeklySchedule: generateWeeklySchedule()},
        F2: {id: "F2",name: "Room F2",building: "Building B",floor: 3,capacity: 10,equipment: ["AC"], weeklySchedule: generateWeeklySchedule()},
        G1: {id: "G1",name: "Room G1",building: "Building B",floor: 2,capacity: 8,equipment: ["Whiteboard"], weeklySchedule: generateWeeklySchedule()},
        G2: {id: "G2",name: "Room G2",building: "Building B",floor: 2,capacity: 6,equipment: ["Projector"], weeklySchedule: generateWeeklySchedule()},
        H1: {id: "H1",name: "Room H1",building: "Building B",floor: 1,capacity: 5,equipment: ["AC"], weeklySchedule: generateWeeklySchedule()},
        H2: {id: "H2",name: "Room H2",building: "Building B",floor: 1,capacity: 4,equipment: ["Whiteboard"], weeklySchedule: generateWeeklySchedule()},
    };

    const mockInstructorClasses = {
        "instructor01": [
            { id: "CS101", name: "CS101 - Introduction to Programming" },
            { id: "CS305", name: "CS305 - Databases and SQL" },
            { id: "IT440", name: "IT440 - Web Development" },
        ],
        "instructor02": [
            { id: "ENG210", name: "ENG210 - Advanced Literature" },
            { id: "WRT101", name: "WRT101 - Composition and Rhetoric" },
        ],
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500)); 
    return { allRoomsData: initialRoomsData, instructorClasses: mockInstructorClasses['instructor01'] };
};

/**
 * The main page component is now an async Server Component.
 */
export default async function InstructorRoomPage() {
    const { allRoomsData, instructorClasses } = await fetchAllRoomsAndClasses();

    return (
        <InstructorLayout activeItem="room" pageTitle="Room Management">
            <Suspense fallback={<InstructorRoomPageSkeleton />}>
                <InstructorRoomClientView
                    initialAllRoomsData={allRoomsData}
                    initialInstructorClasses={instructorClasses}
                />
            </Suspense>
        </InstructorLayout>
    );
}