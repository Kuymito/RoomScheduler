import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import RoomPageSkeleton from './components/RoomPageSkeleton';
import RoomClientView from './components/RoomClientView';

/**
 * Main page component for Admin Room Management. This is a Server Component.
 * Data fetching is now delegated entirely to the client component using SWR and Suspense.
 * This ensures the page shell loads instantly, and the Suspense fallback (skeleton)
 * is shown while the client fetches the data.
 */
export default async function AdminRoomPage() {
    return (
        <AdminLayout activeItem="room" pageTitle="Room">
            <Suspense fallback={<RoomPageSkeleton />}>
                <RoomClientView />
            </Suspense>
        </AdminLayout>
    );
}