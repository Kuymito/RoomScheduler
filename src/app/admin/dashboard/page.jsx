import { Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardHeader from './components/DashboardHeader';
import StatCard from './components/StatCard';
import DashboardSkeleton from './components/DashboardSkeleton';
import RoomAvailabilityWrapper from './components/RoomAvailabilityWrapper';
import { revalidatePath } from 'next/cache';

// Mock data fetching functions (ideally move to a central file like `@/lib/data`)
const fetchDashboardData = async () => {
  return new Promise(resolve => setTimeout(() => resolve({
    classAssign: 65,
    expired: 15,
    unassignedClass: 16,
    onlineClass: 28,
    currentDate: '19 May 2025',
    academicYear: '2025 - 2026',
  }), 500));
};

const fetchChartData = async (timeSlot) => {
  console.log(`Fetching server chart data for: ${timeSlot}`);
  let dataPoints;
  switch (timeSlot) {
    case '07:00 - 10:00': dataPoints = [23, 60, 32, 55, 13, 45, 48]; break;
    case '10:30 - 13:30': dataPoints = [45, 22, 50, 30, 65, 25, 40]; break;
    case '14:00 - 17:00': dataPoints = [30, 55, 18, 48, 33, 60, 22]; break;
    case '17:30 - 20:30': dataPoints = [15, 35, 40, 20, 50, 30, 55]; break;
    default: dataPoints = [10, 20, 30, 40, 50, 60, 70];
  }
  return new Promise(resolve => setTimeout(() => resolve({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: dataPoints,
  }), 500));
};

// This is the primary content component, rendered on the server.
async function DashboardContent() {
  // Fetch initial data for the page and the chart in parallel on the server.
  const [dashboardStats, initialChartData] = await Promise.all([
    fetchDashboardData(),
    fetchChartData('07:00 - 10:00')
  ]);

  const { classAssign, expired, unassignedClass, onlineClass, currentDate, academicYear } = dashboardStats;

  // Server Action to be called from the client component to get new chart data.
  async function updateChart(timeSlot) {
    'use server'; // This marks the function as a Server Action
    const data = await fetchChartData(timeSlot);
    revalidatePath('/admin/dashboard'); // Optional: revalidate path if data is not mock
    return data;
  }

  return (
    <>
      <DashboardHeader
        title="Welcome to Schedule Management"
        description="Easily plan, track, and manage your school schedule all in one place."
        currentDate={currentDate}
        academicYear={academicYear}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <StatCard title="Class Assign" value={classAssign} />
        <StatCard title="Expired" value={expired} />
        <StatCard title="Unassigned Class" value={unassignedClass} />
        <StatCard title="Online Class" value={onlineClass} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        {/*
          The interactive chart is now in a separate client component.
          We pass the initial data and the server action as props.
        */}
        <RoomAvailabilityWrapper
          initialChartData={initialChartData}
          updateChartAction={updateChart}
        />
      </div>
    </>
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