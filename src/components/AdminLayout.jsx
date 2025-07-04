import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notificationService } from '@/services/notification.service';
import AdminLayoutClient from './AdminLayoutClient'; // Make sure this path is correct

// A simple loading component to show while data is fetching on the server.
const FullScreenLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-[#E2E1EF] dark:bg-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
    </div>
);

/**
 * This is an async Server Component. It fetches the initial data on the server
 * before the page is sent to the browser.
 */
async function NotificationData({ children, activeItem, pageTitle }) {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;
    let initialNotifications = [];

    if (token) {
        try {
            initialNotifications = await notificationService.getNotifications(token);
        } catch (error) {
            console.error("🔴 FAILED TO FETCH ADMINLAYOUT NOTIFICATIONS ON SERVER:", error.message);
        }
    } else {
        console.error("No auth token in session for AdminLayout.");
    }

    // Render the Client Component, passing the fetched data as a prop.
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
 * This is the main layout component you will use in your pages.
 * It's a Server Component that wraps the data-fetching logic in a Suspense boundary.
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