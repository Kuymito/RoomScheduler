import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { scheduleService } from '@/services/schedule.service';
import { getAllRooms } from '@/services/room.service';
import { getAllShifts } from '@/services/shift.service'; // Import shift service
import AdminLayout from '@/components/AdminLayout';
import RoomScheduleClient from '../components/RoomScheduleClient';
import React from 'react';

/**
 * Helper function to calculate the academic year from the generation number.
 * @param {string | number} generation - The generation number of the class.
 * @returns {number | null} The calculated academic year, or null if invalid.
 */
const mapGenerationToYear = (generation) => {
    if (!generation) return null;
    const genNumber = parseInt(generation, 10);
    if (isNaN(genNumber)) return null;

    // Define the base generation and year for calculation.
    const BASE_GENERATION = 34; // This is the generation for the first year students in BASE_YEAR.
    const BASE_YEAR = 2025; 

    const currentYear = new Date().getFullYear();
    
    // Calculate what generation is currently in their first year.
    const currentFirstYearGeneration = BASE_GENERATION + (currentYear - BASE_YEAR);

    // Calculate the academic year for the given generation.
    const academicYear = currentFirstYearGeneration - genNumber + 1;
    
    return academicYear > 0 ? academicYear : null;
};

// --- Server-side Data Fetching ---
async function getRoomScheduleData(roomId) {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Room Schedule Page: Not authenticated.");
        return { roomName: null, scheduleData: {}, error: 'Not authenticated' };
    }

    try {
        const [allRooms, allSchedules] = await Promise.all([
            getAllRooms(token),
            scheduleService.getAllSchedules(token),
        ]);

        const room = allRooms.find(r => String(r.roomId) === String(roomId));
        if (!room) {
            return { roomName: null, scheduleData: {}, error: 'Room not found' };
        }
        const roomName = room.roomName;

        const roomSchedules = {};
        allSchedules.forEach(schedule => {
            if (String(schedule.roomId) === String(roomId)) {
                
                const academicYear = mapGenerationToYear(schedule.year);

                const classInfo = {
                    subject: schedule.className,
                    year: academicYear ? `Year ${academicYear}` : 'Year N/A',
                    semester: schedule.semester,
                    scheduleId: schedule.scheduleId,
                };

                if (schedule.dayDetails && Array.isArray(schedule.dayDetails) && schedule.shift) {
                    schedule.dayDetails.forEach(dayDetail => {
                        const dayName = dayDetail.dayOfWeek.charAt(0).toUpperCase() + dayDetail.dayOfWeek.slice(1).toLowerCase();
                        if (!roomSchedules[dayName]) {
                            roomSchedules[dayName] = {};
                        }

                        // UPDATED: Simplified logic to handle all shifts, including weekend shifts, the same way.
                        // This correctly creates a single entry for the specific time slot (e.g., "07:30 - 17:00").
                        const timeSlotKey = `${schedule.shift.startTime.slice(0, 5)} - ${schedule.shift.endTime.slice(0, 5)}`;
                        roomSchedules[dayName][timeSlotKey] = {
                            ...classInfo,
                            timeDisplay: timeSlotKey,
                        };
                    });
                }
            }
        });

        return { roomName, scheduleData: roomSchedules, error: null };

    } catch (error) {
        console.error("Failed to fetch room schedule data:", error);
        return { roomName: null, scheduleData: {}, error: error.message };
    }
}

// --- Skeleton Component ---
const SchedulePageSkeleton = () => (
    <div className="p-4 sm:p-6 animate-pulse">
        <div className="mb-6">
            <div className="h-8 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-md mb-2"></div>
            <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="h-7 w-1/3 bg-gray-300 dark:bg-gray-600 rounded-md mb-4"></div>
            <div className="overflow-x-auto">
                <div className="grid grid-cols-[minmax(120px,1fr)_repeat(7,minmax(150px,1.5fr))] border-t border-l border-gray-300 dark:border-gray-600 min-w-[1024px]">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700/60 border-r border-b border-gray-300 dark:border-gray-600"></div>
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700/50 border-r border-b border-gray-300 dark:border-gray-600"></div>
                    ))}
                    {[...Array(5)].map((_, rowIndex) => ( // Updated to 5 rows to include weekend
                        <React.Fragment key={rowIndex}>
                            <div className="h-36 bg-gray-200 dark:bg-gray-700/50 border-r border-b border-gray-300 dark:border-gray-600"></div>
                            {[...Array(7)].map((_, colIndex) => (
                                <div key={colIndex} className="p-1.5 h-36 border-r border-b border-gray-300 dark:border-gray-600">
                                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    </div>
);


// --- Main Page Component (Server Component) ---
export default async function AdminScheduleRoomDetailPage({ params }) {
    const { roomId } = params;
    const { roomName, scheduleData, error } = await getRoomScheduleData(roomId);

    if (error === 'Room not found') {
        notFound();
    }

    if (error) {
        return (
            <AdminLayout activeItem="schedule" pageTitle="Error">
                <div className="p-6 text-red-500">
                    <p>Failed to load schedule data: {error}</p>
                </div>
            </AdminLayout>
        );
    }

    const breadcrumbs = [
        { label: "Schedule", href: "/admin/schedule" },
        { label: roomName }
    ];

    return (
        <AdminLayout activeItem="schedule" breadcrumbs={breadcrumbs}>
            <Suspense fallback={<SchedulePageSkeleton />}>
                <RoomScheduleClient
                    initialScheduleData={scheduleData}
                    roomId={roomId}
                    roomName={roomName}
                />
            </Suspense>
        </AdminLayout>
    );
}