import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import RoomPageSkeleton from './components/RoomPageSkeleton';
import RoomClientView from './components/RoomClientView';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAllRooms } from '@/services/room.service';


/**
 * An async Server Component to fetch the initial data for rooms.
 * This ensures the data is ready before the client component renders,
 * improving perceived performance.
 */
async function RoomData() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    let initialRooms = [];
    if (token) {
        try {
            initialRooms = await getAllRooms(token);
        } catch (error) {
            console.error("Failed to fetch rooms on the server:", error.message);
            // If fetch fails, pass an empty array. The client-side SWR will attempt to refetch.
        }
    } else {
        console.error("No access token found in session for admin room page.");
    }
    
    // Pass the server-fetched data as a prop to the client component.
    return <RoomClientView initialRooms={initialRooms} />;
}


/**
 * Main page component for Admin Room Management. This is a Server Component.
 * It uses Suspense to show a skeleton while the initial data is fetched on the server.
 */
export default async function AdminRoomPage() {
    return (
        <AdminLayout activeItem="room" pageTitle="Room">
            <Suspense fallback={<RoomPageSkeleton />}>
                <RoomData />
            </Suspense>
        </AdminLayout>
    );
}