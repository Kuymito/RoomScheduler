import { Suspense } from 'react';
import InstructorLayout from '@/components/InstructorLayout';
import SchedulePageSkeleton from './components/SchedulePageSkeleton';
import InstructorScheduleClientView from './components/InstructorScheduleClientView';

/**
 * The main page component is now a standard Server Component.
 * It no longer fetches data itself but provides the layout and Suspense boundary.
 */
export default function InstructorSchedulePage() {
    return (
        <InstructorLayout activeItem="schedule" pageTitle="Schedule">
            <Suspense fallback={<SchedulePageSkeleton />}>
                {/* The Client Component will now handle its own data fetching via useSWR */}
                <InstructorScheduleClientView />
            </Suspense>
        </InstructorLayout>
    );
}