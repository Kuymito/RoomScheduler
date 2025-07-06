import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ClassDetailSkeleton from '../components/ClassDetailSkeleton';
import ClassDetailClientView from '../components/ClassDetailClientView';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { classService } from '@/services/class.service';
import { instructorService } from '@/services/instructor.service';
import { departmentService } from '@/services/department.service';

// Mapping from shiftId to the full descriptive name used in the UI dropdown.
const shiftIdToFullNameMap = {
    1: 'Morning Shift (07:00:00 - 10:00:00, Weekday)',
    2: 'Noon Shift (10:30:00 - 13:30:00, Weekday)',
    3: 'Afternoon Shift (14:00:00 - 17:00:00, Weekday)',
    4: 'Evening Shift (17:30:00 - 20:30:00, Weekday)',
    5: 'Weekend Shift (07:30:00 - 17:00:00, Weekend)'
};

// Helper to map full day names to abbreviated names
const mapApiDayToClientDay = (apiDay) => {
    const dayMap = {
        MONDAY: 'Mon',
        TUESDAY: 'Tue',
        WEDNESDAY: 'Wed',
        THURSDAY: 'Thur',
        FRIDAY: 'Fri',
        SATURDAY: 'Sat',
        SUNDAY: 'Sun',
    };
    return dayMap[apiDay.toUpperCase()];
};


/**
 * Server-side data fetching function.
 * It fetches class details, all instructors, and all departments.
 */
const fetchClassPageData = async (classId) => {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Authentication token not found.");
        return { classDetails: null, instructors: [], departments: [], initialSchedule: {} };
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
            shift: classDetailsResponse.shift ? shiftIdToFullNameMap[classDetailsResponse.shift.shiftId] : 'N/A',
            status: classDetailsResponse.archived ? 'Archived' : 'Active',
        };

        const formattedInstructors = instructorsResponse.map(inst => ({
            id: inst.instructorId,
            name: `${inst.firstName} ${inst.lastName}`,
            profileImage: inst.profile || null,
            degree: inst.degree,
        }));

        const formattedDepartments = departmentsResponse;

        // Process the dailySchedule object from the API
        const initialSchedule = {};
        if (classDetailsResponse.dailySchedule) {
            for (const apiDay in classDetailsResponse.dailySchedule) {
                const clientDay = mapApiDayToClientDay(apiDay);
                if (clientDay) {
                    const scheduleInfo = classDetailsResponse.dailySchedule[apiDay];
                    initialSchedule[clientDay] = {
                        instructor: {
                            id: scheduleInfo.instructor.instructorId,
                            name: `${scheduleInfo.instructor.firstName} ${scheduleInfo.instructor.lastName}`,
                            profileImage: scheduleInfo.instructor.profile,
                            degree: scheduleInfo.instructor.degree,
                        },
                        studyMode: scheduleInfo.online ? 'online' : 'in-class',
                    };
                }
            }
        }

        return { 
            classDetails: formattedClassDetails, 
            instructors: formattedInstructors, 
            departments: formattedDepartments,
            initialSchedule: initialSchedule // Pass the processed schedule
        };

    } catch (error) {
        console.error(`Failed to fetch data for class ${classId}:`, error);
        return { classDetails: null, instructors: [], departments: [], initialSchedule: {} };
    }
};

/**
 * The main page Server Component.
 */
export default async function ClassDetailsPage({ params }) {
    const classId = params.classId;
    const { classDetails, instructors, departments, initialSchedule } = await fetchClassPageData(classId);

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
                    initialSchedule={initialSchedule} // Pass schedule data to client
                />
            </Suspense>
        </AdminLayout>
    );
}