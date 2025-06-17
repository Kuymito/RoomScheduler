// src/components/DashboardLayout.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AdminPopup from 'src/app/admin/profile/components/AdminPopup';
import LogoutAlert from '@/components/LogoutAlert';
import Footer from '@/components/Footer';
import NotificationPopup from '@/app/admin/notification/AdminNotificationPopup';
import { usePathname, useRouter } from 'next/navigation';
import { Moul } from 'next/font/google';
import { signOut } from 'next-auth/react';

const moul = Moul({
    weight: '400',
    subsets: ['latin'],
});

export default function DashboardLayout({ children, activeItem, pageTitle }) {
    const [showAdminPopup, setShowAdminPopup] = useState(false);
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [notifications, setNotifications] = useState([]);
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

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        }
    }, [isSidebarCollapsed]);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const handleUserIconClick = (event) => {
        event.stopPropagation();
        if (showNotificationPopup) {
            setShowNotificationPopup(false);
        }
        setShowAdminPopup(prev => !prev);
    };
    const handleLogoutClick = () => { setShowAdminPopup(false); setShowLogoutAlert(true); };
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
    
    useEffect(() => {
        setNavigatingTo(null);
    }, [pathname]);

    const handleToggleNotificationPopup = (event) => {
        event.stopPropagation();
        if (showAdminPopup) {
            setShowAdminPopup(false);
        }
        setShowNotificationPopup(prev => !prev); 
    };
    
    const mockAPICall = async (action, data) => {
        console.log(`MOCK API CALL: ${action}`, data || '');
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true, message: `${action} successful.` };
    };

    const handleMarkSingleAsRead = (notificationId) => {
        setNotifications(prevNotifications =>
            prevNotifications.map(n =>
                n.id === notificationId ? { ...n, isUnread: false } : n
            )
        );
    };

    const handleMarkAllRead = async () => {
        try {
            await mockAPICall("Mark all notifications as read");
            setNotifications(prevNotifications =>
                prevNotifications.map(n => ({ ...n, isUnread: false }))
            );
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleApproveNotification = async (notificationId) => {
        try {
            await mockAPICall("Approve notification", { notificationId });
            setNotifications(prevNotifications =>
                prevNotifications.map(n => {
                    if (n.id === notificationId) {
                        const { requestorName, room, time } = n.details;
                        return {
                            ...n,
                            message: `You approved the request from ${requestorName} for Room ${room} at ${time}.`,
                            type: 'info_approved',
                            isUnread: false
                        };
                    }
                    return n;
                })
            );
        } catch (error) {
            console.error(`Failed to approve ${notificationId}:`, error);
        }
    };

    const handleDenyNotification = async (notificationId) => {
        try {
            await mockAPICall("Deny notification", { notificationId });
            setNotifications(prevNotifications =>
                prevNotifications.map(n => {
                     if (n.id === notificationId) {
                        const { requestorName, room, time } = n.details;
                        return {
                            ...n,
                            message: `You denied the request from ${requestorName} for Room ${room} at ${time}.`,
                            type: 'info_denied',
                            isUnread: false
                        };
                    }
                    return n;
                })
            );
        } catch (error) {
            console.error(`Failed to deny ${notificationId}:`, error);
        }
    };

    const hasUnreadNotifications = notifications.some(n => n.isUnread);

    const handleProfileNav = (path) => {
        if (isProfileNavigating) {
            return;
        }
        if (pathname === path) {
            setShowAdminPopup(false);
            return;
        }
        setIsProfileNavigating(true);
        router.push(path);
    };
    
    const sidebarWidth = isSidebarCollapsed ? '80px' : '265px';
    const TOPBAR_HEIGHT = '90px'; 

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAdminPopup && 
                adminPopupRef.current && !adminPopupRef.current.contains(event.target) &&
                userIconRef.current && !userIconRef.current.contains(event.target)) {
                setShowAdminPopup(false);
            }
            if (showNotificationPopup &&
                notificationPopupRef.current && !notificationPopupRef.current.contains(event.target) &&
                notificationIconRef.current && !notificationIconRef.current.contains(event.target)) {
                setShowNotificationPopup(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showAdminPopup, showNotificationPopup]);

    useEffect(() => {
        const mockNotificationsData = [
            { id: 1, avatarUrl: 'https://randomuser.me/api/portraits/women/60.jpg', message: 'Dr. Linda Keo is requesting room A1 at 7:00 - 10:00am for class 31/31 IT-morning', timestamp: '10m', isUnread: true, type: 'roomRequest', details: { requestorName: 'Dr. Linda Keo', room: 'A1', time: '7:00 - 10:00am', class: '31/31 IT-morning' } },
            { id: 2, avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg', message: 'You have Approved Mr. Chan Keo request for a room change. The update has been successfully recorded.', timestamp: '1h', isUnread: false, type: 'info', details: { requestorName: 'Mr. Chan Keo' } },
            { id: 3, avatarUrl: 'https://randomuser.me/api/portraits/women/33.jpg', message: 'You have Denied Mr. Tomoko Inoue request for a room change.', timestamp: '2h', isUnread: false, type: 'info', details: { requestorName: 'Mr. Tomoko Inoue' } },
            { id: 4, avatarUrl: 'https://randomuser.me/api/portraits/men/78.jpg', message: 'Mr. Eric Sok submitted a new maintenance request for Projector in B2.', timestamp: '5h', isUnread: true, type: 'maintenanceRequest', details: { requestorName: 'Mr. Eric Sok' } },
        ];
        setNotifications(mockNotificationsData);
    }, []);

    useEffect(() => {
        if (isProfileNavigating) {
            setIsProfileNavigating(false);
        }
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
            <Sidebar
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
                    <Topbar
                        onToggleSidebar={toggleSidebar}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onUserIconClick={handleUserIconClick}
                        pageSubtitle={pageTitle}
                        userIconRef={userIconRef}
                        onNotificationIconClick={handleToggleNotificationPopup}
                        notificationIconRef={notificationIconRef}
                        hasUnreadNotifications={hasUnreadNotifications}
                    />
                </div>
                <div className="flex flex-col flex-grow" style={{ paddingTop: TOPBAR_HEIGHT }}>
                    <main className="content-area flex-grow m-6">
                        {children}
                    </main>
                    <Footer />
                </div>
            </div>
            <div ref={adminPopupRef}>
                <AdminPopup 
                    show={showAdminPopup} 
                    onLogoutClick={handleLogoutClick}
                    isNavigating={isProfileNavigating}
                    onNavigate={handleProfileNav}
                />
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