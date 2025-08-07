'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { scheduleService } from '@/services/schedule.service';
import { authService } from '@/services/auth.service';
import InstructorDashboardHeader from './InstructorDashboardHeader';
import ScheduleTable from './ScheduleTable';
import ClassCard from './ClassCard';
import DashboardSkeleton from './DashboardSkeleton';

// --- SWR Fetcher functions ---
const scheduleFetcher = ([, token]) => scheduleService.getMySchedule(token);
const profileFetcher = ([, token]) => authService.getProfile(token);

// NEW: Helper function to generate a sort order for days of the week starting from today.
const getDynamicDayOrder = () => {
    const dayMap = {
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
        'Thursday': 4, 'Friday': 5, 'Saturday': 6,
    };
    const todayIndex = new Date().getDay(); // JS standard: Sunday is 0, Monday is 1, etc.
    const dynamicOrder = {};

    // Map day names to their sort priority relative to today
    for (const dayName in dayMap) {
        const dayIndex = dayMap[dayName];
        // Calculate the sort priority. Today gets 0, tomorrow gets 1, and so on.
        dynamicOrder[dayName] = (dayIndex - todayIndex + 7) % 7;
    }
    return dynamicOrder;
};

/**
 * This is the Client Component for the Instructor Dashboard page.
 * It now handles its own data fetching using useSWR and manages sorting state.
 */
