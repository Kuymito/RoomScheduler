import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notificationService } from '@/services/notification.service';
import AdminLayoutClient from './AdminLayoutClient'; // We will create this component next

// A simple loading component to show while server-side data is fetching.
const FullScreenLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-[#E2E1EF] dark:bg-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
    </div>
);

/**
 * This is an async Server Component. It runs on the server to fetch
 * the initial data before the page is sent to the browser.
 */
async function NotificationData({ children, activeItem, pageTitle }) {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    let initialNotifications = [];

    if (token) {
        try {
            // This API call runs on the server.
            initialNotifications = await notificationService.getNotifications(token);
        } catch (error) {
            console.error("🔴 FAILED TO FETCH ADMINLAYOUT NOTIFICATIONS ON SERVER:", error.message);
        }
    } else {
        console.error("No auth token in session, cannot fetch initial admin notifications.");
    }
    
    // After fetching, render the Client Component and pass the data as a prop.
    return (
        <AdminLayoutClient 
            activeItem={activeItem} 
            pageTitle={pageTitle} 
            initialNotifications={initialNotifications}
        >
            {children}
        </AdminLayoutClient>
    );
}

/**
 * This is the main layout export. It wraps the data-fetching component
 * in a Suspense boundary to handle loading states gracefully.
 */
export default function AdminLayout({ children, activeItem, pageTitle }) {
    return (
        <Suspense fallback={<FullScreenLoader />}>
            <NotificationData activeItem={activeItem} pageTitle={pageTitle}>
                {children}
            </NotificationData>
        </Suspense>
    );
}