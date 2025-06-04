"use client";
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout'; 
import DashboardHeader from './components/DashboardHeader'; 
import StatCard from './components/StatCard';
import RoomAvailabilityChart from './components/RoomAvailabilityChart';
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

const DashboardPage = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('07:00 - 10:00');

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true); 
      try {
        const stats = await fetchDashboardData();
        setDashboardStats(stats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }s
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedTimeSlot || !dashboardStats) {
        if (dashboardStats && chartData) { 
             setLoading(false);
        }
        return;
    }

    const loadChart = async () => {
      setLoading(true); 
      try {
        const data = await fetchChartData(selectedTimeSlot);
        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        if (dashboardStats) { 
          setLoading(false);
        }
      }
    };
    
    loadChart();

  }, [selectedTimeSlot, dashboardStats]); 
  if (loading || !dashboardStats || !chartData) { 
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
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow">
          <RoomAvailabilityChart
            chartData={chartData} 
            selectedTimeSlot={selectedTimeSlot}
            setSelectedTimeSlot={setSelectedTimeSlot}
          />
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
