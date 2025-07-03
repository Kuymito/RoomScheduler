"use client";

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const defaultChartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const defaultChartValues = [0, 0, 0, 0, 0, 0, 0]; 

export default function RoomAvailabilityChart({ chartData, selectedTimeSlot, setSelectedTimeSlot }) {
  const timeSlots = ['07:00:00 - 10:00:00', '10:30:00 - 13:30:00', '14:00:00 - 17:00:00', '17:30:00 - 20:30:00'];
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currentLabels = chartData?.labels || defaultChartLabels;
  const currentDataValues = chartData?.data || defaultChartValues;

  const data = {
    labels: currentLabels,
    datasets: [
      {
        label: 'Available Rooms', // [LOGIC CHANGE] Updated label to match new data
        data: currentDataValues,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',  // Changed to green for "Available"
        borderColor: 'rgba(22, 163, 74, 1)',
        borderWidth: 1,
        borderRadius: 5,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDarkMode ? '#f3f4f6' : '#1f2937',
        bodyColor: isDarkMode ? '#d1d5db' : '#374151',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 60,
        grid: {
          drawBorder: false,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          stepSize: 10,
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280' }
      },
    },
  };

  useEffect(() => {
    const darkModeMatcher = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMatcher.matches);
    const handleChange = (e) => setIsDarkMode(e.matches);
    darkModeMatcher.addEventListener('change', handleChange);
    return () => darkModeMatcher.removeEventListener('change', handleChange);
  }, []);

  return (
    <div> 
      <div className="flex justify-between pb-10 items-center"> 
        <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Room Availability</h3>
        <select
          value={selectedTimeSlot}
          onChange={(e) => setSelectedTimeSlot(e.target.value)}
          className="p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {timeSlots.map(slot => (
            <option key={slot} value={slot}>{slot.replace(/:\d{2} - /, ' - ').replace(/:\d{2}$/, '')}</option>
          ))}
        </select>
      </div>
      
      <div className="h-96">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}