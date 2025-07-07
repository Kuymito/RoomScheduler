import { Suspense } from 'react';
import InstructorLayout from '@/components/InstructorLayout';
import InstructorClassClientView from './components/InstructorClassClientView';
import InstructorClassPageSkeleton from './components/InstructorClassPageSkeleton';

/**
 * The main page component is now a standard Server Component.
 * It sets up the layout and Suspense boundary, while the client component handles data.
 */
export default function InstructorClassPage() {
    return (
        <InstructorLayout activeItem="class" pageTitle="Class">
            <Suspense fallback={<InstructorClassPageSkeleton />}>
                {/* The Client Component will now handle its own data fetching via useSWR */}
                <InstructorClassClientView />
            </Suspense>
        </InstructorLayout>
    );
}