import { Suspense } from 'react';
import InstructorLayout from '@/components/InstructorLayout';
import SchedulePageSkeleton from './components/SchedulePageSkeleton';
import InstructorScheduleClientView from './components/InstructorScheduleClientView';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { scheduleService } from '@/services/schedule.service';
import { authService } from '@/services/auth.service';

// --- SERVER-SIDE DATA FETCHING ---
const fetchInstructorScheduleData = async () => {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  if (!token) {
    console.error("Instructor Schedule Page: Not authenticated.");
    return { scheduleData: {}, instructorDetails: {} };
  }
  
  try {
    // Fetch schedule and profile data in parallel
    const [scheduleResponse, profileResponse] = await Promise.all([
        scheduleService.getMySchedule(token),
        authService.getProfile(token)
    ]);
    
    const scheduleData = {};
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    daysOfWeek.forEach(day => scheduleData[day] = {});

    scheduleResponse.forEach(item => {
        const timeSlot = `${item.shift.startTime.substring(0, 5)} - ${item.shift.endTime.substring(0, 5)}`;
        const days = item.day.split(',').map(d => d.trim());
        
        days.forEach(apiDay => {
            const dayName = apiDay.charAt(0).toUpperCase() + apiDay.slice(1).toLowerCase();
            if (scheduleData[dayName]) {
                scheduleData[dayName][timeSlot] = {
                    subject: item.className,
                    generation: `Generation ${item.year}`, // Renamed 'year' to 'generation'
                    semester: item.semester,
                    timeDisplay: timeSlot
                };
            }
        });
    });

    const instructorDetails = {
        instructorName: profileResponse ? `${profileResponse.firstName} ${profileResponse.lastName}` : "Instructor",
        publicDate: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    return { scheduleData, instructorDetails };

  } catch (error) {
      console.error("Failed to fetch instructor schedule data:", error);
      return { scheduleData: {}, instructorDetails: { instructorName: "Instructor", publicDate: new Date().toISOString().replace('T', ' ').substring(0, 19) } };
  }
};

/**
 * The main page component is now an async Server Component.
 */
export default async function InstructorSchedulePage() {
    // Data is fetched on the server before the page is sent to the client.
    const { scheduleData, instructorDetails } = await fetchInstructorScheduleData();

    return (
        <InstructorLayout activeItem="schedule" pageTitle="Schedule">
            <Suspense fallback={<SchedulePageSkeleton />}>
                {/* The Client Component is rendered here, receiving all server-fetched data as props. */}
                <InstructorScheduleClientView
                    initialScheduleData={scheduleData}
                    instructorDetails={instructorDetails}
                />
            </Suspense>
        </InstructorLayout>
    );
}