import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { scheduleService } from '@/services/schedule.service';

/**
 * Main API handler to get the definitive weekly schedule.
 * It now processes temporary room assignments directly from the schedule data,
 * accounting for potential changes in shift times.
 */
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const token = session.accessToken;

    try {
        const allSchedules = await scheduleService.getAllSchedules(token);
        
        const shiftNameMap = {
            '07:00:00': 'Morning Shift', '10:30:00': 'Noon Shift', '14:00:00': 'Afternoon Shift',
            '17:30:00': 'Evening Shift', '07:30:00': 'Weekend Shift'
        };
        const dayApiToFullName = {
            MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday',
            FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday'
        };

        const scheduleMap = {};
        const permanentSchedules = {}; // Helper to store original schedule info

        // 1. First pass: Index all permanent schedules and add them to the map.
        allSchedules.forEach(schedule => {
            if (!schedule || !schedule.dayDetails || !schedule.shift?.startTime || schedule.temporaryRoomId) return;
            
            if (!permanentSchedules[schedule.classId]) {
                permanentSchedules[schedule.classId] = {};
            }

            const timeSlot = shiftNameMap[schedule.shift.startTime];
            schedule.dayDetails.forEach(dayDetail => {
                const dayName = dayApiToFullName[dayDetail.dayOfWeek.toUpperCase()];
                if (dayName && timeSlot && !dayDetail.online && schedule.roomId) {
                    // Store the full permanent schedule object for later lookup
                    permanentSchedules[schedule.classId][dayName] = schedule;
                    
                    // Add the permanent assignment to the final schedule map
                    if (!scheduleMap[dayName]) scheduleMap[dayName] = {};
                    if (!scheduleMap[dayName][timeSlot]) scheduleMap[dayName][timeSlot] = {};
                    scheduleMap[dayName][timeSlot][schedule.roomId] = schedule.className;
                }
            });
        });

        // 2. Second pass: Process temporary schedules to override the permanent ones.
        allSchedules.forEach(schedule => {
            if (!schedule || !schedule.temporaryRoomId || !schedule.dayDetails || !schedule.shift?.startTime) return;

            const tempTimeSlot = shiftNameMap[schedule.shift.startTime]; // This is the NEW shift for the temp room

            schedule.dayDetails.forEach(dayDetail => {
                const dayName = dayApiToFullName[dayDetail.dayOfWeek.toUpperCase()];
                if (dayName && tempTimeSlot && !dayDetail.online) {
                    
                    // Find the original schedule for this class on this day from our helper object
                    const originalSchedule = permanentSchedules[schedule.classId]?.[dayName];

                    // If an original schedule was found, free up its room at its original time slot
                    if (originalSchedule) {
                        const originalTimeSlot = shiftNameMap[originalSchedule.shift.startTime];
                        if (originalTimeSlot && scheduleMap[dayName]?.[originalTimeSlot]?.[originalSchedule.roomId]) {
                            delete scheduleMap[dayName][originalTimeSlot][originalSchedule.roomId];
                        }
                    }

                    // Occupy the temporary room at the NEW shift time
                    if (!scheduleMap[dayName]) scheduleMap[dayName] = {};
                    if (!scheduleMap[dayName][tempTimeSlot]) scheduleMap[dayName][tempTimeSlot] = {};
                    scheduleMap[dayName][tempTimeSlot][schedule.temporaryRoomId] = schedule.className;
                }
            });
        });

        return NextResponse.json(scheduleMap);

    } catch (error) {
        console.error("Error fetching weekly view schedule:", error);
        return NextResponse.json({ message: "Failed to fetch schedule data", error: error.message }, { status: 500 });
    }
}