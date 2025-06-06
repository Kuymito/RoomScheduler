"use client";

import { useEffect, useState } from 'react';
import InstructorDashboardLayout from '@/components/InstructorDashboardLayout';
import InstructorDashboardHeader from './components/InstructorDashboardHeader';
import ScheduleTable from './components/ScheduleTable';
import ClassCard from './components/ClassCard';

const fetchDashboardData = async () => {
  return new Promise(resolve => setTimeout(() => resolve({
    classAssign: 65,
    ClassToday: 15,
    onlineClass: 28,
    currentDate: '19 May 2025',
    academicYear: '2025 - 2026',
  }), 500));
};

const fetchScheduleTableData = async () => {
  return new Promise(resolve => setTimeout(() => resolve([
    { id: 1, classNum: '34/27', major: 'IT', date: 'Monday', session: 'In Class', shift: '07:00 - 10:00', room: 'TA' },
    { id: 2, classNum: '32/12', major: 'IT', date: 'Monday', session: 'In Class', shift: '05:30 - 08:30', room: '2B' },
    { id: 3, classNum: '31/21', major: 'MG', date: 'Wednesday', session: 'In Class', shift: '10:30 - 01:30', room: '6A' },
    { id: 4, classNum: '32/15', major: 'IT', date: 'Thursday', session: 'Online', shift: '02:00 - 05:00', room: 'Unavailable' },
    { id: 5, classNum: '32/49', major: 'IT', date: 'Friday', session: 'Online', shift: '07:00 - 10:00', room: 'Unavailable' },
    { id: 6, classNum: '31/17', major: 'BIT', date: 'Saturday', session: 'Online', shift: '05:30 - 08:30', room: 'Unavailable' },
  ]), 100));
};


const InstructorDashboardViewContent = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [stats, scheduleData] = await Promise.all([
          fetchDashboardData(),
          fetchScheduleTableData()
        ]);
        setDashboardStats(stats);
        setScheduleItems(scheduleData); 
      } catch (error) {
        console.error("Failed to fetch initial dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark:text-gray-200">
        <svg className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-3 text-gray-700 dark:text-gray-300">Loading dashboard...</span>
      </div>
    );
  }

  if (!dashboardStats) {
    return <div className="text-center text-red-500">Failed to load dashboard data. Please try again later.</div>;
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
      </div>

      <div className="mt-6">
        <ScheduleTable scheduleItems={scheduleItems} />
      </div>
    </>
  );
}

export default function InstructorDashboardPage() {
    return (
        <InstructorDashboardLayout activeItem="dashboard" pageTitle="Dashboard">
            <InstructorDashboardViewContent/>
        </InstructorDashboardLayout>
    );
}