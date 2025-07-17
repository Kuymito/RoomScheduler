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
import { majorService } from '@/services/major.service';

// Mapping from shiftId to the full descriptive name used in the UI dropdown.
const shiftIdToFullNameMap = {
    1: 'Morning Shift',
    2: 'Noon Shift',
    3: 'Afternoon Shift',
    4: 'Evening Shift',
    5: 'Weekend Shift'
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
 * It fetches class details, all instructors, all departments, all majors, and all classes.
 */
const fetchClassPageData = async (classId) => {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Authentication token not found.");
        return { classDetails: null, instructors: [], allDepartments: [], allMajors: [], initialSchedule: {}, allClasses: [] };
    }
    
    try {
        // Fetch all necessary data in parallel
        const [classDetailsResponse, instructorsResponse, departmentsResponse, majorsResponse, allClassesResponse] = await Promise.all([
            classService.getClassById(classId, token),
            instructorService.getAllInstructors(token),
            departmentService.getAllDepartments(token),
            majorService.getAllMajors(token),
            classService.getAllClasses(token)
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
            allDepartments: departmentsResponse,
            allMajors: majorsResponse,
            initialSchedule: initialSchedule,
            allClasses: allClassesResponse 
        };

    } catch (error) {
        console.error(`Failed to fetch data for class ${classId}:`, error);
        return { classDetails: null, instructors: [], allDepartments: [], allMajors: [], initialSchedule: {}, allClasses: [] };
    }
};

/**
 * The main page Server Component.
 */
export default async function ClassDetailsPage({ params }) {
    const classId = params.classId;
    const { classDetails, instructors, allDepartments, allMajors, initialSchedule, allClasses } = await fetchClassPageData(classId);

    if (!classDetails) {
        notFound();
    }

    const breadcrumbs = [
        { label: "Class", href: "/admin/class" },
        { label: `${classDetails.name}` }
    ];

    return (
        <AdminLayout activeItem="class" breadcrumbs={breadcrumbs}>
            <Suspense fallback={<ClassDetailSkeleton />}>
                <ClassDetailClientView 
                    initialClassDetails={classDetails}
                    allInstructors={instructors}
                    allDepartments={allDepartments}
                    allMajors={allMajors}
                    initialSchedule={initialSchedule}
                    allClasses={allClasses}
                />
            </Suspense>
        </AdminLayout>
    );
}