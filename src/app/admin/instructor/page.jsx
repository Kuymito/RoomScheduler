import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import InstructorPageSkeleton from './components/InstructorPageSkeleton';
import InstructorClientView from './components/InstructorClientView';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { instructorService } from '@/services/instructor.service';

/**
 * An async Server Component to fetch the data directly from the external API.
 */
async function getDepartments(token) {
    try {
        console.log("Fetching departments with token on server...");
        const departments = await departmentService.getAllDepartments(token);
        return departments || [];
    } catch (error) {
        // THIS IS THE MOST IMPORTANT PART TO CHECK
        console.error("🔴 FAILED TO FETCH DEPARTMENTS ON SERVER:", error.message);
        return []; // Return empty array on error
    }
}


async function InstructorData() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    console.log("Server Session Object:", JSON.stringify(session, null, 2));

    if (!token) {
        console.error("No access token found in session. User is not authenticated.");
        return <InstructorClientView initialInstructors={[]} departments={[]} />; 
    }

    try {
        // Fetch both instructors and departments in parallel
        const [apiData, departments] = await Promise.all([
            instructorService.getAllInstructors(token),
            instructorService.getAllDepartments(token)
        ]);
        
        const formattedData = apiData.map(item => ({
            id: item.instructorId,
            name: `${item.firstName} ${item.lastName}`,
            firstName: item.firstName,
            lastName: item.lastName,
            email: item.email,
            phone: item.phone,
            majorStudied: item.major,
            qualifications: item.degree,
            status: item.archived ? 'archived' : 'active',
            profileImage: item.profile || null,
            address: item.address,
            department: item.departmentName
        }));

        // Pass both sets of data to the client component
        return <InstructorClientView initialInstructors={formattedData} departments={departments} />;
    } catch (error) {
        console.error("Failed to fetch initial data in page.jsx:", error.message);
        // Pass empty arrays on failure
        return <InstructorClientView initialInstructors={[]} departments={[]} />; 
    }
}

export default async function AdminInstructorsPage() {
    return (
        <AdminLayout activeItem="instructor" pageTitle="Instructor Management">
            <Suspense fallback={<InstructorPageSkeleton />}>
                <InstructorData />
            </Suspense>
        </AdminLayout>
    );
}