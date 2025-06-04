// dashboard/page.jsx
"use client";

import { useEffect, useState, useRef } from 'react'; // Import useRef
import DashboardLayout from '@/components/DashboardLayout';
import DashboardHeader from './components/DashboardHeader'; 
import StatCard from './components/StatCard';
import RoomAvailabilityChart from './components/RoomAvailabilityChart';

// --- Data Fetching Functions (Unchanged) ---
const fetchDashboardData = async () => {
  return new Promise(resolve => setTimeout(() => resolve({
    classAssign: 65,
    expired: 15,
    unassignedClass: 16,
    onlineClass: 28,
    currentDate: '19 May 2025', 
    academicYear: '2025 - 2026', 
  }), 500));
};

const fetchChartData = async (timeSlot) => {
  console.log(`Fetching chart data for: ${timeSlot}`);
  let dataPoints;
  switch (timeSlot) {
    case '07:00 - 10:00':
      dataPoints = [23, 60, 32, 55, 13, 45, 48]; 
      break;
    case '10:00 - 13:00':
      dataPoints = [45, 22, 50, 30, 65, 25, 40];
      break;
    case '13:00 - 16:00':
      dataPoints = [30, 55, 18, 48, 33, 60, 22];
      break;
    case '16:00 - 19:00':
      dataPoints = [15, 35, 40, 20, 50, 30, 55];
      break;
    default:
      dataPoints = [10, 20, 30, 40, 50, 60, 70];
  }
  return new Promise(resolve => setTimeout(() => resolve({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: dataPoints,
  }), 500));
};

// --- Main Page Component ---
const DashboardPage = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('07:00 - 10:00');

  // --- KEY CHANGE 1: Separate Loading States ---
  // `isPageLoading` for the initial, full-dashboard load.
  const [isPageLoading, setIsPageLoading] = useState(true); 
  // `isChartLoading` for when only the chart data is being refetched.
  const [isChartLoading, setIsChartLoading] = useState(false);

  // --- KEY CHANGE 2: Ref to skip initial effect run ---
  // This helps prevent the chart-specific useEffect from running on the first render.
  const isInitialMount = useRef(true);

  // --- Effect for Initial Page Load ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch initial stats and initial chart data at the same time
        const [stats, initialChartData] = await Promise.all([
          fetchDashboardData(),
          fetchChartData(selectedTimeSlot) 
        ]);
        setDashboardStats(stats);
        setChartData(initialChartData);
      } catch (error) {
        console.error("Failed to fetch initial dashboard data:", error);
      } finally {
        // Once all initial data is loaded, turn off the page loader.
        setIsPageLoading(false);
      }
    };
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs only once on component mount

  // --- Effect for Chart Updates on Filter Change ---
  useEffect(() => {
    // Prevent this from running on the initial render, as the first useEffect already loaded the chart.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const loadChart = async () => {
      setIsChartLoading(true); // Start the chart-specific loader
      try {
        const data = await fetchChartData(selectedTimeSlot);
        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setIsChartLoading(false); // Stop the chart-specific loader
      }
    };
    
    loadChart();
  }, [selectedTimeSlot]); // Only runs when the time slot changes

  // --- KEY CHANGE 3: Update the main loading condition ---
  // This now only shows the full-screen loader on the initial page load.
  if (isPageLoading) { 
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

  // Fallback in case stats didn't load, but page loading is finished
  if (!dashboardStats) {
      return <div>Error loading dashboard data. Please try again.</div>;
  }

  const { classAssign, expired, unassignedClass, onlineClass, currentDate, academicYear } = dashboardStats;

  return (
    <> 
      <DashboardHeader
        title="Welcome to Schedule Management"
        description="Easily plan, track, and manage your school schedule all in one place. From classes to exams, stay organized and never miss a deadline again."
        currentDate={currentDate}
        academicYear={academicYear}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <StatCard title="Class Assign" value={classAssign} />
        <StatCard title="Expired" value={expired} />
        <StatCard title="Unassigned Class" value={unassignedClass} />
        <StatCard title="Online Class" value={onlineClass} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        {/* --- KEY CHANGE 4: Chart container with its own loading state --- */}
        <div className="relative lg:col-span-1 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow">
          {isChartLoading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex justify-center items-center z-10 rounded-lg">
              <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          {/* Only render the chart if data is available */}
          {chartData && (
              <RoomAvailabilityChart
                chartData={chartData} 
                selectedTimeSlot={selectedTimeSlot}
                setSelectedTimeSlot={setSelectedTimeSlot}
              />
          )}
        </div>
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
    return (
        <DashboardLayout activeItem="dashboard" pageTitle="Dashboard">
            <DashboardPage/>
        </DashboardLayout>
    );
}