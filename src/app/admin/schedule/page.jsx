import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ScheduleClientView from './components/ScheduleClientView';
import ClassListSkeleton from './components/ClassListSkeleton';
import ScheduleGridSkeleton from './components/ScheduleGridSkeleton';
import { classService } from '@/services/class.service';
import { getAllRooms } from '@/services/room.service';
import { scheduleService } from '@/services/schedule.service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// --- Data Structures & Fetching (Moved to server-side) ---

const fetchSchedulePageData = async () => {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Schedule Page: Not authenticated.");
        return { 
            initialClasses: [], 
            initialRooms: [], 
            initialSchedules: {}, 
            buildingLayout: {},
            constants: { 
                degrees: [], 
                generations: [], 
                buildings: [], 
                weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], 
                timeSlots: ['Morning Shift', 'Noon Shift', 'Afternoon Shift', 'Evening Shift', 'Weekend Shift']
            } 
        };
    }

    try {
        const [classes, rooms, schedules] = await Promise.all([
            classService.getAllClasses(token),
            getAllRooms(token),
            scheduleService.getAllSchedules(token)
        ]);
        
        const degrees = [...new Set(classes.map(c => c.degreeName))].filter(Boolean);
        const generations = [...new Set(classes.map(c => c.generation))].filter(Boolean);
        const buildings = [...new Set(rooms.map(r => r.buildingName))].filter(Boolean);
        const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
        const timeSlots = ['Morning Shift', 'Noon Shift', 'Afternoon Shift', 'Evening Shift', 'Weekend Shift'];

        // Map start times to shift names
        const shiftNameMap = {
            '07:00:00': 'Morning Shift',
            '10:30:00': 'Noon Shift',
            '14:00:00': 'Afternoon Shift',
            '17:30:00': 'Evening Shift',
            '07:30:00': 'Weekend Shift' // Assuming weekend shift starts at 7:30
        };

        // Transform classes to include the correct shift name
        const transformedClasses = classes.map(cls => {
            if (cls.shift && cls.shift.startTime) {
                return {
                    ...cls,
                    shift: {
                        ...cls.shift,
                        name: shiftNameMap[cls.shift.startTime] || 'Unknown Shift'
                    }
                };
            }
            return cls;
        });

        // UPDATED: Correctly process schedule data from the API's `dayDetails` array
        const scheduleMap = {};
        const dayApiToAbbrMap = {
            MONDAY: 'Mo',
            TUESDAY: 'Tu',
            WEDNESDAY: 'We',
            THURSDAY: 'Th',
            FRIDAY: 'Fr',
            SATURDAY: 'Sa',
            SUNDAY: 'Su'
        };

        schedules.forEach(schedule => {
            if (schedule && schedule.dayDetails && Array.isArray(schedule.dayDetails) && schedule.shift) {
                const timeSlotName = shiftNameMap[schedule.shift.startTime];
                if (timeSlotName) {
                    schedule.dayDetails.forEach(dayDetail => {
                        const dayAbbr = dayApiToAbbrMap[dayDetail.dayOfWeek.toUpperCase()];
                        if (dayAbbr) {
                            if (!scheduleMap[dayAbbr]) {
                                scheduleMap[dayAbbr] = {};
                            }
                            if (!scheduleMap[dayAbbr][timeSlotName]) {
                                scheduleMap[dayAbbr][timeSlotName] = {};
                            }
                            scheduleMap[dayAbbr][timeSlotName][schedule.roomId] = schedule.classId;
                        }
                    });
                }
            }
        });

        const buildingLayout = {};
        rooms.forEach(room => {
            if (!buildingLayout[room.buildingName]) buildingLayout[room.buildingName] = {};
            if (!buildingLayout[room.buildingName][room.floor]) buildingLayout[room.buildingName][room.floor] = [];
            buildingLayout[room.buildingName][room.floor].push(room);
        });

        return {
            initialClasses: transformedClasses,
            initialRooms: rooms,
            initialSchedules: scheduleMap,
            buildingLayout: buildingLayout,
            constants: { degrees, generations, buildings, weekdays, timeSlots }
        };

    } catch (error) {
        console.error("Failed to fetch schedule page data:", error);
        return { 
            initialClasses: [], 
            initialRooms: [], 
            initialSchedules: {}, 
            buildingLayout: {},
            constants: { 
                degrees: [], 
                generations: [], 
                buildings: [], 
                weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], 
                timeSlots: ['Morning Shift', 'Noon Shift', 'Afternoon Shift', 'Evening Shift', 'Weekend Shift']
            } 
        };
    }
};

export default async function AdminSchedulePage() {
    const { initialClasses, initialRooms, initialSchedules, buildingLayout, constants } = await fetchSchedulePageData();

    return (
        <AdminLayout activeItem="schedule" pageTitle="Schedule">
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
                    buildingLayout={buildingLayout}
                    constants={constants}
                />
            </Suspense>
        </AdminLayout>
    );
}
