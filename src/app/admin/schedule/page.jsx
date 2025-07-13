// src/app/admin/schedule/page.jsx

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

// This function now transforms the data to have a consistent structure.
const fetchSchedulePageData = async () => {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Schedule Page: Not authenticated.");
        return { initialClasses: [], initialRooms: [], initialSchedules: {}, buildingLayout: {}, constants: {} };
    }

    try {
        const [classes, rooms, schedules] = await Promise.all([
            classService.getAllClasses(token),
            getAllRooms(token),
            scheduleService.getAllSchedules(token)
        ]);
        
        // --- Constants and Mappings ---
        const constants = {
            degrees: [...new Set(classes.map(c => c.degreeName))].filter(Boolean),
            generations: [...new Set(classes.map(c => c.generation))].filter(Boolean),
            buildings: [...new Set(rooms.map(r => r.buildingName))].filter(Boolean),
            weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
            timeSlots: ['Morning Shift', 'Noon Shift', 'Afternoon Shift', 'Evening Shift', 'Weekend Shift']
        };

        const shiftNameMap = {
            '07:00:00': 'Morning Shift', '10:30:00': 'Noon Shift', '14:00:00': 'Afternoon Shift',
            '17:30:00': 'Evening Shift', '07:30:00': 'Weekend Shift'
        };

        const dayApiToAbbrMap = {
            MONDAY: 'Mo', TUESDAY: 'Tu', WEDNESDAY: 'We', THURSDAY: 'Th',
            FRIDAY: 'Fr', SATURDAY: 'Sa', SUNDAY: 'Su'
        };

        // Transform classes data
        const transformedClasses = classes.map(cls => {
            const newCls = { ...cls };
            if (newCls.shift && newCls.shift.startTime) {
                newCls.shift.name = shiftNameMap[newCls.shift.startTime] || 'Unknown Shift';
            }
            if (newCls.dailySchedule && !newCls.dayDetails) {
                newCls.dayDetails = Object.entries(newCls.dailySchedule).map(([day, details]) => ({
                    dayOfWeek: day,
                    instructorName: `${details.instructor.firstName} ${details.instructor.lastName}`,
                    online: details.online
                }));
            }
            return newCls;
        });

        // Process schedules
        const scheduleMap = {};
        schedules.forEach(schedule => {
            if (!schedule.roomId || schedule.roomName === "Unassigned") {
                return;
            }

            if (schedule.dayDetails && Array.isArray(schedule.dayDetails) && schedule.shift) {
                const timeSlotName = shiftNameMap[schedule.shift.startTime];
                if (timeSlotName) {
                    schedule.dayDetails.forEach(dayDetail => {
                        const dayAbbr = dayApiToAbbrMap[dayDetail.dayOfWeek.toUpperCase()];
                        if (dayAbbr) {
                            if (!scheduleMap[dayAbbr]) scheduleMap[dayAbbr] = {};
                            if (!scheduleMap[dayAbbr][timeSlotName]) scheduleMap[dayAbbr][timeSlotName] = {};
                            
                            scheduleMap[dayAbbr][timeSlotName][schedule.roomId] = {
                                classId: schedule.classId,
                                scheduleId: schedule.scheduleId,
                                className: schedule.className,
                                majorName: schedule.majorName,
                                year: schedule.generation
                            };
                        }
                    });
                }
            }
        });

        // Building layout
        const buildingLayout = {};
        rooms.forEach(room => {
            if (!buildingLayout[room.buildingName]) buildingLayout[room.buildingName] = {};
            if (!buildingLayout[room.buildingName][room.floor]) buildingLayout[room.buildingName][room.floor] = [];
            buildingLayout[room.buildingName][room.floor].push(room);
        });

        return {
            // FIX: Pass the complete list of transformed classes. The client component
            // will handle filtering for its "unassigned" list, but it needs the
            // full list to look up data for already-scheduled classes.
            initialClasses: transformedClasses,
            initialRooms: rooms,
            initialSchedules: scheduleMap,
            buildingLayout: buildingLayout,
            constants: constants
        };

    } catch (error) {
        console.error("Failed to fetch schedule page data:", error);
        return { initialClasses: [], initialRooms: [], initialSchedules: {}, buildingLayout: {}, constants: {} };
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