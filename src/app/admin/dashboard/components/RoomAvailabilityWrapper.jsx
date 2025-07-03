"use client";

import { useState, useTransition } from 'react';
import dynamic from 'next/dynamic';

// Lazy-load the chart component to reduce the initial JavaScript bundle size.
const RoomAvailabilityChart = dynamic(() => import('./RoomAvailabilityChart'), {
  loading: () => <div className="h-80 w-full rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />,
  ssr: false, // Chart libraries often need browser APIs, so disable SSR for it.
});

// This Client Component manages the interactive state of the chart.
export default function RoomAvailabilityWrapper({ initialChartData, updateChartAction }) {
  const [chartData, setChartData] = useState(initialChartData);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('07:00 - 10:00');
  
  // useTransition allows updating state without blocking the UI.
  const [isPending, startTransition] = useTransition();
  const isChartLoading = isPending;

  const handleTimeSlotChange = (newTimeSlot) => {
    setSelectedTimeSlot(newTimeSlot);
    // startTransition will call the server action to fetch new data.
    // The UI remains responsive while the data is being fetched.
    startTransition(async () => {
      const newChartData = await updateChartAction(newTimeSlot);
      setChartData(newChartData);
    });
  };

  return (
    <div className="relative lg:col-span-1 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow">
      {isChartLoading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex justify-center items-center z-10 rounded-lg">
          <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {/* The lazy-loaded chart component receives data and state handlers. */}
      <RoomAvailabilityChart
        chartData={chartData}
        selectedTimeSlot={selectedTimeSlot}
        setSelectedTimeSlot={handleTimeSlotChange} // Note: Prop name might need to match chart component
      />
    </div>
  );
}