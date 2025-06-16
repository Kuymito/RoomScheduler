'use client';

import InstructorDashboardHeader from './InstructorDashboardHeader';
import ScheduleTable from './ScheduleTable';
import ClassCard from './ClassCard';

/**
 * This is the Client Component for the Instructor Dashboard page.
 * It receives its data via props and is only responsible for rendering the UI.
 * It contains no data-fetching logic or useEffect hooks.
 */
export default function InstructorDashboardClientView({ dashboardStats, scheduleItems }) {
  if (!dashboardStats) {
    return <div className="text-center text-red-500 p-8">Failed to load dashboard data. Please try again later.</div>;
  }

  const { classAssign, ClassToday, onlineClass, currentDate, academicYear } = dashboardStats;

  return (
    <>
      <InstructorDashboardHeader
        title="Welcome to Schedule Management"
        description="Easily plan, track, and manage your school schedule all in one place. From classes to exams, stay organized and never miss a deadline again."
        currentDate={currentDate}
        academicYear={academicYear}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <ClassCard title="Class Assign" value={classAssign} />
        <ClassCard title="Class Today" value={ClassToday} />
        <ClassCard title="Online Class" value={onlineClass} />
        {/* The 4th card remains empty as in the original design */}
         <div /> 
      </div>

      <div className="mt-6">
        <ScheduleTable scheduleItems={scheduleItems} />
      </div>
    </>
  );
}
