'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import InstructorSidebar from '@/components/InstructorSidebar';
import InstructorTopbar from '@/components/InstructorTopbar';
import InstructorPopup from 'src/app/instructor/profile/components/InstructorPopup';
import LogoutAlert from '@/components/LogoutAlert';
import Footer from '@/components/Footer';
import InstructorNotificationPopup from '@/app/instructor/notification/InstructorNotificationPopup';
import { signOut, useSession } from 'next-auth/react';
import { moul } from './fonts';
import { notificationService } from '@/services/notification.service';
import useSWR from 'swr';

const TOPBAR_HEIGHT = '90px';

// Helper function to format date strings into relative time
const formatDistanceToNow = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

// Fetcher function for SWR
const notificationsFetcher = (url, token) => notificationService.getNotifications(token);

export default function InstructorLayout({ children, activeItem, pageTitle }) {
    const { data: session } = useSession();
    const [showAdminPopup, setShowAdminPopup] = useState(false);
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    const [showInstructorNotificationPopup, setShowInstructorNotificationPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [navigatingTo, setNavigatingTo] = useState(null);
    const notificationPopupRef = useRef(null);
    const notificationIconRef = useRef(null);
    const adminPopupRef = useRef(null);
    const userIconRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();
    const [isProfileNavigating, setIsProfileNavigating] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebarCollapsed') === 'true';
        }
        return false;
    });

    const { data: rawNotifications, mutate: mutateNotifications } = useSWR(
        session?.accessToken ? ['/api/v1/notifications', session.accessToken] : null,
        notificationsFetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        }
    );
    
    // Map the raw API data to the format your component expects
    const instructorNotifications = rawNotifications?.map(n => ({
        id: n.notificationId,
        avatarUrl: '/images/kok.png', // Default avatar
        message: n.message,
        timestamp: formatDistanceToNow(n.createdAt),
        isUnread: !n.read,
        // Derive type from message content for different icons/styles
        type: n.message.includes('approved') ? 'request_approved' : n.message.includes('denied') ? 'request_denied' : 'info',
        details: { adminName: 'Admin' } // Placeholder details
    })) || [];


    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const handleUserIconClick = (event) => { 
        event.stopPropagation();
        if (showInstructorNotificationPopup) {
            setShowInstructorNotificationPopup(false);
        }
        setShowAdminPopup(prev => !prev); 
    };
    const handleLogoutClick = () => {
        setShowAdminPopup(false);
        setShowLogoutAlert(true);
    };
    const handleCloseLogoutAlert = () => setShowLogoutAlert(false);

    const handleConfirmLogout = () => { 
        setShowLogoutAlert(false);
        setIsLoading(true);
        signOut({ callbackUrl: '/api/auth/login' });
    };
    
    const handleNavItemClick = (item) => {
        if (pathname !== item.href) {
            setNavigatingTo(item.id);
            router.push(item.href);
        }
    };

    const handleToggleInstructorNotificationPopup = (event) => {
        event.stopPropagation();
        if (showAdminPopup) {
            setShowAdminPopup(false);
        }
        setShowInstructorNotificationPopup(prev => !prev);
    };
    
    const handleMarkInstructorNotificationAsRead = async (notificationId) => {
        try {
            // Optimistic UI update
            mutateNotifications(
                instructorNotifications.map(n => n.id === notificationId ? { ...n, isUnread: false } : n),
                false // Don't revalidate yet
            );
            await notificationService.markNotificationAsRead(notificationId, session.accessToken);
            mutateNotifications(); // Re-fetch from API to confirm
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            // Optionally revert optimistic update on error
            mutateNotifications();
        }
    };

    const handleMarkAllInstructorNotificationsAsRead = async () => {
        // Optimistic UI update
        mutateNotifications(
            instructorNotifications.map(n => ({ ...n, isUnread: false })),
            false
        );
        try {
            // In a real app, you might have a dedicated endpoint for this.
            // For now, we'll mark all visible notifications as read one by one.
            const unreadIds = instructorNotifications.filter(n => n.isUnread).map(n => n.id);
            await Promise.all(
                unreadIds.map(id => notificationService.markNotificationAsRead(id, session.accessToken))
            );
            mutateNotifications();
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
            mutateNotifications(); // Revert on error
        }
    };

    const hasUnreadInstructorNotifications = instructorNotifications.some(n => n.isUnread);

    const handleProfileNav = (path) => {
        if (isProfileNavigating) return;
        if (pathname === path) {
            setShowAdminPopup(false);
            return;
        }
        setIsProfileNavigating(true);
        router.push(path);
    };
    
    const sidebarWidth = isSidebarCollapsed ? '80px' : '265px';

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        }
    }, [isSidebarCollapsed]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAdminPopup && 
                adminPopupRef.current && !adminPopupRef.current.contains(event.target) &&
                userIconRef.current && !userIconRef.current.contains(event.target)) {
                setShowAdminPopup(false);
            }
            if (showInstructorNotificationPopup &&
                notificationPopupRef.current && !notificationPopupRef.current.contains(event.target) &&
                notificationIconRef.current && !notificationIconRef.current.contains(event.target)) {
                setShowInstructorNotificationPopup(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showAdminPopup, showInstructorNotificationPopup]);

    useEffect(() => {
        if (isProfileNavigating) {
            setIsProfileNavigating(false);
        }
        setNavigatingTo(null);
    }, [pathname]); 

    if (isLoading) {
        return (
            <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#E0E4F3] text-center p-6">
                <img 
                    src="https://numregister.com/assets/img/logo/num.png" 
                    alt="University Logo" 
                    className="mx-auto mb-6 w-24 sm:w-28 md:w-32" 
                />
                <h1 className={`${moul.className} text-2xl sm:text-3xl font-bold mb-3 text-blue-800`}>
                    សាកលវិទ្យាល័យជាតិគ្រប់គ្រង
                </h1>
                <h2 className="text-xl sm:text-2xl font-medium mb-8 text-blue-700">
                    National University of Management
                </h2>
                <p className="text-lg sm:text-xl text-gray-700 font-semibold mb-4">
                    Logging out, please wait...
                </p>
                <div 
                    className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"
                    role="status"
                >
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full min-h-screen bg-[#E2E1EF] dark:bg-gray-800">
            <InstructorSidebar
                isCollapsed={isSidebarCollapsed}
                activeItem={activeItem}
                onNavItemClick={handleNavItemClick}
                navigatingTo={navigatingTo}
            />

            <div
                className="flex flex-col flex-grow transition-all duration-300 ease-in-out"
                style={{
                    marginLeft: sidebarWidth, 
                    width: `calc(100% - ${sidebarWidth})`,
                    height: '100vh', 
                    overflowY: 'auto',
                }}
            >
                <div
                    className="fixed top-0 bg-white dark:bg-gray-900 shadow-custom-medium p-5 flex justify-between items-center z-30 transition-all duration-300 ease-in-out"
                    style={{
                        left: sidebarWidth,
                        width: `calc(100% - ${sidebarWidth})`,
                        height: TOPBAR_HEIGHT,
                    }}
                >
                    <InstructorTopbar
                        onToggleSidebar={toggleSidebar}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onUserIconClick={handleUserIconClick}
                        pageSubtitle={pageTitle}
                        userIconRef={userIconRef}
                        onNotificationIconClick={handleToggleInstructorNotificationPopup}
                        notificationIconRef={notificationIconRef}
                        hasUnreadNotifications={hasUnreadInstructorNotifications}
                    />
                </div>

                <div className="flex flex-col flex-grow" style={{ paddingTop: TOPBAR_HEIGHT }}>
                    <main className="content-area flex-grow p-3 m-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                        {children}
                    </main>
                    <Footer />
                </div>
            </div>

            <div ref={adminPopupRef}>
                <InstructorPopup 
                    show={showAdminPopup} 
                    onLogoutClick={handleLogoutClick} 
                    isNavigating={isProfileNavigating}
                    onNavigate={handleProfileNav}
                />
            </div>

            <div ref={notificationPopupRef}>
                <InstructorNotificationPopup
                    show={showInstructorNotificationPopup}
                    notifications={instructorNotifications}
                    onMarkAllRead={handleMarkAllInstructorNotificationsAsRead}
                    onMarkAsRead={handleMarkInstructorNotificationAsRead}
                    anchorRef={notificationIconRef} 
                />
            </div>
            
            <LogoutAlert 
                show={showLogoutAlert} 
                onClose={handleCloseLogoutAlert} 
                onConfirmLogout={handleConfirmLogout} 
            />
        </div>
    );
}