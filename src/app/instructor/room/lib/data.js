// --- MOCK DATABASE ---
export const mockInstructorClasses = {
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

export const weekdays = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
export const timeSlots = ['7:00 - 10:00', '10:30 - 13:30', '14:00 - 17:00', '17:30 - 20:30'];

const generateDaySchedule = () => ({
    '7:00 - 10:00': Math.random() > 0.5 ? "Available" : "Unavailable",
    '10:30 - 13:30': Math.random() > 0.5 ? "Available" : "Unavailable",
    '14:00 - 17:00': Math.random() > 0.5 ? "Available" : "Unavailable",
    '17:30 - 20:30': Math.random() > 0.5 ? "Available" : "Unavailable",
});

const generateWeeklySchedule = () => ({
    'Mon': generateDaySchedule(), 'Tue': generateDaySchedule(), 'Wed': generateDaySchedule(),
    'Thur': generateDaySchedule(), 'Fri': generateDaySchedule(), 'Sat': generateDaySchedule(),
    'Sun': generateDaySchedule(),
});

const initialRoomsData = {
    A1: {id: "A1", name: "Room A1", building: "Building A", floor: 5, capacity: 30, equipment: ["Projector", "Whiteboard", "AC"], weeklySchedule: generateWeeklySchedule()},
    A2: {id: "A2", name: "Room A2", building: "Building A", floor: 5, capacity: 20, equipment: ["Whiteboard", "AC"], weeklySchedule: generateWeeklySchedule()},
    A3: {id: "A3", name: "Room A3", building: "Building A", floor: 5, capacity: 25, equipment: ["Projector", "AC"], weeklySchedule: generateWeeklySchedule()},
    B1: {id: "B1", name: "Room B1", building: "Building A", floor: 4, capacity: 15, equipment: ["Projector", "AC"], weeklySchedule: generateWeeklySchedule()},
    B2: {id: "B2", name: "Room B2", building: "Building A", floor: 4, capacity: 20, equipment: ["Whiteboard"], weeklySchedule: generateWeeklySchedule()},
    C1: {id: "C1", name: "Room C1", building: "Building A", floor: 3, capacity: 10, equipment: ["AC"], weeklySchedule: generateWeeklySchedule()},
    C2: {id: "C2", name: "Room C2", building: "Building A", floor: 3, capacity: 12, equipment: ["Whiteboard", "AC"], weeklySchedule: generateWeeklySchedule()},
    D1: {id: "D1", name: "Room D1", building: "Building A", floor: 2, capacity: 8, equipment: ["Projector"], weeklySchedule: generateWeeklySchedule()},
    D2: {id: "D2", name: "Room D2", building: "Building A", floor: 2, capacity: 10, equipment: ["Whiteboard"], weeklySchedule: generateWeeklySchedule()},
    E1: {id: "E1", name: "Room E1", building: "Building A", floor: 1, capacity: 5, equipment: ["AC"], weeklySchedule: generateWeeklySchedule()},
    E2: {id: "E2", name: "Room E2", building: "Building A", floor: 1, capacity: 6, equipment: ["Projector", "Whiteboard"], weeklySchedule: generateWeeklySchedule()},
    F1: {id: "F1", name: "Room F1", building: "Building B", floor: 3, capacity: 12, equipment: ["Projector", "Whiteboard"], weeklySchedule: generateWeeklySchedule()},
    F2: {id: "F2", name: "Room F2", building: "Building B", floor: 3, capacity: 10, equipment: ["AC"], weeklySchedule: generateWeeklySchedule()},
    G1: {id: "G1", name: "Room G1", building: "Building B", floor: 2, capacity: 8, equipment: ["Whiteboard"], weeklySchedule: generateWeeklySchedule()},
    G2: {id: "G2", name: "Room G2", building: "Building B", floor: 2, capacity: 6, equipment: ["Projector"], weeklySchedule: generateWeeklySchedule()},
    H1: {id: "H1", name: "Room H1", building: "Building B", floor: 1, capacity: 5, equipment: ["AC"], weeklySchedule: generateWeeklySchedule()},
    H2: {id: "H2", name: "Room H2", building: "Building B", floor: 1, capacity: 4, equipment: ["Whiteboard"], weeklySchedule: generateWeeklySchedule()},
};

export const buildings = {
    "Building A": [{ floor: 5, rooms: ["A1", "A2", "A3"] }, { floor: 4, rooms: ["B1", "B2"] }, { floor: 3, rooms: ["C1", "C2"] }, { floor: 2, rooms: ["D1", "D2"] }, { floor: 1, rooms: ["E1", "E2"] }],
    "Building B": [{ floor: 3, rooms: ["F1", "F2"] }, { floor: 2, rooms: ["G1", "G2"] }, { floor: 1, rooms: ["H1", "H2"] }],
};

// --- ASYNC FUNCTIONS ---
export const getRoomsData = async () => {
    // Simulate a network delay for fetching data on the server
    await new Promise(resolve => setTimeout(resolve, 1000));
    return initialRoomsData;
};

export const getInstructorClasses = async (instructorId) => {
    console.log(`Fetching classes for instructor: ${instructorId}`);
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockInstructorClasses[instructorId] || [];
};