import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { scheduleService } from '@/services/schedule.service';
import { notificationService } from '@/services/notification.service';

/**
 * Calculates the current week's start and end dates based on the Cambodian timezone.
 * @returns {{start: Date, end: Date}}
 */
const getCurrentWeekDateRange = () => {
    const nowInCambodiaStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' });
    const now = new Date(nowInCambodiaStr);

    const today = now.getDay();
    const mondayOffset = (today === 0) ? -6 : 1 - today;
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { start: startOfWeek, end: endOfWeek };
};

/**
 * **Robust Date Parser:** Manually parses a 'YYYY-MM-DD' string to avoid timezone bugs.
 * @param {string} dateString - The date string in 'YYYY-MM-DD' format.
 * @returns {Date} A Date object representing the start of that day in the local timezone.
 */
const parseDateAsLocal = (dateString) => {
    const parts = dateString.split('-').map(part => parseInt(part, 10));
    // new Date(year, monthIndex, day) - month is 0-indexed in JavaScript.
    return new Date(parts[0], parts[1] - 1, parts[2]);
};


/**
 * Main API handler to get the definitive weekly schedule.
 */
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const token = session.accessToken;

    try {
        const [allSchedules, allChangeRequests] = await Promise.all([
            scheduleService.getAllSchedules(token),
            notificationService.getChangeRequests(token)
        ]);
        
        const shiftNameMap = {
            '07:00:00': 'Morning Shift', '10:30:00': 'Noon Shift', '14:00:00': 'Afternoon Shift',
            '17:30:00': 'Evening Shift', '07:30:00': 'Weekend Shift'
        };
        const dayApiToFullName = {
            MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday',
            FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday'
        };

        const scheduleMap = {};

        // 1. Build the base schedule from all permanent class assignments.
        allSchedules.forEach(schedule => {
            if (!schedule || !schedule.dayDetails || !schedule.shift?.startTime) return;
            
            const timeSlot = shiftNameMap[schedule.shift.startTime];
            schedule.dayDetails.forEach(dayDetail => {
                const dayName = dayApiToFullName[dayDetail.dayOfWeek.toUpperCase()];
                if (dayName && timeSlot) {
                    if (!scheduleMap[dayName]) scheduleMap[dayName] = {};
                    if (!scheduleMap[dayName][timeSlot]) scheduleMap[dayName][timeSlot] = {};
                    scheduleMap[dayName][timeSlot][schedule.roomId] = schedule.className;
                }
            });
        });

        const { start, end } = getCurrentWeekDateRange();

        // 2. Find all approved change requests for the current week.
        const approvedChangesForThisWeek = allChangeRequests.filter(cr => {
            // Use the robust parser for comparison.
            const effectiveDate = parseDateAsLocal(cr.effectiveDate);
            return cr.status === 'APPROVED' && effectiveDate >= start && effectiveDate <= end;
        });

        // 3. Apply the approved changes to the schedule map.
        approvedChangesForThisWeek.forEach(change => {
            const originalSchedule = allSchedules.find(s => s.scheduleId === change.scheduleId);
            
            if (originalSchedule && originalSchedule.shift.startTime) {
                // Use the robust parser again to get the correct date for display.
                const effectiveDate = parseDateAsLocal(change.effectiveDate);
                const dayName = effectiveDate.toLocaleDateString('en-US', { weekday: 'long' });
                const timeSlot = shiftNameMap[originalSchedule.shift.startTime];
                const tempRoomId = originalSchedule.temporaryRoomId;

                if (dayName && timeSlot && tempRoomId && scheduleMap[dayName]?.[timeSlot]) {
                    // A. Make the original room available.
                    if (scheduleMap[dayName][timeSlot][originalSchedule.roomId]) {
                         delete scheduleMap[dayName][timeSlot][originalSchedule.roomId];
                    }
                    
                    // B. Mark the new temporary room as unavailable.
                    scheduleMap[dayName][timeSlot][tempRoomId] = originalSchedule.className;
                }
            }
        });

        return NextResponse.json(scheduleMap);

    } catch (error) {
        console.error("Error fetching weekly view schedule:", error);
        return NextResponse.json({ message: "Failed to fetch schedule data", error: error.message }, { status: 500 });
    }
}