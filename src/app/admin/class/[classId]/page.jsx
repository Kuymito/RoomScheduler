import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ClassDetailSkeleton from '../components/ClassDetailSkeleton';
import ClassDetailClientView from '../components/ClassDetailClientView';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { classService } from '@/services/class.service';
import { instructorService } from '@/services/instructor.service';
import { departmentService } from '@/services/department.service'; // Import the new department service

/**
 * Server-side data fetching function.
 * It fetches class details, all instructors, and all departments.
 */
const fetchClassPageData = async (classId) => {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Authentication token not found.");
        return { classDetails: null, instructors: [], departments: [] };
    }

    try {
        const [classDetailsResponse, instructorsResponse, departmentsResponse] = await Promise.all([
            classService.getClassById(classId, token),
            instructorService.getAllInstructors(token),
            departmentService.getAllDepartments(token)
        ]);

        const formattedClassDetails = {
            id: classDetailsResponse.classId,
            name: classDetailsResponse.className,
            generation: classDetailsResponse.generation,
            group: classDetailsResponse.groupName,
            major: classDetailsResponse.majorName,
            degrees: classDetailsResponse.degreeName,
            faculty: classDetailsResponse.department?.name || 'N/A',
            semester: classDetailsResponse.semester,
            shift: classDetailsResponse.shift?.name || 'N/A',
            status: classDetailsResponse.archived ? 'Archived' : 'Active',
        };

        const formattedInstructors = instructorsResponse.map(inst => ({
            id: inst.instructorId,
            name: `${inst.firstName} ${inst.lastName}`,
            profileImage: inst.profile || null,
            degree: inst.degree,
        }));

        const formattedDepartments = departmentsResponse.map(dep => dep.name);

        return { classDetails: formattedClassDetails, instructors: formattedInstructors, departments: formattedDepartments };

    } catch (error) {
        console.error(`Failed to fetch data for class ${classId}:`, error);
        return { classDetails: null, instructors: [], departments: [] };
    }
};

/**
 * The main page Server Component.
 */
export default async function ClassDetailsPage({ params }) {
    const classId = params.classId;
    const { classDetails, instructors, departments } = await fetchClassPageData(classId);

    if (!classDetails) {
        notFound();
    }

    return (
        <AdminLayout activeItem="class" pageTitle={`Class: ${classDetails.name}`}>
            <Suspense fallback={<ClassDetailSkeleton />}>
                <ClassDetailClientView 
                    initialClassDetails={classDetails}
                    allInstructors={instructors}
                    allDepartments={departments}
                />
            </Suspense>
        </AdminLayout>
    );
}