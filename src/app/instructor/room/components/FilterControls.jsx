"use client";

import { weekdays, timeSlots } from "../lib/data";

export default function FilterControls({
  selectedDay,
  selectedTime,
  selectedBuilding,
  onDayChange,
  onTimeChange,
  onBuildingChange,
  buildings,
}) {
  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b dark:border-gray-600 pb-3 gap-4">
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden w-full sm:w-auto">
          {weekdays.map((day) => (
            <button
              key={day}
              onClick={() => onDayChange(day)}
              className={`px-3.5 py-1.5 text-sm font-medium transition-colors w-full ${
                selectedDay === day
                  ? "bg-sky-600 text-white shadow"
                  : "border-r dark:border-r-gray-500 last:border-r-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="time-select" className="text-sm font-medium dark:text-gray-300">
            Time:
          </label>
          <select
            id="time-select"
            value={selectedTime}
            onChange={onTimeChange}
            className="p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500 w-full"
          >
            {timeSlots.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={selectedBuilding}
          onChange={onBuildingChange}
          className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {Object.keys(buildings).map((building) => (
            <option key={building} value={building}>
              {building}
            </option>
          ))}
        </select>
        <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
      </div>
    </div>
  );
}