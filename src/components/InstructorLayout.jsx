'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import InstructorSidebar from '@/components/InstructorSidebar';
import InstructorTopbar from '@/components/InstructorTopbar';
import InstructorPopup from 'src/app/instructor/profile/components/InstructorPopup'; // Corrected import
import LogoutAlert from '@/components/LogoutAlert';
import Footer from '@/components/Footer';
import NotificationPopup from '@/app/admin/notification/AdminNotificationPopup';

const TOPBAR_HEIGHT = '90px'; // Adjust this value to match your actual Topbar height.

export default function InstructorLayout({ children, activeItem, pageTitle }) {
    // --- State Variables ---
    const [showAdminPopup, setShowAdminPopup] = useState(false);
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notificationPopupRef = useRef(null);
    const notificationIconRef = useRef(null);
    const adminPopupRef = useRef(null);
    const userIconRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();
    const [ isProfileNavigating, setIsProfileNavigating] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebarCollapsed') === 'true';
        }
        return false;
    });

    // --- Handlers ---
    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const handleUserIconClick = (event) => { 
        event.stopPropagation(); 
        setShowAdminPopup(!showAdminPopup); 
    };
    const handleLogoutClick = () => {
        setShowAdminPopup(false);
        setShowLogoutAlert(true);
    };
    const handleCloseLogoutAlert = () => setShowLogoutAlert(false);
    const handleConfirmLogout = () => { 
        setShowLogoutAlert(false);
        router.push('/auth/login');
    };
    
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

    const hasUnreadNotifications = notifications.some(n => n.isUnread); // From HEAD

    const handleProfileNav = (path) => {
        // Prevent any action if a navigation is already in progress.
        if (isProfileNavigating) {
            return;
        }

        // Check if we are already on the target page.
        if (pathname === path) {
            // If so, just close the popup. Do not set a loading state.     
            setShowAdminPopup(false);
            return;
        }

        // If we are on a DIFFERENT page, set the loading state AND navigate.
        setIsProfileNavigating(true);
        router.push(path);
    };
    
    const handleNavItemClick = (item) => {
        console.log("Navigating to:", item);
    };

    const sidebarWidth = isSidebarCollapsed ? '80px' : '265px';

    // --- Hooks ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        }
    }, [isSidebarCollapsed]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        }
    }, [isSidebarCollapsed]);

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

    useEffect(() => {
        const mockNotificationsData = [
            { id: 1, avatarUrl: 'https://randomuser.me/api/portraits/women/60.jpg', message: 'Dr. Linda Keo is requesting room A1 at 7:00 - 10:00am for class 31/31 IT-morning', timestamp: '10m', isUnread: true, type: 'roomRequest', details: { requestorName: 'Dr. Linda Keo' } },
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

    return (
        <div className="flex w-full min-h-screen bg-[#E2E1EF] dark:bg-gray-800">
            {/* Sidebar (fixed) */}
            <InstructorSidebar
                isCollapsed={isSidebarCollapsed}
                activeItem={activeItem}
                onNavItemClick={handleNavItemClick}
            />

            {/* Main Content Area (flex-grow, scrollable) */}
            <div
                className="flex flex-col flex-grow transition-all duration-300 ease-in-out"
                style={{
                    marginLeft: sidebarWidth, 
                    width: `calc(100% - ${sidebarWidth})`,
                    height: '100vh', 
                    overflowY: 'auto',
                }}
            >
                {/* Topbar Wrapper (fixed at the top) */}
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
                        onNotificationIconClick={handleToggleNotificationPopup}
                        notificationIconRef={notificationIconRef}
                        hasUnreadNotifications={hasUnreadNotifications}
                    />
                </div>

                {/* Content and Footer Container */}
                <div className="flex flex-col flex-grow" style={{ paddingTop: TOPBAR_HEIGHT }}>
                    <main className="content-area flex-grow p-3 m-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                        {children} {/* Dynamic page content */}
                    </main>
                    <Footer />
                </div>
            </div>

            {/* Popups */}
            {/* Admin/User Popup (structure from HEAD with ref) */}
            <div ref={adminPopupRef}>
                <InstructorPopup
                    show={showAdminPopup} 
                    onLogoutClick={handleLogoutClick} 
                    isNavigating={isProfileNavigating}
                    onNavigate={handleProfileNav}
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
    );
}