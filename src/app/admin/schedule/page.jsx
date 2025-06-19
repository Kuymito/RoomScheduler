import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ScheduleClientView from './components/ScheduleClientView';
import ClassListSkeleton from './components/ClassListSkeleton';
import ScheduleGridSkeleton from './components/ScheduleGridSkeleton';

// --- Data Structures & Fetching (Moved to server-side) ---

const degrees = ['Bachelor', 'Master', 'PhD'];
const generations = ['Gen 2023', 'Gen 2024', 'Gen 2025', 'Gen 2026'];
const buildings = ['A', 'B', 'C', 'D', 'E', 'F'];
const weekdays = ['Mo', 'Tu', 'We', 'Thu', 'Fr', 'Sa', 'Su'];
const timeSlots = ['7:00 - 10:00', '10:30 - 13:30', '14:00 - 17:00', '17:30 - 20:30'];
const gridDimensions = { rows: 5, cols: 5 }; // Still keep it as a constant for now if other parts rely on it

const fetchSchedulePageData = async () => {
    // In a real app, these would be database queries.
    const initialClasses = [
        { id: 'class_101', name: 'Intro to Physics', code: 'PHY-101', degree: 'Bachelor', generation: 'Gen 2025', shift: '7:00 - 10:00' },
        { id: 'class_102', name: 'Calculus I', code: 'MTH-110', degree: 'Bachelor', generation: 'Gen 2026', shift: '10:30 - 13:30' },
        { id: 'class_103', name: 'Organic Chemistry', code: 'CHM-220', degree: 'Bachelor', generation: 'Gen 2024', shift: '14:00 - 17:00' },
        { id: 'class_104', name: 'World History', code: 'HIS-100', degree: 'Master', generation: 'Gen 2023', shift: '17:30 - 20:30' },
        { id: 'class_105', name: 'English Composition', code: 'ENG-101', degree: 'Master', generation: 'Gen 2025', shift: '7:00 - 10:00' },
        { id: 'class_106', name: 'Linear Algebra', code: 'MTH-210', degree: 'Master', generation: 'Gen 2025', shift: '10:30 - 13:30' },
        { id: 'class_107', name: 'Data Structures', code: 'CS-250', degree: 'PhD', generation: 'Gen 2024', shift: '14:00 - 17:00' },
        { id: 'class_108', name: 'Microeconomics', code: 'ECN-200', degree: 'PhD', generation: 'Gen 2026', shift: '17:30 - 20:30' },
        { id: 'class_109', name: 'Art History', code: 'ART-150', degree: 'PhD', generation: 'Gen 2023', shift: '7:00 - 10:00' },
        { id: 'class_110', name: 'Computer Networks', code: 'CS-350', degree: 'PhD', generation: 'Gen 2023', shift: '10:30 - 13:30' },
        { id: 'class_111', name: 'Thermodynamics', code: 'PHY-201', degree: 'Bachelor', generation: 'Gen 2025', shift: '14:00 - 17:00' },
        { id: 'class_112', name: 'Discrete Math', code: 'MTH-220', degree: 'Bachelor', generation: 'Gen 2026', shift: '17:30 - 20:30' },
        { id: 'class_113', name: 'Biochemistry', code: 'CHM-330', degree: 'Bachelor', generation: 'Gen 2024', shift: '7:00 - 10:00' },
        { id: 'class_114', name: 'European History', code: 'HIS-200', degree: 'Master', generation: 'Gen 2023', shift: '10:30 - 13:30' },
        { id: 'class_115', name: 'Creative Writing', code: 'ENG-201', degree: 'Master', generation: 'Gen 2025', shift: '14:00 - 17:00' },
        { id: 'class_116', name: 'Abstract Algebra', code: 'MTH-310', degree: 'Master', generation: 'Gen 2025', shift: '17:30 - 20:30' },
        { id: 'class_117', name: 'Algorithms', code: 'CS-351', degree: 'PhD', generation: 'Gen 2024', shift: '7:00 - 10:00' },
        { id: 'class_118', name: 'Macroeconomics', code: 'ECN-300', degree: 'PhD', generation: 'Gen 2026', shift: '10:30 - 13:30' },
        { id: 'class_119', name: 'Modern Art', code: 'ART-250', degree: 'PhD', generation: 'Gen 2023', shift: '14:00 - 17:00' },
        { id: 'class_120', name: 'Operating Systems', code: 'CS-450', degree: 'PhD', generation: 'Gen 2023', shift: '17:30 - 20:30' },
    ];

    // Hardcoded initial rooms data matching the room page layout for buildings A to F
    const initialRoomsData = {
        A1: { id: "A1", name: "Room A1", building: "Building A", floor: 1, capacity: 30, equipment: ["Projector", "Whiteboard", "AC"], status: "unavailable" },
        A2: { id: "A2", name: "Room A2", building: "Building A", floor: 1, capacity: 20, equipment: ["Whiteboard", "AC"], status: "unavailable" },
        A3: { id: "A3", name: "Room A3", building: "Building A", floor: 1, capacity: 25, equipment: ["Projector", "AC"], status: "unavailable" },
        A4: { id: "A4", name: "Room A4", building: "Building A", floor: 1, capacity: 18, equipment: ["Whiteboard"], status: "unavailable" },
        A5: { id: "A5", name: "Room A5", building: "Building A", floor: 1, capacity: 22, equipment: ["Projector", "AC"], status: "unavailable" },
        A6: { id: "A6", name: "Room A6", building: "Building A", floor: 1, capacity: 18, equipment: ["Whiteboard"], status: "unavailable" },
        A7: { id: "A7", name: "Room A7", building: "Building A", floor: 1, capacity: 20, equipment: ["Projector", "AC"], status: "unavailable" },
        A8: { id: "A8", name: "Room A8", building: "Building A", floor: 1, capacity: 16, equipment: ["Whiteboard"], status: "unavailable" },
        A9: { id: "A9", name: "Room A9", building: "Building A", floor: 1, capacity: 18, equipment: ["Projector", "AC"], status: "unavailable" },
        MeetingA: { id: "MeetingA", name: "Meeting Room A", building: "Building A", floor: 1, capacity: 100, equipment: ["Projector", "Whiteboard", "Conference System", "Video Conferencing"], status: "unavailable" },

        A10: { id: "A10", name: "Room A10", building: "Building A", floor: 2, capacity: 20, equipment: ["Whiteboard"], status: "available" },
        A11: { id: "A11", name: "Room A11", building: "Building A", floor: 2, capacity: 22, equipment: ["Projector", "AC"], status: "available" },
        A12: { id: "A12", name: "Room A12", building: "Building A", floor: 2, capacity: 18, equipment: ["Whiteboard"], status: "available" },
        A13: { id: "A13", name: "Room A13", building: "Building A", floor: 2, capacity: 20, equipment: ["Projector", "AC"], status: "available" },
        A14: { id: "A14", name: "Room A14", building: "Building A", floor: 2, capacity: 16, equipment: ["Whiteboard"], status: "available" },
        A15: { id: "A15", name: "Room A15", building: "Building A", floor: 2, capacity: 18, equipment: ["Projector", "AC"], status: "available" },
        A16: { id: "A16", name: "Room A16", building: "Building A", floor: 2, capacity: 20, equipment: ["Whiteboard"], status: "available" },
        A17: { id: "A17", name: "Room A17", building: "Building A", floor: 2, capacity: 22, equipment: ["Projector", "AC"], status: "available" },
        A18: { id: "A18", name: "Room A18", building: "Building A", floor: 2, capacity: 18, equipment: ["Whiteboard"], status: "available" },

        A19: { id: "A19", name: "Room A19", building: "Building A", floor: 3, capacity: 20, equipment: ["Projector", "AC"], status: "available" },
        A20: { id: "A20", name: "Room A20", building: "Building A", floor: 3, capacity: 16, equipment: ["Whiteboard"], status: "available" },
        A21: { id: "A21", name: "Room A21", building: "Building A", floor: 3, capacity: 18, equipment: ["Projector", "AC"], status: "available" },
        A22: { id: "A22", name: "Room A22", building: "Building A", floor: 3, capacity: 20, equipment: ["Whiteboard"], status: "available" },
        A23: { id: "A23", name: "Room A23", building: "Building A", floor: 3, capacity: 22, equipment: ["Projector", "AC"], status: "available" },
        A24: { id: "A24", name: "Room A24", building: "Building A", floor: 3, capacity: 18, equipment: ["Whiteboard"], status: "available" },
        A25: { id: "A25", name: "Room A25", building: "Building A", floor: 3, capacity: 20, equipment: ["Projector", "AC"], status: "available" },

        B1: { id: "B1", name: "Room B1", building: "Building B", floor: 1, capacity: 15, equipment: ["Projector", "AC"], status: "available" },
        B2: { id: "B2", name: "Room B2", building: "Building B", floor: 1, capacity: 20, equipment: ["Whiteboard"], status: "available" },
        B3: { id: "B3", name: "Room B3", building: "Building B", floor: 1, capacity: 18, equipment: ["Projector", "AC"], status: "available" },
        B4: { id: "B4", name: "Room B4", building: "Building B", floor: 1, capacity: 22, equipment: ["Whiteboard"], status: "available" },
        B5: { id: "B5", name: "Room B5", building: "Building B", floor: 1, capacity: 20, equipment: ["Projector", "AC"], status: "available" },
        B6: { id: "B6", name: "Room B6", building: "Building B", floor: 2, capacity: 18, equipment: ["Whiteboard"], status: "available" },
        Meeting: { id: "Meeting", name: "Meeting Room", building: "Building B", floor: 2, capacity: 82, equipment: ["Projector", "Whiteboard", "AC", "Conference System"], status: "available" },

        C1: { id: "C1", name: "Room C1", building: "Building C", floor: 1, capacity: 10, equipment: ["AC"], status: "unavailable" },
        C2: { id: "C2", name: "Room C2", building: "Building C", floor: 1, capacity: 12, equipment: ["Whiteboard", "AC"], status: "unavailable" },
        C3: { id: "C3", name: "Room C3", building: "Building C", floor: 1, capacity: 8, equipment: ["Projector"], status: "unavailable" },
        C4: { id: "C4", name: "Room C4", building: "Building C", floor: 1, capacity: 10, equipment: ["Whiteboard"], status: "unavailable" },
        C5: { id: "C5", name: "Room C5", building: "Building C", floor: 2, capacity: 5, equipment: ["AC"], status: "available" },
        C6: { id: "C6", name: "Room C6", building: "Building C", floor: 2, capacity: 6, equipment: ["Projector", "Whiteboard"], status: "available" },
        C7: { id: "C7", name: "Room C7", building: "Building C", floor: 2, capacity: 12, equipment: ["Projector", "Whiteboard"], status: "available" },
        C8: { id: "C8", name: "Room C8", building: "Building C", floor: 2, capacity: 10, equipment: ["AC"], status: "available" },
        C9: { id: "C9", name: "Room C9", building: "Building C", floor: 3, capacity: 8, equipment: ["Whiteboard"], status: "available" },
        C10: { id: "C10", name: "Room C10", building: "Building C", floor: 3, capacity: 6, equipment: ["Projector"], status: "available" },
        C11: { id: "C11", name: "Room C11", building: "Building C", floor: 3, capacity: 5, equipment: ["AC"], status: "available" },
        C12: { id: "C12", name: "Room C12", building: "Building C", floor: 3, capacity: 4, equipment: ["Whiteboard"], status: "available" },

        LibraryD1: { id: "LibraryD1", name: "Library Room D1", building: "Building D", floor: 1, capacity: 60, equipment: ["Bookshelves", "Computers", "Tables", "Study Desks"], status: "unavailable" },
        LibraryD2: { id: "LibraryD2", name: "Library Room D2", building: "Building D", floor: 2, capacity: 60, equipment: ["Bookshelves", "Computers", "Tables", "Study Desks"], status: "available" },
        LibraryD3: { id: "LibraryD3", name: "Library Room D3", building: "Building D", floor: 3, capacity: 60, equipment: ["Bookshelves", "Computers", "Tables", "Study Desks"], status: "available" },

        E1: { id: "E1", name: "Room E1", building: "Building E", floor: 1, capacity: 5, equipment: ["AC"], status: "unavailable" },
        E2: { id: "E2", name: "Room E2", building: "Building E", floor: 1, capacity: 6, equipment: ["Projector", "Whiteboard"], status: "unavailable" },
        E3: { id: "E3", name: "Room E3", building: "Building E", floor: 1, capacity: 8, equipment: ["Whiteboard"], status: "available" },
        E4: { id: "E4", name: "Room E4", building: "Building E", floor: 1, capacity: 10, equipment: ["AC", "Projector"], status: "unavailable" },
        E5: { id: "E5", name: "Room E5", building: "Building E", floor: 1, capacity: 12, equipment: ["AC"], status: "unavailable" },
        E6: { id: "E6", name: "Room E6", building: "Building E", floor: 1, capacity: 9, equipment: ["Whiteboard", "Projector"], status: "unavailable" },

        E7: { id: "E7", name: "Room E7", building: "Building E", floor: 2, capacity: 7, equipment: ["Projector"], status: "available" },
        E8: { id: "E8", name: "Room E8", building: "Building E", floor: 2, capacity: 11, equipment: ["AC"], status: "available" },
        E9: { id: "E9", name: "Room E9", building: "Building E", floor: 2, capacity: 13, equipment: ["Whiteboard", "AC"], status: "available" },
        E10: { id: "E10", name: "Room E10", building: "Building E", floor: 2, capacity: 15, equipment: ["Projector", "Whiteboard"], status: "available" },
        E11: { id: "E11", name: "Room E11", building: "Building E", floor: 2, capacity: 6, equipment: ["AC"], status: "available" },

        E12: { id: "E12", name: "Room E12", building: "Building E", floor: 3, capacity: 8, equipment: ["Whiteboard"], status: "available" },
        E13: { id: "E13", name: "Room E13", building: "Building E", floor: 3, capacity: 5, equipment: ["Projector"], status: "available" },
        E14: { id: "E14", name: "Room E14", building: "Building E", floor: 3, capacity: 9, equipment: ["AC"], status: "available" },
        E15: { id: "E15", name: "Room E15", building: "Building E", floor: 3, capacity: 10, equipment: ["Whiteboard", "AC"], status: "available" },
        E16: { id: "E16", name: "Room E16", building: "Building E", floor: 3, capacity: 7, equipment: ["Projector"], status: "available" },

        E17: { id: "E17", name: "Room E17", building: "Building E", floor: 4, capacity: 14, equipment: ["AC", "Whiteboard"], status: "available" },
        E18: { id: "E18", name: "Room E18", building: "Building E", floor: 4, capacity: 11, equipment: ["Projector"], status: "available" },
        E19: { id: "E19", name: "Room E19", building: "Building E", floor: 4, capacity: 4, equipment: ["Whiteboard"], status: "available" },
        E20: { id: "E20", name: "Room E20", building: "Building E", floor: 4, capacity: 6, equipment: ["AC"], status: "available" },
        E21: { id: "E21", name: "Room E21", building: "Building E", floor: 4, capacity: 8, equipment: ["Projector", "Whiteboard"], status: "available" },

        E22: { id: "E22", name: "Room E22", building: "Building E", floor: 5, capacity: 10, equipment: ["AC"], status: "available" },
        E23: { id: "E23", name: "Room E23", building: "Building E", floor: 5, capacity: 12, equipment: ["Whiteboard"], status: "available" },
        E24: { id: "E24", name: "Room E24", building: "Building E", floor: 5, capacity: 15, equipment: ["Projector", "AC"], status: "available" },
        E25: { id: "E25", name: "Room E25", building: "Building E", floor: 5, capacity: 13, equipment: ["AC", "Whiteboard"], status: "available" },
        E26: { id: "E26", name: "Room E26", building: "Building E", floor: 5, capacity: 9, equipment: ["Whiteboard"], status: "available" },

        F1: { id: "F1", name: "Room F1", building: "Building F", floor: 1, capacity: 12, equipment: ["Projector", "Whiteboard"], status: "available" },
        F2: { id: "F2", name: "Room F2", building: "Building F", floor: 1, capacity: 10, equipment: ["AC"], status: "available" },
        F3: { id: "F3", name: "Room F3", building: "Building F", floor: 1, capacity: 8, equipment: ["Whiteboard"], status: "available" },
        F4: { id: "F4", name: "Room F4", building: "Building F", floor: 1, capacity: 6, equipment: ["Projector"], status: "available" },

        F5: { id: "F5", name: "Room F5", building: "Building F", floor: 2, capacity: 5, equipment: ["AC"], status: "available" },
        F6: { id: "F6", name: "Room F6", building: "Building F", floor: 2, capacity: 4, equipment: ["Whiteboard"], status: "available" },
        F7: { id: "F7", name: "Room F7", building: "Building F", floor: 2, capacity: 15, equipment: ["Projector", "AC", "Whiteboard"], status: "available" },
        F8: { id: "F8", name: "Room F8", building: "Building F", floor: 2, capacity: 7, equipment: ["AC"], status: "available" },

        F9: { id: "F9", name: "Room F9", building: "Building F", floor: 3, capacity: 9, equipment: ["Whiteboard", "AC"], status: "available" },
        F10: { id: "F10", name: "Room F10", building: "Building F", floor: 3, capacity: 11, equipment: ["Projector"], status: "available" },
        F11: { id: "F11", name: "Room F11", building: "Building F", floor: 3, capacity: 6, equipment: ["AC"], status: "available" },
        F12: { id: "F12", name: "Room F12", building: "Building F", floor: 3, capacity: 8, equipment: ["Whiteboard"], status: "available" },

        F13: { id: "F13", name: "Room F13", building: "Building F", floor: 4, capacity: 10, equipment: ["Projector", "AC"], status: "available" },
        F14: { id: "F14", name: "Room F14", building: "Building F", floor: 4, capacity: 7, equipment: ["Whiteboard"], status: "available" },
        F15: { id: "F15", name: "Room F15", building: "Building F", floor: 4, capacity: 14, equipment: ["AC"], status: "available" },
        F16: { id: "F16", name: "Room F16", building: "Building F", floor: 4, capacity: 9, equipment: ["Projector", "Whiteboard"], status: "available" },

        F17: { id: "F17", name: "Room F17", building: "Building F", floor: 5, capacity: 5, equipment: ["AC"], status: "available" },
        F18: { id: "F18", name: "Room F18", building: "Building F", floor: 5, capacity: 6, equipment: ["Whiteboard"], status: "available" },
        F19: { id: "F19", name: "Room F19", building: "Building F", floor: 5, capacity: 11, equipment: ["Projector"], status: "available" },
        F20: { id: "F20", name: "Room F20", building: "Building F", floor: 5, capacity: 13, equipment: ["AC", "Whiteboard"], status: "available" },
    };

    const initialRoomsArray = Object.values(initialRoomsData);

    const initialSchedules = {};
    weekdays.forEach(day => {
        initialSchedules[day] = {};
        timeSlots.forEach(time => {
            initialSchedules[day][time] = {};
            buildings.forEach(buildingCode => {
                const fullBuildingName = `Building ${buildingCode}`;
                const roomsInBuilding = initialRoomsArray.filter(room => room.building === fullBuildingName);

                const floorsInBuilding = [...new Set(roomsInBuilding.map(room => room.floor))].sort((a, b) => b - a);

                initialSchedules[day][time][fullBuildingName] = floorsInBuilding.map(floorNum => {
                    return roomsInBuilding.filter(room => room.floor === floorNum).map(room => ({ room, class: null }));
                });
            });
        });
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    return { initialClasses, initialRooms: initialRoomsArray, initialSchedules, constants: { degrees, generations, buildings: buildings.map(b => `Building ${b}`), weekdays, timeSlots, gridDimensions } };
};

export default async function AdminSchedulePage() {
    const { initialClasses, initialRooms, initialSchedules, constants } = await fetchSchedulePageData();

    return (
        <AdminLayout activeItem="schedule" pageTitle="Schedule Management">
            <Suspense fallback={
                <div className='p-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]'>
                    <ClassListSkeleton />
                    <ScheduleGridSkeleton />
                </div>
            }>
                <ScheduleClientView
                    initialClasses={initialClasses}
                    initialRooms={initialRooms}
                    initialSchedules={initialSchedules}
                    constants={constants}
                />
            </Suspense>
        </AdminLayout>
    );
}