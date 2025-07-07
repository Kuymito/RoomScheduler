import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import InstructorLayout from '@/components/InstructorLayout';
import InstructorClassDetailSkeleton from '../components/InstructorClassDetailSkeleton';
import InstructorClassDetailClientView from '../components/InstructorClassDetailClientView';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { classService } from '@/services/class.service';

// --- Mappings and Helper Functions ---

// Mapping from shiftId to the full descriptive name used in the UI.
const shiftIdToFullNameMap = {
    1: 'Morning Shift (07:00:00 - 10:00:00, Weekday)',
    2: 'Noon Shift (10:30:00 - 13:30:00, Weekday)',
    3: 'Afternoon Shift (14:00:00 - 17:00:00, Weekday)',
    4: 'Evening Shift (17:30:00 - 20:30:00, Weekday)',
    5: 'Weekend Shift (07:30:00 - 17:00:00, Weekend)'
};

// Helper to map full day names from API to abbreviated names for the client
const mapApiDayToClientDay = (apiDay) => {
    const dayMap = {
        MONDAY: 'Monday',
        TUESDAY: 'Tuesday',
        WEDNESDAY: 'Wednesday',
        THURSDAY: 'Thursday',
        FRIDAY: 'Friday',
        SATURDAY: 'Saturday',
        SUNDAY: 'Sunday',
    };
    return dayMap[apiDay.toUpperCase()];
};


/**
 * Server-side data fetching function for a specific class assigned to the instructor.
 * @param {number} classId - The ID of the class to fetch details for.
 * @returns {Promise<{classDetails: object, schedule: object}>}
 */
const fetchInstructorClassDetails = async (classId) => {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Instructor Class Details: Not authenticated.");
        return { classDetails: null, schedule: {} };
    }

    try {
        const assignedClasses = await classService.getAssignedClasses(token);
        const classInfo = assignedClasses.find(c => c.classId === classId);

        if (!classInfo) {
            return { classDetails: null, schedule: {} };
        }

        // Format the main class details
        const classDetails = {
            id: classInfo.classId,
            name: classInfo.className,
            generation: classInfo.generation,
            group: classInfo.groupName,
            major: classInfo.majorName,
            degrees: classInfo.degreeName,
            faculty: classInfo.department?.name || 'N/A',
            semester: classInfo.semester,
            shift: classInfo.shift ? shiftIdToFullNameMap[classInfo.shift.shiftId] : 'N/A',
            status: classInfo.archived ? 'Archived' : 'Active',
        };

        // Format the schedule data from the dailySchedule object
        const schedule = {};
        if (classInfo.dailySchedule) {
            for (const apiDay in classInfo.dailySchedule) {
                const clientDay = mapApiDayToClientDay(apiDay);
                if (clientDay) {
                    const scheduleItem = classInfo.dailySchedule[apiDay];
                    schedule[clientDay] = {
                        instructor: {
                            name: `${scheduleItem.instructor.firstName} ${scheduleItem.instructor.lastName}`,
                            role: scheduleItem.instructor.degree,
                            avatar: scheduleItem.instructor.profile || null
                        },
                        studyMode: scheduleItem.online ? 'Online' : 'In-Class'
                    };
                }
            }
        }

        return { classDetails, schedule };

    } catch (error) {
        console.error(`Failed to fetch details for instructor's class ${classId}:`, error.message);
        return { classDetails: null, schedule: {} };
    }
};

/**
 * The main page component is now an async Server Component.
 */
export default async function InstructorClassDetailsPage({ params }) {
    const classId = parseInt(params.classId, 10);
    
    // Fetch data in parallel on the server
    const { classDetails, schedule } = await fetchInstructorClassDetails(classId);
    
    // If class doesn't exist for this instructor, show a 404 page
    if (!classDetails) {
        notFound();
    }

    const breadcrumbs = [
        { label: "Class Management", href: "/instructor/class" },
        { label: `Class: ${classDetails.name}` }
    ];

    return (
        <InstructorLayout activeItem="class" breadcrumbs={breadcrumbs}>
            <Suspense fallback={<InstructorClassDetailSkeleton />}>
                <InstructorClassDetailClientView
                    initialClassDetails={classDetails}
                    initialSchedule={schedule}
                />
            </Suspense>
        </InstructorLayout>
    );
}