import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import InstructorPageSkeleton from './components/InstructorPageSkeleton';
import InstructorClientView from './components/InstructorClientView';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { instructorService } from '@/services/instructor.service';
import { departmentService } from '@/services/department.service';

/**
 * An async Server Component to fetch data for instructors and departments.
 * This ensures all necessary data is available before the client component renders.
 */
async function InstructorData() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("No access token found in session. User is not authenticated.");
        // Pass empty arrays to the client component if not authenticated
        return <InstructorClientView initialInstructors={[]} initialDepartments={[]} />;
    }

    try {
        // Fetch both instructors and departments data in parallel for efficiency
        const [apiInstructors, apiDepartments] = await Promise.all([
            instructorService.getAllInstructors(token),
            departmentService.getAllDepartments(token)
        ]);
        
        // Pass the raw API data directly to the client component
        return <InstructorClientView initialInstructors={apiInstructors} initialDepartments={apiDepartments} />;
    } catch (error) {
        console.error("Failed to fetch instructor or department data in page.jsx:", error.message);
        // Pass empty arrays on error to prevent crashing the client
        return <InstructorClientView initialInstructors={[]} initialDepartments={[]} />;
    }
}

/**
 * The main page component for managing instructors.
 * It uses Suspense to show a loading skeleton while data is being fetched.
 */
export default async function AdminInstructorsPage() {
    return (
        <AdminLayout activeItem="instructor" pageTitle="Instructor Management">
            <Suspense fallback={<InstructorPageSkeleton />}>
                <InstructorData />
            </Suspense>
        </AdminLayout>
    );
}