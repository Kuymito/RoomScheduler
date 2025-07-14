// src/components/AdminLayout.jsx
'use client';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AdminPopup from 'src/app/admin/profile/components/AdminPopup';
import Footer from '@/components/Footer';
import NotificationPopup from '@/app/admin/notification/AdminNotificationPopup';
import { signOut, useSession } from 'next-auth/react';
import useSWR, { mutate } from 'swr';
import { authService } from '@/services/auth.service';
import { notificationService } from '@/services/notification.service';
import { moul } from './fonts';

// Dynamically import the LogoutAlert component.
// This creates a separate JavaScript chunk for the component, loaded only when needed.
const LogoutAlert = lazy(() => import('@/components/LogoutAlert'));

const TOPBAR_HEIGHT = '90px';
const profileFetcher = ([, token]) => authService.getProfile(token);
const notificationsFetcher = ([, token]) => notificationService.getNotifications(token);
const changeRequestsFetcher = ([, token]) => notificationService.getChangeRequests(token);

const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const media = window.matchMedia(query);
        const listener = () => setMatches(media.matches);
        
        // Add listener
        media.addEventListener('change', listener);
        
        // Cleanup listener on component unmount
        return () => media.removeEventListener('change', listener);
    }, [query]);

    return matches;
};

export default function AdminLayout({ children, activeItem, pageTitle, breadcrumbs }) {
    const [showAdminPopup, setShowAdminPopup] = useState(false);
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false); 
    const [navigatingTo, setNavigatingTo] = useState(null);
    const notificationPopupRef = useRef(null);
    const notificationIconRef = useRef(null);
    const adminPopupRef = useRef(null);
    const userIconRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();
    const [ isProfileNavigating, setIsProfileNavigating] = useState(false);

    const isSmallScreen = useMediaQuery('(max-width: 1023px)');

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }
        if (window.matchMedia('(max-width: 1023px)').matches) {
            return true;
        }
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });
    
    useEffect(() => {
        if (isSmallScreen) {
            setIsSidebarCollapsed(true);
        }
    }, [isSmallScreen]);

    useEffect(() => {
        if (!isSmallScreen) {
            localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        }
    }, [isSidebarCollapsed, isSmallScreen]);

    const { data: session } = useSession();
    const token = session?.accessToken;

    const { data: profile } = useSWR(
        token ? ['/api/profile', token] : null,
        profileFetcher
    );

    const { data: notifications, mutate: mutateNotifications } = useSWR(
        token ? ['/api/notifications', token] : null,
        notificationsFetcher,
        {
            refreshInterval: 5000,
        }
    );

    const { data: changeRequests, mutate: mutateChangeRequests } = useSWR(
        token ? ['/api/change-requests', token] : null,
        changeRequestsFetcher,
        {
            refreshInterval: 5000,
        }
    );

    const finalBreadcrumbs = breadcrumbs || [{ label: pageTitle }];

    const toggleSidebar = () => {
        if (!isSmallScreen) {
            setIsSidebarCollapsed(prev => !prev);
        }
    };

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
    
    const handleMarkSingleAsRead = async (notificationId) => {
        await notificationService.markNotificationAsRead(notificationId, token);
        mutateNotifications();
    };

    const handleMarkAllRead = async () => {
        const unreadIds = notifications?.filter(n => !n.read).map(n => n.notificationId) || [];
        if (unreadIds.length > 0) {
            await Promise.all(unreadIds.map(id => notificationService.markNotificationAsRead(id, token)));
            mutateNotifications();
        }
    };

    const handleApproveNotification = async (requestId) => {
        await notificationService.approveChangeRequest(requestId, token);
        mutateChangeRequests();
        mutateNotifications();
        mutate(['/api/v1/schedule', token]);
    };

    const handleDenyNotification = async (requestId) => {
        await notificationService.denyChangeRequest(requestId, token);
        mutateChangeRequests();
        mutateNotifications();
        mutate(['/api/v1/schedule', token]);
    };

    const hasUnreadNotifications = notifications?.some(n => !n.read) || changeRequests?.some(cr => cr.status === 'PENDING');

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

    useEffect(() => {
        if (isProfileNavigating) {
            setIsProfileNavigating(false);
        }
    }, [pathname]);

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
            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                activeItem={activeItem} 
                onNavItemClick={handleNavItemClick} 
                navigatingTo={navigatingTo}
            />
            <div className="flex flex-col flex-grow transition-all duration-300 ease-in-out" style={{ marginLeft: sidebarWidth, width: `calc(100% - ${sidebarWidth})`, height: '100vh', overflowY: 'auto' }}>
                <div className="fixed top-0 bg-white dark:bg-gray-900 shadow-custom-medium p-5 flex justify-between items-center z-30 transition-all duration-300 ease-in-out" style={{ left: sidebarWidth, width: `calc(100% - ${sidebarWidth})`, height: TOPBAR_HEIGHT }}>
                    <Topbar onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} onUserIconClick={handleUserIconClick} breadcrumbs={finalBreadcrumbs} userIconRef={userIconRef} onNotificationIconClick={handleToggleNotificationPopup} notificationIconRef={notificationIconRef} hasUnreadNotifications={hasUnreadNotifications} showToggleButton={!isSmallScreen} />
                </div>
                <div className="flex flex-col flex-grow" style={{ paddingTop: TOPBAR_HEIGHT }}>
                    <main className="content-area flex-grow p-3 m-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">{children}</main>
                    <Footer />
                </div>
            </div>
            <div ref={adminPopupRef}>
                <AdminPopup 
                    show={showAdminPopup} 
                    onLogoutClick={handleLogoutClick} 
                    isNavigating={isProfileNavigating} 
                    onNavigate={handleProfileNav}
                    adminName={profile ? `${profile.firstName} ${profile.lastName}` : 'Admin'}
                    adminEmail={profile?.email || 'admin@example.com'}
                />
            </div>
            <div ref={notificationPopupRef}>
                <NotificationPopup 
                    show={showNotificationPopup} 
                    notifications={notifications} 
                    changeRequests={changeRequests}
                    onMarkAllRead={handleMarkAllRead} 
                    onApprove={handleApproveNotification} 
                    onDeny={handleDenyNotification} 
                    onMarkAsRead={handleMarkSingleAsRead} 
                    anchorRef={notificationIconRef} 
                    onClose={() => setShowNotificationPopup(false)}
                />
            </div>
            {/* Wrap the LogoutAlert component in a Suspense boundary */}
            {showLogoutAlert && (
                <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 z-[1002] flex items-center justify-center"><div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div></div>}>
                    <LogoutAlert show={showLogoutAlert} onClose={handleCloseLogoutAlert} onConfirmLogout={handleConfirmLogout} />
                </Suspense>
            )}
        </div>
    );
}