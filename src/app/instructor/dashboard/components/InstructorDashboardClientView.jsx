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

        const localScheduleItems = [];
        let localOnlineClassCount = 0;
        let localClassTodayCount = 0;
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        
        const processedForOnlineCount = new Set();

        scheduleResponse.forEach(item => {
            if (item && item.dayDetails && Array.isArray(item.dayDetails)) {
                
                const isOnlineClass = item.dayDetails.some(d => d.online) || !item.roomName || item.roomName === "Unavailable";
                if (isOnlineClass && !processedForOnlineCount.has(item.scheduleId)) {
                    localOnlineClassCount++;
                    processedForOnlineCount.add(item.scheduleId);
                }

                item.dayDetails.forEach(dayDetail => {
                    const dayOfWeek = dayDetail.dayOfWeek.toUpperCase();
                    
                    if (dayOfWeek === today) {
                        localClassTodayCount++;
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

        const dashboardStats = {
            classAssign: scheduleResponse.length,
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