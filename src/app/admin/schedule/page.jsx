import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ScheduleClientView from './components/ScheduleClientView';
import ClassListSkeleton from './components/ClassListSkeleton';
import ScheduleGridSkeleton from './components/ScheduleGridSkeleton';

// --- Data Structures & Fetching (Moved to server-side) ---

const degrees = ['Bachelor', 'Master', 'PhD'];
const generations = ['Gen 2023', 'Gen 2024', 'Gen 2025', 'Gen 2026'];
const buildings = ['A', 'B', 'C', 'D', 'E'];
const weekdays = ['Mo', 'Tu', 'We', 'Thu', 'Fr', 'Sa', 'Su'];
const timeSlots = ['7:00 - 10:00', '10:30 - 13:30', '14:00 - 17:00', '17:30 - 20:30'];
const gridDimensions = { rows: 5, cols: 5 };

const fetchSchedulePageData = async () => {
    // In a real app, these would be database queries.
    const initialClasses = [
        { id: 'class_101', name: 'Intro to Physics', code: 'PHY-101', degree: 'Bachelor', generation: 'Gen 2025' },
        { id: 'class_102', name: 'Calculus I', code: 'MTH-110', degree: 'Bachelor', generation: 'Gen 2026' },
        { id: 'class_103', name: 'Organic Chemistry', code: 'CHM-220', degree: 'Bachelor', generation: 'Gen 2024' },
        { id: 'class_104', name: 'World History', code: 'HIS-100', degree: 'Master', generation: 'Gen 2023' },
        { id: 'class_105', name: 'English Composition', code: 'ENG-101', degree: 'Master', generation: 'Gen 2025' },
        { id: 'class_106', name: 'Linear Algebra', code: 'MTH-210', degree: 'Master', generation: 'Gen 2025' },
        { id: 'class_107', name: 'Data Structures', code: 'CS-250', degree: 'PhD', generation: 'Gen 2024' },
        { id: 'class_108', name: 'Microeconomics', code: 'ECN-200', degree: 'PhD', generation: 'Gen 2026' },
        { id: 'class_109', name: 'Art History', code: 'ART-150', degree: 'PhD', generation: 'Gen 2023' },
        { id: 'class_110', name: 'Computer Networks', code: 'CS-350', degree: 'PhD', generation: 'Gen 2023' },
    ];

    const initialRooms = [];
    let roomCounter = 1;
    for (const building of buildings) {
        roomCounter = 1;
        for (let floor = 1; floor <= gridDimensions.rows; floor++) {
            for (let col = 1; col <= gridDimensions.cols; col++) {
                initialRooms.push({ id: `${building}-${roomCounter}`, name: `${building}${roomCounter}`, building, floor, capacity: (floor + col) % 2 === 0 ? 30 : 45 });
                roomCounter++;
            }
        }
    }

    const initialSchedules = {};
    weekdays.forEach(day => {
        initialSchedules[day] = {};
        timeSlots.forEach(time => {
            initialSchedules[day][time] = {};
            buildings.forEach(building => {
                const buildingRooms = initialRooms.filter(r => r.building === building);
                const floors = Array.from({ length: gridDimensions.rows }, (_, i) => gridDimensions.rows - i);
                initialSchedules[day][time][building] = floors.map(floorNum => buildingRooms.filter(r => r.floor === floorNum).map(room => ({ room, class: null })));
            });
        });
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { initialClasses, initialSchedules, constants: { degrees, generations, buildings, weekdays, timeSlots, gridDimensions } };
};

/**
 * The main page component is now an async Server Component.
 */
export default async function AdminSchedulePage() {
    // Data is fetched on the server before the page is sent to the client.
    const { initialClasses, initialSchedules, constants } = await fetchSchedulePageData();

    return (
        <AdminLayout activeItem="schedule" pageTitle="Schedule Management">
            <Suspense fallback={
                <div className='p-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]'>
                    <ClassListSkeleton />
                    <ScheduleGridSkeleton />
                </div>
            }>
                {/* The Client Component is rendered here, receiving all server-fetched data as props. */}
                <ScheduleClientView 
                    initialClasses={initialClasses}
                    initialSchedules={initialSchedules}
                    constants={constants}
                />
            </Suspense>
        </AdminLayout>
    );
}