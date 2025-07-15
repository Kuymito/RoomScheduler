import { Suspense } from 'react';
import InstructorLayout from '@/components/InstructorLayout';
import SchedulePageSkeleton from './components/SchedulePageSkeleton';
import InstructorScheduleClientView from './components/InstructorScheduleClientView';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { scheduleService } from '@/services/schedule.service';
import { getAllShifts } from '@/services/shift.service'; 

/**
 * Helper function to calculate the academic year from the generation number.
 * @param {string | number} generation - The generation number of the class.
 * @returns {number | null} The calculated academic year, or null if invalid.
 */
const mapGenerationToYear = (generation) => {
    if (!generation) return null;
    const genNumber = parseInt(generation, 10);
    if (isNaN(genNumber)) return null;

    // Define the base generation and year for calculation.
    const BASE_GENERATION = 34; // This is the generation for the first year students in BASE_YEAR.
    const BASE_YEAR = 2025; 

    const currentYear = new Date().getFullYear();
    
    // Calculate what generation is currently in their first year.
    const currentFirstYearGeneration = BASE_GENERATION + (currentYear - BASE_YEAR);

    // Calculate the academic year for the given generation.
    const academicYear = currentFirstYearGeneration - genNumber + 1;
    
    return academicYear > 0 ? academicYear : null;
};

/**
 * Fetches and processes the schedule for the currently logged-in instructor.
 */
const fetchScheduleData = async () => {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  if (!token) {
      console.error("Instructor Schedule Page: Not authenticated.");
      return { scheduleData: {}, instructorDetails: {}, allShifts: [] };
  }

  try {
      const [apiSchedulesResponse, allShifts] = await Promise.all([
          scheduleService.getMySchedule(token),
          getAllShifts(token)
      ]);

      const apiSchedules = Array.isArray(apiSchedulesResponse) ? apiSchedulesResponse : (apiSchedulesResponse.payload || []);

      const scheduleData = {};
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      daysOfWeek.forEach(day => {
          scheduleData[day] = {};
      });

      apiSchedules.forEach(schedule => {
          if (!schedule || !schedule.shift || !schedule.dayDetails || !Array.isArray(schedule.dayDetails)) {
              console.warn('Skipping malformed schedule entry:', schedule);
              return;
          }

          const timeSlotKey = `${schedule.shift.startTime.slice(0, 5)} - ${schedule.shift.endTime.slice(0, 5)}`;
          
          const days = schedule.dayDetails.map(dayDetail => dayDetail.dayOfWeek.toUpperCase());
          
          // Use the new generation-based year calculation
          const academicYear = mapGenerationToYear(schedule.year);

          days.forEach(dayString => {
              const formattedDay = dayString.charAt(0) + dayString.slice(1).toLowerCase();
              if (scheduleData[formattedDay]) {
                  scheduleData[formattedDay][timeSlotKey] = {
                      subject: schedule.className,
                      // Use the calculated academic year
                      year: academicYear ? `Year ${academicYear}` : 'Year N/A', 
                      semester: schedule.semester,
                      timeDisplay: timeSlotKey,
                      room: schedule.roomName
                  };
              }
          });
      });
      
      const instructorDetails = {
          instructorName: session.user.name,
          publicDate: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      return { scheduleData, instructorDetails, allShifts };

  } catch (error) {
      console.error("Failed to fetch instructor schedule:", error.message);
      return { scheduleData: {}, instructorDetails: { instructorName: "Error", publicDate: "" }, allShifts: [] };
  }
};

/**
 * The main page component for the instructor's schedule.
 */
export default async function InstructorSchedulePage() {
    const { scheduleData, instructorDetails, allShifts } = await fetchScheduleData();

    return (
        <InstructorLayout activeItem="schedule" pageTitle="Schedule">
            <Suspense fallback={<SchedulePageSkeleton />}>
                <InstructorScheduleClientView
                    initialScheduleData={scheduleData}
                    instructorDetails={instructorDetails}
                    allShifts={allShifts} 
                />
            </Suspense>
        </InstructorLayout>
    );
}