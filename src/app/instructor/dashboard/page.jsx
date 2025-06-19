import { Suspense } from 'react';
import InstructorDashboardLayout from '@/components/InstructorDashboardLayout';
import InstructorDashboardClientView from './components/InstructorDashboardClientView';
import DashboardSkeleton from './components/DashboardSkeleton';

// --- SERVER-SIDE DATA FETCHING ---
const fetchDashboardData = async () => {
  return new Promise(resolve => setTimeout(() => resolve({
    classAssign: 65,
    ClassToday: 15,
    onlineClass: 28,
    currentDate: '16 June 2025',
    academicYear: '2025 - 2026',
  }), 500)); 
};

const fetchScheduleTableData = async () => {
  return new Promise(resolve => setTimeout(() => resolve([
    { id: 1, classNum: '34/27', major: 'IT', date: 'Monday', session: 'In Class', shift: '07:00 - 10:00', room: '1A' },
    { id: 2, classNum: '32/12', major: 'IT', date: 'Monday', session: 'In Class', shift: '05:30 - 08:30', room: '2B' },
    { id: 3, classNum: '31/21', major: 'MG', date: 'Wednesday', session: 'In Class', shift: '10:30 - 01:30', room: '6A' },
    { id: 4, classNum: '32/15', major: 'IT', date: 'Thursday', session: 'Online', shift: '02:00 - 05:00', room: 'Unavailable' },
    { id: 5, classNum: '32/49', major: 'IT', date: 'Friday', session: 'Online', shift: '07:00 - 10:00', room: 'Unavailable' },
    { id: 6, classNum: '31/17', major: 'BIT', date: 'Saturday', session: 'Online', shift: '05:30 - 08:30', room: 'Unavailable' },
  ]), 500));
};

/**
 * The main page component is now an async Server Component.
 * It fetches data on the server before sending the page to the client.
 */
export default async function InstructorDashboardPage() {
    // Fetch initial data in parallel on the server
    const [dashboardStats, scheduleItems] = await Promise.all([
        fetchDashboardData(),
        fetchScheduleTableData()
    ]);

    return (
        <InstructorDashboardLayout activeItem="dashboard" pageTitle="Dashboard">
            <Suspense fallback={<DashboardSkeleton />}>
                {/* Render the Client Component here, passing the server-fetched data as props.
                  The browser receives pre-rendered HTML for an instant load, then hydrates
                  the component to make it interactive (if needed).
                */}
                <InstructorDashboardClientView 
                    dashboardStats={dashboardStats}
                    scheduleItems={scheduleItems}
                />
            </Suspense>
        </InstructorDashboardLayout>
    );
}
