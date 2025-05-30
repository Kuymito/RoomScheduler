// AdminLayout.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar'; // Standardized path
import Topbar from '@/components/Topbar';   // Standardized path
import Footer from '@/components/Footer';     // Standardized path
import AdminPopup from '@/app/admin/profile/components/AdminPopup'; // Kept specific path from HEAD, adjust if more general
import LogoutAlert from '@/components/LogoutAlert'; // Standardized path
import NotificationPopup from '../app/admin/notification/AdminNotificationPopup'; // From HEAD
// You'll also need NotificationItem.js for NotificationPopup to work (Comment from HEAD)
import ThemeProvider from '@/components/ThemeProvider'; // From 39f846b - Ensure this path is correct

export default function AdminLayout({ children, pageTitle, activeItem }) { // Added activeItem from 39f846b
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => { // From 39f846b (localStorage logic)
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebarCollapsed') === 'true';
        }
        return false; // Default
    });
    
    // Admin/User Popup State
    const [showAdminPopup, setShowAdminPopup] = useState(false); // Common, defined once
    const adminPopupRef = useRef(null); // From HEAD
    const userIconRef = useRef(null);   // From HEAD

    // Notification Popup State (From HEAD)
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notificationPopupRef = useRef(null);
    const notificationIconRef = useRef(null);

    // Logout Alert State
    const [showLogoutAlert, setShowLogoutAlert] = useState(false); // Common, defined once

    // Effect to save collapse state to localStorage (From 39f846b)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        }
    }, [isSidebarCollapsed]);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    const handleUserIconClick = (event) => {
        event.stopPropagation();
        setShowAdminPopup(prev => !prev);
        if (showNotificationPopup) setShowNotificationPopup(false); // Close other popup (from HEAD)
    };

    const handleLogoutClick = () => {
        setShowAdminPopup(false);
        setShowLogoutAlert(true);
    };
    const handleCloseLogoutAlert = () => setShowLogoutAlert(false);
    const handleConfirmLogout = () => {
        alert('Logged out'); // Placeholder
        setShowLogoutAlert(false);
        // Add actual logout logic
    };

    // --- Notification Handlers (From HEAD) ---
    const handleToggleNotificationPopup = (event) => {
        event.stopPropagation();
        setShowNotificationPopup(prev => !prev);
        if (showAdminPopup) setShowAdminPopup(false); // Close other popup
    };

    const mockAPICall = async (action, data) => { // From HEAD
        console.log(`MOCK API CALL: ${action}`, data || '');
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true, message: `${action} successful.` };
    };

    const handleMarkAllRead = async () => { // From HEAD
        try {
            await mockAPICall("Mark all notifications as read");
            setNotifications(prevNotifications =>
                prevNotifications.map(n => ({ ...n, isUnread: false }))
            );
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleApproveNotification = async (notificationId) => { // From HEAD
        try {
            await mockAPICall("Approve notification", { notificationId });
            setNotifications(prevNotifications =>
                prevNotifications.map(n =>
                    n.id === notificationId
                        ? { ...n, message: `Request ID ${notificationId} has been APPROVED.`, type: 'info', isUnread: false }
                        : n
                )
            );
        } catch (error) {
            console.error(`Failed to approve ${notificationId}:`, error);
        }
    };

    const handleDenyNotification = async (notificationId) => { // From HEAD
        try {
            await mockAPICall("Deny notification", { notificationId });
            setNotifications(prevNotifications =>
                prevNotifications.map(n =>
                    n.id === notificationId
                        ? { ...n, message: `Request ID ${notificationId} has been DENIED.`, type: 'info', isUnread: false }
                        : n
                )
            );
        } catch (error) {
            console.error(`Failed to deny ${notificationId}:`, error);
        }
    };

    // --- Effects ---
    // Fetch/mock initial notifications (From HEAD)
    useEffect(() => {
        const mockNotificationsData = [
            { id: 1, avatarUrl: 'https://randomuser.me/api/portraits/women/60.jpg', message: 'Dr. Linda Keo is requesting room A1 at 7:00 - 10:00am for class 31/31 IT-morning', timestamp: '10m', isUnread: true, type: 'roomRequest', details: { requestorName: 'Dr. Linda Keo' } },
            { id: 2, avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg', message: 'You have Approved Mr. Chan Keo request for a room change. The update has been successfully recorded.', timestamp: '1h', isUnread: false, type: 'info', details: { requestorName: 'Mr. Chan Keo' } },
            { id: 3, avatarUrl: 'https://randomuser.me/api/portraits/women/33.jpg', message: 'You have Denied Mr. Tomoko Inoue request for a room change.', timestamp: '2h', isUnread: false, type: 'info', details: { requestorName: 'Mr. Tomoko Inoue' } },
            { id: 4, avatarUrl: 'https://randomuser.me/api/portraits/men/78.jpg', message: 'Mr. Eric Sok submitted a new maintenance request for Projector in B2.', timestamp: '5h', isUnread: true, type: 'maintenanceRequest', details: { requestorName: 'Mr. Eric Sok' } },
        ];
        setNotifications(mockNotificationsData);
    }, []);

    // Handle clicks outside popups (From HEAD, ensures both popups are handled)
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Admin Popup
            if (showAdminPopup &&
                adminPopupRef.current && !adminPopupRef.current.contains(event.target) &&
                userIconRef.current && !userIconRef.current.contains(event.target)) {
                setShowAdminPopup(false);
            }
            // Notification Popup
            if (showNotificationPopup &&
                notificationPopupRef.current && !notificationPopupRef.current.contains(event.target) &&
                notificationIconRef.current && !notificationIconRef.current.contains(event.target)) {
                setShowNotificationPopup(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showAdminPopup, showNotificationPopup]);

    const hasUnreadNotifications = notifications.some(n => n.isUnread); // From HEAD

    // Placeholder for onNavItemClick if it's used by Sidebar from 39f846b version
    const handleNavItemClick = (item) => {
        console.log("Navigating to:", item);
        // Implement actual navigation logic here, e.g., router.push or setting activeItem
    };

    return (
        <ThemeProvider> {/* Assuming ThemeProvider wraps the layout, from 39f846b */}
            <> {/* Using React Fragment from 39f846b */}
                <div className="flex w-full min-h-screen bg-[#E2E1EF] dark:bg-gray-800"> {/* dark:bg-gray-800 from 39f846b */}
                    <Sidebar
                        isCollapsed={isSidebarCollapsed}
                        activeItem={activeItem} // From 39f846b
                        onNavItemClick={handleNavItemClick} // From 39f846b (ensure handleNavItemClick is implemented or passed)
                    />
                    <div className={`main-content flex-grow flex flex-col transition-all duration-300 ease-in-out`}>
                        <Topbar
                            onToggleSidebar={toggleSidebar}
                            isSidebarCollapsed={isSidebarCollapsed}
                            onUserIconClick={handleUserIconClick}
                            pageSubtitle={pageTitle} // pageTitle was in both, used here
                            userIconRef={userIconRef} // From HEAD
                            // Notification props for Topbar (From HEAD)
                            onNotificationIconClick={handleToggleNotificationPopup}
                            notificationIconRef={notificationIconRef}
                            hasUnreadNotifications={hasUnreadNotifications}
                        />
                        {/* Using p-3 sm:p-6 m-3 sm:m-6 from HEAD as it's more specific, with dark mode from 39f846b */}
                        <main className="content-area flex-grow p-3 sm:p-6 m-3 sm:m-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                            {children}
                        </main>
                        <Footer />
                    </div>

                    {/* Popups */}
                    {/* Admin/User Popup (structure from HEAD with ref) */}
                    <div ref={adminPopupRef}>
                        <AdminPopup 
                            show={showAdminPopup} 
                            onLogoutClick={handleLogoutClick} 
                        />
                    </div>

                    {/* Notification Popup (From HEAD) */}
                    <div ref={notificationPopupRef}>
                        <NotificationPopup
                            show={showNotificationPopup}
                            notifications={notifications}
                            onMarkAllRead={handleMarkAllRead}
                            onApprove={handleApproveNotification}
                            onDeny={handleDenyNotification}
                            anchorRef={notificationIconRef} 
                        />
                    </div>
                    
                    <LogoutAlert 
                        show={showLogoutAlert} 
                        onClose={handleCloseLogoutAlert} 
                        onConfirmLogout={handleConfirmLogout} 
                    />
                </div>
            </>
        </ThemeProvider>
    );
}