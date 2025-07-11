// src/app/admin/dashboard/components/DashboardClientContent.jsx
"use client";

import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import StatCard from './StatCard';
import RoomAvailabilityWrapper from './RoomAvailabilityWrapper';

/**
 * Calculates the current academic year based on the current date.
 * Assumes academic year changes around September 1st.
 * @returns {string} The formatted academic year (e.g., "2024 - 2025").
 */
const getAcademicYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 for January, 8 for September

    // If current month is September (8) or later, the academic year starts in the current year.
    // Otherwise, it started in the previous year.
    const startYear = currentMonth >= 8 ? currentYear : currentYear - 1;
    const endYear = startYear + 1;

    return `${startYear} - ${endYear}`;
};

/**
 * Client Component that manages real-time date/academic year updates and
 * renders the interactive parts of the dashboard.
 *
 * @param {object} props - The props received from the Server Component.
 * @param {object} props.dashboardStats - Statistics like classAssign, expired, etc.
 * @param {object} props.initialChartData - Initial data for the chart.
 * @param {function} props.updateChartAction - Server Action to fetch updated chart data.
 */
export default function DashboardClientContent({ dashboardStats, initialChartData, updateChartAction }) {
  const { classAssign, expired, unassignedClass, onlineClass } = dashboardStats;

  // State for real-time current date
  const [currentDate, setCurrentDate] = useState('');
  // State for academic year
  const [academicYear, setAcademicYear] = useState('');

  useEffect(() => {
    // Function to update date and academic year
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
      setAcademicYear(getAcademicYear());
    };

    // Set initial date and academic year immediately
    updateDateTime();

    // Update date every second for real-time effect
    const dateInterval = setInterval(updateDateTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(dateInterval);
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <>
      {/* DashboardHeader uses the client-side managed current date and academic year */}
      <DashboardHeader
        title="Welcome to Schedule Management"
        description="Easily plan, track, and manage your school schedule all in one place."
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
        <RoomAvailabilityWrapper
          initialChartData={initialChartData}
          updateChartAction={updateChartAction}
        />
      </div>
    </>
  );
}


