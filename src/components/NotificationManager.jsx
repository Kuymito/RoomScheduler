'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AdminPopup from 'src/app/admin/profile/components/AdminPopup';
import LogoutAlert from '@/components/LogoutAlert';
import Footer from '@/components/Footer';
import NotificationPopup from '@/app/admin/notification/AdminNotificationPopup';
import { moul } from './fonts';
import { notificationService } from '@/services/notification.service';

/**
 * Transforms a raw notification from the backend into the format
 * expected by the NotificationItem component.
 * @param {object} notification - The raw notification data from the API.
 * @returns {object} The transformed notification object for the UI.
 */
const transformNotification = (notification) => {
    // --- THIS IS THE FIX ---
    // Pass the status directly from the backend data to the UI component.
    const status = notification.status; // e.g., "PENDING", "APPROVED", "DENIED"

    let type = 'info'; // Default type
    if (status === 'PENDING') {
        type = 'roomRequest'; // This type shows the action buttons.
    } else if (status === 'APPROVED') {
        type = 'info_approved';
    } else if (status === 'DENIED') {
        type = 'info_denied';
    }

    return {
        id: notification.notificationId,
        changeRequestId: notification.changeRequestId,
        message: notification.message,
        timestamp: new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUnread: !notification.read,
        type: type,
        status: status, // Include the status field
        avatarUrl: null,
        details: { requestorName: notification.message.match(/from (.*?) requires/)?.[1] || 'User' }
    };
};

const TOPBAR_HEIGHT = '90px';

