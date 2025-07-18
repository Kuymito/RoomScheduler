// src/app/admin/schedule/page.jsx

import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ScheduleClientView from './components/ScheduleClientView';
import ClassListSkeleton from './components/ClassListSkeleton';
import ScheduleGridSkeleton from './components/ScheduleGridSkeleton';
import { classService } from '@/services/class.service';
import { getAllRooms } from '@/services/room.service';
import { scheduleService } from '@/services/schedule.service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// This function will now fetch the raw initial data.
const fetchSchedulePageData = async () => {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Schedule Page: Not authenticated.");
        return { initialClasses: [], initialRooms: [], initialSchedules: [] };
    }

    try {
        const [classes, rooms, schedules] = await Promise.all([
            classService.getAllClasses(token),
            getAllRooms(token),
            scheduleService.getAllSchedules(token)
        ]);
        
        return {
            initialClasses: classes || [],
            initialRooms: rooms || [],
            initialSchedules: schedules || [],
        };

    } catch (error) {
        console.error("Failed to fetch schedule page data:", error);
        return { initialClasses: [], initialRooms: [], initialSchedules: [] };
    }
};


export default async function AdminSchedulePage() {
    const { initialClasses, initialRooms, initialSchedules } = await fetchSchedulePageData();

    return (
        <AdminLayout activeItem="schedule" pageTitle="Schedule">
            <Suspense fallback={
                <div className='p-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]'>
                    <ClassListSkeleton />
                    <ScheduleGridSkeleton />
                </div>
            }>
                <ScheduleClientView
                    initialClasses={initialClasses}
                    initialRooms={initialRooms}
                    initialSchedules={initialSchedules}
                />
            </Suspense>
        </AdminLayout>
    );
}