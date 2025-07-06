import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ClassPageSkeleton from './components/ClassPageSkeleton';
import ClassClientView from './components/ClassClientView';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { classService } from '@/services/class.service';
import { departmentService } from '@/services/department.service';

/**
 * An async Server Component to fetch the raw data for classes and departments.
 * The client component will handle all formatting and display logic.
 */
async function ClassData() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("No access token found in session. User is not authenticated.");
        // Pass empty arrays to the client component if not authenticated
        return <ClassClientView initialClasses={[]} initialDepartments={[]} />; 
    }

    try {
        // Fetch both classes and departments data in parallel
        const [apiClasses, apiDepartments] = await Promise.all([
            classService.getAllClasses(token),
            departmentService.getAllDepartments(token)
        ]);
        
        // Pass the raw API data directly to the client component
        return <ClassClientView initialClasses={apiClasses} initialDepartments={apiDepartments} />;
    } catch (error) {
        console.error("Failed to fetch class or department data in page.jsx:", error.message);
        // Pass empty arrays on error to prevent crashing the client
        return <ClassClientView initialClasses={[]} initialDepartments={[]} />; 
    }
}

/**
 * The main page component, responsible for layout and the Suspense boundary.
 */
export default function AdminClassPage() {
    return (
        <AdminLayout activeItem="class" pageTitle="Class Management">
            <Suspense fallback={<ClassPageSkeleton />}>
                <ClassData />
            </Suspense>
        </AdminLayout>
    );
}