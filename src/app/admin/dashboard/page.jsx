import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardSkeleton from './components/DashboardSkeleton';
import DashboardClientContent from './components/DashboardClientContent';
import { classService } from '@/services/class.service';
import { scheduleService } from '@/services/schedule.service';
import { roomService } from '@/services/room.service'; // Import room service

/**
 * Fetches and calculates dashboard statistics from the live API using services.
 * @param {string} token - The authentication token.
 * @returns {Promise<object>} An object containing the calculated stats.
 */
const fetchDashboardStats = async (token) => {
    try {
        const [schedulesResponse, allClasses] = await Promise.all([
            scheduleService.getAllSchedules(token),
            classService.getAllClasses(token)
        ]);

        // --- THE FIX ---
        // The service returns an array directly, so we use it.
        const allSchedules = Array.isArray(schedulesResponse) ? schedulesResponse : [];

        // The rest of the logic from before is correct
        const assignedClassIds = new Set();
        const unassignedClassIds = new Set();
        const onlineClassIds = new Set();

        for (const schedule of allSchedules) {
            const classId = schedule.classId;
            const hasDays = schedule.dayDetails && schedule.dayDetails.length > 0;

            if (hasDays) {
                assignedClassIds.add(classId);
            } else {
                unassignedClassIds.add(classId);
            }

            if (hasDays && schedule.dayDetails.some(day => day.online === true)) {
                onlineClassIds.add(classId);
            }
        }

        return {
            classAssign: assignedClassIds.size,
            unassignedClass: unassignedClassIds.size,
            onlineClass: onlineClassIds.size,
            expired: allClasses.filter(c => c.archived).length,
        };
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        return { classAssign: 0, expired: 0, unassignedClass: 0, onlineClass: 0 };
    }
};
/**
 * **[UPDATED LOGIC]**
 * Fetches all rooms and schedules to calculate the number of AVAILABLE rooms.
 * @param {string} timeSlot - The time slot to filter by.
 * @param {string} token - The authentication token.
 * @returns {Promise<object>} An object containing labels and data for the chart.
 */
const fetchChartData = async (timeSlot, token) => {
    console.log(`Fetching server chart data for available rooms: ${timeSlot}`);
    try {
        const [allRooms, schedulesResponse] = await Promise.all([
            roomService.getAllRooms(token),
            scheduleService.getAllSchedules(token)
        ]);

        // --- FIX 1: Access the array directly from the response ---
        const allSchedules = Array.isArray(schedulesResponse) ? schedulesResponse : [];
        const totalRoomCount = allRooms.length;
        const [startTime] = timeSlot.split(' - ');
        
        const relevantSchedules = allSchedules.filter(s => s.shift.startTime === startTime);

        const dailyOccupiedCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

        relevantSchedules.forEach(schedule => {
            if (schedule.roomId !== null && schedule.dayDetails) {
                schedule.dayDetails.forEach(dayDetail => {
                    if (!dayDetail.online) {
                        // --- FIX 2: Correctly format the day abbreviation to match the keys ---
                        // Converts "TUESDAY" to "Tue", "WEDNESDAY" to "Wed", etc.
                        const dayOfWeek = dayDetail.dayOfWeek;
                        const dayAbbr = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.substring(1, 3).toLowerCase();
                        
                        if (dayAbbr in dailyOccupiedCounts) {
                            dailyOccupiedCounts[dayAbbr]++;
                        }
                    }
                });
            }
        });

        const dailyAvailableCounts = {
            Mon: totalRoomCount - dailyOccupiedCounts.Mon,
            Tue: totalRoomCount - dailyOccupiedCounts.Tue,
            Wed: totalRoomCount - dailyOccupiedCounts.Wed,
            Thu: totalRoomCount - dailyOccupiedCounts.Thu,
            Fri: totalRoomCount - dailyOccupiedCounts.Fri,
            Sat: totalRoomCount - dailyOccupiedCounts.Sat,
            Sun: totalRoomCount - dailyOccupiedCounts.Sun,
        };

        return {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: Object.values(dailyAvailableCounts),
        };
    } catch (error) {
        console.error("Failed to fetch chart data:", error);
        return {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [0, 0, 0, 0, 0, 0, 0],
        };
    }
};
/**
 * The primary server component for the dashboard.
 */
async function DashboardContent() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        return <div>Authentication error. Please sign in again.</div>;
    }

    const [dashboardStats, initialChartData] = await Promise.all([
        fetchDashboardStats(token),
        fetchChartData('07:00:00 - 10:00:00', token)
    ]);

    // Server Action to be called from the client to get new chart data.
    async function updateChart(timeSlot) {
        'use server';
        const session = await getServerSession(authOptions);
        const data = await fetchChartData(timeSlot, session?.accessToken);
        revalidatePath('/admin/dashboard');
        return data;
    }

    return (
        <DashboardClientContent
            dashboardStats={dashboardStats}
            initialChartData={initialChartData}
            updateChartAction={updateChart}
        />
    );
}

// The main page export
export default function AdminDashboardPage() {
    return (
        <DashboardLayout activeItem="dashboard" pageTitle="Dashboard">
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardContent />
            </Suspense>
        </DashboardLayout>
    );
}