import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import InstructorLayout from '@/components/InstructorLayout';
import InstructorClassDetailSkeleton from '../components/InstructorClassDetailSkeleton';
import InstructorClassDetailClientView from '../components/InstructorClassDetailClientView';
import { classService } from '@/services/class.service'; // Import your class service

/**
 * Fetches and processes data for a specific class from the live API.
 * @param {number} classId - The ID of the class to fetch.
 * @returns {Promise<object>} An object containing the formatted class details and schedule.
 */
const fetchClassAndScheduleData = async (classId) => {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Authentication token not found.");
        return { classDetails: null, schedule: {} };
    }

    try {
        const classApiResponse = await classService.getClassById(classId, token);
        
        if (!classApiResponse) {
            return { classDetails: null, schedule: {} };
        }

        // Format the main class details
        const classDetails = {
            id: classApiResponse.classId,
            name: classApiResponse.className,
            generation: classApiResponse.generation,
            group: classApiResponse.groupName,
            major: classApiResponse.majorName,
            degrees: classApiResponse.degreeName,
            faculty: classApiResponse.department?.name || 'N/A',
            semester: classApiResponse.semester,
            shift: classApiResponse.shift ? `${classApiResponse.shift.startTime} - ${classApiResponse.shift.endTime}` : 'N/A',
            status: classApiResponse.archived ? 'Archived' : 'Active',
        };

        // --- THIS IS THE FIX ---
        // Process the 'dailySchedule' from the API response into the format the UI expects.
        const schedule = {};
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        daysOfWeek.forEach(day => {
            const apiDay = day.toUpperCase(); // API uses uppercase day names
            const scheduleForDay = classApiResponse.dailySchedule[apiDay];
            
            if (scheduleForDay && scheduleForDay.instructor) {
                schedule[day] = {
                    instructor: {
                        name: `${scheduleForDay.instructor.firstName} ${scheduleForDay.instructor.lastName}`,
                        role: scheduleForDay.instructor.degree,
                        avatar: scheduleForDay.instructor.profile || null
                    },
                    studyMode: scheduleForDay.online ? 'Online' : 'In-Class'
                };
            } else {
                schedule[day] = null; // No class on this day
            }
        });
        
        return { classDetails, schedule };

    } catch (error) {
        console.error(`Failed to fetch data for class ${classId}:`, error);
        return { classDetails: null, schedule: {} };
    }
};


export default async function InstructorClassDetailsPage({ params }) {
    const classId = parseInt(params.classId, 10);
    
    // Fetch the live data from your API
    const { classDetails, schedule } = await fetchClassAndScheduleData(classId);
    
    if (!classDetails) {
        notFound();
    }

    return (
        <InstructorLayout activeItem="class" pageTitle="Class Details">
            <Suspense fallback={<InstructorClassDetailSkeleton />}>
                <InstructorClassDetailClientView
                    initialClassDetails={classDetails}
                    initialSchedule={schedule}
                />
            </Suspense>
        </InstructorLayout>
    );
}