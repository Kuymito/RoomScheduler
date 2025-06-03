
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
    currentDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    academicYear: '2025 - 2028',
  }), 500));
};

const fetchChartData = async (timeSlot) => {
  console.log(`Fetching chart data for: ${timeSlot}`);
  return new Promise(resolve => setTimeout(() => resolve({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [23, 60, 32, 55, 13, 45, 48],
  }), 500));
};

const fetchActivityData = async () => {
  return new Promise(resolve => setTimeout(() => resolve([
    { id: 1, type: 'Create new class', time: '1 hour ago', icon: '' },
    { id: 2, type: 'Create new class', time: '2 hours ago', icon: '' },
    { id: 3, type: 'Add class to room', time: '10 hours ago', icon: '' },
    { id: 4, type: 'Add class to room', time: '11 hours ago', icon: '' },
    { id: 5, type: 'Add class to room', time: '12 hours ago', icon: '' },
  ]), 500));
};


export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('07:00 - 10:00');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const stats = await fetchDashboardData();
        const activities = await fetchActivityData();
        setDashboardStats(stats);
        setActivityData(activities);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadChartData = async () => {
      if (!selectedTimeSlot) return;
      try {
        const data = await fetchChartData(selectedTimeSlot);
        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      }
    };
    loadChartData();
  }, [selectedTimeSlot]);

  // ==>> loading page
  if (loading || !dashboardStats) {
    return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  }

  const { classAssign, expired, unassignedClass, onlineClass, currentDate, academicYear } = dashboardStats;

// ===>> Return here
  return (
    <DashboardLayout>
    <div>
      <DashboardHeader
        title="Welcome to Schedule Management"
        description="Easily plan, track, and manage your school schedule all in one place. 
                    From classes to exams, stay organized and never miss a deadline again."
        currentDate={currentDate}
        academicYear={academicYear}
      />

      <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <StatCard  title="Class Assign" value={classAssign} />
        <StatCard title="Expired" value={expired} />
        <StatCard title="Unassigned Class" value={unassignedClass} />
        <StatCard title="Online Class" value={onlineClass} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 ">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
          <RoomAvailabilityChart
            chartData={chartData}
            selectedTimeSlot={selectedTimeSlot}
            setSelectedTimeSlot={setSelectedTimeSlot}
          />
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}

