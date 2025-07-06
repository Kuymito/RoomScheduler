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

        const scheduleItems = [];
        let onlineClassCount = 0;
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        let classTodayCount = 0;

        scheduleResponse.forEach(item => {
            const days = item.day.split(',').map(d => d.trim().toUpperCase());
            
            if (days.includes(today)) {
                classTodayCount++;
            }

            const isOnline = !item.roomName || item.roomName === "Unavailable";
            if (isOnline) {
                onlineClassCount++;
            }

            days.forEach(dayString => {
                scheduleItems.push({
                    id: `${item.scheduleId}-${dayString}`,
                    classNum: item.className,
                    major: item.majorName,
                    date: dayString.charAt(0) + dayString.slice(1).toLowerCase(),
                    session: isOnline ? 'Online' : 'In Class',
                    shift: `${item.shift.startTime.substring(0, 5)} - ${item.shift.endTime.substring(0, 5)}`,
                    room: item.roomName || 'Unavailable',
                });
            });
        });

        const dashboardStats = {
            classAssign: scheduleResponse.length,
            ClassToday: classTodayCount,
            onlineClass: onlineClassCount,
            currentDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            academicYear: '2025 - 2026',
        };

        return { dashboardStats, scheduleItems };
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