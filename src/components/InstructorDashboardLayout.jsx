// src/components/InstructorDashboardLayout.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import InstructorSidebar from '@/components/InstructorSidebar';
import InstructorTopbar from '@/components/InstructorTopbar';
import AdminPopup from 'src/app/admin/profile/components/AdminPopup';
import LogoutAlert from '@/components/LogoutAlert';
import Footer from '@/components/Footer';
import NotificationPopup from '@/app/admin/notification/AdminNotificationPopup';
import { usePathname, useRouter } from 'next/navigation';

export default function InstructorDashboardLayout({ children, activeItem, pageTitle }) {
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
    const handleUserIconClick = (event) => { event.stopPropagation(); setShowAdminPopup(!showAdminPopup); };
    const handleLogoutClick = () => { setShowAdminPopup(false); setShowLogoutAlert(true); };
    const handleCloseLogoutAlert = () => setShowLogoutAlert(false);
    const handleConfirmLogout = () => { 
        alert('Logged out'); 
        setShowLogoutAlert(false); 
    };

    const handleNavItemClick = (item) => {
        console.log("Navigating to:", item);
    };

    const handleToggleNotificationPopup = (event) => {
        event.stopPropagation();
        setShowNotificationPopup(prev => !prev);
        if (showAdminPopup) setShowAdminPopup(false);
    };
    
    const mockAPICall = async (action, data) => {
        console.log(`MOCK API CALL: ${action}`, data || '');
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true, message: `${action} successful.` };
    };

    const handleMarkAllRead = async () => {
        try {
            await mockAPICall("Mark all notifications as read");
            setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleNotificationClick = (notificationId) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === notificationId ? { ...n, isUnread: false } : n
            )
        );
    };

    const hasUnreadNotifications = notifications.some(n => n.isUnread);

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
            { id: 1, avatarUrl: 'https://numregister.com/assets/img/logo/num.png', message: 'Your Request for room A1 for class 31/31 IT-morning to study at 7:00 - 10:00 on 15 May 2025 was Approve at 12:00 on 13 May 2025.', timestamp: '15h', isUnread: true, status: 'approved' },
            { id: 2, avatarUrl: 'https://numregister.com/assets/img/logo/num.png', message: 'Your Request for room C2 for class 33/27 SE-evening to study at 17:30 - 20:30 on 12 May 2025 was deny at 09:00 on 13 May 2025.', timestamp: '18h', isUnread: false, status: 'denied' },
            { id: 4, avatarUrl: 'https://numregister.com/assets/img/logo/num.png', message: 'A new class "Advanced Algorithms" has been assigned to your schedule for Wednesday.', timestamp: '2d', isUnread: false, status: 'info' },
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
            <InstructorSidebar
                isCollapsed={isSidebarCollapsed}
                activeItem={activeItem}
                onNavItemClick={handleNavItemClick}
            />
            <div
                className="flex flex-col flex-grow transition-all duration-300 ease-in-out"
                style={{ marginLeft: sidebarWidth, width: `calc(100% - ${sidebarWidth})`, height: '100vh', overflowY: 'auto' }}
            >
                <div
                    className="fixed top-0 bg-white dark:bg-gray-900 shadow-custom-medium p-5 flex justify-between items-center z-30 transition-all duration-300 ease-in-out"
                    style={{ left: sidebarWidth, width: `calc(100% - ${sidebarWidth})`, height: TOPBAR_HEIGHT }}
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
                <div className="flex flex-col flex-grow" style={{ paddingTop: TOPBAR_HEIGHT }}>
                    <main className="content-area flex-grow m-6">
                        {children}
                    </main>
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
                    onNotificationClick={handleNotificationClick}
                    anchorRef={notificationIconRef} 
                />
            </div>
            <LogoutAlert show={showLogoutAlert} onClose={handleCloseLogoutAlert} onConfirmLogout={handleConfirmLogout} />
        </div>
    );
}