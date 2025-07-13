// src/app/admin/dashboard/page.jsx
import { Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardSkeleton from './components/DashboardSkeleton';
import DashboardClientContent from './components/DashboardClientContent';
import { classService } from '@/services/class.service';
import { scheduleService } from '@/services/schedule.service';
import { getAllRooms } from '@/services/room.service';
import { getServerSession }from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

const fetchDashboardStats = async () => {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  if (!token) {
    return {
      classAssign: 0,
      expired: 0,
      unassignedClass: 0,
      onlineClass: 0,
    };
  }

  const classes = await classService.getAllClasses(token);

  let assigned = 0;
  let unassigned = 0;
  let expired = 0;
  let online = 0;

  const currentDate = new Date();
  const fourYearsAgo = new Date(currentDate);
  fourYearsAgo.setFullYear(currentDate.getFullYear() - 4);
  const expiryThreshold = new Date(fourYearsAgo);
  expiryThreshold.setMonth(expiryThreshold.getMonth() - 2);


  classes.forEach(cls => {
    // A class is considered assigned if its dailySchedule object is not null and has entries.
    if (cls.dailySchedule && Object.keys(cls.dailySchedule).length > 0) {
      assigned++;
    } else {
      unassigned++;
    }

    // Check if createdAt is not null before comparing dates.
    if (cls.createdAt && new Date(cls.createdAt) < expiryThreshold) {
      expired++;
    }

    // Updated logic for counting online classes
    let isOnline = false;
    if (cls.dailySchedule && typeof cls.dailySchedule === 'object') {
        for (const day in cls.dailySchedule) {
            if (cls.dailySchedule[day] && cls.dailySchedule[day].online === true) {
                isOnline = true;
                break; // Exit the loop once an online session is found for the class
            }
        }
    }
    if (isOnline) {
        online++;
    }
  });

  return {
    classAssign: assigned,
    expired: expired,
    unassignedClass: unassigned,
    onlineClass: online,
  };
};


const fetchChartData = async (timeSlot) => {
  console.log(`Fetching server chart data for: ${timeSlot}`);
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  if (!token) {
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [0, 0, 0, 0, 0, 0, 0],
      totalRoomCount: 10, // Default value
    };
  }

  try {
    const [allRooms, allSchedules] = await Promise.all([
      getAllRooms(token),
      scheduleService.getAllSchedules(token)
    ]);

    const totalRoomCount = allRooms.length;
    const selectedStartTime = timeSlot.split(' - ')[0] + ':00';

    const occupiedRoomsByDay = {
      MONDAY: new Set(),
      TUESDAY: new Set(),
      WEDNESDAY: new Set(),
      THURSDAY: new Set(),
      FRIDAY: new Set(),
      SATURDAY: new Set(),
      SUNDAY: new Set()
    };

    const relevantSchedules = allSchedules.filter(
      schedule => schedule.shift && schedule.shift.startTime === selectedStartTime
    );

    relevantSchedules.forEach(schedule => {
      if (schedule.dayDetails && schedule.roomId) {
        schedule.dayDetails.forEach(dayDetail => {
          if (occupiedRoomsByDay[dayDetail.dayOfWeek] && !dayDetail.online) {
            occupiedRoomsByDay[dayDetail.dayOfWeek].add(schedule.roomId);
          }
        });
      }
    });

    const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const dataPoints = daysOrder.map(day => {
      const occupiedCount = occupiedRoomsByDay[day].size;
      return totalRoomCount - occupiedCount;
    });

    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: dataPoints,
      totalRoomCount: totalRoomCount,
    };

  } catch (error) {
    console.error("Failed to fetch chart data:", error);
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [0, 0, 0, 0, 0, 0, 0],
      totalRoomCount: 10, // Default value on error
    };
  }
};

// This is the primary content component, rendered on the server.
async function DashboardContent() {
  // Fetch initial data for the page and the chart in parallel on the server.
  const [dashboardStats, initialChartData] = await Promise.all([
    fetchDashboardStats(), // No longer fetching date/year here
    fetchChartData('07:00 - 10:00')
  ]);

  // Server Action to be called from the client component to get new chart data.
  async function updateChart(timeSlot) {
    'use server'; // This marks the function as a Server Action
    const data = await fetchChartData(timeSlot);
    revalidatePath('/admin/dashboard'); // Optional: revalidate path if data is not mock
    return data;
  }

  return (
    // Pass the fetched stats and the server action to the client component
    <DashboardClientContent
      dashboardStats={dashboardStats}
      initialChartData={initialChartData}
      updateChartAction={updateChart}
    />
  );
}

// The main page export, which uses Suspense for a loading fallback.
export default function AdminDashboardPage() {
    return (
        <DashboardLayout activeItem="dashboard" pageTitle="Dashboard">
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardContent/>
            </Suspense>
        </DashboardLayout>
    );
}