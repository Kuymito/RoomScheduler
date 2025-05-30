'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar'; // Assume Topbar.js exists
import Footer from './Footer'; // Assume Footer.js exists
import AdminPopup from '@/app/admin/profile/components/AdminPopup'; // Path from your code
import LogoutAlert from './LogoutAlert'; // Path from your code
import NotificationPopup from '../app/admin/notification/AdminNotificationPopup'; // Assuming this is created as discussed
// You'll also need NotificationItem.js for NotificationPopup to work


export default function AdminLayout({ children, pageTitle }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    // Admin/User Popup State
    const [showAdminPopup, setShowAdminPopup] = useState(false);
    const adminPopupRef = useRef(null);
    const userIconRef = useRef(null);

    // Notification Popup State
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notificationPopupRef = useRef(null); // Ref for the notification popup itself
    const notificationIconRef = useRef(null); // Ref for the bell icon in Topbar

    // Logout Alert State
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    const handleUserIconClick = (event) => {
        event.stopPropagation();
        setShowAdminPopup(prev => !prev);
        if (showNotificationPopup) setShowNotificationPopup(false); // Close other popup
    };

    const handleLogoutClick = () => {
        setShowAdminPopup(false);
        setShowLogoutAlert(true);
    };
    const handleCloseLogoutAlert = () => setShowLogoutAlert(false);
    const handleConfirmLogout = () => {
        alert('Logged out'); // Placeholder for actual logout
        setShowLogoutAlert(false);
        // Add actual logout logic, e.g., call API, router.push('/login');
    };

    // --- Notification Handlers ---
    const handleToggleNotificationPopup = (event) => {
        event.stopPropagation();
        setShowNotificationPopup(prev => !prev);
        if (showAdminPopup) setShowAdminPopup(false); // Close other popup
    };

    const mockAPICall = async (action, data) => {
        console.log(`MOCK API CALL: ${action}`, data || '');
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
        return { success: true, message: `${action} successful.` };
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

    const handleDenyNotification = async (notificationId) => {
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
    // Fetch/mock initial notifications
    useEffect(() => {
        const mockNotificationsData = [
            { id: 1, avatarUrl: 'https://randomuser.me/api/portraits/women/60.jpg', message: 'Dr. Linda Keo is requesting room A1 at 7:00 - 10:00am for class 31/31 IT-morning', timestamp: '10m', isUnread: true, type: 'roomRequest', details: { requestorName: 'Dr. Linda Keo' } },
            { id: 2, avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg', message: 'You have Approved Mr. Chan Keo request for a room change. The update has been successfully recorded.', timestamp: '1h', isUnread: false, type: 'info', details: { requestorName: 'Mr. Chan Keo' } },
            { id: 3, avatarUrl: 'https://randomuser.me/api/portraits/women/33.jpg', message: 'You have Denied Mr. Tomoko Inoue request for a room change.', timestamp: '2h', isUnread: false, type: 'info', details: { requestorName: 'Mr. Tomoko Inoue' } },
            { id: 4, avatarUrl: 'https://randomuser.me/api/portraits/men/78.jpg', message: 'Mr. Eric Sok submitted a new maintenance request for Projector in B2.', timestamp: '5h', isUnread: true, type: 'maintenanceRequest', details: { requestorName: 'Mr. Eric Sok' } },
        ];
        setNotifications(mockNotificationsData);
    }, []);

    // Handle clicks outside popups
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
    }, [showAdminPopup, showNotificationPopup]); // Rerun effect if visibility of either popup changes

    const hasUnreadNotifications = notifications.some(n => n.isUnread);

    return (
        <div className="flex w-full min-h-screen bg-[#E2E1EF]">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
            />
            <div className={`main-content flex-grow flex flex-col transition-all duration-300 ease-in-out`}>
                <Topbar
                    onToggleSidebar={toggleSidebar}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onUserIconClick={handleUserIconClick}
                    pageSubtitle={pageTitle}
                    userIconRef={userIconRef}
                    // Notification props for Topbar
                    onNotificationIconClick={handleToggleNotificationPopup}
                    notificationIconRef={notificationIconRef}
                    hasUnreadNotifications={hasUnreadNotifications}
                />
                <main className="content-area flex-grow p-3 sm:p-6 m-3 sm:m-6 bg-white rounded-lg shadow-md">
                    {children}
                </main>
                <Footer />
            </div>

            {/* Popups */}
            {/* Admin/User Popup */}
            <div ref={adminPopupRef}> {/* Wrapper for ref */}
                <AdminPopup 
                    show={showAdminPopup} 
                    onLogoutClick={handleLogoutClick} 
                    // Pass userName and userEmail if AdminPopup is generic UserPopup
                    // userName="Current User"
                    // userEmail="user@example.com"
                />
            </div>

            {/* Notification Popup */}
            <div ref={notificationPopupRef}> {/* Wrapper for ref */}
                <NotificationPopup
                    show={showNotificationPopup}
                    notifications={notifications}
                    onMarkAllRead={handleMarkAllRead}
                    onApprove={handleApproveNotification}
                    onDeny={handleDenyNotification}
                    anchorRef={notificationIconRef} // For potential positioning logic
                    // onClose={() => setShowNotificationPopup(false)} // If popup has own close button
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