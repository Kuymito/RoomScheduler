'use client';

import { useMemo } from 'react';
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

/**
 * This is the Client Component for the Instructor Dashboard page.
 * It now handles its own data fetching using useSWR.
 */
export default function InstructorDashboardClientView() {
    const { data: session } = useSession();
    const token = session?.accessToken;

    // Fetch schedule and profile data using useSWR
    const { data: scheduleResponse, error: scheduleError, isLoading: isScheduleLoading } = useSWR(
        token ? ['mySchedule', token] : null,
        scheduleFetcher
    );
    const { data: profileResponse, error: profileError, isLoading: isProfileLoading } = useSWR(
        token ? ['profile', token] : null,
        profileFetcher
    );

    // Process the fetched data into the format needed by the component
    const { dashboardStats, scheduleItems } = useMemo(() => {
        if (!scheduleResponse || !profileResponse) {
            return { dashboardStats: null, scheduleItems: [] };
        }

        const localScheduleItems = [];
        let localOnlineClassCount = 0;
        let localClassTodayCount = 0;
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        
        // Use a Set to count each online class only once, even if it's on multiple days
        const processedForOnlineCount = new Set();

        scheduleResponse.forEach(item => {
            if (item && item.dayDetails && Array.isArray(item.dayDetails)) {
                
                // Determine if the entire class is considered online
                const isOnlineClass = item.dayDetails.some(d => d.online) || !item.roomName || item.roomName === "Unavailable";
                if (isOnlineClass && !processedForOnlineCount.has(item.scheduleId)) {
                    localOnlineClassCount++;
                    processedForOnlineCount.add(item.scheduleId);
                }

                // Create a schedule row for each day in the `dayDetails` array
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
                description="Easily plan, track, and manage your school schedule all in one place. From classes to exams, stay organized and never miss a deadline again."
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
                <ScheduleTable scheduleItems={scheduleItems} />
            </div>
        </>
    );
}