export default function InstructorDashboardClientView() {
    const { data: session } = useSession();
    const token = session?.accessToken;

    // State for sorting the schedule table, defaulting to sort by date
    const [sortColumn, setSortColumn] = useState('date');
    const [sortDirection, setSortDirection] = useState('asc');

    // Fetch schedule and profile data using useSWR
    const { data: scheduleResponse, error: scheduleError, isLoading: isScheduleLoading } = useSWR(
        token ? ['mySchedule', token] : null,
        scheduleFetcher
    );
    const { data: profileResponse, error: profileError, isLoading: isProfileLoading } = useSWR(
        token ? ['profile', token] : null,
        profileFetcher
    );

    /**
     * Handles clicks on table headers to set sorting state.
     * @param {string} column - The key of the column to sort by.
     */
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Process the fetched data into the format needed by the component
    const { dashboardStats, scheduleItems } = useMemo(() => {
        if (!scheduleResponse || !profileResponse) {
            return { dashboardStats: null, scheduleItems: [] };
        }

        const overriddenSchedules = new Set(); // Stores 'classId-DAYOFWEEK' for temp schedules
        const localScheduleItems = [];
        let localOnlineClassCount = 0;
        let localClassTodayCount = 0;
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        
        const processedForOnlineCount = new Set();
        const processedForTodayCount = new Set(); // To avoid double counting classes today

        // First pass: identify all temporary assignments to know which permanent slots are overridden
        scheduleResponse.forEach(item => {
            if (item && item.scheduleId && item.temporaryRoomId && item.dayDetails) {
                item.dayDetails.forEach(dayDetail => {
                    overriddenSchedules.add(`${item.classId}-${dayDetail.dayOfWeek.toUpperCase()}`);
                });
            }
        });

        // Second pass: build the final schedule list
        scheduleResponse.forEach(item => {
            if (!item || !item.scheduleId || !item.dayDetails) return;

            // This is a temporary schedule record, it always takes precedence
            if (item.temporaryRoomId) {
                const isOnlineClass = item.dayDetails.some(d => d.online) || !item.temporaryRoomName;
                if (isOnlineClass && !processedForOnlineCount.has(item.classId)) {
                    localOnlineClassCount++;
                    processedForOnlineCount.add(item.classId);
                }

                item.dayDetails.forEach(dayDetail => {
                    const dayOfWeek = dayDetail.dayOfWeek.toUpperCase();
                    
                    if (dayOfWeek === today && !processedForTodayCount.has(item.classId)) {
                        localClassTodayCount++;
                        processedForTodayCount.add(item.classId);
                    }

                    const dayString = dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase();
                    const sessionType = dayDetail.online ? 'Online' : 'In Class';

                    localScheduleItems.push({
                        id: `${item.scheduleId}-${dayOfWeek}-temp`,
                        classNum: item.className,
                        major: item.majorName,
                        date: dayString,
                        session: sessionType,
                        shift: (item.shift && item.shift.startTime && item.shift.endTime) 
                                ? `${item.shift.startTime.substring(0, 5)} - ${item.shift.endTime.substring(0, 5)}` 
                                : 'N/A',
                        // ✨ UPDATED: Add "(Temp)" label for temporary rooms
                        room: dayDetail.online ? 'Online' : `${item.temporaryRoomName} (Temp)` || 'Unavailable',
                    });
                });
            } 
            // This is a permanent schedule record
            else {
                const isPotentiallyOnline = item.dayDetails.some(d => d.online) || !item.roomName || item.roomName === "Unavailable";
                if (isPotentiallyOnline && !processedForOnlineCount.has(item.classId)) {
                    const hasNonOverriddenOnlineDay = item.dayDetails.some(d => 
                        !overriddenSchedules.has(`${item.classId}-${d.dayOfWeek.toUpperCase()}`) && (d.online || !item.roomName)
                    );
                    if(hasNonOverriddenOnlineDay) {
                        localOnlineClassCount++;
                        processedForOnlineCount.add(item.classId);
                    }
                }

                item.dayDetails.forEach(dayDetail => {
                    const dayOfWeek = dayDetail.dayOfWeek.toUpperCase();
                    
                    // Skip this day if it's been overridden by a temporary schedule
                    if (overriddenSchedules.has(`${item.classId}-${dayOfWeek}`)) {
                        return;
                    }
                    
                    if (dayOfWeek === today && !processedForTodayCount.has(item.classId)) {
                        localClassTodayCount++;
                        processedForTodayCount.add(item.classId);
                    }

                    const dayString = dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase();
                    const sessionType = dayDetail.online ? 'Online' : 'In Class';

                    localScheduleItems.push({
                        id: `${item.scheduleId}-${dayOfWeek}`,
                        classNum: item.className,
                        major: item.majorName,
                        date: dayString,
                        session: sessionType,
                        shift: (item.shift && item.shift.startTime && item.shift.endTime) 
                                ? `${item.shift.startTime.substring(0, 5)} - ${item.shift.endTime.substring(0, 5)}` 
                                : 'N/A',
                        room: dayDetail.online ? 'Online' : item.roomName || 'Unavailable',
                    });
                });
            }
        });

        // The number of assigned classes should be the count of unique class IDs.
        const uniqueClassIds = new Set(scheduleResponse.map(s => s.classId).filter(Boolean));

        const dashboardStats = {
            classAssign: uniqueClassIds.size,
            ClassToday: localClassTodayCount,
            onlineClass: localOnlineClassCount,
            currentDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            academicYear: '2025 - 2026',
        };

        return { dashboardStats, scheduleItems: localScheduleItems };
    }, [scheduleResponse, profileResponse]);

    // Memoize the sorted schedule items to prevent re-sorting on every render
    const sortedScheduleItems = useMemo(() => {
        // Get the dynamic day order for sorting
        const dayOrder = getDynamicDayOrder();

        if (!sortColumn) return scheduleItems;

        const sorted = [...scheduleItems].sort((a, b) => {
            let aValue = a[sortColumn];
            let bValue = b[sortColumn];

            // Special handling for date column to sort chronologically from the current day
            if (sortColumn === 'date') {
                aValue = dayOrder[aValue] ?? 8; // Use the dynamic order, fallback for safety
                bValue = dayOrder[bValue] ?? 8;
            }

            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            
            // Secondary sort by shift if dates are the same
            if (sortColumn === 'date') {
                const shiftOrder = { 'Morning': 1, 'Noon': 2, 'Afternoon': 3, 'Evening': 4, 'Weekend': 5 };
                const aShift = shiftOrder[a.shift?.split(' ')[0]] || 99;
                const bShift = shiftOrder[b.shift?.split(' ')[0]] || 99;
                return aShift - bShift;
            }

            return 0;
        });
        return sorted;
    }, [scheduleItems, sortColumn, sortDirection]);

    if (isScheduleLoading || isProfileLoading) {
        return <DashboardSkeleton />;
    }

    if (scheduleError || profileError) {
        return <div className="text-center text-red-500 p-8">Failed to load dashboard data. Please try again later.</div>;
    }
 
    if (!dashboardStats) {
        return <DashboardSkeleton />;
    }

    return (
        <>
            <InstructorDashboardHeader
                title="Welcome to Schedule Management"
                description="Easily plan, track, and manage your school schedule all in one place."
                currentDate={dashboardStats.currentDate}
                academicYear={dashboardStats.academicYear}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <ClassCard title="Class Assign" value={dashboardStats.classAssign} />
                <ClassCard title="Class Today" value={dashboardStats.ClassToday} />
                <ClassCard title="Online Class" value={dashboardStats.onlineClass} />
                <div /> 
            </div>

            <div className="mt-6">
                <ScheduleTable 
                    scheduleItems={sortedScheduleItems} 
                    onSort={handleSort}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                />
            </div>
        </>
    );
}