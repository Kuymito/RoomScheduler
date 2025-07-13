import { Suspense } from 'react';
import InstructorLayout from '@/components/InstructorLayout';
import SchedulePageSkeleton from './components/SchedulePageSkeleton';
import InstructorScheduleClientView from './components/InstructorScheduleClientView';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { scheduleService } from '@/services/schedule.service';
import { shiftService } from '@/services/shift.service';

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
          shiftService.getAllShifts(token)
      ]);

      const apiSchedules = Array.isArray(apiSchedulesResponse) ? apiSchedulesResponse : (apiSchedulesResponse.payload || []);

      const scheduleData = {};
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      daysOfWeek.forEach(day => {
          scheduleData[day] = {};
      });

      apiSchedules.forEach(schedule => {
          const timeSlotKey = `${schedule.shift.startTime.slice(0, 5)} - ${schedule.shift.endTime.slice(0, 5)}`;
          
          // --- THIS IS THE FIX ---
          // Check if dayDetails exists and is an array before processing
          if (!schedule.dayDetails || !Array.isArray(schedule.dayDetails)) {
              return; // Skip this schedule if dayDetails is missing or not an array
          }
          // Create the list of days from the dayDetails array
          const days = schedule.dayDetails.map(dayDetail => dayDetail.dayOfWeek.toUpperCase());
          
          const mapSemesterToYear = (semester) => {
              if (!semester || typeof semester !== 'string') return '';
              const semesterNumber = parseInt(semester.replace(/[^0-9]/g, ''), 10);
              if (isNaN(semesterNumber)) return '';
              return Math.ceil(semesterNumber / 2);
          };

          const academicYear = mapSemesterToYear(schedule.semester);

          days.forEach(dayString => {
              const formattedDay = dayString.charAt(0) + dayString.slice(1).toLowerCase();
              if (scheduleData[formattedDay]) {
                  scheduleData[formattedDay][timeSlotKey] = {
                      subject: schedule.className,
                      year: `Year ${academicYear}`, 
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