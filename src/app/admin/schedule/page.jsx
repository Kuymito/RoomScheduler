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

const UNAVAILABLE_ROOM_IDS = new Set([1, 2, 3, 28, 29, 30, 31, 32, 35, 36, 37, 38, 47, 48, 49, 50, 51, 53, 54, 55]);

const mapGenerationToYear = (generation) => {
    if (!generation) return null;
    const genNumber = parseInt(generation, 10);
    if (isNaN(genNumber)) return null;

    const BASE_GENERATION = 34;
    const BASE_YEAR = 2025;
    const currentYear = new Date().getFullYear();
    const currentFirstYearGeneration = BASE_GENERATION + (currentYear - BASE_YEAR);
    const academicYear = currentFirstYearGeneration - genNumber + 1;
    return academicYear > 0 ? academicYear : null;
};

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

        const shiftNameToTimeDisplay = {
            'Morning Shift': '07:00 - 10:00',
            'Noon Shift': '10:30 - 13:30',
            'Afternoon Shift': '14:00 - 17:00',
            'Evening Shift': '17:30 - 20:30',
            'Weekend Shift': '07:30 - 17:00'
        };

        const dayApiToAbbrMap = {
            MONDAY: 'Mo', TUESDAY: 'Tu', WEDNESDAY: 'We', THURSDAY: 'Th',
            FRIDAY: 'Fr', SATURDAY: 'Sa', SUNDAY: 'Su'
        };

        const constants = {
            degrees: [...new Set(classes.map(c => c.degreeName))].filter(Boolean),
            generations: [...new Set(classes.map(c => c.generation))].filter(Boolean),
            buildings: [...new Set(rooms.map(r => r.buildingName))].filter(Boolean),
            weekdays: Object.values(dayApiToAbbrMap),
            timeSlots: Object.keys(shiftNameToTimeDisplay)
        };

        const scheduleMap = {};
        
        const today = new Date();
        const dayOfWeekIndex = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeekIndex === 0 ? 6 : dayOfWeekIndex - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        (schedules || []).forEach(schedule => {
            // Skip classes that don't have a room or a properly defined shift
            if (!schedule.roomId || !schedule.shift?.name) return;

            const academicYear = mapGenerationToYear(schedule.year);
            const baseClassDetails = {
                classId: schedule.classId,
                scheduleId: schedule.scheduleId,
                className: schedule.className,
                majorName: schedule.majorName,
                year: academicYear ? `Year ${academicYear}` : 'Year N/A',
                semester: schedule.semester,
            };

            (schedule.dayDetails || []).forEach(dayDetail => {
                const effectiveDate = dayDetail.effectiveDate ? new Date(`${dayDetail.effectiveDate}T00:00:00`) : null;
                const isTemporaryAndActive = effectiveDate && dayDetail.temporaryDay && dayDetail.temporaryShift && effectiveDate >= startOfWeek && effectiveDate <= endOfWeek;

                if (isTemporaryAndActive) {
                    // --- Handle Active Temporary Assignment ---

                    // 1. Place the "Temporary" card in the new slot
                    const tempDayAbbr = dayApiToAbbrMap[dayDetail.temporaryDay.toUpperCase()];
                    const tempTimeSlot = dayDetail.temporaryShift.name;
                    if (tempDayAbbr && tempTimeSlot) {
                        if (!scheduleMap[tempDayAbbr]) scheduleMap[tempDayAbbr] = {};
                        if (!scheduleMap[tempDayAbbr][tempTimeSlot]) scheduleMap[tempDayAbbr][tempTimeSlot] = {};
                        scheduleMap[tempDayAbbr][tempTimeSlot][dayDetail.temporaryRoomId] = {
                            ...baseClassDetails,
                            subject: baseClassDetails.className,
                            timeDisplay: shiftNameToTimeDisplay[tempTimeSlot],
                            isTemporary: true,
                        };
                    }
                    
                    // 2. Place the "Moved" placeholder in the original slot
                    const originalDayAbbr = dayApiToAbbrMap[dayDetail.dayOfWeek.toUpperCase()];
                    const originalTimeSlot = schedule.shift.name;
                    if (originalDayAbbr && originalTimeSlot) {
                        if (!scheduleMap[originalDayAbbr]) scheduleMap[originalDayAbbr] = {};
                        if (!scheduleMap[originalDayAbbr][originalTimeSlot]) scheduleMap[originalDayAbbr][originalTimeSlot] = {};
                        scheduleMap[originalDayAbbr][originalTimeSlot][schedule.roomId] = {
                            ...baseClassDetails,
                            isMovedPlaceholder: true,
                            movedToRoomName: dayDetail.temporaryRoomName,
                        };
                    }

                } else {
                    // --- Handle Regular Assignment ---
                    const dayAbbr = dayApiToAbbrMap[dayDetail.dayOfWeek.toUpperCase()];
                    const timeSlot = schedule.shift.name;
                    if (dayAbbr && timeSlot) {
                        if (!scheduleMap[dayAbbr]) scheduleMap[dayAbbr] = {};
                        if (!scheduleMap[dayAbbr][timeSlot]) scheduleMap[dayAbbr][timeSlot] = {};
                        
                        // Ensure we don't overwrite a "Moved" placeholder
                        if (!scheduleMap[dayAbbr][timeSlot][schedule.roomId]) {
                             scheduleMap[dayAbbr][timeSlot][schedule.roomId] = {
                                ...baseClassDetails,
                                subject: baseClassDetails.className,
                                timeDisplay: shiftNameToTimeDisplay[timeSlot],
                                isTemporary: false,
                            };
                        }
                    }
                }
            });
        });

        const buildingLayout = {};
        rooms.forEach(room => {
            const roomWithStatus = {
                ...room,
                status: UNAVAILABLE_ROOM_IDS.has(room.roomId) ? 'unavailable' : 'available'
            };
            if (!buildingLayout[room.buildingName]) buildingLayout[room.buildingName] = {};
            if (!buildingLayout[room.buildingName][room.floor]) buildingLayout[room.buildingName][room.floor] = [];
            buildingLayout[room.buildingName][room.floor].push(roomWithStatus);
        });

        return {
            initialClasses: classes,
            initialRooms: rooms,
            initialSchedules: scheduleMap,
            buildingLayout,
            constants
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