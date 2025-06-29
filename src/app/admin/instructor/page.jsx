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
async function InstructorData() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("No access token found in session. User is not authenticated.");
        return <InstructorClientView initialInstructors={[]} />; 
    }

    try {
        const apiData = await instructorService.getAllInstructors(token);
        
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

        return <InstructorClientView initialInstructors={formattedData} />;
    } catch (error) {
        console.error("Failed to fetch instructor data in page.jsx:", error.message);
        return <InstructorClientView initialInstructors={[]} />; 
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