// AdminLayout.js
'use client';
import { useState, useEffect, useRef } from 'react';
<<<<<<< HEAD
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AdminPopup from 'src/app/admin/profile/components/AdminPopup';
import LogoutAlert from '@/components/LogoutAlert';
import Footer from '@/components/Footer';
import NotificationPopup from '@/app/admin/notification/AdminNotificationPopup';
import { Moul } from 'next/font/google';

const moul = Moul({
    weight: '400',
    subsets: ['latin'],
});

const TOPBAR_HEIGHT = '90px'; // Adjust this value to match your actual Topbar height.

export default function AdminLayout({ children, activeItem, pageTitle }) {
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
    const [isLoading, setIsLoading] = useState(false); // State for loading
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
        setIsLoading(true);
        setTimeout(() => {
            router.push('/auth/login');
        }, 1500);
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
=======
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
>>>>>>> 338923325b0eb2647a8b61cca7c704dd9474621d
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        }
    }, [isSidebarCollapsed]);

<<<<<<< HEAD
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        }
    }, [isSidebarCollapsed]);
=======
    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    const handleUserIconClick = (event) => {
        event.stopPropagation();
        setShowAdminPopup(prev => !prev);
        if (showNotificationPopup) setShowNotificationPopup(false); // Close other popup (from HEAD)
    };
>>>>>>> 338923325b0eb2647a8b61cca7c704dd9474621d

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
<<<<<<< HEAD
            if (showAdminPopup && 
=======
            if (showAdminPopup &&
>>>>>>> 338923325b0eb2647a8b61cca7c704dd9474621d
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

<<<<<<< HEAD
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

    if (isLoading) {
        return (
            <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-blue-100 text-center p-6">
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
                {/* Simple Tailwind CSS Spinner */}
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
            {/* Sidebar (fixed) */}
            <Sidebar
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
                <AdminPopup 
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
=======
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
>>>>>>> 338923325b0eb2647a8b61cca7c704dd9474621d
    );
}