import { Suspense } from 'react';
import InstructorLayout from '@/components/InstructorLayout';
import InstructorClassClientView from './components/InstructorClassClientView';
import InstructorClassPageSkeleton from './components/InstructorClassPageSkeleton';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { classService } from '@/services/class.service';

/**
 * An async Server Component to fetch the initial data for the instructor's classes.
 * This ensures the data is ready before the client component renders.
 */
async function InstructorClassData() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    let initialClasses = [];
    if (token) {
        try {
            // Fetch the initial set of classes on the server.
            initialClasses = await classService.getAssignedClasses(token);
        } catch (error) {
            console.error("Failed to fetch instructor classes on the server:", error.message);
            // If the fetch fails, we'll pass an empty array and let the client-side SWR handle retries.
        }
    } else {
        console.error("No access token found in session for instructor class page.");
    }
    
    // Pass the server-fetched data as a prop to the client component.
    return <InstructorClassClientView initialClasses={initialClasses} />;
}


/**
 * The main page component for an instructor's classes.
 * It uses Suspense to show a loading skeleton while the initial data is being fetched on the server.
 */
export default function InstructorClassPage() {
    return (
        <InstructorLayout activeItem="class" pageTitle="Class">
            <Suspense fallback={<InstructorClassPageSkeleton />}>
                <InstructorClassData />
            </Suspense>
        </InstructorLayout>
    );
}