import { Suspense } from 'react';
import InstructorDashboardLayout from '@/components/InstructorDashboardLayout';
import InstructorDashboardClientView from './components/InstructorDashboardClientView';
import DashboardSkeleton from './components/DashboardSkeleton';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { classService } from '@/services/class.service';
import { scheduleService } from '@/services/schedule.service';

/**
 * Fetches and processes live data for the instructor dashboard from the API.
 */
const fetchDashboardData = async () => {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Dashboard Page: Not authenticated.");
        return {
            dashboardStats: { classAssign: 0, ClassToday: 0, onlineClass: 0, currentDate: '', academicYear: '' },
            scheduleItems: []
        };
    }

    try {
        const [myClasses, mySchedules] = await Promise.all([
            classService.getMyClasses(token),
            scheduleService.getMySchedules(token)
        ]);

        // --- THIS IS THE FIX ---
        // De-duplicate the schedules received from the API.
        const uniqueSchedules = Array.from(new Map(mySchedules.map(schedule => {
            // Create a unique key for each schedule based on its core properties
            const key = `${schedule.classId}-${schedule.day}-${schedule.shift.shiftId}`;
            return [key, schedule];
        })).values());
        // -------------------------

        const classAssignCount = myClasses.length;
        const onlineClassCount = myClasses.filter(cls => cls.isOnline).length;
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        
        const classesTodayCount = uniqueSchedules.filter(schedule => 
            schedule.day.toUpperCase().split(',').map(d => d.trim()).includes(today)
        ).length;

        const scheduleItems = [];
        uniqueSchedules.forEach(schedule => {
            const scheduleDays = schedule.day.split(',').map(d => d.trim());

            scheduleDays.forEach((day, index) => {
                scheduleItems.push({
                    id: `${schedule.scheduleId}-${index}`, 
                    classNum: schedule.className,
                    major: schedule.majorName || 'N/A',
                    date: day.charAt(0) + day.slice(1).toLowerCase(), 
                    session: schedule.isOnline ? 'Online' : 'In Class',
                    shift: `${schedule.shift.startTime.slice(0, 5)} - ${schedule.shift.endTime.slice(0, 5)}`,
                    room: schedule.roomName || 'Unavailable'
                });
            });
        });

        const dashboardStats = {
            classAssign: classAssignCount,
            ClassToday: classesTodayCount,
            onlineClass: onlineClassCount,
            currentDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            academicYear: '2025 - 2026',
        };

        return { dashboardStats, scheduleItems };

    } catch (error) {
        console.error("Failed to fetch dashboard data:", error.message);
        return {
            dashboardStats: { classAssign: 0, ClassToday: 0, onlineClass: 0, currentDate: '', academicYear: '' },
            scheduleItems: []
        };
    }
};

/**
 * The main page component that renders the instructor dashboard.
 */
export default async function InstructorDashboardPage() {
    const { dashboardStats, scheduleItems } = await fetchDashboardData();

    return (
        <InstructorDashboardLayout activeItem="dashboard" pageTitle="Dashboard">
            <Suspense fallback={<DashboardSkeleton />}>
                <InstructorDashboardClientView 
                    dashboardStats={dashboardStats}
                    scheduleItems={scheduleItems}
                />
            </Suspense>
        </InstructorDashboardLayout>
    );
}