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

    let initialInstructors = [];
    let initialDepartments = [];

    if (!token) {
        console.error("No access token found in session. User is not authenticated.");
    } else {
        try {
            // Fetch both instructors and departments data in parallel for efficiency
            const [apiInstructors, apiDepartments] = await Promise.all([
                instructorService.getAllInstructors(token),
                departmentService.getAllDepartments(token)
            ]);
            initialInstructors = apiInstructors;
            initialDepartments = apiDepartments;
        } catch (error) {
            console.error("Failed to fetch instructor or department data in page.jsx:", error.message);
            // In case of an error, we'll pass empty arrays and let the client-side SWR handle retries.
        }
    }
    
    // Pass the server-fetched data as props to the client component.
    return <InstructorClientView initialInstructors={initialInstructors} initialDepartments={initialDepartments} />;
}

/**
 * The main page component for managing instructors.
 * It uses Suspense to show a loading skeleton while data is being fetched on the server.
 */
export default async function AdminInstructorsPage() {
    return (
        <AdminLayout activeItem="instructor" pageTitle="Instructor">
            <Suspense fallback={<InstructorPageSkeleton />}>
                <InstructorData />
            </Suspense>
        </AdminLayout>
    );
}