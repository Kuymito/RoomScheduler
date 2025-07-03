import { Suspense } from 'react';
import InstructorLayout from '@/components/InstructorLayout';
import SchedulePageSkeleton from './components/SchedulePageSkeleton';
import InstructorScheduleClientView from './components/InstructorScheduleClientView';

// --- SERVER-SIDE DATA FETCHING ---
const fetchScheduleData = async () => {
  // In a real app, this would be a database query for a specific instructor's schedule
  const scheduleData = {
    'Monday': {
        '07:00 - 10:00': { subject: '32/27 IT', year: 'Year 2', semester: 'Semester 1', timeDisplay: '07:00 - 10:00' },
        '17:30 - 20:30': { subject: '32/34 MG', year: 'Year 2', semester: 'Semester 1', timeDisplay: '17:30 - 20:30' },
    },
    'Tuesday': {},
    'Wednesday': {
        '10:30 - 13:30': { subject: '33/29 FA', year: 'Year 1', semester: 'Semester 1', timeDisplay: '10:30 - 13:30' },
    },
    'Thursday': {
        '14:00 - 17:00': { subject: '32/98 law', year: 'Year 2', semester: 'Semester 1', timeDisplay: '14:00 - 17:00' },
    },
    'Friday': {
        '07:00 - 10:00': { subject: '31/35 MG', year: 'Year 3', semester: 'Semester 1', timeDisplay: '07:00 - 10:00' },
        '17:30 - 20:30': { subject: '30/11 IT', year: 'Year 4', semester: 'Semester 2', timeDisplay: '17:30 - 20:30' },
    },
    'Saturday': {},
    'Sunday': {},
  };
  
  const instructorDetails = {
      instructorName: "Keo Linda",
      publicDate: "2025-06-22 13:11:46"
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500)); 
  return { scheduleData, instructorDetails };
};

/**
 * The main page component is now an async Server Component.
 */
export default async function InstructorSchedulePage() {
    // Data is fetched on the server before the page is sent to the client.
    const { scheduleData, instructorDetails } = await fetchScheduleData();

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