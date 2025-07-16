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

// Define the unavailable room IDs
const UNAVAILABLE_ROOM_IDS = new Set([1, 2, 3, 28, 29, 30, 31, 32, 35, 36, 37, 38, 47, 48, 49, 50, 51, 53, 54, 55]);

/**
 * Helper function to calculate the academic year from the generation number.
 * @param {string | number} generation - The generation number of the class.
 * @returns {number | null} The calculated academic year, or null if invalid.
 */
const mapGenerationToYear = (generation) => {
    if (!generation) return null;
    const genNumber = parseInt(generation, 10);
    if (isNaN(genNumber)) return null;

    // Define the base generation and year for calculation.
    const BASE_GENERATION = 34; // This is the generation for the first year students in BASE_YEAR.
    const BASE_YEAR = 2025; 

    const currentYear = new Date().getFullYear();
    
    // Calculate what generation is currently in their first year.
    const currentFirstYearGeneration = BASE_GENERATION + (currentYear - BASE_YEAR);

    // Calculate the academic year for the given generation.
    const academicYear = currentFirstYearGeneration - genNumber + 1;
    
    return academicYear > 0 ? academicYear : null;
};

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
        const timeSlotsList = ['Morning Shift', 'Noon Shift', 'Afternoon Shift', 'Evening Shift', 'Weekend Shift'];
        const constants = {
            degrees: [...new Set(classes.map(c => c.degreeName))].filter(Boolean),
            generations: [...new Set(classes.map(c => c.generation))].filter(Boolean),
            buildings: [...new Set(rooms.map(r => r.buildingName))].filter(Boolean),
            weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
            timeSlots: timeSlotsList
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
            if (!schedule.roomId || schedule.roomName === "Unassigned" || !schedule.dayDetails || !Array.isArray(schedule.dayDetails) || !schedule.shift) {
                return; // Skip malformed entries
            }

            if (schedule.shift.startTime) {
                // --- Handle REGULAR class schedules ---
                const timeSlotName = shiftNameMap[schedule.shift.startTime];
                if (timeSlotName) {
                    schedule.dayDetails.forEach(dayDetail => {
                        const dayAbbr = dayApiToAbbrMap[dayDetail.dayOfWeek.toUpperCase()];
                        if (dayAbbr) {
                            if (!scheduleMap[dayAbbr]) scheduleMap[dayAbbr] = {};
                            if (!scheduleMap[dayAbbr][timeSlotName]) scheduleMap[dayAbbr][timeSlotName] = {};
                            
                            const academicYear = mapGenerationToYear(schedule.year);
                            scheduleMap[dayAbbr][timeSlotName][schedule.roomId] = {
                                classId: schedule.classId,
                                scheduleId: schedule.scheduleId,
                                className: schedule.className,
                                majorName: schedule.majorName,
                                year: academicYear ? `Year ${academicYear}` : 'Year N/A'
                            };
                        }
                    });
                }
            } else if (schedule.shift.name === 'Booked') {
                // --- Handle CONFERENCE room bookings ---
                schedule.dayDetails.forEach(dayDetail => {
                    const dayAbbr = dayApiToAbbrMap[dayDetail.dayOfWeek.toUpperCase()];
                    if (dayAbbr) {
                        if (!scheduleMap[dayAbbr]) scheduleMap[dayAbbr] = {};
                        // Mark room as booked for ALL time slots on that day
                        timeSlotsList.forEach(timeSlot => {
                            if (!scheduleMap[dayAbbr][timeSlot]) {
                                scheduleMap[dayAbbr][timeSlot] = {};
                            }
                            scheduleMap[dayAbbr][timeSlot][schedule.roomId] = {
                                classId: null,
                                scheduleId: null,
                                className: schedule.className, // "Booked by John Doe"
                                majorName: "Booking",
                                year: "N/A"
                            };
                        });
                    }
                });
            }
        });

        // Building layout
        const buildingLayout = {};
        rooms.forEach(room => {
            // Add status to each room
            const roomWithStatus = {
                ...room,
                status: UNAVAILABLE_ROOM_IDS.has(room.roomId) ? 'unavailable' : 'available'
            };

            if (!buildingLayout[room.buildingName]) buildingLayout[room.buildingName] = {};
            if (!buildingLayout[room.buildingName][room.floor]) buildingLayout[room.buildingName][room.floor] = [];
            buildingLayout[room.buildingName][room.floor].push(roomWithStatus);
        });

        return {
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