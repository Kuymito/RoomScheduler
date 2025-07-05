import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import InstructorDetailSkeleton from '../components/InstructorDetailSkeleton';
import InstructorDetailClientView from '../components/InstructorDetailClientView';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { instructorService } from '@/services/instructor.service';
import { departmentService } from '@/services/department.service';

/**
 * Server-side data fetching function.
 * Fetches instructor details and all available departments.
 */
const fetchInstructorPageData = async (id) => {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Authentication token not found.");
        return { instructor: null, departments: [] };
    }
    
    try {
        // Fetch instructor details and all departments in parallel
        const [instructorData, departmentsData] = await Promise.all([
            instructorService.getInstructorById(id, token),
            departmentService.getAllDepartments(token)
        ]);

        const instructor = {
            id: instructorData.instructorId,
            name: `${instructorData.firstName} ${instructorData.lastName}`,
            firstName: instructorData.firstName,
            lastName: instructorData.lastName,
            email: instructorData.email,
            phone: instructorData.phone,
            major: instructorData.major,
            degree: instructorData.degree,
            department: instructorData.departmentName,
            departmentId: instructorData.departmentId, // Pass departmentId to client
            status: instructorData.archived ? 'archived' : 'active',
            profileImage: instructorData.profile || null,
            address: instructorData.address,
            password: 'password123', // Password should not be sent from API
        };

        return { instructor, allDepartments: departmentsData };

    } catch (error) {
        console.error(`Failed to fetch page data for instructor ID ${id}:`, error);
        return { instructor: null, allDepartments: [] };
    }
};

/**
 * The page is now an async Server Component.
 */
export default async function InstructorDetailsPage({ params }) {
    const instructorId = parseInt(params.instructorId, 10);
    const { instructor, allDepartments } = await fetchInstructorPageData(instructorId);

    if (!instructor) {
        notFound();
    }

    return (
        <AdminLayout activeItem="instructor" pageTitle="Instructor Details">
            <Suspense fallback={<InstructorDetailSkeleton />}>
                <InstructorDetailClientView 
                    initialInstructor={instructor}
                    allDepartments={allDepartments} 
                />
            </Suspense>
        </AdminLayout>
    );
}