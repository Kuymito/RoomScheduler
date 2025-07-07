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
        const [myClassesResponse, mySchedulesResponse] = await Promise.all([
            classService.getMyClasses(token),
            scheduleService.getMySchedules(token)
        ]);
        
        // --- FIX 1: Use the direct array response from the service ---
        // Checks if the response is an array, otherwise defaults to an empty one.
        const myClasses = Array.isArray(myClassesResponse) ? myClassesResponse : [];
        const mySchedules = Array.isArray(mySchedulesResponse) ? mySchedulesResponse : [];

        // --- Stat Calculation ---

        // 1. "Class Assign" is the total number of classes taught by the instructor.
        const classAssignCount = myClasses.length;

        // 2. "Class Today" is the number of unique classes happening today.
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        const schedulesToday = mySchedules.filter(schedule => 
            schedule.dayDetails && schedule.dayDetails.some(d => d.dayOfWeek.toUpperCase() === today)
        );
        const classesTodayCount = new Set(schedulesToday.map(s => s.classId)).size;

        // 3. "Online Class" is the number of unique classes that have at least one online session.
        const schedulesWithOnlineDays = mySchedules.filter(schedule => 
            schedule.dayDetails && schedule.dayDetails.some(d => d.online)
        );
        const onlineClassCount = new Set(schedulesWithOnlineDays.map(s => s.classId)).size;
        
        // --- Schedule Table Items Creation ---
        const scheduleItems = [];
        mySchedules.forEach(schedule => {
            if (schedule.dayDetails) {
                schedule.dayDetails.forEach(dayDetail => {
                    scheduleItems.push({
                        id: `${schedule.scheduleId}-${dayDetail.dayOfWeek}`, 
                        classNum: schedule.className,
                        major: schedule.majorName || 'N/A',
                        date: dayDetail.dayOfWeek.charAt(0) + dayDetail.dayOfWeek.slice(1).toLowerCase(), 
                        session: dayDetail.online ? 'Online' : 'In Class',
                        shift: `${schedule.shift.startTime.slice(0, 5)} - ${schedule.shift.endTime.slice(0, 5)}`,
                        room: schedule.roomName || 'Unavailable'
                    });
                });
            }
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
        console.error("Failed to fetch instructor dashboard data:", error.message);
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