// src/components/InstructorDashboardLayout.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import InstructorSidebar from '@/components/InstructorSidebar';
import InstructorTopbar from '@/components/InstructorTopbar';
import InstructorPopup from 'src/app/instructor/profile/components/InstructorPopup';
import LogoutAlert from '@/components/LogoutAlert';
import Footer from '@/components/Footer';
import InstructorNotificationPopup from '@/app/instructor/notification/InstructorNotificationPopup';
import { usePathname, useRouter } from 'next/navigation';
import { Moul } from 'next/font/google';

const moul = Moul({
    weight: '400',
    subsets: ['latin'],
});

export default function InstructorDashboardLayout({ children, activeItem, pageTitle }) {
    const [showAdminPopup, setShowAdminPopup] = useState(false);
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    const [showInstructorNotificationPopup, setShowInstructorNotificationPopup] = useState(false);
    const [instructorNotifications, setInstructorNotifications] = useState([]);
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
        if (showInstructorNotificationPopup) {
            setShowInstructorNotificationPopup(false);
        }
        setShowAdminPopup(prev => !prev);
    };
    
    const handleLogoutClick = () => { setShowAdminPopup(false); setShowLogoutAlert(true); };
    const handleCloseLogoutAlert = () => setShowLogoutAlert(false);

    const handleConfirmLogout = () => { 
        setShowLogoutAlert(false);
        setIsLoading(true);
        setTimeout(() => {
            router.push('/api/auth/login');
        }, 1000);
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
    
    const handleMarkInstructorNotificationAsRead = (notificationId) => {
        setInstructorNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, isUnread: false } : n)
        );
    };

    const handleMarkAllInstructorNotificationsAsRead = () => {
        setInstructorNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
    };

    const hasUnreadInstructorNotifications = instructorNotifications.some(n => n.isUnread);

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
        const mockInstructorNotifications = [
            { id: 1, avatarUrl: '/images/kok.png', message: 'Your request for Room A1 has been approved by Admin.', timestamp: '5m', isUnread: true, type: 'request_approved', details: { adminName: 'Admin' } },
            { id: 2, avatarUrl: '/images/kok.png', message: 'Your request for Room C2 has been denied due to a conflict.', timestamp: '1h', isUnread: true, type: 'request_denied', details: { adminName: 'Admin' } },
            { id: 3, avatarUrl: '/images/kok.png', message: 'A new schedule has been published for your classes.', timestamp: '3h', isUnread: false, type: 'info', details: { adminName: 'Admin' } },
        ];
        setInstructorNotifications(mockInstructorNotifications);
    }, []);

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
                    <main className="content-area flex-grow m-6">
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
            <LogoutAlert show={showLogoutAlert} onClose={handleCloseLogoutAlert} onConfirmLogout={handleConfirmLogout} />
        </div>
    );
}