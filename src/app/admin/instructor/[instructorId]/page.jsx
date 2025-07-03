import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import InstructorDetailSkeleton from '../components/InstructorDetailSkeleton';
import InstructorDetailClientView from '../components/InstructorDetailClientView';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { instructorService } from '@/services/instructor.service';
import { departmentService } from '@/services/department.service'; // ✅ Import department service

/**
 * Server-side data fetching function.
 * Fetches details for a specific instructor AND the list of all departments.
 */
const fetchInstructorPageData = async (id) => {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Authentication token not found.");
        return { instructor: null, departments: [] };
    }
    
    try {
        // Fetch both data sets in parallel for better performance
        const [instructorData, departmentsData] = await Promise.all([
            instructorService.getInstructorById(id, token),
            departmentService.getAllDepartments(token) // ✅ Fetch all departments
        ]);

        if (!instructorData) {
            return { instructor: null, departments: [] };
        }

        const instructor = {
            id: instructorData.instructorId,
            name: `${instructorData.firstName} ${instructorData.lastName}`,
            firstName: instructorData.firstName,
            lastName: instructorData.lastName,
            email: instructorData.email,
            phone: instructorData.phone,
            major: instructorData.major,
            degree: instructorData.degree,
            department: instructorData.departmentName, // The current department name
            status: instructorData.archived ? 'archived' : 'active',
            profileImage: instructorData.profile || null,
            address: instructorData.address,
        };
        
        return { instructor, departments: departmentsData || [] };

    } catch (error) {
        console.error(`Failed to fetch data for instructor ID ${id}:`, error);
        return { instructor: null, departments: [] };
    }
};

/**
 * The main page is a Server Component that orchestrates data fetching.
 */
export default async function InstructorDetailsPage({ params }) {
    const instructorId = parseInt(params.instructorId, 10);
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        // Handle unauthorized access
        return redirect('/api/auth/login');
    }

    const { instructor, departments } = await fetchInstructorPageData(instructorId, token);

    if (!instructor) {
        notFound();
    }

    return (
        <AdminLayout activeItem="instructor" pageTitle="Instructor Details">
            <Suspense fallback={<InstructorDetailSkeleton />}>
                <InstructorDetailClientView 
                    initialInstructor={instructor} 
                    allDepartments={departments}
                    token={token}  // Pass the token as a prop
                />
            </Suspense>
        </AdminLayout>
    );
}