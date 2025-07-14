import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { scheduleService } from '@/services/schedule.service';
import { getAllRooms } from '@/services/room.service';
import AdminLayout from '@/components/AdminLayout';
import RoomScheduleClient from '../components/RoomScheduleClient';

// --- Server-side Data Fetching ---
async function getRoomScheduleData(roomId) {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Room Schedule Page: Not authenticated.");
        return { roomName: null, scheduleData: {}, error: 'Not authenticated' };
    }

    try {
        // Fetch all rooms and all schedules in parallel
        const [allRooms, allSchedules] = await Promise.all([
            getAllRooms(token),
            scheduleService.getAllSchedules(token)
        ]);

        // Find the specific room by its ID to get the name
        const room = allRooms.find(r => String(r.roomId) === String(roomId));
        if (!room) {
            return { roomName: null, scheduleData: {}, error: 'Room not found' };
        }
        const roomName = room.roomName;

        // Helper function to map semester to academic year
        const mapSemesterToYear = (semester) => {
            if (!semester || typeof semester !== 'string') return '';
            const semesterNumber = parseInt(semester.replace(/[^0-9]/g, ''), 10);
            if (isNaN(semesterNumber)) return '';
            return Math.ceil(semesterNumber / 2);
        };

        // Process schedules for the specific room
        const roomSchedules = {};
        allSchedules.forEach(schedule => {
            if (String(schedule.roomId) === String(roomId)) {
                const timeSlotKey = `${schedule.shift.startTime.slice(0, 5)} - ${schedule.shift.endTime.slice(0, 5)}`;
                if (schedule.dayDetails && Array.isArray(schedule.dayDetails)) {
                    schedule.dayDetails.forEach(dayDetail => {
                        const dayName = dayDetail.dayOfWeek.charAt(0).toUpperCase() + dayDetail.dayOfWeek.slice(1).toLowerCase();
                        if (!roomSchedules[dayName]) {
                            roomSchedules[dayName] = {};
                        }
                        const academicYear = mapSemesterToYear(schedule.semester);
                        roomSchedules[dayName][timeSlotKey] = {
                            subject: schedule.className,
                            year: `Year ${academicYear}`,
                            semester: schedule.semester,
                            timeDisplay: timeSlotKey,
                            // Pass along scheduleId for swap/move operations
                            scheduleId: schedule.scheduleId, 
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
                    {/* Header */}
                    <div className="h-12 bg-gray-200 dark:bg-gray-700/60 border-r border-b border-gray-300 dark:border-gray-600"></div>
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700/50 border-r border-b border-gray-300 dark:border-gray-600"></div>
                    ))}
                    {/* Body */}
                    {[...Array(4)].map((_, rowIndex) => (
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
        { label: roomName } // Use the fetched room name
    ];

    return (
        <AdminLayout activeItem="schedule" breadcrumbs={breadcrumbs}>
            <Suspense fallback={<SchedulePageSkeleton />}>
                <RoomScheduleClient
                    initialScheduleData={scheduleData}
                    roomId={roomId}
                    roomName={roomName} // Pass roomName to the client
                />
            </Suspense>
        </AdminLayout>
    );
}