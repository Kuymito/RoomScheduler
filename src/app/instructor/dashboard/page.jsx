import { Suspense } from 'react';
import InstructorDashboardLayout from '@/components/InstructorDashboardLayout';
import InstructorDashboardClientView from './components/InstructorDashboardClientView';
import DashboardSkeleton from './components/DashboardSkeleton';

/**
 * The main page component is now a standard Server Component.
 * It no longer fetches data itself but provides the layout and Suspense boundary.
 */
export default function InstructorDashboardPage() {
    return (
        <InstructorDashboardLayout activeItem="dashboard" pageTitle="Dashboard">
            <Suspense fallback={<DashboardSkeleton />}>
                {/* The Client Component will now handle its own data fetching via useSWR */}
                <InstructorDashboardClientView />
            </Suspense>
        </InstructorDashboardLayout>
    );
}