export default function AdminLayoutClient({ children, activeItem, pageTitle, initialNotifications }) {
    const { data: session } = useSession();
    const token = session?.accessToken;

    const [notifications, setNotifications] = useState(() => initialNotifications.map(transformNotification));

    const [showAdminPopup, setShowAdminPopup] = useState(false);
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [navigatingTo, setNavigatingTo] = useState(null);
    const [isProfileNavigating, setIsProfileNavigating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebarCollapsed') === 'true';
        }
        return false;
    });

    const notificationPopupRef = useRef(null);
    const notificationIconRef = useRef(null);
    const adminPopupRef = useRef(null);
    const userIconRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const pollNotifications = async () => {
            if (!token) return;
            try {
                const backendNotifications = await notificationService.getNotifications(token);
                setNotifications(backendNotifications.map(transformNotification));
            } catch (error) {
                console.error("Failed to poll notifications:", error.message);
            }
        };

        const interval = setInterval(pollNotifications, 30000);
        return () => clearInterval(interval);
    }, [token]);

    const handleApproveNotification = async (notificationId) => {
        if (!token) return;
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification?.changeRequestId) return;

        try {
            await notificationService.approveChangeRequest(notification.changeRequestId, token);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error("Failed to approve request:", error.message);
        }
    };

    const handleDenyNotification = async (notificationId) => {
        if (!token) return;
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification?.changeRequestId) return;

        try {
            await notificationService.denyChangeRequest(notification.changeRequestId, token);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error("Failed to deny request:", error.message);
        }
    };

    const handleMarkSingleAsRead = async (notificationId) => {
        if (!token) return;
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification?.isUnread) return;

        try {
            await notificationService.markNotificationAsRead(notificationId, token);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isUnread: false } : n));
        } catch (error) {
            console.error("Failed to mark notification as read:", error.message);
        }
    };

    const handleMarkAllRead = async () => {
        if (!token) return;
        const unread = notifications.filter(n => n.isUnread);
        if (unread.length === 0) return;

        try {
            await Promise.all(unread.map(n => notificationService.markNotificationAsRead(n.id, token)));
            setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
        } catch (error) {
            console.error("Failed to mark all as read:", error.message);
        }
    };

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const handleUserIconClick = (event) => {
        event.stopPropagation();
        setShowNotificationPopup(false);
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

    const handleToggleNotificationPopup = (event) => {
        event.stopPropagation();
        setShowAdminPopup(false);
        setShowNotificationPopup(prev => !prev);
    };

    const hasUnreadNotifications = notifications.some(n => n.isUnread);

    const handleProfileNav = (path) => {
        if (isProfileNavigating || pathname === path) {
            setShowAdminPopup(false);
            return;
        }
        setIsProfileNavigating(true);
        router.push(path);
    };

    const handleNavItemClick = (item) => {
        if (pathname !== item.href) {
            setNavigatingTo(item.id);
            router.push(item.href);
        }
    };

    useEffect(() => {
        setNavigatingTo(null);
        setIsProfileNavigating(false);
    }, [pathname]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        }
    }, [isSidebarCollapsed]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAdminPopup && adminPopupRef.current && !adminPopupRef.current.contains(event.target) && userIconRef.current && !userIconRef.current.contains(event.target)) {
                setShowAdminPopup(false);
            }
            if (showNotificationPopup && notificationPopupRef.current && !notificationPopupRef.current.contains(event.target) && notificationIconRef.current && !notificationIconRef.current.contains(event.target)) {
                setShowNotificationPopup(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showAdminPopup, showNotificationPopup]);

    const sidebarWidth = isSidebarCollapsed ? '80px' : '265px';

    if (isLoading) {
        return (
            <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#E0E4F3] text-center p-6">
                 <img src="https://numregister.com/assets/img/logo/num.png" alt="University Logo" className="mx-auto mb-6 w-24 sm:w-28 md:w-32" />
                 <h1 className={`${moul.className} text-2xl sm:text-3xl font-bold mb-3 text-blue-800`}>សាកលវិទ្យាល័យជាតិគ្រប់គ្រង</h1>
                 <h2 className="text-xl sm:text-2xl font-medium mb-8 text-blue-700">National University of Management</h2>
                 <p className="text-lg sm:text-xl text-gray-700 font-semibold mb-4">Logging out, please wait...</p>
                 <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600" role="status"><span className="sr-only">Loading...</span></div>
            </div>
        );
    }
    
    return (
        <div className="flex w-full min-h-screen bg-[#E2E1EF] dark:bg-gray-800">
            <Sidebar isCollapsed={isSidebarCollapsed} activeItem={activeItem} onNavItemClick={handleNavItemClick} navigatingTo={navigatingTo} />
             <div className="flex flex-col flex-grow transition-all duration-300 ease-in-out" style={{ marginLeft: sidebarWidth, width: `calc(100% - ${sidebarWidth})`, height: '100vh', overflowY: 'auto' }}>
                 <div className="fixed top-0 bg-white dark:bg-gray-900 shadow-custom-medium p-5 flex justify-between items-center z-30 transition-all duration-300 ease-in-out" style={{ left: sidebarWidth, width: `calc(100% - ${sidebarWidth})`, height: TOPBAR_HEIGHT }}>
                     <Topbar onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} onUserIconClick={handleUserIconClick} pageSubtitle={pageTitle} userIconRef={userIconRef} onNotificationIconClick={handleToggleNotificationPopup} notificationIconRef={notificationIconRef} hasUnreadNotifications={hasUnreadNotifications} />
                 </div>
                 <div className="flex flex-col flex-grow" style={{ paddingTop: TOPBAR_HEIGHT }}>
                     <main className="content-area flex-grow p-3 m-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">{children}</main>
                     <Footer />
                 </div>
             </div>
             <div ref={adminPopupRef}>
                 <AdminPopup show={showAdminPopup} onLogoutClick={handleLogoutClick} isNavigating={isProfileNavigating} onNavigate={handleProfileNav} />
             </div>
             <div ref={notificationPopupRef}>
                 <NotificationPopup 
                    show={showNotificationPopup} 
                    notifications={notifications} 
                    onMarkAllRead={handleMarkAllRead} 
                    onApprove={handleApproveNotification} 
                    onDeny={handleDenyNotification} 
                    onMarkAsRead={handleMarkSingleAsRead} 
                    anchorRef={notificationIconRef} 
                />
             </div>
             <LogoutAlert show={showLogoutAlert} onClose={handleCloseLogoutAlert} onConfirmLogout={handleConfirmLogout} />
        </div>
    );
}