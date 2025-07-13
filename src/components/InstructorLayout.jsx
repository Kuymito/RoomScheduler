// src/components/InstructorLayout.jsx
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
import useSWR, { mutate } from 'swr';
import { authService } from '@/services/auth.service';
import { notificationService } from '@/services/notification.service';
import { moul } from './fonts';

const TOPBAR_HEIGHT = '90px';
const profileFetcher = ([, token]) => authService.getProfile(token);
const notificationsFetcher = ([, token]) => notificationService.getNotifications(token);

const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => {
            setMatches(media.matches);
        };
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
};

export default function InstructorLayout({ children, activeItem, pageTitle, breadcrumbs }) {
    const [showAdminPopup, setShowAdminPopup] = useState(false);
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    const [showInstructorNotificationPopup, setShowInstructorNotificationPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isProfileNavigating, setIsProfileNavigating] = useState(false);
    
    const isSmallScreen = useMediaQuery('(max-width: 1023px)');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebarCollapsed') === 'true';
        }
        return false;
    });

    useEffect(() => {
        if (isSmallScreen) {
            setIsSidebarCollapsed(true);
        }
    }, [isSmallScreen]);

    useEffect(() => {
        if (typeof window !== 'undefined' && !isSmallScreen) {
            localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        }
    }, [isSidebarCollapsed, isSmallScreen]);

    const notificationPopupRef = useRef(null);
    const notificationIconRef = useRef(null);
    const adminPopupRef = useRef(null);
    const userIconRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();
    const [navigatingTo, setNavigatingTo] = useState(null);
    
    const { data: session } = useSession();
    const token = session?.accessToken;

    const { data: profile } = useSWR(
        token ? ['/api/profile', token] : null,
        profileFetcher
    );

    const { data: instructorNotifications, mutate: mutateInstructorNotifications } = useSWR(
        token ? ['/api/notifications', token] : null,
        notificationsFetcher,
        {
            refreshInterval: 5000,
        }
    );

    const finalBreadcrumbs = breadcrumbs || [{ label: pageTitle }];

    const toggleSidebar = () => {
        if (!isSmallScreen) {
            setIsSidebarCollapsed(!isSidebarCollapsed);
        }
    };

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
        await notificationService.markNotificationAsRead(notificationId, token);
        mutateInstructorNotifications();
        mutate(['/api/v1/schedule', token]);
    };

    const handleMarkAllInstructorNotificationsAsRead = async () => {
        const unreadIds = instructorNotifications?.filter(n => !n.read).map(n => n.notificationId) || [];
        if (unreadIds.length > 0) {
            await Promise.all(unreadIds.map(id => notificationService.markNotificationAsRead(id, token)));
            mutateInstructorNotifications();
            mutate(['/api/v1/schedule', token]);
        }
    };

    const hasUnreadInstructorNotifications = instructorNotifications?.some(n => !n.read);

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
                        breadcrumbs={finalBreadcrumbs}
                        userIconRef={userIconRef}
                        onNotificationIconClick={handleToggleInstructorNotificationPopup}
                        notificationIconRef={notificationIconRef}
                        hasUnreadNotifications={hasUnreadInstructorNotifications}
                        showToggleButton={!isSmallScreen}
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
                    instructorName={profile ? `${profile.firstName} ${profile.lastName}` : 'Instructor'}
                    instructorEmail={profile?.email || 'instructor@example.com'}
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