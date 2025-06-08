"use client";

import { useEffect, useState } from 'react';
import InstructorDashboardLayout from '@/components/InstructorDashboardLayout';
import InstructorDashboardHeader from './components/InstructorDashboardHeader';
import ScheduleTable from './components/ScheduleTable';
import ClassCard from './components/ClassCard';

// --- MOCK API CALLS (No changes here) ---
const fetchDashboardData = async () => {
  return new Promise(resolve => setTimeout(() => resolve({
    classAssign: 65,
    ClassToday: 15,
    onlineClass: 28,
    currentDate: '19 May 2025',
    academicYear: '2025 - 2026',
  }), 1500)); // Increased delay to better see the skeleton
};

const fetchScheduleTableData = async () => {
  return new Promise(resolve => setTimeout(() => resolve([
    { id: 1, classNum: '34/27', major: 'IT', date: 'Monday', session: 'In Class', shift: '07:00 - 10:00', room: '1A' },
    { id: 2, classNum: '32/12', major: 'IT', date: 'Monday', session: 'In Class', shift: '05:30 - 08:30', room: '2B' },
    { id: 3, classNum: '31/21', major: 'MG', date: 'Wednesday', session: 'In Class', shift: '10:30 - 01:30', room: '6A' },
    { id: 4, classNum: '32/15', major: 'IT', date: 'Thursday', session: 'Online', shift: '02:00 - 05:00', room: 'Unavailable' },
    { id: 5, classNum: '32/49', major: 'IT', date: 'Friday', session: 'Online', shift: '07:00 - 10:00', room: 'Unavailable' },
    { id: 6, classNum: '31/17', major: 'BIT', date: 'Saturday', session: 'Online', shift: '05:30 - 08:30', room: 'Unavailable' },
  ]), 1500));
};

// ===================================================================
// --- NEW SKELETON COMPONENTS ---
// ===================================================================

const HeaderSkeleton = () => (
    <div className="animate-pulse flex justify-between items-start">
        <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-72 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-96 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-80"></div>
        </div>
        <div className="text-right">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-40"></div>
        </div>
    </div>
);

const CardSkeleton = () => (
    <div className="animate-pulse p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-24 mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
    </div>
);

const TableSkeleton = ({ rows = 6 }) => (
    <div className="animate-pulse mt-6 overflow-x-auto relative border border-gray-200 dark:border-gray-700 rounded-xl">
        <div className="w-full">
            {/* Table Header */}
            <div className="flex bg-gray-50 dark:bg-gray-700/50 p-4">
                <div className="w-1/6 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="w-1/6 h-4 bg-gray-300 dark:bg-gray-600 rounded-full ml-4"></div>
                <div className="w-1/6 h-4 bg-gray-300 dark:bg-gray-600 rounded-full ml-4"></div>
                <div className="w-1/6 h-4 bg-gray-300 dark:bg-gray-600 rounded-full ml-4"></div>
                <div className="w-1/6 h-4 bg-gray-300 dark:bg-gray-600 rounded-full ml-4"></div>
                <div className="w-1/6 h-4 bg-gray-300 dark:bg-gray-600 rounded-full ml-4"></div>
            </div>
            {/* Table Body */}
            <div className="p-4 space-y-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center">
                        <div className="w-1/6 h-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="w-1/6 h-4 bg-gray-200 dark:bg-gray-700 rounded-full ml-4"></div>
                        <div className="w-1/6 h-4 bg-gray-200 dark:bg-gray-700 rounded-full ml-4"></div>
                        <div className="w-1/6 h-4 bg-gray-200 dark:bg-gray-700 rounded-full ml-4"></div>
                        <div className="w-1/6 h-4 bg-gray-200 dark:bg-gray-700 rounded-full ml-4"></div>
                        <div className="w-1/6 h-4 bg-gray-200 dark:bg-gray-700 rounded-full ml-4"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// This component assembles all the skeleton parts into the page layout
const DashboardSkeleton = () => (
    <>
        <HeaderSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
        </div>
        <TableSkeleton />
    </>
);


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

  // --- UPDATED LOADING STATE ---
  if (loading) {
    return <DashboardSkeleton />;
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
        {/* We only have 3 stats, so the 4th card is empty, which is fine */}
         <div /> 
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