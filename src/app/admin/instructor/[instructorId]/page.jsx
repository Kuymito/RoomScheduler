import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import InstructorDetailSkeleton from '../components/InstructorDetailSkeleton';
import InstructorDetailClientView from '../components/InstructorDetailClientView';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { instructorService } from '@/services/instructor.service';

/**
 * Server-side data fetching function.
 */
const fetchInstructorDetails = async (id) => {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Authentication token not found.");
        return null;
    }
    
    try {
        const data = await instructorService.getInstructorById(id, token);
        return {
            id: data.instructorId,
            name: `${data.firstName} ${data.lastName}`,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            major: data.major,
            degree: data.degree,
            department: data.departmentName,
            status: data.archived ? 'archived' : 'active',
            profileImage: data.profile || null,
            address: data.address,
            password: 'password123', // Password should not be sent from API
        };
    } catch (error) {
        console.error(`Failed to fetch instructor details for ID ${id}:`, error);
        return null;
    }
};

/**
 * The page is now an async Server Component.
 */
export default async function InstructorDetailsPage({ params }) {
    const instructorId = parseInt(params.instructorId, 10);
    const instructor = await fetchInstructorDetails(instructorId);

    if (!instructor) {
        notFound();
    }

    return (
        <AdminLayout activeItem="instructor" pageTitle="Instructor Details">
            <Suspense fallback={<InstructorDetailSkeleton />}>
                <InstructorDetailClientView initialInstructor={instructor} />
            </Suspense>
        </AdminLayout>
    );
}